"""The semantic clustering pipeline (Phase 7) — technology clusters per domain.

Implements the `cluster` job from architecture §7 stage 3 (HDBSCAN) over the
technology domains assigned by Phase 6.5's classification pipeline: within each
domain, the embedded, surfaced Repositories that carry it are clustered by
HDBSCAN on their existing embeddings (stage 1's vectors — clustering never
re-embeds). Each cluster is persisted to `clusters` (migration 07) with a
readable, deterministic term-based label (D-06), its member Repositories get
`repos.cluster_id`, and every considered Repository's `clustered_at` advances
(migration 12).

The pass is incremental by construction, mirroring the embed/classify runners:

  * **Full** — the first run, or when the clustering algorithm/tuning changes
    (`clustering_algorithm_version`). Every embedded, classified repo in the
    universe is grouped by domain and re-clustered with HDBSCAN; the cluster
    set is REPLACED (the migration-07 recompute convention: delete + re-insert).
    A Repository may carry several domains, so it can be a candidate in several
    domain clusterings; it is finally assigned to the single cluster whose
    centroid is nearest to its embedding (deterministic: sorted candidates).
  * **Incremental** — every day after that. Repositories that have never been
    clustered (`clustered_at IS NULL`) are assigned to the nearest existing
    cluster centroid within their own domains when the cosine similarity clears
    `similarity_threshold`; anything farther stays unassigned (noise) until the
    next full recompute. Geometry (UMAP projection, layout version) is a later
    phase — this is the cluster assignment only.

The engine is pure: `cluster_embeddings` (HDBSCAN), the centroid/nearest-cluster
helpers, and the term-based labeler are import-light and unit-testable;
persistence happens in `ClusteringRunner` over the store seam (same shape as
MomentumRunner/ClassificationRunner). HDBSCAN comes from scikit-learn >= 1.3 —
the architecture review's choice, so the numba dependency is never pulled in —
and is imported lazily, keeping `import gitmaps.clustering` cheap.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Sequence

from gitmaps.embeddings import semantic_fingerprint
from gitmaps.repo_store import parse_pgvector
from gitmaps.similarity import cosine_similarity
from gitmaps.timeutil import utc_stamp

CLUSTERING_VERSION_KEY = "clustering_algorithm_version"
PROGRESS_PREFIX = "clustering."

#: Common English filler words that never discriminate one cluster from another.
#: Deliberately does NOT include technology words ("framework", "python") — the
#: domain prefix already supplies the tech identity, and the labeler also drops
#: terms that repeat the domain name itself.
_STOPWORDS = frozenset((
    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "at", "by", "from",
    "with", "into", "over", "under", "your", "you", "this", "that", "these", "those",
    "its", "it", "is", "are", "was", "were", "be", "been", "has", "have", "had", "not",
    "no", "so", "but", "as", "all", "any", "how", "why", "what", "when", "where", "which",
    "who", "will", "can", "should", "about", "using", "used", "use", "make", "made",
    "making", "built", "build", "based", "such", "more", "most", "than", "then", "there",
    "their", "them", "they", "like", "just", "out", "off", "one", "two", "some", "very",
    "new", "old", "open", "source", "code", "codes", "repo", "repos", "repository",
    "repositories", "project", "projects", "app", "apps", "application", "applications",
    "website", "site", "tool", "tools", "thing", "things", "set", "get", "put", "run",
    "running", "create", "creating", "created", "provide", "provides", "support", "supports",
    "simple", "easy", "fast", "quick", "lightweight", "modern", "powerful", "free", "real",
    "way", "work", "works", "working", "let", "lets", "allow", "allows", "enable", "enables",
    "feature", "features", "function", "functions", "written", "write", "writing", "read",
    "reads", "manage", "manages", "handle", "handles", "github", "git", "http", "https",
    "www",
))


@dataclass(frozen=True)
class ClusteringConfig:
    """Tuning knobs for the clustering engine — algorithm, not data.

    Everything that changes cluster structure feeds `clustering_version`, so a
    tuning change triggers a full recompute (see `clustering_version`).
    """

    min_cluster_size: int = 3
    min_samples: int | None = None  # None -> sklearn uses min_cluster_size
    cluster_selection_epsilon: float = 0.0
    similarity_threshold: float = 0.75  # incremental nearest-centroid floor
    label_max_terms: int = 2
    label_max_chars: int = 60
    universe: str = "surfaced"  # "surfaced" (map set) or "all" (whole universe)

    def __post_init__(self) -> None:
        if self.min_cluster_size < 1:
            raise ValueError(f"min_cluster_size must be >= 1, got {self.min_cluster_size}")
        if self.min_samples is not None and self.min_samples < 1:
            raise ValueError(f"min_samples must be >= 1 or None, got {self.min_samples}")
        if self.cluster_selection_epsilon < 0:
            raise ValueError(f"cluster_selection_epsilon must be >= 0, got {self.cluster_selection_epsilon}")
        if not -1.0 <= self.similarity_threshold <= 1.0:
            raise ValueError(f"similarity_threshold must be in [-1, 1], got {self.similarity_threshold}")
        if self.label_max_terms < 1:
            raise ValueError(f"label_max_terms must be >= 1, got {self.label_max_terms}")
        if self.label_max_chars < 1:
            raise ValueError(f"label_max_chars must be >= 1, got {self.label_max_chars}")
        if self.universe not in ("surfaced", "all"):
            raise ValueError(f"universe must be 'surfaced' or 'all', got {self.universe!r}")


@dataclass(frozen=True)
class ClusterKey:
    """Identity of a HDBSCAN cluster inside one domain: (domain, label index)."""

    domain: str
    label: int


@dataclass(frozen=True)
class RepoClusterInput:
    """A Repository row read for clustering (CLUSTERING_COLUMNS order).

    `embedding` and `domains` are parsed to their real types by
    `clustering_row_to_input`; the labeler reads only the metadata fields.
    """

    id: int
    embedding: list[float]
    domains: tuple[str, ...]
    full_name: str
    description: str | None
    topics: tuple[str, ...]
    language: str | None


@dataclass(frozen=True)
class ClusteringResult:
    """Summary of one `cluster` run (written to ingestion_state too)."""

    version: str
    force_full: bool
    repos_seen: int
    domains_clustered: int
    clusters_created: int
    repos_assigned: int
    noise: int


# ---------------------------------------------------------------------------
# Pure engine
# ---------------------------------------------------------------------------


def normalize(vector: Sequence[float]) -> list[float]:
    """Return a new vector L2-normalized to unit length; a zero vector stays all-zeros.

    Embeddings are already normalized (all-MiniLM output), but re-normalizing
    makes the engine robust to arbitrary input and lets HDBSCAN use Euclidean
    distance, which equals cosine distance for unit vectors.
    """
    norm = sum(x * x for x in vector) ** 0.5
    if norm == 0.0:
        return [0.0] * len(vector)
    return [x / norm for x in vector]


def centroid(vectors: Sequence[Sequence[float]]) -> list[float]:
    """The normalized mean of a cluster's member embeddings."""
    if not vectors:
        return []
    dim = len(vectors[0])
    mean = [sum(v[i] for v in vectors) / len(vectors) for i in range(dim)]
    return normalize(mean)


def cluster_embeddings(vectors: Sequence[Sequence[float]], config: ClusteringConfig) -> list[int]:
    """HDBSCAN cluster labels for `vectors`; -1 means noise.

    The pure statement of the clustering algorithm (architecture §7 stage 3).
    scikit-learn's HDBSCAN is imported lazily (the architecture review's nod:
    no numba dependency). Vectors are normalized first, so the Euclidean metric
    matches the cosine distance the embeddings were built for.
    """
    if len(vectors) < config.min_cluster_size:
        return [-1] * len(vectors)
    import numpy as np
    from sklearn.cluster import HDBSCAN as SkHDBSCAN  # type: ignore[import-untyped]

    X = np.array([normalize(v) for v in vectors], dtype=float)
    model = SkHDBSCAN(
        min_cluster_size=config.min_cluster_size,
        min_samples=config.min_samples,
        cluster_selection_epsilon=config.cluster_selection_epsilon,
        metric="euclidean",
        copy=False,
    )
    return [int(label) for label in model.fit_predict(X)]


def pick_best_cluster(
    embedding: Sequence[float],
    candidates: Sequence[tuple[ClusterKey, list[float]]],
) -> ClusterKey:
    """The candidate cluster whose centroid is most similar to `embedding`.

    Deterministic: candidates are compared in sorted (domain, label) order and
    ties resolve to the first — so a Repository in several domains lands in one
    well-defined cluster even when two centroids coincide.
    """
    best_key: ClusterKey | None = None
    best_sim = -1.0
    for key, centroid_vec in sorted(candidates, key=lambda kv: (kv[0].domain, kv[0].label)):
        sim = cosine_similarity(embedding, centroid_vec)
        if sim > best_sim:
            best_sim, best_key = sim, key
    assert best_key is not None  # candidates is never empty here
    return best_key


def nearest_cluster(
    embedding: Sequence[float],
    candidates: Sequence[tuple[int, list[float]]],
    min_similarity: float,
) -> int | None:
    """Nearest existing cluster (by centroid cosine) above `min_similarity`.

    Used by the incremental pass to assign a new Repository to the cluster it
    best fits. Returns the cluster id, or None when the Repository is too far
    from every cluster (noise). Deterministic tie-break: lowest cluster id.
    """
    best_id: int | None = None
    best_sim = -1.0
    for cluster_id, centroid_vec in sorted(candidates, key=lambda c: c[0]):
        sim = cosine_similarity(embedding, centroid_vec)
        if sim > best_sim:
            best_sim, best_id = sim, cluster_id
    if best_id is not None and best_sim >= min_similarity:
        return best_id
    return None


def extract_terms(*, description: str | None, topics: Sequence[str], language: str | None) -> set[str]:
    """Candidate label terms from one Repository's metadata.

    Topics split on separators ("vector-search" -> "vector", "search");
    description keeps words of >= 4 letters; the primary language is included
    verbatim (so a "Rust tooling" cluster can name its language). Common words
    are dropped; the domain name is filtered later, at label time.
    """
    terms: set[str] = set()
    for topic in topics or ():
        for part in re.split(r"[^a-z0-9]+", str(topic).lower()):
            if len(part) >= 2 and part not in _STOPWORDS:
                terms.add(part)
    if description:
        for word in re.findall(r"[a-z0-9]+", description.lower()):
            if len(word) >= 4 and word not in _STOPWORDS:
                terms.add(word)
    if language:
        lang = language.lower()
        if len(lang) >= 2 and lang not in _STOPWORDS:
            terms.add(lang)
    return terms


def label_cluster(
    domain: str,
    members: Sequence[RepoClusterInput],
    *,
    domain_term_counts: dict[str, int],
    domain_size: int,
    config: ClusteringConfig,
) -> str:
    """A readable, deterministic label from the cluster's dominant terms.

    Term-based labeling (D-06, `label_source='terms'`): terms are scored by how
    often they appear in the cluster's members (df) weighted by how rare they
    are across the whole domain (idf), so the label names what distinguishes
    THIS cluster from its domain, not the domain's wallpaper ("python", "app").
    The domain name prefixes the label ("AI agents", "Rust tooling") and terms
    that just repeat the domain are dropped.
    """
    if not members:
        return domain
    df: dict[str, int] = {}
    for member in members:
        for term in extract_terms(
            description=member.description, topics=member.topics, language=member.language
        ):
            df[term] = df.get(term, 0) + 1

    scores: dict[str, float] = {}
    for term, count in df.items():
        domain_df = domain_term_counts.get(term, 0)
        idf = 1.0 + math.log((domain_size + 1) / (domain_df + 1))
        scores[term] = count * idf

    domain_tokens = set(re.findall(r"[a-z0-9]+", domain.lower()))
    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    words = [domain]
    for term, _score in ranked:
        if term in domain_tokens:
            continue
        words.append(term)
        if len(words) - 1 >= config.label_max_terms:
            break

    label = " ".join(words)
    if len(label) > config.label_max_chars:
        label = label[: config.label_max_chars].rsplit(" ", 1)[0]
    return label


def clustering_version(config: ClusteringConfig) -> str:
    """Stable fingerprint of the algorithm + tuning — the full-pass trigger.

    A change to anything that alters cluster structure or the incremental
    assignment contract means the stored version stops matching and the next
    run is a full recompute (the same convention as the taxonomy version).
    """
    parts = (
        f"min_cluster_size={config.min_cluster_size}",
        f"min_samples={config.min_samples}",
        f"epsilon={config.cluster_selection_epsilon}",
        f"threshold={config.similarity_threshold}",
        f"label_terms={config.label_max_terms}",
        f"label_chars={config.label_max_chars}",
        f"universe={config.universe}",
    )
    return semantic_fingerprint("\n".join(parts))


def clustering_row_to_input(row: tuple) -> RepoClusterInput:
    """Map a CLUSTERING_COLUMNS row to a RepoClusterInput (parses the vector)."""
    repo_id, embedding, domains, full_name, description, topics, language = row
    return RepoClusterInput(
        id=repo_id,
        embedding=parse_pgvector(embedding) or [],
        domains=tuple(domains or ()),
        full_name=full_name,
        description=description,
        topics=tuple(topics or ()),
        language=language,
    )


def clustering_due_row_to_input(row: tuple) -> tuple[int, list[float], tuple[str, ...]]:
    """Map a due-clustering row (id, embedding, domains) to its parsed form."""
    repo_id, embedding, domains = row
    return (repo_id, parse_pgvector(embedding) or [], tuple(domains or ()))


@dataclass(frozen=True)
class DomainClustering:
    """The full-pass clustering result, keyed by member index into the input.

    Shared by the runner (which persists it) and the validator (which only
    prints it), so the dry run can never drift from what the pipeline writes.
    """

    resolved_groups: list[tuple[ClusterKey, list[int]]]  # (key, resolved member idxs)
    resolved: dict[int, ClusterKey]  # member idx -> its single cluster
    domains_clustered: int  # domains dense enough for HDBSCAN to run
    domain_term_counts: dict[str, dict[str, int]]  # idf context for labeling
    domain_size: dict[str, int]


def cluster_by_domain(members: Sequence[RepoClusterInput], config: ClusteringConfig) -> DomainClustering:
    """Cluster `members` per technology domain and resolve multi-domain members.

    The pure core of the full pass: group members by domain, run HDBSCAN on
    each domain's embeddings, and — because a Repository may carry several
    domains — resolve every member to the single cluster whose centroid is
    nearest to its embedding (deterministic). A member is a candidate in every
    domain's clustering but belongs to exactly one cluster, so the returned
    `resolved_groups` always matches what gets persisted.
    """
    domain_members: dict[str, list[int]] = {}
    for i, member in enumerate(members):
        for domain in member.domains:
            domain_members.setdefault(domain, []).append(i)

    member_terms = {
        i: extract_terms(description=m.description, topics=m.topics, language=m.language)
        for i, m in enumerate(members)
    }
    domain_term_counts: dict[str, dict[str, int]] = {}
    domain_size: dict[str, int] = {}
    for domain, idxs in domain_members.items():
        counts: dict[str, int] = {}
        for i in idxs:
            for term in member_terms[i]:
                counts[term] = counts.get(term, 0) + 1
        domain_term_counts[domain] = counts
        domain_size[domain] = len(idxs)

    candidates: dict[int, list[ClusterKey]] = {}
    domains_clustered = 0
    for domain in sorted(domain_members):
        idxs = domain_members[domain]
        if len(idxs) < config.min_cluster_size:
            continue  # too sparse to cluster — every member stays noise
        labels = cluster_embeddings([members[i].embedding for i in idxs], config)
        domains_clustered += 1
        for idx, label in zip(idxs, labels):
            if label >= 0:
                candidates.setdefault(idx, []).append(ClusterKey(domain, label))

    candidate_groups: dict[ClusterKey, list[int]] = {}
    for idx, keys in candidates.items():
        for key in keys:
            candidate_groups.setdefault(key, []).append(idx)
    centroids = {
        key: centroid([members[i].embedding for i in idxs])
        for key, idxs in candidate_groups.items()
    }
    resolved: dict[int, ClusterKey] = {}
    for idx, keys in candidates.items():
        resolved[idx] = pick_best_cluster(
            members[idx].embedding, [(key, centroids[key]) for key in keys]
        )

    resolved_groups: dict[ClusterKey, list[int]] = {}
    for idx, key in resolved.items():
        resolved_groups.setdefault(key, []).append(idx)
    return DomainClustering(
        resolved_groups=sorted(resolved_groups.items(), key=lambda kv: (kv[0].domain, kv[0].label)),
        resolved=resolved,
        domains_clustered=domains_clustered,
        domain_term_counts=domain_term_counts,
        domain_size=domain_size,
    )


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


class ClusteringRunner:
    """Orchestrates one `cluster` run over the store seam (pure engine above)."""

    def __init__(
        self,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        config: ClusteringConfig | None = None,
        batch_size: int = 200,
    ) -> None:
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or ClusteringConfig()
        self._batch_size = batch_size

    def run(self) -> ClusteringResult:
        version = clustering_version(self._config)
        stored = self._store.get_state(CLUSTERING_VERSION_KEY)
        run_stamp = utc_stamp(self._now())
        if stored != version:
            return self._run_full(version, run_stamp)
        return self._run_incremental(version, run_stamp)

    # -- full pass -----------------------------------------------------------

    def _run_full(self, version: str, run_stamp: str) -> ClusteringResult:
        members = self._load_all()
        repos_seen = len(members)
        clustering = cluster_by_domain(members, self._config)

        # Replace the cluster set (migration-07 recompute convention) and assign.
        # The member lists come from the RESOLVED membership, so member_count
        # and the labels always match the cluster_id assignments (a repo in
        # several domains belongs to exactly one cluster and is counted once).
        self._store.delete_clusters()
        cluster_id_by_key: dict[ClusterKey, int] = {}
        clusters_created = 0
        for ck, idxs in clustering.resolved_groups:
            domain = ck.domain
            label_text = label_cluster(
                domain,
                [members[i] for i in idxs],
                domain_term_counts=clustering.domain_term_counts[domain],
                domain_size=clustering.domain_size[domain],
                config=self._config,
            )
            cluster_id = self._store.insert_cluster(
                domain=domain, label=label_text, member_count=len(idxs), computed_at=run_stamp
            )
            cluster_id_by_key[ck] = cluster_id
            clusters_created += 1

        rows: list[tuple] = []
        for i, member in enumerate(members):
            resolved_key = clustering.resolved.get(i)
            cluster_id = cluster_id_by_key[resolved_key] if resolved_key is not None else None
            rows.append((cluster_id, run_stamp, member.id))
        self._store.set_cluster_memberships(rows)

        repos_assigned = len(clustering.resolved)
        noise = repos_seen - repos_assigned
        self._record_state(version, run_stamp, repos_seen, clusters_created, repos_assigned, noise)
        return ClusteringResult(
            version=version,
            force_full=True,
            repos_seen=repos_seen,
            domains_clustered=clustering.domains_clustered,
            clusters_created=clusters_created,
            repos_assigned=repos_assigned,
            noise=noise,
        )

    # -- incremental pass ----------------------------------------------------

    def _run_incremental(self, version: str, run_stamp: str) -> ClusteringResult:
        # Reconstruct each existing cluster's centroid from its members.
        clusters = self._store.get_cluster_members()  # (cluster_id, domain, embedding)
        member_vectors: dict[int, list[list[float]]] = {}
        cluster_domain: dict[int, str] = {}
        for cluster_id, domain, embedding in clusters:
            member_vectors.setdefault(cluster_id, []).append(embedding)
            cluster_domain[cluster_id] = domain
        centroids = [
            (cluster_id, cluster_domain[cluster_id], centroid(vecs))
            for cluster_id, vecs in member_vectors.items()
        ]

        repos_seen = repos_assigned = noise = 0
        offset = 0
        while True:
            rows = self._store.list_due_for_clustering(self._config.universe, self._batch_size, offset)
            if not rows:
                break
            for repo_id, embedding, domains in (clustering_due_row_to_input(r) for r in rows):
                repos_seen += 1
                domain_set = set(domains)
                candidates = [
                    (cluster_id, centroid_vec)
                    for cluster_id, domain, centroid_vec in centroids
                    if domain in domain_set
                ]
                best = nearest_cluster(embedding, candidates, self._config.similarity_threshold)
                if best is not None:
                    self._store.assign_repo_to_cluster(repo_id, best, run_stamp)
                    repos_assigned += 1
                else:
                    self._store.touch_clustered_at(repo_id, run_stamp)
                    noise += 1
            offset += self._batch_size
            if len(rows) < self._batch_size:
                break

        self._record_state(version, run_stamp, repos_seen, 0, repos_assigned, noise)
        return ClusteringResult(
            version=version,
            force_full=False,
            repos_seen=repos_seen,
            domains_clustered=0,
            clusters_created=0,
            repos_assigned=repos_assigned,
            noise=noise,
        )

    # -- helpers -------------------------------------------------------------

    def _load_all(self) -> list[RepoClusterInput]:
        members: list[RepoClusterInput] = []
        offset = 0
        while True:
            rows = self._store.list_all_for_clustering(self._config.universe, self._batch_size, offset)
            if not rows:
                break
            members.extend(clustering_row_to_input(row) for row in rows)
            offset += self._batch_size
            if len(rows) < self._batch_size:
                break
        return members

    def _record_state(
        self,
        version: str,
        run_stamp: str,
        repos_seen: int,
        clusters_created: int,
        repos_assigned: int,
        noise: int,
    ) -> None:
        self._store.set_state(CLUSTERING_VERSION_KEY, version)
        self._store.set_state(f"{PROGRESS_PREFIX}last_run_at", run_stamp)
        self._store.set_state(f"{PROGRESS_PREFIX}last_seen", repos_seen)
        self._store.set_state(f"{PROGRESS_PREFIX}last_clusters", clusters_created)
        self._store.set_state(f"{PROGRESS_PREFIX}last_assigned", repos_assigned)
        self._store.set_state(f"{PROGRESS_PREFIX}last_noise", noise)
