"""Repository storage: `repos` upserts and `ingestion_state` progress.

The mapping from a GitHub REST repository object to a `repos` row lives here
(repo_to_row) — that is the decision-rich logic, kept pure so it is unit-testable
without a database. The upsert conflicts on GitHub's immutable `id`, so a
renamed repository updates its row rather than duplicating it.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from gitmaps.momentum import PERIOD_DAYS
# Import from schemas since momentum module doesn't define these classes
# They are used only for API response serialization
from gitmaps.api.schemas import MomentumSignal, MomentumPeriod, MomentumScores

REPO_UPSERT_SQL = """
INSERT INTO repos (
    id, owner, name, full_name, description, topics, language, license,
    homepage, archived, is_fork, created_at, pushed_at,
    tracked, surfaced, stars, forks, watchers, open_issues
) VALUES (
    %(id)s, %(owner)s, %(name)s, %(full_name)s, %(description)s, %(topics)s,
    %(language)s, %(license)s, %(homepage)s, %(archived)s, %(is_fork)s,
    %(created_at)s, %(pushed_at)s, false, false, %(stars)s, %(forks)s,
    %(watchers)s, %(open_issues)s
)
ON CONFLICT (id) DO UPDATE SET
    owner      = EXCLUDED.owner,
    name       = EXCLUDED.name,
    full_name  = EXCLUDED.full_name,
    description = EXCLUDED.description,
    topics     = EXCLUDED.topics,
    language   = EXCLUDED.language,
    license    = EXCLUDED.license,
    homepage   = EXCLUDED.homepage,
    archived   = EXCLUDED.archived,
    is_fork    = EXCLUDED.is_fork,
    created_at = EXCLUDED.created_at,
    pushed_at  = EXCLUDED.pushed_at,
    stars      = EXCLUDED.stars,
    forks      = EXCLUDED.forks,
    watchers   = EXCLUDED.watchers,
    open_issues = EXCLUDED.open_issues
"""

STATE_UPSERT_SQL = """
INSERT INTO ingestion_state (key, value, updated_at)
VALUES (%s, %s, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
"""

INSERT_SNAPSHOT_SQL = """
INSERT INTO snapshots (
    repo_id, taken_at, kind, stars, forks, watchers, open_issues,
    contributors, commit_activity
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (repo_id, taken_at, kind) DO NOTHING
"""

TOUCH_SNAPSHOT_SQL = """
UPDATE repos SET
    last_snapshot_at = now(),
    first_snapshot_at = COALESCE(first_snapshot_at, now())
WHERE id = %s
"""

#: The GH Archive backfill's repo universe: everything already tracked or
#: surfaced, so a historical row is only written for repos we care about —
#: never the whole GH Archive firehose.
BACKFILL_REPOS_SQL = """
SELECT id, owner, name FROM repos
WHERE tracked = true OR surfaced = true
ORDER BY id
LIMIT %s OFFSET %s
"""

#: A repo's current core signals — the anchor the backfill walks backwards
#: from to reconstruct historical absolute counts.
BACKFILL_CURRENT_STATS_SQL = """
SELECT stars, forks, open_issues FROM repos WHERE id = %s
"""

DUE_CORE_SQL = """
SELECT r.id, r.owner, r.name FROM repos r
WHERE r.tracked AND (r.last_snapshot_at IS NULL OR r.last_snapshot_at < %s)
ORDER BY r.last_snapshot_at NULLS FIRST, r.id
LIMIT %s
"""

#: Column order for candidate reads — must match `row_to_signals` in promotion.py.
PROMOTION_COLUMNS = (
    "id, stars, forks, contributors, created_at, pushed_at, "
    "description, homepage, topics, tracked, surfaced, surfaced_at"
)

LIST_CANDIDATES_SQL = f"""
SELECT {PROMOTION_COLUMNS} FROM repos
WHERE NOT tracked
ORDER BY id
LIMIT %s
"""

LIST_TRACKED_NOT_SURFACED_SQL = f"""
SELECT {PROMOTION_COLUMNS} FROM repos
WHERE tracked AND NOT surfaced
ORDER BY id
LIMIT %s
"""

PROMOTE_TO_TRACKED_SQL = """
UPDATE repos SET tracked = true
WHERE id = %s AND NOT tracked
"""

PROMOTE_TO_SURFACED_SQL = """
UPDATE repos SET surfaced = true, surfaced_at = %s
WHERE id = %s AND NOT surfaced
"""

SET_SIGNIFICANCE_SQL = """
UPDATE repos SET
    significance_score = %s,
    significance_vars = %s
WHERE id = %s
"""

DUE_DEEP_SQL = """
SELECT r.id, r.owner, r.name FROM repos r
LEFT JOIN LATERAL (
    SELECT max(s.taken_at) AS last_deep FROM snapshots s
    WHERE s.repo_id = r.id AND s.kind = 'deep'
) d ON true
WHERE r.tracked AND (d.last_deep IS NULL OR d.last_deep < %s)
ORDER BY d.last_deep NULLS FIRST, r.id
LIMIT %s
"""

#: Snapshot row column order — must match the Momentum engine's column contract
#: (_SLOT_* indexes in gitmaps/momentum.py).
MOMENTUM_SNAPSHOT_COLUMNS = (
    "taken_at, kind, stars, forks, watchers, open_issues, contributors, commit_activity"
)

MOMENTUM_LIST_REPO_IDS_SQL = """
SELECT DISTINCT repo_id FROM snapshots
ORDER BY repo_id
LIMIT %s OFFSET %s
"""

MOMENTUM_GET_SNAPSHOTS_SQL = f"""
SELECT {MOMENTUM_SNAPSHOT_COLUMNS} FROM snapshots
WHERE repo_id = %s AND taken_at >= %s AND taken_at <= %s
ORDER BY taken_at, id
"""

MOMENTUM_GET_CREATED_AT_SQL = """
SELECT created_at FROM repos WHERE id = %s
"""

UPSERT_MOMENTUM_SQL = """
INSERT INTO momentum_scores (repo_id, period, computed_at, score, decomposition, rank)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (repo_id, period, computed_at) DO UPDATE SET
    score = EXCLUDED.score,
    decomposition = EXCLUDED.decomposition,
    rank = EXCLUDED.rank
"""

RANK_MOMENTUM_SQL = """
UPDATE momentum_scores m
SET rank = ranked.rn
FROM (
    SELECT repo_id, ROW_NUMBER() OVER (ORDER BY score DESC NULLS LAST) AS rn
    FROM momentum_scores
    WHERE period = %s AND computed_at = %s
) ranked
WHERE m.repo_id = ranked.repo_id
  AND m.period = %s
  AND m.computed_at = %s
"""

#: Embedding SELECT column order — must match `embedding_row_to_input` in
#: gitmaps/embeddings.py.
EMBEDDING_COLUMNS = (
    "r.id, r.owner, r.name, r.full_name, r.description, r.topics, "
    "r.language, r.homepage, r.embedding_fingerprint"
)

#: A repo is due when it has never been embedded, or its content may have
#: changed since last embed (embedded_at < pushed_at). {universe} is a
#: validated "AND r.surfaced" (surfaced-only) or "" (all repos) fragment.
EMBEDDING_DUE_SQL_TMPL = f"""
SELECT {EMBEDDING_COLUMNS} FROM repos r
WHERE (r.embedding IS NULL OR r.embedded_at IS NULL OR r.embedded_at < r.pushed_at)
{{universe}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

#: Full re-embed pass (model change / first run): every repo in the universe.
EMBEDDING_ALL_SQL_TMPL = f"""
SELECT {EMBEDDING_COLUMNS} FROM repos r
{{where}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

UPDATE_EMBEDDING_SQL = """
UPDATE repos SET
    embedding = %s::vector,
    embedding_fingerprint = %s,
    embedded_at = %s
WHERE id = %s
"""

TOUCH_EMBEDDED_SQL = "UPDATE repos SET embedded_at = %s WHERE id = %s"

#: Source row for the Similar repositories query (architecture §9): the source
#: repo's id + embedding + the filterable metadata. The embedding is the query
#: vector the ANN measures distance from.
SIMILAR_SOURCE_SQL = """
SELECT id, embedding, language, topics FROM repos WHERE full_name = %s
"""

#: Similar-repo SELECT columns — must match `row_to_similar` in
#: gitmaps/similarity.py.
SIMILAR_COLUMNS = (
    "r.id, r.owner, r.name, r.full_name, r.description, r.language, "
    "r.topics, r.stars, r.surfaced"
)

#: The HNSW ANN query (architecture §7/§9, migration 04): the source repo's
#: nearest neighbors by cosine distance, never itself, ordered by the `<=>`
#: operator so `repos_embedding_hnsw_idx` can serve it. `{filters}` holds the
#: optional language / topic / min-similarity WHERE clauses (see find_similar).
SIMILAR_QUERY_TMPL = f"""
SELECT {SIMILAR_COLUMNS},
       1 - (r.embedding <=> %s::vector) AS similarity
FROM repos r
WHERE r.embedding IS NOT NULL
  AND r.id != %s
{{filters}}
ORDER BY r.embedding <=> %s::vector
LIMIT %s
"""

#: Classification SELECT column order — must match
#: `classification_row_to_input` in gitmaps/classification.py.
CLASSIFICATION_COLUMNS = (
    "r.id, r.owner, r.name, r.full_name, r.description, r.topics, "
    "r.language, r.homepage, r.domains_fingerprint"
)

#: A repo is due for classification when it has never been classified, or its
#: content may have changed since (classified_at < pushed_at). {universe} is a
#: validated "AND r.surfaced" (surfaced-only) or "" (all repos) fragment.
CLASSIFICATION_DUE_SQL_TMPL = f"""
SELECT {CLASSIFICATION_COLUMNS} FROM repos r
WHERE (r.domains_fingerprint IS NULL OR r.classified_at IS NULL OR r.classified_at < r.pushed_at)
{{universe}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

#: Full re-classification pass (taxonomy change / first run): every repo in the
#: universe, so a retuned taxonomy propagates to already-classified repos.
CLASSIFICATION_ALL_SQL_TMPL = f"""
SELECT {CLASSIFICATION_COLUMNS} FROM repos r
{{where}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

UPDATE_CLASSIFICATION_SQL = """
UPDATE repos SET
    domains = %s,
    domains_fingerprint = %s,
    classified_at = %s
WHERE id = %s
"""

TOUCH_CLASSIFIED_SQL = "UPDATE repos SET classified_at = %s WHERE id = %s"

#: Clustering SELECT column order — must match `clustering_row_to_input` in
#: gitmaps/clustering.py. The full pass reads every embedded, classified repo
#: in the universe (embedding + domains for HDBSCAN, metadata for the labels).
CLUSTERING_COLUMNS = (
    "r.id, r.embedding, r.domains, r.full_name, r.description, r.topics, r.language"
)

CLUSTERING_ALL_SQL_TMPL = f"""
SELECT {CLUSTERING_COLUMNS} FROM repos r
WHERE r.embedding IS NOT NULL AND cardinality(r.domains) > 0
{{universe}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

#: A repo is due for the incremental clustering pass when it has never been
#: clustered (clustered_at IS NULL). Only the fields the nearest-centroid
#: assignment needs are read; the full SELECT above carries the label metadata.
CLUSTERING_DUE_SQL_TMPL = f"""
SELECT r.id, r.embedding, r.domains FROM repos r
WHERE r.embedding IS NOT NULL AND cardinality(r.domains) > 0
  AND r.clustered_at IS NULL
{{universe}}
ORDER BY r.id
LIMIT %s OFFSET %s
"""

#: Recompute convention (migration 07): a full pass REPLACES the cluster set;
#: deleting a cluster row SET NULLs the cluster_id of its member repos, which
#: the runner then overwrites with the fresh assignments.
DELETE_CLUSTERS_SQL = "DELETE FROM clusters"

INSERT_CLUSTER_SQL = """
INSERT INTO clusters (domain, label, label_source, member_count, computed_at)
VALUES (%s, %s, 'terms', %s, %s)
RETURNING id
"""

#: Cluster assignment — one UPDATE for both the full pass (bulk, cluster_id
#: NULL for noise) and the incremental pass (single repo to an existing
#: cluster): both set cluster_id + clustered_at together.
SET_CLUSTER_SQL = "UPDATE repos SET cluster_id = %s, clustered_at = %s WHERE id = %s"

#: Every cluster member's embedding, so the incremental pass can reconstruct
#: each cluster's centroid (mean of member vectors) in Python.
CLUSTER_MEMBERS_SQL = """
SELECT c.id, c.domain, r.embedding
FROM clusters c JOIN repos r ON r.cluster_id = c.id
"""

#: Incremental assignment keeps the denormalized member_count honest.
BUMP_CLUSTER_COUNT_SQL = "UPDATE clusters SET member_count = member_count + 1 WHERE id = %s"

#: A considered-but-unassigned repo (no cluster near enough): mark it processed
#: so the incremental pass does not retry it until the next full recompute.
TOUCH_CLUSTERED_SQL = "UPDATE repos SET clustered_at = %s WHERE id = %s"

#: Layout (Phase 8) — every cluster member's embedding, for the full pass to
#: recompute centroids and scatter members around them.
LAYOUT_MEMBERS_SQL = """
SELECT r.id, r.cluster_id, r.embedding
FROM repos r
WHERE r.cluster_id IS NOT NULL AND r.embedding IS NOT NULL
ORDER BY r.id
"""

SET_CLUSTER_POSITION_SQL = "UPDATE clusters SET centroid_x = %s, centroid_y = %s WHERE id = %s"

#: Clusters with a centroid — the anchors the incremental pass places new
#: members around.
CLUSTER_POSITIONS_SQL = """
SELECT id, domain, label, member_count, centroid_x, centroid_y
FROM clusters WHERE centroid_x IS NOT NULL
"""

#: A cluster member with no map position yet is due for the incremental anchor.
LAYOUT_DUE_SQL = """
SELECT r.id, r.cluster_id FROM repos r
WHERE r.cluster_id IS NOT NULL AND r.map_x IS NULL
ORDER BY r.id
"""

SET_REPO_POSITION_SQL = "UPDATE repos SET map_x = %s, map_y = %s WHERE id = %s"


def repo_to_row(repo: dict) -> dict:
    """Map a GitHub REST repository object to a `repos` row.

    Field choices worth noting:
      * `license` — GitHub exposes a license object; we store its SPDX id
        (falling back to its key).
      * `watchers` — GitHub's `watchers_count` is a legacy alias for stars,
        so the true watch (notification) count is `subscribers_count`.
      * `topics` — a Python list is adapted to Postgres `text[]` by psycopg2.
    """
    license_ = repo.get("license") or {}
    owner = repo["owner"]["login"]
    return {
        "id": repo["id"],
        "owner": owner,
        "name": repo["name"],
        "full_name": repo.get("full_name") or f"{owner}/{repo['name']}",
        "description": repo.get("description"),
        "topics": repo.get("topics") or [],
        "language": repo.get("language"),
        "license": license_.get("spdx_id") or license_.get("key"),
        "homepage": repo.get("homepage"),
        "archived": repo.get("archived", False),
        "is_fork": repo.get("fork", False),
        "created_at": repo.get("created_at"),
        "pushed_at": repo.get("pushed_at"),
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "watchers": repo.get("subscribers_count", 0),
        "open_issues": repo.get("open_issues_count", 0),
    }


def _universe_sql(universe: str) -> tuple[str, str]:
    """The validated (AND-clause, WHERE-clause) fragments for a universe.

    `universe` is the only SQL-influencing input, and it is validated against
    the two known values, so the fragment interpolation cannot inject SQL.
    `AND r.surfaced` / `WHERE r.surfaced` narrow a query to the surfaced tier;
    `("", "")` means every repository.
    """
    if universe == "surfaced":
        return "AND r.surfaced", "WHERE r.surfaced"
    if universe == "all":
        return "", ""
    raise ValueError(f"universe must be 'surfaced' or 'all', got {universe!r}")


def embedding_queries(universe: str) -> tuple[str, str]:
    """The (due, full) embedding SELECTs for a universe; validates the value."""
    universe_clause, where_clause = _universe_sql(universe)
    return (
        EMBEDDING_DUE_SQL_TMPL.format(universe=universe_clause),
        EMBEDDING_ALL_SQL_TMPL.format(where=where_clause),
    )


def vector_to_pgvector(vector) -> str:
    """Format a Python list of floats as a pgvector literal ("[1.0,2.0,...]")."""
    return "[" + ",".join(str(float(v)) for v in vector) + "]"


def parse_pgvector(value) -> list[float] | None:
    """Normalize a pgvector column value to a list of floats (or None).

    Without the pgvector-psycopg2 caster, a SELECTed vector column comes back
    as its text form ("[0.1,0.2,...]"); with the caster registered it is
    already a list. The Similar repositories query reads the source repo's
    embedding, so it normalizes here — the query path then re-formats with
    `vector_to_pgvector` regardless of which form psycopg2 returned.
    """
    if value is None:
        return None
    if isinstance(value, str):
        inner = value.strip().strip("[]")
        return [float(part) for part in inner.split(",")] if inner else []
    return [float(part) for part in value]


class RepoStore:
    """`repos` upserts plus `ingestion_state` progress (same Db seam)."""

    def __init__(self, db) -> None:
        self._db = db

    def upsert(self, repo: dict) -> int:
        return self._db.execute(REPO_UPSERT_SQL, repo_to_row(repo)).rowcount

    def upsert_many(self, repos: list[dict]) -> int:
        rows = [repo_to_row(repo) for repo in repos]
        if not rows:
            return 0
        return self._db.executemany(REPO_UPSERT_SQL, rows).rowcount

    def get_state(self, key: str) -> Any:
        cur = self._db.execute(
            "SELECT value FROM ingestion_state WHERE key = %s", (key,)
        )
        row = cur.fetchone()
        if row is None or row[0] is None:
            return None
        # psycopg2 parses jsonb columns to Python objects natively — no
        # json.loads here (that would double-parse and fail on bare strings).
        return row[0]

    def get_repo_by_id(self, repo_id: int) -> dict | None:
        """Get a repo by ID, returning the full_name and embedding."""
        cur = self._db.execute(
            "SELECT full_name, embedding FROM repos WHERE id = %s", (repo_id,)
        )
        row = cur.fetchone()
        if not row:
            return None
        return {"full_name": row[0], "embedding": row[1]}

    def get_repo_detail(self, repo_id: int) -> dict | None:
        """Get full repository detail by ID."""
        cur = self._db.execute(
            """
            SELECT
                r.id, r.owner, r.name, r.full_name, r.description, r.topics, r.language,
                r.license, r.homepage, r.archived, r.is_fork, r.created_at, r.pushed_at,
                r.stars, r.forks, r.watchers, r.open_issues,
                r.tracked, r.surfaced, r.surfaced_at,
                r.significance_score, r.significance_vars,
                r.domains, r.domains_fingerprint, r.classified_at,
                r.embedding_fingerprint, r.embedded_at,
                r.cluster_id, r.clustered_at,
                r.map_x, r.map_y
            FROM repos r
            WHERE r.id = %s
            """,
            (repo_id,),
        )
        row = cur.fetchone()
        if not row:
            return None

        (
            id_, owner, name, full_name, description, topics, language, license_,
            homepage, archived, is_fork, created_at, pushed_at,
            stars, forks, watchers, open_issues,
            tracked, surfaced, surfaced_at,
            significance_score, significance_vars,
            domains, domains_fingerprint, classified_at,
            embedding_fingerprint, embedded_at,
            cluster_id, clustered_at,
            map_x, map_y,
        ) = row

        # Get momentum scores if available
        momentum = None
        cur = self._db.execute(
            """
            SELECT period, computed_at, score, decomposition
            FROM momentum_scores
            WHERE repo_id = %s
            ORDER BY period
            """,
            (repo_id,),
        )
        momentum_rows = cur.fetchall()
        if momentum_rows:
            periods = {}
            computed_at = None
            for period, comp_at, score, decomp in momentum_rows:
                if computed_at is None:
                    computed_at = comp_at
                signals = {}
                for signal_name, signal_data in decomp.get("signals", {}).items():
                    signals[signal_name] = MomentumSignal(
                        signal=signal_name,
                        start=signal_data.get("start"),
                        end=signal_data.get("end"),
                        growth=signal_data.get("growth", 0.0),
                        span_days=signal_data.get("span_days", 0.0),
                        growth_per_day=signal_data.get("growth_per_day", 0.0),
                        prior_floor=signal_data.get("prior_floor", 10.0),
                        size_factor=signal_data.get("size_factor", 1.0),
                        target_per_day=signal_data.get("target_per_day", 1.0),
                        weight=signal_data.get("weight", 0.0),
                        score=signal_data.get("score", 0.0),
                        contribution=signal_data.get("contribution", 0.0),
                    )
                periods[period] = MomentumPeriod(
                    period=period,
                    score=score,
                    window_days=PERIOD_DAYS.get(period, 0),
                    age_days=decomp.get("age_days"),
                    age_factor=decomp.get("age_factor", 1.0),
                    age_cap=decomp.get("age_cap", 2.5),
                    max_signal_score=decomp.get("max_signal_score", 20.0),
                    signals=signals,
                )
            momentum = MomentumScores(
                repo_id=repo_id,
                computed_at=computed_at or datetime.now(),
                periods=periods,
            )

        return {
            "id": id_,
            "owner": owner,
            "name": name,
            "full_name": full_name,
            "description": description,
            "topics": list(topics or []),
            "language": language,
            "license": license_,
            "homepage": homepage,
            "archived": archived,
            "is_fork": is_fork,
            "created_at": created_at,
            "pushed_at": pushed_at,
            "stars": stars,
            "forks": forks,
            "watchers": watchers,
            "open_issues": open_issues,
            "tracked": tracked,
            "surfaced": surfaced,
            "surfaced_at": surfaced_at,
            "significance_score": significance_score,
            "significance_vars": significance_vars,
            "domains": list(domains or []),
            "domains_fingerprint": domains_fingerprint,
            "classified_at": classified_at,
            "embedding_fingerprint": embedding_fingerprint,
            "embedded_at": embedded_at,
            "cluster_id": cluster_id,
            "clustered_at": clustered_at,
            "map_x": map_x,
            "map_y": map_y,
            "momentum": momentum,
        }

    def set_state(self, key: str, value: Any) -> None:
        self._db.execute(STATE_UPSERT_SQL, (key, json.dumps(value)))

    # -- snapshot pipeline (architecture §5) -------------------------------

    def list_due_repos(self, kind: str, cutoff: str, limit: int) -> list[tuple[int, str, str]]:
        """Tracked repos due for a `kind` snapshot, oldest-first.

        `cutoff` is a timestamp string; repos whose last snapshot of that kind
        predates it (or have none) are due. The deep query uses a LATERAL to
        read the per-kind last time, since `repos.last_snapshot_at` is shared.
        """
        if kind not in ("core", "deep"):
            raise ValueError(f"kind must be 'core' or 'deep', got {kind!r}")
        sql = DUE_CORE_SQL if kind == "core" else DUE_DEEP_SQL
        cur = self._db.execute(sql, (cutoff, limit))
        return [tuple(row) for row in cur.fetchall()]

    def insert_snapshot(
        self,
        repo_id: int,
        taken_at: str,
        kind: str,
        *,
        stars: int | None = None,
        forks: int | None = None,
        watchers: int | None = None,
        open_issues: int | None = None,
        contributors: int | None = None,
        commit_activity: Any = None,
    ) -> int:
        """Insert a snapshot row; idempotent via UNIQUE(repo_id, taken_at, kind)."""
        commit_activity_json = json.dumps(commit_activity) if commit_activity is not None else None
        return self._db.execute(
            INSERT_SNAPSHOT_SQL,
            (
                repo_id, taken_at, kind, stars, forks, watchers, open_issues,
                contributors, commit_activity_json,
            ),
        ).rowcount

    def touch_snapshot_times(self, repo_id: int) -> None:
        """Mark a repo as freshly snapshotted (sets first time on first snapshot)."""
        self._db.execute(TOUCH_SNAPSHOT_SQL, (repo_id,))

    # -- GH Archive backfill pipeline ---------------------------------------

    def list_tracked_surfaced(self, limit: int = 500, offset: int = 0) -> list[tuple[int, str, str]]:
        """(id, owner, name) for every tracked or surfaced repo — the backfill universe."""
        cur = self._db.execute(BACKFILL_REPOS_SQL, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def get_repo_stats(self, repo_id: int) -> dict[str, int | None] | None:
        """The repo's current core signals — the anchor the backfill walks back from.

        Backfilled rows are reconstructed from these current values plus the GH
        Archive growth events, so the count at a historical day is the repo's
        current count minus everything that grew after that day.
        """
        cur = self._db.execute(BACKFILL_CURRENT_STATS_SQL, (repo_id,))
        row = cur.fetchone()
        if row is None:
            return None
        return {"stars": row[0], "forks": row[1], "open_issues": row[2]}

    # -- promotion pipeline (architecture §4) -------------------------------

    def list_candidates(self, limit: int = 100) -> list[tuple]:
        """Untracked repos — the promotion candidate pool (see PROMOTION_COLUMNS)."""
        cur = self._db.execute(LIST_CANDIDATES_SQL, (limit,))
        return [tuple(row) for row in cur.fetchall()]

    def list_tracked_not_surfaced(self, limit: int = 100) -> list[tuple]:
        """Tracked repos that haven't cleared the significance gate yet."""
        cur = self._db.execute(LIST_TRACKED_NOT_SURFACED_SQL, (limit,))
        return [tuple(row) for row in cur.fetchall()]

    def promote_to_tracked(self, repo_id: int) -> int:
        """Promote a candidate into the tracked snapshot rotation."""
        return self._db.execute(PROMOTE_TO_TRACKED_SQL, (repo_id,)).rowcount

    def promote_to_surfaced(self, repo_id: int, surfaced_at: str) -> int:
        """Promote a tracked repo to surfaced (records surfaced_at, once)."""
        return self._db.execute(PROMOTE_TO_SURFACED_SQL, (surfaced_at, repo_id)).rowcount

    def store_significance(self, repo_id: int, score: float, decomposition: dict) -> None:
        """Persist the gate result + its decomposition (transparency, ADR-0002)."""
        self._db.execute(SET_SIGNIFICANCE_SQL, (score, json.dumps(decomposition), repo_id))

    # -- momentum pipeline (architecture §5) ---------------------------------

    def list_snapshot_repo_ids(self, limit: int = 100, offset: int = 0) -> list[int]:
        """Repositories that have snapshots — the momentum universe, paged."""
        cur = self._db.execute(MOMENTUM_LIST_REPO_IDS_SQL, (limit, offset))
        return [row[0] for row in cur.fetchall()]

    def get_snapshots(self, repo_id: int, since: str, until: str) -> list[tuple]:
        """A repo's snapshot rows in `[since, until]`, oldest first (see MOMENTUM_SNAPSHOT_COLUMNS)."""
        cur = self._db.execute(MOMENTUM_GET_SNAPSHOTS_SQL, (repo_id, since, until))
        return [tuple(row) for row in cur.fetchall()]

    def get_repo_created_at(self, repo_id: int) -> Any:
        """Repo birth timestamp (the age signal for momentum)."""
        cur = self._db.execute(MOMENTUM_GET_CREATED_AT_SQL, (repo_id,))
        row = cur.fetchone()
        return row[0] if row else None

    def upsert_momentum(
        self,
        repo_id: int,
        period: str,
        computed_at: str,
        score: float,
        decomposition: dict,
        rank: int | None = None,
    ) -> int:
        """Upsert one period's score + decomposition (replaces that computed_at's row)."""
        return self._db.execute(
            UPSERT_MOMENTUM_SQL,
            (repo_id, period, computed_at, score, json.dumps(decomposition), rank),
        ).rowcount

    def rank_momentum(self, period: str, computed_at: str) -> None:
        """Assign per-period ranks (ROW_NUMBER over score desc) for one computed_at."""
        self._db.execute(RANK_MOMENTUM_SQL, (period, computed_at, period, computed_at))

    # -- embedding pipeline (architecture §7) --------------------------------

    def list_due_for_embedding(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        """Repos in the universe whose embedding is missing or possibly stale."""
        due_sql, _ = embedding_queries(universe)
        cur = self._db.execute(due_sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def list_all_for_embedding(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        """Every repo in the universe — the full re-embed pass."""
        _, full_sql = embedding_queries(universe)
        cur = self._db.execute(full_sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def store_embedding(self, repo_id: int, vector, fingerprint: str, embedded_at: str) -> int:
        """Write a repo's embedding + fingerprint + timestamp atomically (one UPDATE)."""
        return self._db.execute(
            UPDATE_EMBEDDING_SQL,
            (vector_to_pgvector(vector), fingerprint, embedded_at, repo_id),
        ).rowcount

    def touch_embedded_at(self, repo_id: int, embedded_at: str) -> None:
        """Advance embedded_at without re-embedding (content verified unchanged)."""
        self._db.execute(TOUCH_EMBEDDED_SQL, (embedded_at, repo_id))

    # -- similarity pipeline (architecture §9) -------------------------------

    def get_similar_source(self, full_name: str) -> tuple | None:
        """The source repo's (id, embedding, language, topics) — or None.

        The embedding is normalized to a list of floats (`parse_pgvector`), so
        the query path can hand it back to `find_similar` unchanged.
        """
        cur = self._db.execute(SIMILAR_SOURCE_SQL, (full_name,))
        row = cur.fetchone()
        if row is None:
            return None
        id_, embedding, language, topics = row
        return (id_, parse_pgvector(embedding), language, topics)

    def find_similar(
        self,
        repo_id: int,
        query_vector,
        *,
        limit: int,
        language: str | None = None,
        topic: str | None = None,
        min_similarity: float | None = None,
    ) -> list[tuple]:
        """Top-`limit` repos nearest to `query_vector` (HNSW cosine), source excluded.

        `language` filters to that exact primary language; `topic` to repos
        carrying that topic (text[] membership); `min_similarity` is a
        relevance floor on the returned score (architecture §9). The row order
        is `SIMILAR_COLUMNS + (similarity)` — see `row_to_similar` in
        gitmaps/similarity.py.
        """
        filters: list[str] = []
        params: list = [vector_to_pgvector(query_vector), repo_id]
        if language is not None:
            filters.append("AND r.language = %s")
            params.append(language)
        if topic is not None:
            filters.append("AND %s = ANY(r.topics)")
            params.append(topic)
        if min_similarity is not None:
            filters.append("AND 1 - (r.embedding <=> %s::vector) >= %s")
            params.extend((vector_to_pgvector(query_vector), min_similarity))
        sql = SIMILAR_QUERY_TMPL.format(filters="\n".join(filters))
        params.extend((vector_to_pgvector(query_vector), limit))  # ORDER BY, LIMIT
        cur = self._db.execute(sql, params)
        return [tuple(row) for row in cur.fetchall()]

    # -- technology classification pipeline (Phase 6.5) ---------------------

    def list_due_for_classification(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        """Repos due for classification, oldest-first (never/unchanged-checked).

        A repo is due when it has never been classified (`domains_fingerprint`
        NULL) or its content may have changed since (`classified_at <
        pushed_at`). The runner still skips content that is unchanged via the
        fingerprint, exactly like the embedding pass.
        """
        and_clause, _ = _universe_sql(universe)
        sql = CLASSIFICATION_DUE_SQL_TMPL.format(universe=and_clause)
        cur = self._db.execute(sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def list_all_for_classification(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        """Every repo in the universe (full pass after a taxonomy change)."""
        _, where_clause = _universe_sql(universe)
        sql = CLASSIFICATION_ALL_SQL_TMPL.format(where=where_clause)
        cur = self._db.execute(sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def store_classification(self, repo_id: int, domains: list[str], fingerprint: str, classified_at: str) -> int:
        """Write the assigned domains + the fingerprint that produced them."""
        return self._db.execute(
            UPDATE_CLASSIFICATION_SQL, (domains, fingerprint, classified_at, repo_id)
        ).rowcount

    def touch_classified_at(self, repo_id: int, classified_at: str) -> None:
        """Advance classified_at without re-classifying (content unchanged)."""
        self._db.execute(TOUCH_CLASSIFIED_SQL, (classified_at, repo_id))

    # -- clustering pipeline (Phase 7) -------------------------------------

    def list_all_for_clustering(self, universe: str = "surfaced", limit: int = 200, offset: int = 0) -> list[tuple]:
        """Every embedded, classified repo in the universe — the full cluster pass."""
        and_clause, _ = _universe_sql(universe)
        sql = CLUSTERING_ALL_SQL_TMPL.format(universe=and_clause)
        cur = self._db.execute(sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def list_due_for_clustering(self, universe: str = "surfaced", limit: int = 200, offset: int = 0) -> list[tuple]:
        """Repos that have never been clustered — the incremental pass."""
        and_clause, _ = _universe_sql(universe)
        sql = CLUSTERING_DUE_SQL_TMPL.format(universe=and_clause)
        cur = self._db.execute(sql, (limit, offset))
        return [tuple(row) for row in cur.fetchall()]

    def delete_clusters(self) -> None:
        """Drop every cluster row (recompute convention: the set is replaced)."""
        self._db.execute(DELETE_CLUSTERS_SQL)

    def insert_cluster(self, *, domain: str, label: str, member_count: int, computed_at: str) -> int:
        """Insert a cluster row and return its generated id (RETURNING id)."""
        cur = self._db.execute(INSERT_CLUSTER_SQL, (domain, label, member_count, computed_at))
        return cur.fetchone()[0]

    def set_cluster_memberships(self, rows: list[tuple]) -> None:
        """Bulk-assign cluster_id + clustered_at to repo ids (cluster_id None = noise)."""
        if rows:
            self._db.executemany(SET_CLUSTER_SQL, rows)

    def get_cluster_members(self) -> list[tuple]:
        """(cluster_id, domain, embedding) for every cluster member, normalized."""
        cur = self._db.execute(CLUSTER_MEMBERS_SQL)
        out = []
        for cluster_id, domain, embedding in cur.fetchall():
            vec = parse_pgvector(embedding)
            if vec is not None:
                out.append((cluster_id, domain, vec))
        return out

    def assign_repo_to_cluster(self, repo_id: int, cluster_id: int, clustered_at: str) -> None:
        """Attach a repo to an existing cluster and keep member_count honest."""
        self._db.execute(SET_CLUSTER_SQL, (cluster_id, clustered_at, repo_id))
        self._db.execute(BUMP_CLUSTER_COUNT_SQL, (cluster_id,))

    def touch_clustered_at(self, repo_id: int, clustered_at: str) -> None:
        """Mark a repo considered-but-unassigned (noise) as processed."""
        self._db.execute(TOUCH_CLUSTERED_SQL, (clustered_at, repo_id))

    # -- semantic-map layout (Phase 8) --------------------------------------

    def list_layout_members(self) -> list[tuple]:
        """(repo_id, cluster_id, embedding) for every cluster member — the full pass."""
        cur = self._db.execute(LAYOUT_MEMBERS_SQL)
        return [tuple(row) for row in cur.fetchall()]

    def set_cluster_position(self, cluster_id: int, x: float, y: float) -> None:
        """Write a cluster's 2D centroid position."""
        self._db.execute(SET_CLUSTER_POSITION_SQL, (x, y, cluster_id))

    def list_cluster_positions(self) -> list[tuple]:
        """(cluster_id, centroid_x, centroid_y) for clusters with a centroid."""
        cur = self._db.execute(CLUSTER_POSITIONS_SQL)
        return [tuple(row) for row in cur.fetchall()]

    def list_due_layout(self) -> list[tuple]:
        """(repo_id, cluster_id) for cluster members with no map position yet."""
        cur = self._db.execute(LAYOUT_DUE_SQL)
        return [tuple(row) for row in cur.fetchall()]

    def list_repo_positions(self, limit: int, offset: int) -> list[tuple]:
        """Get paginated repository map positions with cluster domain for coloring."""
        cur = self._db.execute(
            """
            SELECT r.id, r.map_x, map_y, r.cluster_id, r.stars, r.owner, r.name,
                   c.domain
            FROM repos r
            LEFT JOIN clusters c ON r.cluster_id = c.id
            WHERE r.map_x IS NOT NULL AND r.map_y IS NOT NULL
            ORDER BY r.id
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        )
        return [tuple(row) for row in cur.fetchall()]

    def list_all_repo_positions(self) -> list[tuple]:
        """Get every repository map position.

        The semantic map renders the whole universe of positioned repos; a
        LIMIT here silently truncates the visualization to the first page.
        """
        cur = self._db.execute(
            """
            SELECT r.id, r.map_x, map_y, r.cluster_id, r.stars, r.owner, r.name,
                   c.domain
            FROM repos r
            LEFT JOIN clusters c ON r.cluster_id = c.id
            WHERE r.map_x IS NOT NULL AND r.map_y IS NOT NULL
            ORDER BY r.id
            """
        )
        return [tuple(row) for row in cur.fetchall()]

    def count_repo_positions(self) -> int:
        """Get total count of repositories with map positions."""
        cur = self._db.execute(
            "SELECT COUNT(*) FROM repos WHERE map_x IS NOT NULL AND map_y IS NOT NULL"
        )
        return cur.fetchone()[0]

    def set_repo_positions(self, rows: list[tuple]) -> None:
        """Bulk-write map_x/map_y for repo ids."""
        if rows:
            self._db.executemany(SET_REPO_POSITION_SQL, rows)

    # -- API helper methods -----------------------------------------------------

    def list_clusters(
        self,
        *,
        pagination,
        sort,
        domain: str | None = None,
    ):
        """List clusters with pagination, sorting, and filtering."""
        from gitmaps.api.schemas import ClustersResponse, ClusterSummary

        where_clauses = ["centroid_x IS NOT NULL", "centroid_y IS NOT NULL"]
        params: list = []

        if domain:
            where_clauses.append("domain = %s")
            params.append(domain)

        where_sql = "WHERE " + " AND ".join(where_clauses)

        valid_sort = {"id": "id", "domain": "domain", "label": "label", "member_count": "member_count", "computed_at": "computed_at"}
        sort_field = valid_sort.get(sort.sort, "id")
        order = "ASC" if sort.order.lower() == "asc" else "DESC"

        # Total count
        cur = self._db.execute(
            f"SELECT COUNT(*) FROM clusters {where_sql}",
            tuple(params),
        )
        total = cur.fetchone()[0]

        # Paginated results
        params.extend([pagination.limit, pagination.offset])
        cur = self._db.execute(
            f"""
            SELECT id, domain, label, label_source, member_count, computed_at,
                   centroid_x, centroid_y
            FROM clusters
            {where_sql}
            ORDER BY {sort_field} {order}
            LIMIT %s OFFSET %s
            """,
            tuple(params),
        )
        rows = cur.fetchall()

        items = [
            ClusterSummary(
                id=row[0],
                domain=row[1],
                label=row[2],
                member_count=row[4],
                centroid_x=row[6],
                centroid_y=row[7],
                computed_at=row[5],
            )
            for row in rows
        ]

        total_pages = (total + pagination.per_page - 1) // pagination.per_page

        return ClustersResponse(
            items=items,
            page=pagination.page,
            per_page=pagination.per_page,
            total=total,
            total_pages=total_pages,
        )

    def search_repos(
        self,
        *,
        pagination,
        sort,
        q: str | None = None,
        language: str | None = None,
        topics: list[str] | None = None,
        domains: list[str] | None = None,
        min_stars: int | None = None,
        max_stars: int | None = None,
        tracked: bool | None = None,
        surfaced: bool | None = None,
        has_cluster: bool | None = None,
        has_map_position: bool | None = None,
    ):
        """Search repositories with full-text and filter support."""
        from gitmaps.api.schemas import SearchResponse, RepoBase

        where_clauses = []
        params: list = []

        # Full-text search
        if q:
            where_clauses.append(
                "(r.full_name ILIKE %s OR r.description ILIKE %s OR "
                "EXISTS (SELECT 1 FROM unnest(r.topics) t WHERE t ILIKE %s))"
            )
            search_term = f"%{q}%"
            params.extend([search_term, search_term, search_term])

        # Language filter
        if language:
            where_clauses.append("r.language = %s")
            params.append(language)

        # Topics filter (any match)
        if topics:
            for topic in topics:
                where_clauses.append("%s = ANY(r.topics)")
                params.append(topic)

        # Domains filter (any match)
        if domains:
            for domain in domains:
                where_clauses.append("%s = ANY(r.domains)")
                params.append(domain)

        # Stars range
        if min_stars is not None:
            where_clauses.append("r.stars >= %s")
            params.append(min_stars)
        if max_stars is not None:
            where_clauses.append("r.stars <= %s")
            params.append(max_stars)

        # Boolean filters
        if tracked is not None:
            where_clauses.append("r.tracked = %s")
            params.append(tracked)
        if surfaced is not None:
            where_clauses.append("r.surfaced = %s")
            params.append(surfaced)
        if has_cluster is not None:
            where_clauses.append("r.cluster_id IS NOT NULL" if has_cluster else "r.cluster_id IS NULL")
        if has_map_position is not None:
            where_clauses.append(
                "(r.map_x IS NOT NULL AND r.map_y IS NOT NULL)"
                if has_map_position
                else "(r.map_x IS NULL OR r.map_y IS NULL)"
            )

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        # Valid sort fields
        valid_sort = {
            "id": "r.id",
            "stars": "r.stars",
            "forks": "r.forks",
            "created_at": "r.created_at",
            "pushed_at": "r.pushed_at",
            "full_name": "r.full_name",
        }
        sort_field = valid_sort.get(sort.sort, "r.id")
        order = "ASC" if sort.order.lower() == "asc" else "DESC"

        # Total count
        cur = self._db.execute(
            f"SELECT COUNT(*) FROM repos r {where_sql}",
            tuple(params),
        )
        total = cur.fetchone()[0]

        # Paginated results
        params.extend([pagination.limit, pagination.offset])
        cur = self._db.execute(
            f"""
            SELECT
                r.id, r.owner, r.name, r.full_name, r.description, r.topics,
                r.language, r.license, r.homepage, r.archived, r.is_fork,
                r.created_at, r.pushed_at, r.stars, r.forks, r.watchers, r.open_issues
            FROM repos r
            {where_sql}
            ORDER BY {sort_field} {order}
            LIMIT %s OFFSET %s
            """,
            tuple(params),
        )
        rows = cur.fetchall()

        items = [
            RepoBase(
                id=row[0],
                owner=row[1],
                name=row[2],
                full_name=row[3],
                description=row[4],
                topics=list(row[5] or []),
                language=row[6],
                license=row[7],
                homepage=row[8],
                archived=row[9],
                is_fork=row[10],
                created_at=row[11],
                pushed_at=row[12],
                stars=row[13],
                forks=row[14],
                watchers=row[15],
                open_issues=row[16],
            )
            for row in rows
        ]

        total_pages = (total + pagination.per_page - 1) // pagination.per_page

        return SearchResponse(
            items=items,
            page=pagination.page,
            per_page=pagination.per_page,
            total=total,
            total_pages=total_pages,
            query=q,
        )

    def get_trending(
        self,
        *,
        pagination,
        period: str,
        language: str | None = None,
        topic: str | None = None,
        domain: str | None = None,
        min_score: float | None = None,
        surfaced_only: bool = False,
    ):
        """Get trending repositories by momentum score."""
        from gitmaps.api.schemas import TrendingResponse, RepoBase

        valid_periods = set(PERIOD_DAYS.keys())
        if period not in valid_periods:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=f"Invalid period. Must be one of {sorted(valid_periods)}")

        where_clauses = ["ms.period = %s"]
        params: list[Any] = [period]

        if language:
            where_clauses.append("r.language = %s")
            params.append(language)
        if topic:
            where_clauses.append("%s = ANY(r.topics)")
            params.append(topic)
        if domain:
            where_clauses.append("%s = ANY(r.domains)")
            params.append(domain)
        if min_score is not None:
            where_clauses.append("ms.score >= %s")
            params.append(min_score)
        if surfaced_only:
            where_clauses.append("r.surfaced = true")

        where_sql = "WHERE " + " AND ".join(where_clauses)

        # Total count
        cur = self._db.execute(
            f"""
            SELECT COUNT(*)
            FROM momentum_scores ms
            JOIN repos r ON r.id = ms.repo_id
            {where_sql}
            """,
            tuple(params),
        )
        total = cur.fetchone()[0]

        # Paginated results with momentum score
        params.extend([pagination.limit, pagination.offset])
        cur = self._db.execute(
            f"""
            SELECT
                r.id, r.owner, r.name, r.full_name, r.description, r.topics,
                r.language, r.license, r.homepage, r.archived, r.is_fork,
                r.created_at, r.pushed_at, r.stars, r.forks, r.watchers, r.open_issues,
                ms.score, ms.decomposition
            FROM momentum_scores ms
            JOIN repos r ON r.id = ms.repo_id
            {where_sql}
            ORDER BY ms.score DESC NULLS LAST
            LIMIT %s OFFSET %s
            """,
            tuple(params),
        )
        rows = cur.fetchall()

        items = [
            RepoBase(
                id=row[0],
                owner=row[1],
                name=row[2],
                full_name=row[3],
                description=row[4],
                topics=list(row[5] or []),
                language=row[6],
                license=row[7],
                homepage=row[8],
                archived=row[9],
                is_fork=row[10],
                created_at=row[11],
                pushed_at=row[12],
                stars=row[13],
                forks=row[14],
                watchers=row[15],
                open_issues=row[16],
            )
            for row in rows
        ]

        total_pages = (total + pagination.per_page - 1) // pagination.per_page

        return TrendingResponse(
            items=items,
            period=period,
            page=pagination.page,
            per_page=pagination.per_page,
            total=total,
            total_pages=total_pages,
        )
