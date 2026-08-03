"""Seam 3 — DiscoveryRunner orchestration.

Verifies the discovery flow over injected fakes: watermark read/advance,
search query construction, screening, repos upsert, and ingestion_state
progress writes. No network and no database.
"""

from __future__ import annotations

from datetime import datetime, timezone

from gitmaps.github.client import GitHubApiError
from gitmaps.github.graphql_client import RepoData
from gitmaps.collector import DiscoveryRunner

from conftest import FakeClient, FakeGraphQL, FakeStore, make_repo

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)


def make_runner(client: FakeClient, store: FakeStore | None = None, **kwargs) -> tuple[DiscoveryRunner, FakeStore]:
    store = store or FakeStore()
    return DiscoveryRunner(client, store, now=lambda: NOW, **kwargs), store


def test_first_run_uses_default_window_and_advances_since() -> None:
    client = FakeClient([make_repo(), make_repo(id=1002)])
    runner, store = make_runner(client)

    result = runner.run()

    # default window = 7 days before the injected "now"
    assert result.query == "created:>=2026-07-24T12:00:00Z"
    assert result.found == 2
    assert result.stored == 2
    assert result.dropped == 0
    assert len(store.upserted) == 2
    # progress tracked: watermark advanced to the run start
    assert store.state["discovery.since"] == "2026-07-31T12:00:00Z"
    assert store.state["discovery.last_run_at"] == "2026-07-31T12:00:00Z"
    assert store.state["discovery.last_count"] == 2


def test_uses_existing_watermark() -> None:
    client = FakeClient([make_repo()])
    runner, store = make_runner(client, store=FakeStore({"discovery.since": "2026-07-01T00:00:00Z"}))

    result = runner.run()

    assert result.query == "created:>=2026-07-01T00:00:00Z"


def test_screens_out_forks_and_archived() -> None:
    client = FakeClient(
        [
            make_repo(),
            make_repo(id=1002, fork=True),
            make_repo(id=1003, archived=True),
        ]
    )
    runner, store = make_runner(client)

    result = runner.run()

    assert result.found == 3
    assert result.stored == 1
    assert result.dropped == 2
    assert [r["id"] for r in store.upserted] == [1001]


def test_empty_search_advances_watermark_with_zero() -> None:
    client = FakeClient([])
    runner, store = make_runner(client)

    result = runner.run()

    assert result.found == 0
    assert result.stored == 0
    assert store.state["discovery.since"] == "2026-07-31T12:00:00Z"
    assert store.state["discovery.last_count"] == 0


def test_no_upsert_call_when_nothing_screened() -> None:
    client = FakeClient([make_repo(fork=True)])
    runner, store = make_runner(client)

    runner.run()

    assert store.upserted == []
    assert store.state["discovery.last_count"] == 0


def test_result_reports_since_and_counts() -> None:
    client = FakeClient([make_repo()])
    runner, store = make_runner(client)

    result = runner.run()

    assert result.since == "2026-07-24T12:00:00Z"
    assert result.stored == 1


# ---------------------------------------------------------------------------
# GraphQL batch enrichment
# ---------------------------------------------------------------------------


def _repo_data(full_name: str = "octocat/hello-world", *, id: int = 1001, **overrides: object) -> RepoData:
    return RepoData(
        id=id, full_name=full_name, owner="octocat", name="hello-world",
        description="enriched", topics=["x"], language="Rust", license="Apache-2.0",
        homepage=None, archived=False, is_fork=False,
        created_at="2026-07-01T10:00:00Z", pushed_at="2026-07-30T10:00:00Z",
        stars=999, forks=10, watchers=4, open_issues=1, readme="# hi",
        **overrides,
    )


def test_graphql_enrichment_replaces_search_metadata_for_upsert() -> None:
    client = FakeClient([make_repo()])  # search says 42 stars
    graphql = FakeGraphQL(repos=[_repo_data()])  # GraphQL says 999 stars
    runner, store = make_runner(client, graphql=graphql)

    result = runner.run()

    assert result.stored == 1
    assert graphql.calls == [["octocat/hello-world"]]
    # the upserted row is the enriched (REST-shaped) dict, not the search item
    assert store.upserted[0]["stargazers_count"] == 999
    assert store.upserted[0]["language"] == "Rust"


def test_graphql_null_repo_keeps_rest_search_data() -> None:
    # GraphQL resolves the first repo, returns null for the renamed second one
    client = FakeClient([make_repo(), make_repo(id=1002, full_name="octocat/vanished")])
    graphql = FakeGraphQL(repos=[_repo_data(), None])
    runner, store = make_runner(client, graphql=graphql)

    runner.run()

    assert store.upserted[0]["stargazers_count"] == 999  # enriched
    assert store.upserted[1]["id"] == 1002  # kept the search data
    assert store.upserted[1]["stargazers_count"] == 42


def test_graphql_batch_failure_falls_back_to_rest_without_crashing(caplog) -> None:
    client = FakeClient([make_repo()])
    graphql = FakeGraphQL(repos=[], error=GitHubApiError("graphql: 401 Bad credentials", status_code=401))
    runner, store = make_runner(client, graphql=graphql)

    result = runner.run()

    assert result.stored == 1
    assert store.upserted[0]["stargazers_count"] == 42  # REST search data used
    assert any("GraphQL batch enrichment failed" in r.message for r in caplog.records)


def test_no_graphql_client_skips_enrichment() -> None:
    client = FakeClient([make_repo()])
    runner, store = make_runner(client)  # no graphql arg

    runner.run()

    assert store.upserted[0]["stargazers_count"] == 42  # plain search data
