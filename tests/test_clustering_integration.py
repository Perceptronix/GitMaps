"""Live rolled-back integration test for the semantic clustering pipeline.

Skips when no `DATABASE_URL` is available (CI / a box without the `.env`), and
runs the whole flow inside one transaction that is always rolled back — the
fixture repositories, their cluster rows, and the ingestion_state entries never
persist. The DB is expected to be migrated (this is `clusters.domain` +
`repos.clustered_at` from migration 12 in action, over the migration-07 schema).

The fixtures are six embedded, classified repos in the "Databases" domain
forming two well-separated 384-d blobs (verified to make HDBSCAN emit exactly
two clusters), plus a seventh "new" repo inserted after the full pass to
exercise the incremental nearest-centroid assignment. Real embedded repos in
the box have no domains yet, so the clustering universe is exactly the fixtures
and the test stays deterministic and fast. The real HDBSCAN runs against real
Postgres + pgvector; nothing is mocked except the absent network.
"""

from __future__ import annotations

import os
import random
from datetime import datetime, timezone

import psycopg2
import pytest

from gitmaps.clustering import (
    CLUSTERING_VERSION_KEY,
    ClusteringConfig,
    ClusteringRunner,
    clustering_version,
)
from gitmaps.db import Db
from gitmaps.repo_store import RepoStore, vector_to_pgvector

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"

#: Fixture id block reserved for the clustering suite (others: momentum
#: 9_600_000_0xx, similarity 9_600_001_1xx, classification 9_600_002_xxx).
V1, V2, V3 = 9_600_003_101, 9_600_003_102, 9_600_003_103  # "vector" blob
S1, S2, S3 = 9_600_003_201, 9_600_003_202, 9_600_003_203  # "sql" blob
NEW = 9_600_003_301  # inserted after the full pass, assigned incrementally

CONFIG = ClusteringConfig(min_cluster_size=3)

#: Two spread 384-d blobs around distinct one-hot spikes (indexes 300 / 310),
#: generated deterministically — this exact shape makes HDBSCAN emit two
#: clusters with min_cluster_size=3 (verified in the pure-layer tests).
RNG = random.Random(7)


def _one_hot(idx: int, value: float = 1.0) -> list[float]:
    vec = [0.0] * 384
    vec[idx] = value
    return vec


def _spread(center: list[float], n: int, spread: float = 0.06) -> list[list[float]]:
    return [[c + RNG.uniform(-spread, spread) for c in center] for _ in range(n)]


VECTOR_BLOB = _spread(_one_hot(300), 3, 0.06)
SQL_BLOB = _spread(_one_hot(310), 3, 0.06)
VECTOR_CENTROID = _one_hot(300)  # the incremental fixture sits right on the spike

#: (id, name, description, topics) — language is left NULL so the labeler's
#: top terms come from description/topics, not the language.
FIXTURES = {
    V1: ("clust-vec-1", "vector database", ["vector"]),
    V2: ("clust-vec-2", "vector database", ["vector"]),
    V3: ("clust-vec-3", "vector database", ["vector"]),
    S1: ("clust-sql-1", "sql engine", ["sql"]),
    S2: ("clust-sql-2", "sql engine", ["sql"]),
    S3: ("clust-sql-3", "sql engine", ["sql"]),
}

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked, embedding, domains)
VALUES (%s, 'inttest', %s, %s, %s, %s, NULL, 'https://fixture.example', %s, %s, true, true,
        %s::vector, %s)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced,
    tracked = EXCLUDED.tracked, embedding = EXCLUDED.embedding,
    domains = EXCLUDED.domains
"""

PAST = "2026-07-01T00:00:00Z"


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


_BLOB_IDS = {V1: VECTOR_BLOB[0], V2: VECTOR_BLOB[1], V3: VECTOR_BLOB[2],
             S1: SQL_BLOB[0], S2: SQL_BLOB[1], S3: SQL_BLOB[2]}


def _insert_fixtures(db: Db, *, include_new: bool = False) -> None:
    for repo_id, (name, description, topics) in FIXTURES.items():
        db.execute(
            INSERT_REPO_SQL,
            (repo_id, name, f"inttest/{name}", description, topics, PAST, PAST,
             vector_to_pgvector(_BLOB_IDS[repo_id]), ["Databases"]),
        )
    if include_new:
        db.execute(
            INSERT_REPO_SQL,
            (NEW, "clust-new", "inttest/clust-new", "vector database", ["vector"],
             PAST, PAST, vector_to_pgvector(VECTOR_CENTROID), ["Databases"]),
        )


def _runner(db: Db) -> ClusteringRunner:
    return ClusteringRunner(RepoStore(db), now=lambda: NOW, config=CONFIG)


def _cluster_row(db: Db, cluster_id: int) -> tuple:
    cur = db.execute(
        "SELECT domain, label, label_source, member_count FROM clusters WHERE id = %s",
        (cluster_id,),
    )
    row = cur.fetchone()
    assert row is not None  # the fixture cluster must exist inside this transaction
    return row


def _repo_cluster(db: Db, repo_id: int) -> tuple:
    cur = db.execute(
        "SELECT cluster_id, clustered_at FROM repos WHERE id = %s", (repo_id,)
    )
    row = cur.fetchone()
    assert row is not None  # the fixture repo must exist inside this transaction
    return row


def test_clustering_pipeline_against_supabase_and_rolls_back(live_db: Db) -> None:
    db = live_db
    _insert_fixtures(db)
    # A live run may have recorded a clustering version; reset it inside this
    # transaction (rolled back below) so run 1 deterministically does a full pass.
    db.execute("DELETE FROM ingestion_state WHERE key = %s", (CLUSTERING_VERSION_KEY,))

    first = _runner(db).run()

    # Run 1 — full pass (no version recorded yet). The box may already hold real
    # embedded, classified repos, so only the fixtures' invariants are asserted:
    # the two 384-d blobs each land in their own cluster, far from any real repo
    # (their one-hot spikes make cosine to real dense embeddings ~0.1).
    assert first.force_full is True
    assert first.clusters_created >= 2

    vec_cluster_id = _repo_cluster(db, V1)[0]
    sql_cluster_id = _repo_cluster(db, S1)[0]
    assert vec_cluster_id is not None and sql_cluster_id is not None
    assert vec_cluster_id != sql_cluster_id
    # Both blobs are internally coherent.
    assert {_repo_cluster(db, i)[0] for i in (V1, V2, V3)} == {vec_cluster_id}
    assert {_repo_cluster(db, i)[0] for i in (S1, S2, S3)} == {sql_cluster_id}
    # Every considered repo's clustered_at advanced (STAMP = the injected clock).
    assert all(_repo_cluster(db, i)[1] == NOW for i in (V1, V2, V3, S1, S2, S3))

    # Cluster rows: term-labeled, domain-tagged, honest member counts.
    vc = _cluster_row(db, vec_cluster_id)
    sc = _cluster_row(db, sql_cluster_id)
    assert vc[0] == sc[0] == "Databases"
    assert vc[2] == sc[2] == "terms"  # D-06 term-based labeling
    assert vc[1].startswith("Databases") and "vector" in vc[1]
    assert sc[1].startswith("Databases") and "sql" in sc[1]
    assert vc[3] >= 3 and sc[3] >= 3

    # A new repo (no clustered_at yet, same embedding neighborhood as the
    # vector blob) is assigned incrementally to the nearest existing cluster.
    _insert_fixtures(db, include_new=True)
    before = _cluster_row(db, vec_cluster_id)[3]
    second = _runner(db).run()

    assert second.force_full is False
    new_cluster_id, new_at = _repo_cluster(db, NEW)
    assert new_cluster_id == vec_cluster_id
    assert new_at == NOW
    # The denormalized member_count stays honest (bumped by exactly one).
    assert _cluster_row(db, vec_cluster_id)[3] == before + 1


def test_clustering_fixtures_are_rolled_back(live_db: Db) -> None:
    db = live_db
    cur = db.execute(
        "SELECT id FROM repos WHERE id IN (%s, %s, %s, %s, %s, %s, %s)",
        (V1, V2, V3, S1, S2, S3, NEW),
    )
    assert cur.fetchall() == []
