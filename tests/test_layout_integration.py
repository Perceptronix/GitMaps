"""Live rolled-back integration test for the deterministic map layout.

Skips when no `DATABASE_URL` is available and runs the whole flow inside one
transaction that is always rolled back — the fixture cluster, its member repos,
their map positions, and the ingestion_state layout_version never persist. The
DB is expected to be migrated (this is `clusters.centroid_x/y` from migration 07
and `repos.map_x/y` from migration 02 in action, plus migration 12's clustered
schema). Nothing is mocked except the network.

Real embedded repos in the box have no cluster_id yet (clustering has never been
persisted), so the layout universe is exactly the fixtures and the test is
deterministic. The real MDS/PCA run against real Postgres; only the readme/GitHub
interaction is out of scope.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

import psycopg2
import pytest

from gitmaps.db import Db
from gitmaps.layout import (
    LAYOUT_VERSION_KEY,
    LayoutConfig,
    LayoutRunner,
    jitter_offset,
)
from gitmaps.repo_store import RepoStore, vector_to_pgvector

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)

#: Fixture id block reserved for the layout suite (others: momentum
#: 9_600_000_0xx, similarity 9_600_001_1xx, classification 9_600_002_xxx,
#: clustering 9_600_003_xxx).
M1, M2, M3, M4 = 9_600_004_101, 9_600_004_102, 9_600_004_103, 9_600_004_104
NEW = 9_600_004_105  # inserted after the full pass, anchored incrementally

CONFIG = LayoutConfig()

#: Four spread 384-d embeddings around one-hot index 300 — PCA gives them
#: distinct offsets; the deterministic jitter keeps them apart regardless.
BLOB = [
    [1.0 if i == 300 else 0.06 * (i % 3) for i in range(384)]
    for _ in range(4)
]

INSERT_CLUSTER_SQL = """
INSERT INTO clusters (domain, label, label_source, member_count, computed_at)
VALUES ('Databases', 'fixture cluster', 'terms', 0, %s)
RETURNING id
"""

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked, embedding, cluster_id)
VALUES (%s, 'inttest', %s, %s, %s, %s, NULL, 'https://fixture.example', %s, %s, true, true,
        %s::vector, %s)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced,
    tracked = EXCLUDED.tracked, embedding = EXCLUDED.embedding,
    cluster_id = EXCLUDED.cluster_id
"""

PAST = "2026-07-01T00:00:00Z"
MEMBERS = (M1, M2, M3, M4)


def _env_url() -> str | None:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    try:
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    value = line.split("=", 1)[1].strip()
                    return value.strip("'\"")
    except OSError:
        return None
    return None


@pytest.fixture
def live_db():
    url = _env_url()
    if not url:
        pytest.skip("DATABASE_URL not available")
    options = "-c statement_timeout=30000 -c lock_timeout=15000"
    try:
        conn = psycopg2.connect(url, connect_timeout=15, options=options)
        db = Db(conn)
    except psycopg2.Error as exc:  # pragma: no cover - depends on the box
        pytest.skip(f"Supabase unreachable: {exc}")
    try:
        yield db
    finally:
        db.rollback()
        db.close()


def _insert_cluster(db: Db) -> int:
    row = db.execute(INSERT_CLUSTER_SQL, ("2026-07-31T12:00:00Z",)).fetchone()
    assert row is not None  # RETURNING id always yields a row
    return row[0]


def _insert_member(db: Db, repo_id: int, cluster_id: int) -> None:
    db.execute(
        INSERT_REPO_SQL,
        (repo_id, f"layout-{repo_id}", f"inttest/layout-{repo_id}", "layout fixture",
         ["map"], PAST, PAST, vector_to_pgvector(BLOB[repo_id % 4]), cluster_id),
    )


def _runner(db: Db) -> LayoutRunner:
    return LayoutRunner(RepoStore(db), now=lambda: NOW, config=CONFIG)


def _cluster_xy(db: Db, cluster_id: int) -> tuple:
    row = db.execute(
        "SELECT centroid_x, centroid_y FROM clusters WHERE id = %s", (cluster_id,)
    ).fetchone()
    assert row is not None
    return (float(row[0]), float(row[1]))


def _repo_xy(db: Db, repo_id: int) -> tuple:
    row = db.execute("SELECT map_x, map_y FROM repos WHERE id = %s", (repo_id,)).fetchone()
    assert row is not None
    return (float(row[0]), float(row[1]))


def test_layout_pipeline_against_supabase_and_rolls_back(live_db: Db) -> None:
    db = live_db
    cluster_id = _insert_cluster(db)
    for repo_id in MEMBERS:
        _insert_member(db, repo_id, cluster_id)
    # A live run may have recorded a layout version; reset it inside this
    # transaction (rolled back below) so run 1 deterministically does a full pass.
    db.execute("DELETE FROM ingestion_state WHERE key = %s", (LAYOUT_VERSION_KEY,))

    first = _runner(db).run()

    # Run 1 — full pass: the one cluster gets a centroid, all four members get
    # a map position.
    assert first.force_full is True
    assert first.clusters_placed == 1
    assert first.repos_placed == 4
    cx, cy = _cluster_xy(db, cluster_id)
    assert cx is not None and cy is not None

    xy = {repo_id: _repo_xy(db, repo_id) for repo_id in MEMBERS}
    assert all(x is not None and y is not None for x, y in xy.values())
    assert len({tuple(xy[r]) for r in MEMBERS}) == 4  # members never coincide

    # A new member (no map position yet, same cluster) is anchored incrementally
    # at the cluster centroid plus its deterministic jitter.
    _insert_member(db, NEW, cluster_id)
    second = _runner(db).run()

    assert second.force_full is False
    assert second.repos_placed == 1
    nx, ny = _repo_xy(db, NEW)
    jx, jy = jitter_offset(NEW, CONFIG)
    assert abs(nx - (cx + jx)) < 1e-6 and abs(ny - (cy + jy)) < 1e-6


def test_layout_fixtures_are_rolled_back(live_db: Db) -> None:
    db = live_db
    cur = db.execute("SELECT id FROM repos WHERE id IN (%s, %s, %s, %s, %s)", (M1, M2, M3, M4, NEW))
    assert cur.fetchall() == []
