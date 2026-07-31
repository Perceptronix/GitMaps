"""worker.py entrypoint — dispatch, commit-on-success, rollback-on-failure.

Drives main() with injected settings + FakeDb + fake client factory, so the
full dispatch path (env-free, network-free, database-free) is exercised.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from gitmaps.config import Settings
from gitmaps.worker import main

from conftest import FakeClient, FakeDb, make_repo


def settings() -> Settings:
    return Settings(database_url="postgresql://x", github_tokens=("t",), rate_budget_per_hour=5000)


def test_discover_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    rc = main(
        ["discover"],
        settings=settings(),
        db=db,
        client_factory=lambda s: FakeClient(repos=[make_repo()]),
    )

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1  # the missing-commit fix: writes persisted
    assert "stored=1" in out.out


def test_snapshot_core_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    db.fetchall_result = [(1001, "octocat", "hello-world")]
    rc = main(
        ["snapshot_core"],
        settings=settings(),
        db=db,
        client_factory=lambda s: FakeClient(responses={"/repos/octocat/hello-world": make_repo()}),
    )

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "inserted=1" in out.out


def _ago(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")


def _significant_candidate() -> tuple:
    # PROMOTION_COLUMNS order: id, stars, forks, contributors, created_at,
    # pushed_at, description, homepage, topics, tracked, surfaced, surfaced_at.
    return (
        7, 80, 10, 3, _ago(200), _ago(0),
        "A focused CLI for reproducible data science.", None, ["python", "cli", "data"],
        False, False, None,
    )


def test_promote_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    db.fetchall_by_substring = {"WHERE NOT tracked": [_significant_candidate()], "WHERE tracked": []}

    rc = main(["promote"], settings=settings(), db=db, client_factory=lambda s: FakeClient())

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "tracked=1 surfaced=1" in out.out


def test_momentum_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    # One repo with snapshots (no rows fetched -> scores 0 for all periods),
    # no birth date, and no other repos.
    db.fetchall_by_substring = {
        "SELECT DISTINCT repo_id FROM snapshots": [(1,)],
        "SELECT taken_at, kind": [],
    }
    db.fetchone_result = (None,)  # created_at unknown

    rc = main(["momentum"], settings=settings(), db=db, client_factory=lambda s: FakeClient())

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "momentum: repos=1 rows=3 periods=1d/7d/30d" in out.out


def test_embed_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    # No model version yet -> full pass (also exercises the rate-budget wiring,
    # which reads an empty budget when no state is present).
    db.fetchone_result = None
    db.fetchall_by_substring = {
        "WHERE r.surfaced": [
            (1001, "octocat", "hello", "octocat/hello", "A demo repo", ["cli"], "Python", "https://x", None),
        ]
    }

    rc = main(["embed"], settings=settings(), db=db, client_factory=lambda s: FakeClient())

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "embed: seen=1 embedded=1 skipped=0 model=sentence-transformers/all-MiniLM-L6-v2:384" in out.out


def test_unknown_job_prints_usage(capsys) -> None:
    rc = main(["bogus"])

    err = capsys.readouterr().err
    assert rc == 2
    assert "usage" in err


def test_missing_config_is_reported(monkeypatch, capsys) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("GITHUB_TOKENS", raising=False)

    rc = main(["discover"], client_factory=lambda s: FakeClient())

    err = capsys.readouterr().err
    assert rc == 1
    assert "config error" in err


def test_job_failure_rolls_back(capsys) -> None:
    class _BrokenClient(FakeClient):
        def get(self, path: str, **kw) -> object:
            raise RuntimeError("boom")

    db = FakeDb()
    db.fetchall_result = [(1001, "octocat", "hello-world")]
    rc = main(
        ["snapshot_core"],
        settings=settings(),
        db=db,
        client_factory=lambda s: _BrokenClient(),
    )

    err = capsys.readouterr().err
    assert rc == 1
    assert db.rollbacks == 1
    assert db.commits == 0
    assert "boom" in err
