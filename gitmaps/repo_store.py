"""Repository storage: `repos` upserts and `ingestion_state` progress.

The mapping from a GitHub REST repository object to a `repos` row lives here
(repo_to_row) — that is the decision-rich logic, kept pure so it is unit-testable
without a database. The upsert conflicts on GitHub's immutable `id`, so a
renamed repository updates its row rather than duplicating it.
"""

from __future__ import annotations

import json
from typing import Any

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


def embedding_queries(universe: str) -> tuple[str, str]:
    """The (due, full) embedding SELECTs for a universe; validates the value.

    `universe` is the only SQL-influencing input, and it is validated against
    the two known values, so the fragment interpolation cannot inject SQL.
    """
    if universe == "surfaced":
        universe_clause, where_clause = "AND r.surfaced", "WHERE r.surfaced"
    elif universe == "all":
        universe_clause, where_clause = "", ""
    else:
        raise ValueError(f"universe must be 'surfaced' or 'all', got {universe!r}")
    return (
        EMBEDDING_DUE_SQL_TMPL.format(universe=universe_clause),
        EMBEDDING_ALL_SQL_TMPL.format(where=where_clause),
    )


def vector_to_pgvector(vector) -> str:
    """Format a Python list of floats as a pgvector literal ("[1.0,2.0,...]")."""
    return "[" + ",".join(str(float(v)) for v in vector) + "]"


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
