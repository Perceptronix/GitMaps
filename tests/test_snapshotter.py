"""Seam 3 (orchestration) — SnapshotRunner over injected FakeClient + FakeStore.

Verifies the core and deep flows: due enumeration → fetch → insert → touch →
progress/budget writes, plus per-repo error skip and rate-budget behaviour.
"""

from __future__ import annotations

from datetime import datetime, timezone

from gitmaps.snapshotter import SnapshotRunner

from conftest import FakeClient, FakeStore, make_repo

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
HOUR = "2026-07-31T12:00:00Z"
CORE_CUTOFF = "2026-07-30T16:00:00Z"  # NOW - 20h
DEEP_CUTOFF = "2026-07-25T12:00:00Z"  # NOW - 6d


def make_runner(client: FakeClient, store: FakeStore | None = None, **kwargs) -> tuple[SnapshotRunner, FakeStore]:
    store = store or FakeStore()
    return SnapshotRunner(client, store, now=lambda: NOW, **kwargs), store


def test_core_snapshots_due_repos_and_tracks_progress() -> None:
    client = FakeClient(
        responses={
            "/repos/octocat/hello-world": make_repo(),
            "/repos/acme/widget": make_repo(id=1002, name="widget", stargazers_count=9),
        },
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world"), (1002, "acme", "widget")])
    runner, store = make_runner(client, store)

    result = runner.run_core()

    assert result.kind == "core"
    assert result.attempted == 2
    assert result.inserted == 2
    assert result.skipped == 0
    assert not result.rate_limited
    assert len(store.snapshots) == 2
    core = store.snapshots[0]
    assert core["kind"] == "core" and core["taken_at"] == "2026-07-31T12:00:00Z"
    assert core["stars"] == 42 and core["forks"] == 7 and core["watchers"] == 3 and core["open_issues"] == 2
    assert store.touched == [1001, 1002]
    assert store.state["snapshot.core.last_run_at"] == "2026-07-31T12:00:00Z"
    assert store.state["snapshot.core.last_count"] == 2


def test_core_uses_cutoff_and_batch_size() -> None:
    client = FakeClient(responses={})
    runner, store = make_runner(client, batch_size=50)

    runner.run_core()

    assert store.due_calls == [("core", CORE_CUTOFF, 50)]


def test_deep_snapshots_stats_and_counts_two_calls() -> None:
    weeks = [{"week": "2026-07-01", "total": 5}]
    client = FakeClient(
        responses={
            "/repos/octocat/hello-world/stats/contributors": [{"login": "a"}, {"login": "b"}, {"login": "c"}],
            "/repos/octocat/hello-world/stats/commit_activity": weeks,
        },
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world")])
    runner, store = make_runner(client, store, budget_per_hour=10)

    result = runner.run_deep()

    assert result.kind == "deep"
    assert result.inserted == 1
    deep = store.snapshots[0]
    assert deep["kind"] == "deep"
    assert deep["contributors"] == 3
    assert deep["commit_activity"] == weeks
    assert store.touched == [1001]
    assert store.state["snapshot.deep.last_count"] == 1
    # deep = 2 API calls/repo
    assert store.state["rate_budget"] == {"hour": HOUR, "used": 2}


def test_deep_uses_weekly_cutoff() -> None:
    client = FakeClient(responses={})
    runner, store = make_runner(client)

    runner.run_deep()

    assert store.due_calls == [("deep", DEEP_CUTOFF, 100)]


def test_deep_treats_empty_stats_as_not_ready() -> None:
    client = FakeClient(
        responses={
            "/repos/octocat/hello-world/stats/contributors": [],
            "/repos/octocat/hello-world/stats/commit_activity": [],
        },
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world")])
    runner, store = make_runner(client, store)

    runner.run_deep()

    deep = store.snapshots[0]
    assert deep["contributors"] is None
    assert deep["commit_activity"] is None


def test_skips_repo_on_client_error() -> None:
    client = FakeClient(
        responses={"/repos/octocat/hello-world": make_repo()},
        get_error={"/repos/acme/widget"},
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world"), (1002, "acme", "widget")])
    runner, store = make_runner(client, store)

    result = runner.run_core()

    assert result.attempted == 1
    assert result.inserted == 1
    assert result.skipped == 1
    assert store.touched == [1001]


def test_rate_budget_already_spent_aborts_before_requests() -> None:
    client = FakeClient(responses={"/repos/octocat/hello-world": make_repo()})
    store = FakeStore(state={"rate_budget": {"hour": HOUR, "used": 5}}, due=[(1001, "octocat", "hello-world")])
    runner, store = make_runner(client, store, budget_per_hour=5)

    result = runner.run_core()

    assert result.rate_limited
    assert result.attempted == 0
    assert client.calls == []  # no API request was made


def test_rate_limit_error_aborts_batch() -> None:
    # When every token is rate limited, the run must stop at the first repo
    # rather than skip it and sleep through the reset for each remaining repo.
    client = FakeClient(
        responses={"/repos/acme/widget": make_repo(id=1002, name="widget")},
        rate_limit={"/repos/octocat/hello-world"},
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world"), (1002, "acme", "widget")])
    runner, store = make_runner(client, store, budget_per_hour=10)

    result = runner.run_core()

    assert result.rate_limited
    assert result.attempted == 0
    assert result.skipped == 0
    assert [c for c in client.calls if c[0] == "get"] == [("get", "/repos/octocat/hello-world")]
    assert store.snapshots == []  # the second repo was never fetched
    # the aborted repo's request still consumed budget
    assert store.state["rate_budget"] == {"hour": HOUR, "used": 1}


def test_failed_requests_consume_budget() -> None:
    client = FakeClient(
        responses={"/repos/acme/widget": make_repo(id=1002, name="widget")},
        get_error={"/repos/octocat/hello-world"},
    )
    store = FakeStore(due=[(1001, "octocat", "hello-world"), (1002, "acme", "widget")])
    runner, store = make_runner(client, store, budget_per_hour=10)

    result = runner.run_core()

    assert result.skipped == 1
    assert result.attempted == 1
    assert result.inserted == 1
    # failed repo (1001) and successful repo (1002) each consumed one call
    assert store.state["rate_budget"] == {"hour": HOUR, "used": 2}


def test_rate_budget_rolls_over_to_new_hour() -> None:
    client = FakeClient(responses={"/repos/octocat/hello-world": make_repo()})
    store = FakeStore(state={"rate_budget": {"hour": "2026-07-31T11:00:00Z", "used": 999}}, due=[(1001, "octocat", "hello-world")])
    runner, store = make_runner(client, store, budget_per_hour=100)

    result = runner.run_core()

    assert not result.rate_limited
    assert store.state["rate_budget"] == {"hour": HOUR, "used": 1}
