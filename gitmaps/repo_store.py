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
