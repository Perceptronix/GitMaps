"""Live rolled-back integration test for the Similar repositories service.

Skips when no `DATABASE_URL` is available (CI / a box without the `.env`), and
runs the whole flow inside one transaction that is always rolled back — the
fixture repositories never persist. The DB is expected to be migrated (this is
`repos.embedding` + the `repos_embedding_hnsw_idx` HNSW index from migration 04
in action).

The fixture vectors are near-pure basis directions, so the neighbor fixture's
cosine similarity with the source (~0.994) is far above anything a real dense
embedding can produce — the top result and the exact score are deterministic
even though the real DB carries ~100 other embedded repositories. Language and
topic filter assertions are written tolerant of those interlopers.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

import psycopg2
import pytest

from gitmaps.db import Db
from gitmaps.repo_store import RepoStore, vector_to_pgvector
from gitmaps.similarity import (
    RepoNotEmbeddedError,
    RepoNotFoundError,
    SimilarityConfig,
    SimilarityService,
    cosine_similarity,
)

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
PAST = "2026-07-01T00:00:00Z"

# Fixture ids in the high range (matches the embedding suite's convention).
SOURCE_ID, NEIGHBOR_ID, FAR_ID, RUST_ID, ML_ID, NO_EMBED_ID = range(
    9_600_001_101, 9_600_001_107
)

# Near-pure basis vectors on the first two coordinates (all L2-normalized), so
# cosine similarities with the source are extreme and deterministic.
E1 = [1.0] + [0.0] * 383


def unit_vector(a: float, b: float) -> list[float]:
    """A normalized 384-d vector pointing along (a, b); the rest is zero."""
    v = [0.0] * 384
    v[0] = a
    v[1] = b
    norm = (a * a + b * b) ** 0.5
    return [x / norm for x in v]


NEIGHBOR_VEC = unit_vector(0.9, 0.1)  # cos ~0.994 with the source
FAR_VEC = unit_vector(0.1, 0.9)       # cos ~0.11 with the source
RUST_VEC = unit_vector(0.0, 1.0)      # cos 0 with the source
ML_VEC = unit_vector(0.7, 0.7)        # cos ~0.707 with the source

#: The unique topic proves the topic filter is hermetic — no real repo carries it.
UNIQUE_TOPIC = "inttest-fixture"

FIXTURES: dict[int, tuple[str, str, str, list[str], list[float]]] = {
    SOURCE_ID:   ("sim-source", "inttest/sim-source", "Python", ["web", "api", UNIQUE_TOPIC], E1),
    NEIGHBOR_ID: ("sim-neighbor", "inttest/sim-neighbor", "Python", ["web"], NEIGHBOR_VEC),
    FAR_ID:      ("sim-far", "inttest/sim-far", "Python", ["games"], FAR_VEC),
    RUST_ID:     ("sim-rust", "inttest/sim-rust", "Rust", ["cli"], RUST_VEC),
    ML_ID:       ("sim-ml", "inttest/sim-ml", "Python", ["ml", UNIQUE_TOPIC], ML_VEC),
}

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked, embedding)
VALUES (%s, 'inttest', %s, %s, %s, %s, %s, NULL, %s, %s, true, true, %s::vector)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced,
    tracked = EXCLUDED.tracked, embedding = EXCLUDED.embedding
"""

INSERT_REPO_NO_EMBED_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked)
VALUES (%s, 'inttest', %s, %s, %s, %s, %s, NULL, %s, %s, true, true)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced,
    tracked = EXCLUDED.tracked
"""


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


def _insert_fixtures(db: Db) -> None:
    for repo_id, (name, full_name, language, topics, vector) in FIXTURES.items():
        db.execute(
            INSERT_REPO_SQL,
            (repo_id, name, full_name, f"inttest fixture {name}", topics,
             language, PAST, PAST, vector_to_pgvector(vector)),
        )


def test_similar_returns_nearest_neighbor_with_exact_score(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)

    result = SimilarityService(store).similar("inttest/sim-source")

    # The neighbor fixture (~0.994 similarity) is deterministic top-1 — no real
    # dense embedding comes anywhere near a basis vector.
    top = result[0]
    assert top.full_name == "inttest/sim-neighbor"
    assert top.similarity == pytest.approx(cosine_similarity(E1, NEIGHBOR_VEC), abs=1e-6)
    assert top.language == "Python" and top.surfaced is True

    # The source repo is never its own neighbor.
    assert all(r.id != SOURCE_ID for r in result)

    # Scores are descending (the ANN orders by cosine distance).
    scores = [r.similarity for r in result]
    assert scores == sorted(scores, reverse=True)


def test_similar_language_filter(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)

    result = SimilarityService(store).similar("inttest/sim-source", language="Rust")

    # Real repos may also be Rust — assert the filter holds and the fixture is in.
    assert result, "expected at least the Rust fixture"
    assert all(r.language == "Rust" for r in result)
    assert {r.id for r in result} >= {RUST_ID}
    assert all(r.id != SOURCE_ID for r in result)


def test_similar_topic_filter_is_hermetic(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)

    result = SimilarityService(store).similar("inttest/sim-source", topic=UNIQUE_TOPIC)

    # Only the two fixtures carrying the unique topic qualify; the source itself
    # carries it too but is excluded by id.
    assert {r.id for r in result} == {ML_ID}
    assert result[0].full_name == "inttest/sim-ml"


def test_similar_min_similarity_floor(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)

    result = SimilarityService(
        store, config=SimilarityConfig(top_n=5, min_similarity=0.5)
    ).similar("inttest/sim-source")

    assert {r.id for r in result} == {NEIGHBOR_ID, ML_ID}  # 0.994 and 0.707 pass
    assert all(r.similarity >= 0.5 for r in result)
    assert all(r.id != FAR_ID for r in result)  # 0.11 falls below the floor


def test_similar_unknown_source_raises(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    with pytest.raises(RepoNotFoundError):
        SimilarityService(store).similar("inttest/does-not-exist")


def test_similar_source_not_embedded_raises(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    db.execute(
        INSERT_REPO_NO_EMBED_SQL,
        (NO_EMBED_ID, "sim-no-embed", "inttest/sim-no-embed",
         "not embedded yet", ["x"], "Python", PAST, PAST),
    )
    with pytest.raises(RepoNotEmbeddedError):
        SimilarityService(store).similar("inttest/sim-no-embed")


def test_hnsw_index_exists(live_db: Db) -> None:
    """The query is index-eligible; confirm the HNSW index is actually deployed."""
    db = live_db
    cur = db.execute("SELECT to_regclass('public.repos_embedding_hnsw_idx')")
    assert cur.fetchone()[0] is not None


def test_similarity_fixtures_are_rolled_back(live_db: Db) -> None:
    """After the transaction rolls back, every fixture repo must be gone."""
    db = live_db
    cur = db.execute(
        "SELECT count(*) FROM repos WHERE id BETWEEN %s AND %s",
        (SOURCE_ID, NO_EMBED_ID),
    )
    assert cur.fetchone()[0] == 0
