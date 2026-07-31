"""Seam 3 — DiscoveryRunner orchestration.

Verifies the discovery flow over injected fakes: watermark read/advance,
search query construction, screening, repos upsert, and ingestion_state
progress writes. No network and no database.
"""

from __future__ import annotations

from datetime import datetime, timezone

from gitmaps.collector import DiscoveryRunner

from conftest import FakeClient, FakeStore, make_repo

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
