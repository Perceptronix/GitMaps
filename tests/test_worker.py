"""worker.py entrypoint — dispatch, commit-on-success, rollback-on-failure.

Drives main() with injected settings + FakeDb + fake client factory, so the
full dispatch path (env-free, network-free, database-free) is exercised.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from gitmaps.config import Settings
from gitmaps.worker import main

from conftest import FakeClient, FakeDb, FakeGraphQL, make_repo

#: Two 5-point blobs around [1,0,0] / [0,1,0] — verified to make HDBSCAN emit
#: two clusters with the worker's default min_cluster_size=5.
CLUSTER_BLOB_A: list[list[float]] = [[1, 0, 0], [0.95, 0.31, 0], [0.99, 0.14, 0], [0.93, 0.37, 0], [0.96, 0.28, 0]]
CLUSTER_BLOB_B: list[list[float]] = [[0, 1, 0], [0.31, 0.95, 0], [0.14, 0.99, 0], [0.37, 0.93, 0], [0.28, 0.96, 0]]


def _cluster_row(repo_id: int, embedding: list[float]) -> tuple:
    # CLUSTERING_COLUMNS order: id, embedding, domains, full_name, description, topics, language.
    return (repo_id, embedding, ["AI"], f"octocat/repo-{repo_id}", "agent tooling", ["agents"], "Python")


def settings() -> Settings:
    return Settings(database_url="postgresql://x", github_tokens=("t",), rate_budget_per_hour=5000)


def test_discover_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    rc = main(
        ["discover"],
        settings=settings(),
        db=db,
        client_factory=lambda s: FakeClient(repos=[make_repo()]),
        # graphql enrichment defaults to the real client — inject a no-op so
        # the unit test stays hermetic (no network)
        graphql_factory=lambda s: FakeGraphQL(),
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
    assert "tracked=1 surfaced_candidates=1 promoted_surfaced=1" in out.out
    # the gate result is persisted to the row (repos.significance_score/vars)
    significance_updates = [sql for sql, _ in db.executed if "significance_score" in sql]
    assert len(significance_updates) == 1


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


def test_classify_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    # No taxonomy version yet -> full pass.
    db.fetchone_result = None
    db.fetchall_result = [
        (1001, "octocat", "hello", "octocat/hello", "A demo repo", ["cli"], "Python", "https://x", None),
    ]
    client = FakeClient(responses={"/repos/octocat/hello/readme": "# README about docker"})

    rc = main(["classify"], settings=settings(), db=db, client_factory=lambda s: client)

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "classify: seen=1 classified=1 skipped=0 errors=0" in out.out


def test_cluster_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    # No clustering version yet -> full pass. (None,) doubles for get_state
    # ("no version recorded") and insert_cluster's RETURNING id.
    db.fetchone_result = (None,)
    db.fetchall_result = [
        _cluster_row(1001 + i, v) for i, v in enumerate(CLUSTER_BLOB_A + CLUSTER_BLOB_B)
    ]

    rc = main(["cluster"], settings=settings(), db=db, client_factory=lambda s: FakeClient())

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "cluster: seen=10 domains=1 clusters=2 assigned=10" in out.out


def test_layout_job_commits_and_reports(capsys) -> None:
    db = FakeDb()
    # No stored layout version -> full pass. (None,) doubles for get_state
    # ("no version recorded").
    db.fetchone_result = (None,)
    db.fetchall_result = [
        (1001, 1, [1.0, 0.0, 0.0]),
        (1002, 1, [0.95, 0.31, 0.0]),
        (1003, 1, [0.99, 0.14, 0.0]),
        (1004, 1, [0.93, 0.37, 0.0]),
    ]

    rc = main(["layout"], settings=settings(), db=db, client_factory=lambda s: FakeClient())

    out = capsys.readouterr()
    assert rc == 0
    assert db.commits == 1
    assert "layout: clusters=1 repos=4 full=True" in out.out


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
