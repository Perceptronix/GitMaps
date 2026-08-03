"""The discovery collector — search → screen → store → progress.

Implements the first stage of the worker's ingestion pipeline (architecture
§4): poll the GitHub search API for newly created repositories, drop obvious
junk (forks, archives), upsert the survivors into `repos`, and record the
run's progress in `ingestion_state` so the next run continues from where this
one stopped. Storage and HTTP live behind injected seams (client, store) so
this orchestration is unit-testable without network or database.

Discovery sweeps
----------------
GitHub stops paginating a single search query at 1,000 results, so one
`created:>=since` query caps the whole run at a thousand new repos. To reach
the long tail, `run()` issues a *family* of narrower queries and merges the
results:

  * **baseline** — `created:>=since` (the original sweep; catches anything
    the narrower queries miss)
  * **per-language** — `created:>=since language:<lang>` for the top 15
    languages, so a hot week in a single language can't crowd the rest out
  * **per-topic** — `created:>=since topic:<slug>` for each classification
    taxonomy domain (slugged from ``DEFAULT_TAXONOMY``), so taxonomy-retuned
    domains widen discovery automatically
  * **star-crossing** — `stars:5..50 pushed:>=since`, repos created before
    the watermark but pushed recently with modest stars — the rising long
    tail a created-only sweep never sees

The sweeps overlap heavily (a Python AI repo appears in three of them), so
results are deduped by repo id before screening.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable, Sequence

from gitmaps.github.client import GitHubApiError, RateLimitError
from gitmaps.github.graphql_client import GraphQLBatchClient
from gitmaps.timeutil import utc_stamp

logger = logging.getLogger("gitmaps.collector")

SINCE_KEY = "discovery.since"
LAST_RUN_KEY = "discovery.last_run_at"
LAST_COUNT_KEY = "discovery.last_count"

#: Default look-back when no watermark exists yet (first run).
DEFAULT_WINDOW_DAYS = 7

#: Per-language sweeps — the top GitHub languages by repository volume.
#: Each query still caps at 1000, but the union of languages clears far more
#: of a busy week than one blanket query.
DEFAULT_LANGUAGES = (
    "python", "typescript", "javascript", "go", "rust", "java",
    "c++", "c", "csharp", "ruby", "php", "swift", "kotlin", "shell", "html",
)


def taxonomy_topic_slugs() -> tuple[str, ...]:
    """One GitHub topic per classification taxonomy domain.

    Slugged from ``DEFAULT_TAXONOMY`` (lowercased, spaces → hyphens) so a
    taxonomy retune widens discovery in lockstep: "AI Agents" → ``topic:ai-agents``,
    "RAG" → ``topic:rag``, "DevOps" → ``topic:devops``. Imported lazily to keep
    collector's import graph light (the taxonomy drags the classifier with it).
    """
    from gitmaps.classification import DEFAULT_TAXONOMY

    return tuple(domain.lower().replace(" ", "-") for domain, _ in DEFAULT_TAXONOMY)


@dataclass(frozen=True)
class SweepResult:
    """Raw yield of one discovery sweep query (before cross-sweep dedupe)."""

    query: str
    hits: int


@dataclass(frozen=True)
class DiscoveryResult:
    """Outcome of one discovery run."""

    since: str
    sweeps: tuple[SweepResult, ...]
    found: int  # unique repos after cross-sweep dedupe
    stored: int
    dropped: int


class DiscoveryRunner:
    def __init__(
        self,
        client,
        store,
        *,
        graphql: GraphQLBatchClient | None = None,
        now: Callable[[], datetime] | None = None,
        default_window_days: int = DEFAULT_WINDOW_DAYS,
        languages: Sequence[str] | None = None,
        topics: Sequence[str] | None = None,
    ) -> None:
        self._client = client
        self._store = store
        self._graphql = graphql
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._window_days = default_window_days
        self._languages = tuple(languages) if languages is not None else DEFAULT_LANGUAGES
        self._topics = tuple(topics) if topics is not None else taxonomy_topic_slugs()

    def run(self) -> DiscoveryResult:
        run_start = utc_stamp(self._now())
        since = self._store.get_state(SINCE_KEY) or utc_stamp(
            self._now() - timedelta(days=self._window_days)
        )
        queries = self._build_queries(since)

        # Merge every sweep, deduped by repo id — the same repo legitimately
        # shows up in the baseline, its language, and its topic sweeps.
        by_id: dict[int, dict] = {}
        sweeps: list[SweepResult] = []
        for query in queries:
            hits = 0
            for repo in self._client.search(query):
                hits += 1
                by_id.setdefault(repo["id"], repo)
            sweeps.append(SweepResult(query=query, hits=hits))

        found = 0
        dropped = 0
        screened: list[dict] = []
        for repo in by_id.values():
            found += 1
            if self._is_junk(repo):
                dropped += 1
                continue
            screened.append(repo)

        screened = self._enrich(screened)
        stored = self._store.upsert_many(screened) if screened else 0

        # Progress: advance the discovery watermark to this run's start so the
        # next run looks only at repositories created since now.
        self._store.set_state(SINCE_KEY, run_start)
        self._store.set_state(LAST_RUN_KEY, run_start)
        self._store.set_state(LAST_COUNT_KEY, stored)

        return DiscoveryResult(since=since, sweeps=tuple(sweeps), found=found, stored=stored, dropped=dropped)

    def _enrich(self, screened: list[dict]) -> list[dict]:
        """Batch-fetch richer metadata for the screened repos via GraphQL.

        One batched GraphQL request replaces the N per-repo REST detail calls
        the downstream snapshot/classify passes would otherwise make. The
        enriched rows are REST-shaped (`RepoData.as_rest_dict`), so upserting
        them needs no downstream change.

        Failure semantics match the pipeline's "enrich if you can, else REST":
        a whole-batch failure (rate limit, 4xx/5xx, network) logs a warning and
        falls back to the REST search data — never crashes the run. A per-repo
        null (renamed/deleted between search and enrichment) keeps its search
        data rather than dropping it.
        """
        if self._graphql is None or not screened:
            return screened
        try:
            fetched = self._graphql.fetch_repos_batch([r["full_name"] for r in screened])
        except (GitHubApiError, RateLimitError) as exc:
            logger.warning("GraphQL batch enrichment failed (%s); using REST search data", exc)
            return screened
        enriched = {rd.full_name: rd.as_rest_dict() for rd in fetched if rd is not None}
        return [enriched.get(r["full_name"], r) for r in screened]

    def _build_queries(self, since: str) -> list[str]:
        queries = [f"created:>={since}"]
        queries += [f"created:>={since} language:{lang}" for lang in self._languages]
        queries += [f"created:>={since} topic:{topic}" for topic in self._topics]
        # Repos created before the watermark but pushed recently with modest
        # stars — the "rising long tail" a created-only sweep never sees.
        queries.append(f"stars:5..50 pushed:>={since}")
        return queries

    @staticmethod
    def _is_junk(repo: dict) -> bool:
        return bool(repo.get("fork")) or bool(repo.get("archived"))
