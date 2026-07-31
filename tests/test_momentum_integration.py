"""Live rolled-back integration test for the Momentum engine against Supabase.

Skips when no `DATABASE_URL` is available (CI / a box without the `.env`), and
runs the whole flow inside one transaction that is always rolled back — the
fixture repository, snapshots, and momentum rows never persist. The DB is
expected to be migrated (this is the momentum_scores schema in action).
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import psycopg2
import pytest

from gitmaps.db import Db
from gitmaps.momentum import MomentumConfig, MomentumRunner
from gitmaps.repo_store import RepoStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
FIXTURE_REPO_ID = 9_600_000_001
FIXTURE_FULL_NAME = "inttest/momentum-fixture"

INSERT_REPO_SQL = """
INSERT INTO repos (id, owner, name, full_name, created_at, tracked)
VALUES (%s, 'inttest', 'momentum-fixture', %s, %s, true)
ON CONFLICT (id) DO UPDATE SET
    owner = EXCLUDED.owner, name = EXCLUDED.name,
    full_name = EXCLUDED.full_name, created_at = EXCLUDED.created_at, tracked = EXCLUDED.tracked
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
    # Bound the connect and any lock wait: a box that cannot reach Supabase
    # (or a fixture row still locked by an interrupted earlier run) fails fast
    # instead of hanging the whole suite.
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


def _week(days_ago: int, total: int) -> dict:
    ts = int((NOW - timedelta(days=days_ago)).timestamp())
    return {"week": ts, "total": total, "days": [0] * 7}


def _insert_fixture(db: Db, store: RepoStore) -> None:
    db.execute(INSERT_REPO_SQL, (FIXTURE_REPO_ID, FIXTURE_FULL_NAME,
                                 (NOW - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")))
    # Core snapshots: 7 days of growth (stars 100 -> 135, forks 10 -> 12).
    store.insert_snapshot(FIXTURE_REPO_ID, (NOW - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                          "core", stars=100, forks=10, watchers=5, open_issues=2)
    store.insert_snapshot(FIXTURE_REPO_ID, STAMP, "core",
                          stars=135, forks=12, watchers=6, open_issues=2)
    # Deep snapshots: contributor + commit activity for the same window.
    store.insert_snapshot(FIXTURE_REPO_ID, (NOW - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                          "deep", contributors=3)
    store.insert_snapshot(FIXTURE_REPO_ID, STAMP, "deep",
                          contributors=5, commit_activity=[_week(4, 2), _week(2, 2)])


def test_momentum_engine_scores_against_supabase_and_rolls_back(live_db: Db) -> None:
    db = live_db
    store = RepoStore(db)
    _insert_fixture(db, store)

    runner = MomentumRunner(store, now=lambda: NOW, config=MomentumConfig())
    result = runner.run()

    # The runner covers the whole universe, so the global counts depend on what
    # else is in the database; the assertions below are scoped to the fixture.
    assert result.computed_at == STAMP
    assert result.repos_scored >= 1
    assert result.rows_written >= 3

    # The materialized rows are queryable inside the transaction.
    cur = db.execute(
        "SELECT period, score, decomposition, rank FROM momentum_scores "
        "WHERE repo_id = %s AND computed_at = %s ORDER BY period",
        (FIXTURE_REPO_ID, STAMP),
    )
    rows = cur.fetchall()
    assert len(rows) == 3
    assert {r[0] for r in rows} == {"1d", "7d", "30d"}

    by_period = {r[0]: r for r in rows}
    period, score, decomposition, rank = by_period["7d"]
    score = float(score)

    # The 7-day decomposition matches the hand-computed unit math.
    assert score > 0
    assert decomposition["score"] == score
    assert decomposition["signals"]["stars"]["contribution"] == 0.4375
    assert score == round(sum(s["contribution"] for s in decomposition["signals"].values()), 6)

    # Rank is verified self-referentially (1 + the count of higher-scoring rows
    # at the same computed_at), so it holds even on a populated database.
    assert rank is not None
    cur = db.execute(
        "SELECT count(*) FROM momentum_scores "
        "WHERE period = '7d' AND computed_at = %s AND score > %s",
        (STAMP, score),
    )
    assert rank == cur.fetchone()[0] + 1

    # Progress was recorded too (universe-wide, so only lower-bounded).
    assert store.get_state("momentum.last_run_at") == STAMP
    assert int(store.get_state("momentum.last_count")) >= 1

    # Roll back: this run's write must not persist (the DB may hold committed
    # state from an earlier live run, so only our STAMP write is checked).
    db.rollback()
    assert store.get_state("momentum.last_run_at") != STAMP
    cur = db.execute("SELECT count(*) FROM momentum_scores WHERE repo_id = %s", (FIXTURE_REPO_ID,))
    assert cur.fetchone()[0] == 0
    cur = db.execute("SELECT count(*) FROM repos WHERE id = %s", (FIXTURE_REPO_ID,))
    assert cur.fetchone()[0] == 0
    cur = db.execute("SELECT count(*) FROM snapshots WHERE repo_id = %s", (FIXTURE_REPO_ID,))
    assert cur.fetchone()[0] == 0
