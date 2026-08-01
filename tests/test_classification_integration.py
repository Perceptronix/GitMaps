"""Live rolled-back integration test for the technology classification pipeline.

Skips when no `DATABASE_URL` is available (CI / a box without the `.env`), and
runs the whole flow inside one transaction that is always rolled back — the
fixture repositories, their assigned domains, and the ingestion_state rows never
persist. The DB is expected to be migrated (this is `repos.domains` +
`domains_fingerprint` + `classified_at` from migration 11 in action).

The classification runner pages over the whole surfaced universe; assertions
target the deterministic fixtures. A stub readme client returns a scripted
README per full_name (None = "no README"), so README-driven classification is
exercised without any GitHub network calls — the real model is not involved;
classification is pure keyword matching (Phase 6.5).
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import psycopg2
import pytest

from gitmaps.classification import ClassificationRunner, classify_domains
from gitmaps.db import Db
from gitmaps.embeddings import compose_semantic_text, semantic_fingerprint
from gitmaps.repo_store import RepoStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
PAST = "2026-07-01T00:00:00Z"
LATER = "2026-08-01T00:00:00Z"  # after NOW -> pushes a fixture back into the due set

A_ID, B_ID, C_ID = 9_600_002_001, 9_600_002_002, 9_600_002_003

#: (id, name, description, topics, language, readme) — the readme is served by
#: the stub client; None means the repo has no README.
FIXTURES = {
    A_ID: ("classif-react", "inttest/classif-react", "An AI-powered React dashboard",
           ["web", "dashboard"], "TypeScript", None),
    B_ID: ("classif-docker", "inttest/classif-docker", "a plain tool",
           [], "Shell", "# Container\nA Docker containerized web server."),
    C_ID: ("classif-plain", "inttest/classif-plain", "a simple toy project",
           [], "Nim", None),
}

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, description, topics, language,
                   homepage, created_at, pushed_at, surfaced, tracked)
VALUES (%s, 'inttest', %s, %s, %s, %s, %s, 'https://fixture.example', %s, %s, true, true)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, description = EXCLUDED.description,
    topics = EXCLUDED.topics, language = EXCLUDED.language,
    homepage = EXCLUDED.homepage, created_at = EXCLUDED.created_at,
    pushed_at = EXCLUDED.pushed_at, surfaced = EXCLUDED.surfaced,
    tracked = EXCLUDED.tracked
"""


class StubReadmeClient:
    """Duck-typed readme seam: a scripted README per full_name, None otherwise."""

    def __init__(self, readmes: dict[str, str]) -> None:
        self._readmes = readmes

    def get_readme(self, owner: str, name: str) -> str | None:
        return self._readmes.get(f"{owner}/{name}")


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
    for repo_id, (name, full_name, description, topics, language, _readme) in FIXTURES.items():
        db.execute(
            INSERT_REPO_SQL,
            (repo_id, name, full_name, description, topics, language, PAST, PAST),
        )


def _readme_for(repo_id: int) -> str | None:
    return FIXTURES[repo_id][5]


def _expected_fingerprint(repo_id: int) -> str:
    _, full_name, description, topics, language, _ = FIXTURES[repo_id]
    text = compose_semantic_text(
        full_name=full_name, description=description, topics=topics,
        language=language, homepage="https://fixture.example",
        readme=_readme_for(repo_id), readme_max_chars=2000,
    )
    return semantic_fingerprint(text)


def _expected_domains(repo_id: int) -> list[str]:
    _, full_name, description, topics, language, _ = FIXTURES[repo_id]
    text = compose_semantic_text(
        full_name=full_name, description=description, topics=topics,
        language=language, homepage="https://fixture.example",
        readme=_readme_for(repo_id), readme_max_chars=2000,
    )
    return list(classify_domains(text))


def _classification_rows(db: Db, repo_id: int) -> tuple:
    cur = db.execute(
        "SELECT domains, domains_fingerprint, classified_at, language FROM repos WHERE id = %s",
        (repo_id,),
    )
    return cur.fetchone()


def _runner(db: Db) -> tuple[ClassificationRunner, StubReadmeClient]:
    store = RepoStore(db)
    readmes = {full_name: readme for _, full_name, _, _, _, readme in FIXTURES.values() if readme}
    client = StubReadmeClient(readmes)
    return ClassificationRunner(client, store, now=lambda: NOW), client


def test_classification_pipeline_against_supabase_and_rolls_back(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)
    # A live run may have recorded a taxonomy version; reset it inside this
    # transaction (rolled back below) so run 1 deterministically does a full pass.
    db.execute("DELETE FROM ingestion_state WHERE key = 'classification_taxonomy_version'")

    runner, _ = _runner(db)
    first = runner.run()

    # Run 1 — full pass (no taxonomy version recorded yet): every surfaced repo
    # is classified, including the fixtures.
    assert first.force_full is True
    assert first.classified >= 3

    # Fixture A — multi-domain, assigned from metadata only (no README).
    domains, fingerprint, classified_at, language = _classification_rows(db, A_ID)
    assert sorted(domains) == ["AI", "Frontend"]
    assert domains != [language]  # stored separately from the primary language
    assert fingerprint == _expected_fingerprint(A_ID)
    assert classified_at == NOW

    # Fixture B — README-driven: metadata matches nothing, the README adds domains.
    domains_b, fingerprint_b, _, _ = _classification_rows(db, B_ID)
    assert sorted(domains_b) == ["Backend", "DevOps"]
    assert fingerprint_b == _expected_fingerprint(B_ID)

    # Fixture C — no keyword matches: an empty domains array, never NULL.
    domains_c, fingerprint_c, _, _ = _classification_rows(db, C_ID)
    assert domains_c == []
    assert fingerprint_c == _expected_fingerprint(C_ID)


def test_classification_incremental_skip_against_supabase(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixtures(db)
    db.execute("DELETE FROM ingestion_state WHERE key = 'classification_taxonomy_version'")

    runner, _ = _runner(db)
    runner.run()  # full pass — everything classified

    # Simulate a push on fixture A (classified_at < pushed_at => due again) but
    # keep the content identical: the fingerprint skip must verify and advance
    # classified_at WITHOUT re-writing domains or classifying anything.
    db.execute("UPDATE repos SET pushed_at = %s WHERE id = %s", (LATER, A_ID))

    second = runner.run()

    assert second.force_full is False  # taxonomy version unchanged
    assert second.classified == 0      # no content actually changed anywhere
    assert second.skipped >= 1         # fixture A's unchanged content was skipped
    # And its domains are untouched.
    domains, _, classified_at, _ = _classification_rows(db, A_ID)
    assert sorted(domains) == ["AI", "Frontend"]
    assert classified_at == NOW


def test_classification_fixtures_are_rolled_back(live_db: Db) -> None:
    db = live_db
    cur = db.execute("SELECT count(*) FROM repos WHERE id BETWEEN %s AND %s", (A_ID, C_ID))
    assert cur.fetchone()[0] == 0
