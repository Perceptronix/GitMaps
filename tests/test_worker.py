"""worker.py entrypoint — dispatch, commit-on-success, rollback-on-failure.

Drives main() with injected settings + FakeDb + fake client factory, so the
full dispatch path (env-free, network-free, database-free) is exercised.
"""

from __future__ import annotations

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
