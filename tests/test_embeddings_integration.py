"""Live rolled-back integration test for the embedding pipeline against Supabase.

Skips when no `DATABASE_URL` is available (CI / a box without the `.env`), and
runs the whole flow inside one transaction that is always rolled back — the
fixture repository, its embedding, and the ingestion_state rows never persist.
The DB is expected to be migrated (this is the `repos.embedding` vector column
in action, plus the migration-10 tracking columns). The GitHub readme fetch is
stubbed: the network/GitHub interaction is unit-tested; here the point is the
pgvector store, the due-query, and the fingerprint skip against real Postgres.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import psycopg2
import pytest

from gitmaps.db import Db
from gitmaps.embeddings import (
    EmbeddingRunner,
    SentenceTransformerEmbedder,
    compose_semantic_text,
    semantic_fingerprint,
)
from gitmaps.repo_store import RepoStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
FIXTURE_REPO_ID = 9_600_000_002
FIXTURE_FULL_NAME = "inttest/embedding-fixture"
FIXTURE_README = "# Fixture README\n\nA deterministic repository used by the live test."

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked)
VALUES (%s, 'inttest', 'embedding-fixture', %s, %s, %s, %s, %s, %s, %s, true, true)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced, tracked = EXCLUDED.tracked
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


class StubReadmeClient:
    """Duck-typed readme seam: returns a fixed README for every repo."""

    def get_readme(self, owner: str, name: str) -> str:
        return FIXTURE_README


class StubSentenceModel:
    """Duck-typed SentenceTransformer: deterministic 384-d normalized vectors.

    Keeps the live test hermetic and fast — the real model is exercised by the
    re-embed validation run, not by the suite's DB round-trip test.
    """

    def __init__(self) -> None:
        self.dimension = 384
        self.component = 1.0 / 384**0.5

    def encode(self, texts, normalize_embeddings: bool = True) -> list[list[float]]:
        return [[self.component] * self.dimension for _ in texts]


def _insert_fixture(db: Db) -> None:
    past = (NOW - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    db.execute(
        INSERT_REPO_SQL,
        (
            FIXTURE_REPO_ID, FIXTURE_FULL_NAME,
            "A fixture repository for the live embedding test.",
            ["python", "cli", "fixture"], "Python", "https://fixture.example",
            past, past,
        ),
    )


def _expected_fingerprint() -> str:
    text = compose_semantic_text(
        full_name=FIXTURE_FULL_NAME,
        description="A fixture repository for the live embedding test.",
        topics=["python", "cli", "fixture"],
        language="Python",
        homepage="https://fixture.example",
        readme=FIXTURE_README,
        readme_max_chars=2000,
    )
    return semantic_fingerprint(text)


def test_embedding_pipeline_against_supabase_and_rolls_back(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixture(db)

    # A live re-embed may have recorded the model version already; reset it
    # inside this transaction (rolled back below) so run 1 deterministically
    # exercises the full pass.
    db.execute("DELETE FROM ingestion_state WHERE key = 'embedding_model_version'")

    provider = SentenceTransformerEmbedder(
        dimension=384, sentence_transformer=StubSentenceModel()
    )
    runner = EmbeddingRunner(StubReadmeClient(), store, provider, now=lambda: NOW)

    # Run 1 — full pass (no model version recorded yet): the fixture is embedded.
    first = runner.run()
    assert first.force_full is True
    assert first.embedded >= 1

    # The fixture row now carries a real pgvector embedding + fingerprint.
    cur = db.execute(
        "SELECT embedding, embedding_fingerprint, embedded_at FROM repos WHERE id = %s",
        (FIXTURE_REPO_ID,),
    )
    embedding, fingerprint, embedded_at = cur.fetchone()
    assert embedding is not None
    assert _vector_dims(db) == 384
    assert fingerprint == _expected_fingerprint()
    assert embedded_at is not None

    # Make the fixture due again (pushed_at into the future) but leave the
    # content identical: run 2 must skip it and advance embedded_at.
    db.execute(
        "UPDATE repos SET pushed_at = %s WHERE id = %s",
        ((NOW + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ"), FIXTURE_REPO_ID),
    )
    second = runner.run()
    assert second.force_full is False
    assert second.skipped >= 1

    cur = db.execute(
        "SELECT embedding_fingerprint, embedded_at FROM repos WHERE id = %s",
        (FIXTURE_REPO_ID,),
    )
    fingerprint2, embedded_at2 = cur.fetchone()
    assert fingerprint2 == fingerprint  # untouched content, untouched fingerprint
    assert embedded_at2 is not None

    # Progress + model version were recorded (universe-wide, so lower-bounded).
    assert store.get_state("embedding_model_version") == "sentence-transformers/all-MiniLM-L6-v2:384"
    assert store.get_state("embedding.last_run_at") == STAMP


def _vector_dims(db: Db) -> int:
    cur = db.execute("SELECT vector_dims(embedding) FROM repos WHERE id = %s", (FIXTURE_REPO_ID,))
    return cur.fetchone()[0]


def test_embedding_fixture_is_rolled_back(live_db: Db) -> None:
    """After the transaction rolls back, the fixture repo must be gone."""
    db = live_db
    cur = db.execute("SELECT count(*) FROM repos WHERE id = %s", (FIXTURE_REPO_ID,))
    assert cur.fetchone()[0] == 0
