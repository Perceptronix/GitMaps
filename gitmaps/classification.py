"""The technology classification pipeline (Phase 6.5).

Assigns each Repository one-or-more **technology domains** (AI, Frontend,
DevOps, ...) from a configurable keyword taxonomy, stored independently of the
primary programming language. Domains are rule-based — deterministic, local,
and explainable, in the spirit of the transparent Momentum/Significance engines
(ADR-0002) — never a hosted LLM or an opaque classifier.

The input is the Repository's semantic content (README, description, topics,
homepage, identity) — the same composed text the embedding pipeline uses, so a
Repository's `domains_fingerprint` and `embedding_fingerprint` change together.
A domain is assigned when any of its keywords appears as a case-insensitive,
word-bounded substring (`ai` matches "AI" but not "email"); a Repository may
match several domains.

The pipeline is incremental by construction, mirroring `EmbeddingRunner`:

  * **Universe** — surfaced Repositories by default; `ClassificationConfig
    .universe="all"` widens it.
  * **Due** — never classified (`domains_fingerprint IS NULL`), or its content
    may have changed since (`classified_at < pushed_at`).
  * **Skip** — within the due set, a Repository whose freshly-composed content
    hashes to the stored fingerprint is skipped (content unchanged) and its
    `classified_at` advances, so it is not re-fetched until the next push.

The engine is pure (`classify_domains`); persistence happens in
`ClassificationRunner` over the store seam, charging the shared per-hour GitHub
rate budget for every README fetch (architecture §6). The taxonomy is data —
tuning it never touches the algorithm.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from functools import lru_cache
from typing import Callable, Sequence

from gitmaps.budget import RATE_BUDGET_KEY, rate_budget_state
from gitmaps.embeddings import compose_semantic_text, semantic_fingerprint
from gitmaps.github.client import GitHubApiError, RateLimitError
from gitmaps.timeutil import utc_stamp

#: Documented ingestion_state key (ticket 08 convention): the taxonomy version
#: the stored domains were produced with. When it changes (a retuned/extended
#: taxonomy), the runner does a full re-classification pass, so already-
#: classified repos pick up the new rules.
TAXONOMY_VERSION_KEY = "classification_taxonomy_version"

#: The default taxonomy: (domain, keywords). A Repository joins a domain when
#: ANY keyword appears in its composed semantic text, case-insensitively and
#: word-bounded. Keywords are plain terms; use explicit variants for phrasing
#: ("retrieval-augmented" + "retrieval augmented", "next.js" + "nextjs").
DEFAULT_TAXONOMY: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("AI", (
        "ai", "a.i.", "artificial intelligence", "generative ai", "ai assistant",
        "ai-powered", "ai tool", "ai model", "llm", "large language model",
        "machine intelligence",
    )),
    ("AI Agents", (
        "ai agent", "agentic", "autonomous agent", "multi-agent", "agent framework",
        "coding agent", "agent platform",
    )),
    ("RAG", (
        "retrieval-augmented", "retrieval augmented", "vector store", "vector database",
        "retrieval pipeline", "grounded generation", "knowledge base",
    )),
    ("Machine Learning", (
        "machine learning", "deep learning", "neural network", "pytorch", "tensorflow",
        "scikit-learn", "sklearn", "keras", "jax", "gradient descent", "model training",
        "ml pipeline", "inference engine",
    )),
    ("Frontend", (
        "frontend", "front-end", "react", "vue", "angular", "svelte", "next.js",
        "nextjs", "tailwind", "css", "component library", "design system",
        "browser extension", "ui kit",
    )),
    ("Backend", (
        "backend", "back-end", "api server", "server-side", "rest api", "graphql",
        "microservice", "http server", "web server", "middleware", "webhook server", "grpc",
    )),
    ("DevOps", (
        "devops", "ci/cd", "continuous integration", "continuous delivery", "docker",
        "kubernetes", "k8s", "terraform", "ansible", "infrastructure as code",
        "deployment pipeline", "github actions", "monitoring", "observability",
        "prometheus", "grafana", "container orchestration",
    )),
    ("Cybersecurity", (
        "cybersecurity", "cyber security", "penetration testing", "pentest", "exploit",
        "malware", "reverse engineering", "fuzzing", "vulnerability scanner", "zero-day",
        "waf", "firewall", "infosec", "ctf", "ransomware", "phishing", "intrusion detection",
    )),
    ("Data Engineering", (
        "data engineering", "etl", "data pipeline", "data warehouse", "spark", "airflow",
        "kafka", "parquet", "data lake", "streaming pipeline", "data processing",
        "hadoop", "flink", "dbt",
    )),
    ("Mobile", (
        "mobile app", "ios", "android", "react native", "flutter", "swift",
        "kotlin", "cross-platform app", "native app", "mobile development", "play store",
    )),
    ("Game Development", (
        "game engine", "unity", "unreal", "godot", "gamedev", "game development",
        "pygame", "3d renderer", "procedural generation", "game server", "sprite",
    )),
    ("Blockchain", (
        "blockchain", "ethereum", "smart contract", "defi", "bitcoin", "web3",
        "cryptocurrency", "crypto wallet", "solidity", "nft", "solana", "decentralized",
    )),
    ("Networking", (
        "networking", "network protocol", "tcp/ip", "dns", "http proxy", "vpn",
        "packet capture", "socket server", "mesh network", "p2p", "network monitoring",
        "nat traversal", "routing",
    )),
    ("Cloud", (
        "cloud", "aws", "azure", "gcp", "google cloud", "cloud-native", "serverless",
        "lambda", "s3", "ec2", "cloud storage", "saas", "multi-cloud", "cloud infrastructure",
    )),
    ("Databases", (
        "database", "sql", "nosql", "postgres", "postgresql", "mysql", "sqlite",
        "mongodb", "redis", "clickhouse", "query engine", "data store", "orm",
        "database driver", "sqlx",
    )),
)


@lru_cache(maxsize=8)
def _compiled(taxonomy) -> tuple[tuple[str, tuple[re.Pattern, ...]], ...]:
    """Precompile a taxonomy's keywords into case-insensitive word-bounded regexes."""
    return tuple(
        (
            domain,
            tuple(re.compile(r"\b" + re.escape(keyword) + r"\b", re.IGNORECASE) for keyword in keywords),
        )
        for domain, keywords in taxonomy
    )


#: Words that disclaim a keyword rather than claim it. "NOT AI SLOP" must not
#: classify as AI, but "anti-malware" still is Cybersecurity — the guard needs
#: whitespace before the keyword, so hyphenated compounds are unaffected.
_NEGATION_RE = re.compile(r"(?:^|\W)(?:not|no|never|without|avoid|non|anti)\s+$", re.IGNORECASE)


def _is_negated(text: str, start: int) -> bool:
    """True if the keyword match at `start` is disclaimed by the word before it.

    A negation directly preceding the match (a word boundary + whitespace, so
    "anti-malware" is untouched) means the text is *disclaiming* the technology,
    not claiming it. Looking at the 16 characters before the match is enough for
    the single-word negations above.
    """
    return _NEGATION_RE.search(text[max(0, start - 16):start]) is not None


def classify_domains(text: str, taxonomy: tuple = DEFAULT_TAXONOMY) -> tuple[str, ...]:
    """The sorted tuple of domains whose keywords appear in `text`.

    Matching is case-insensitive and word-bounded, so a keyword like `ai`
    matches "AI-powered" but never "email" or "Taiwan", and a keyword disclaimed
    by a preceding negation ("not AI", "without docker") is ignored. The result
    is sorted for determinism — order carries no meaning (a Repository may
    belong to several domains). Pass any (domain, keywords) taxonomy to classify
    by a custom, extensible rule set.
    """
    matched: list[str] = []
    for domain, patterns in _compiled(taxonomy):
        for pattern in patterns:
            match = pattern.search(text)
            if match is not None and not _is_negated(text, match.start()):
                matched.append(domain)
                break
    return tuple(sorted(matched))


def taxonomy_fingerprint(taxonomy: tuple = DEFAULT_TAXONOMY) -> str:
    """A stable version of a taxonomy: changes when any domain or keyword does.

    Recorded in `ingestion_state`; a mismatch on the next run triggers a full
    re-classification pass, so retuning the taxonomy propagates to repos whose
    fingerprint would otherwise let them skip.
    """
    parts = [f"{domain}:{','.join(keywords)}" for domain, keywords in taxonomy]
    return semantic_fingerprint("\n".join(parts))


@dataclass(frozen=True)
class ClassificationConfig:
    """Classification pipeline tunables. Tuning these is tuning the taxonomy."""

    taxonomy: tuple[tuple[str, tuple[str, ...]], ...] = DEFAULT_TAXONOMY
    readme_max_chars: int = 2000  # READMEs are truncated before composing/classifying
    universe: str = "surfaced"    # "surfaced" (map/search set) | "all" (every repo)

    def __post_init__(self) -> None:
        if self.readme_max_chars <= 0:
            raise ValueError(f"readme_max_chars must be positive, got {self.readme_max_chars}")
        if self.universe not in ("surfaced", "all"):
            raise ValueError(f"universe must be 'surfaced' or 'all', got {self.universe!r}")
        seen: set[str] = set()
        for domain, keywords in self.taxonomy:
            if not domain or not domain.strip():
                raise ValueError("every domain needs a non-empty name")
            if not keywords:
                raise ValueError(f"domain {domain!r} needs at least one keyword")
            if domain in seen:
                raise ValueError(f"duplicate domain {domain!r}")
            seen.add(domain)


@dataclass(frozen=True)
class RepoClassificationInput:
    """A repo row read for classification (CLASSIFICATION_COLUMNS order)."""

    id: int
    owner: str
    name: str
    full_name: str
    description: str | None
    topics: tuple[str, ...]
    language: str | None
    homepage: str | None
    domains_fingerprint: str | None


def classification_row_to_input(row: tuple) -> RepoClassificationInput:
    """Convert a repos classification SELECT row to RepoClassificationInput."""
    (
        id_, owner, name, full_name, description, topics, language,
        homepage, fingerprint,
    ) = row
    return RepoClassificationInput(
        id=id_, owner=owner, name=name, full_name=full_name,
        description=description, topics=tuple(topics or ()),
        language=language, homepage=homepage, domains_fingerprint=fingerprint,
    )


@dataclass(frozen=True)
class ClassificationResult:
    taxonomy_version: str
    force_full: bool
    repos_seen: int
    classified: int
    skipped: int  # content unchanged — verified and skipped
    errors: int   # readme fetch failures (non-404), repo skipped
    readme_fetches: int
    rate_limited: bool


class ClassificationRunner:
    """Orchestrates the classification pass over the store + readme client seams.

    `client` is duck-typed: anything with `get_readme(owner, name) -> str | None`
    (the GitHubClient in production; a fake in tests). `store` is a RepoStore.
    """

    def __init__(
        self,
        client,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        config: ClassificationConfig | None = None,
        batch_size: int = 100,
        budget_per_hour: int | None = None,
    ) -> None:
        self._client = client
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or ClassificationConfig()
        self._batch_size = batch_size
        self._budget_per_hour = budget_per_hour

    def run(self) -> ClassificationResult:
        run_stamp = utc_stamp(self._now())
        taxonomy_version = taxonomy_fingerprint(self._config.taxonomy)
        stored_version = self._store.get_state(TAXONOMY_VERSION_KEY)
        # None (first run) or a different version -> full pass. This is how a
        # retuned/extended taxonomy deliberately re-classifies the whole
        # universe, so no repo is stuck with stale rules.
        force_full = stored_version != taxonomy_version

        seen = classified = skipped = errors = readme_fetches = 0
        rate_limited = False
        offset = 0

        # Rolling per-hour rate budget (§6): read the current hour's counter;
        # if another run already spent it, abort before any request. One README
        # fetch charges 1 against the same pool the snapshot/embed jobs draw from.
        budget = rate_budget_state(self._store, self._now()) if self._budget_per_hour is not None else None

        while True:
            rows = self._page(force_full, offset)
            if not rows:
                break
            for row in rows:
                if budget is not None and budget["used"] >= self._budget_per_hour:
                    rate_limited = True
                    break
                inp = classification_row_to_input(row)
                seen += 1
                # Charge up front: a request is consumed whether it succeeds or
                # fails, so aborted calls still count (§6).
                if budget is not None:
                    budget["used"] += 1
                try:
                    readme = self._client.get_readme(inp.owner, inp.name)
                except RateLimitError:
                    # All tokens exhausted — abort the batch rather than
                    # sleeping through the reset once per remaining repo.
                    rate_limited = True
                    break
                except GitHubApiError:
                    errors += 1
                    continue
                readme_fetches += 1

                text = compose_semantic_text(
                    full_name=inp.full_name, description=inp.description,
                    topics=inp.topics, language=inp.language,
                    homepage=inp.homepage, readme=readme,
                    readme_max_chars=self._config.readme_max_chars,
                )
                fingerprint = semantic_fingerprint(text)
                if (
                    not force_full
                    and inp.domains_fingerprint is not None
                    and inp.domains_fingerprint == fingerprint
                ):
                    # Content unchanged since last classification — skip, but
                    # advance classified_at so the repo is not re-fetched until
                    # the next push.
                    skipped += 1
                    self._store.touch_classified_at(inp.id, run_stamp)
                    continue

                domains = classify_domains(text, self._config.taxonomy)
                self._store.store_classification(inp.id, list(domains), fingerprint, run_stamp)
                classified += 1

            offset += self._batch_size
            if rate_limited or len(rows) < self._batch_size:
                break

        if budget is not None:
            self._store.set_state(RATE_BUDGET_KEY, budget)

        self._store.set_state(TAXONOMY_VERSION_KEY, taxonomy_version)
        self._store.set_state("classification.last_run_at", run_stamp)
        self._store.set_state("classification.last_classified", classified)
        self._store.set_state("classification.last_skipped", skipped)

        return ClassificationResult(
            taxonomy_version=taxonomy_version,
            force_full=force_full,
            repos_seen=seen,
            classified=classified,
            skipped=skipped,
            errors=errors,
            readme_fetches=readme_fetches,
            rate_limited=rate_limited,
        )

    def _page(self, force_full: bool, offset: int) -> list[tuple]:
        if force_full:
            return self._store.list_all_for_classification(self._config.universe, self._batch_size, offset)
        return self._store.list_due_for_classification(self._config.universe, self._batch_size, offset)
