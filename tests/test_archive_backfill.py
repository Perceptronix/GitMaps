"""Tests for the GH Archive backfill runner (`gitmaps.archive_backfill`).

Two layers, mirroring the other stage suites:
  * pure engine — `extract_daily_deltas` (which GH Archive events contribute a
    daily star/fork/open-issue signal, and how deltas are counted) and
    `reconstruct_absolutes` (backward reconstruction from current repo stats,
    so rows carry the same absolute-count semantics the Momentum engine reads).
  * runner layer — `ArchiveBackfillRunner` over FakeStore + a scripted
    downloader: window-complete writes reconstructed rows, an early stop banks
    deltas for resume, resume honours last_processed_hour, download failures
    are recorded and skipped, and a missing universe is a no-op.
"""

from __future__ import annotations

from datetime import datetime, timezone

import requests

from gitmaps.archive_backfill import (
    BACKFILL_DELTAS_KEY,
    BACKFILL_ERRORS_KEY,
    BACKFILL_LAST_HOUR_KEY,
    GH_ARCHIVE_BASE,
    ArchiveBackfillRunner,
    extract_daily_deltas,
    reconstruct_absolutes,
)

from conftest import FakeStore

NOW = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
REPO_MAP = {1001: ("octocat", "repo-a"), 1002: ("octocat", "repo-b")}


def _watch(repo: str, ts: str) -> dict:
    return {"type": "WatchEvent", "repo": {"name": repo}, "created_at": ts,
            "payload": {"action": "started"}}


def _fork(repo: str, ts: str, forkee: dict | None = None) -> dict:
    return {"type": "ForkEvent", "repo": {"name": repo}, "created_at": ts,
            "payload": {"forkee": forkee or {}}}


def _issue(repo: str, ts: str, action: str) -> dict:
    return {"type": "IssuesEvent", "repo": {"name": repo}, "created_at": ts,
            "payload": {"action": action}}


def _push(repo: str, ts: str) -> dict:
    return {"type": "PushEvent", "repo": {"name": repo}, "created_at": ts, "payload": {}}


class FakeDownloader:
    """Scripted downloader seam: events per hourly filename; records every URL."""

    def __init__(self, events_by_hour: dict[str, list[dict]] | None = None) -> None:
        self.events_by_hour = events_by_hour or {}
        self.calls: list[str] = []

    def __call__(self, url: str) -> list[dict]:
        self.calls.append(url)
        return self.events_by_hour.get(url.rsplit("/", 1)[1], [])


# -- pure engine: extract_daily_deltas ---------------------------------------


def test_extract_daily_deltas_watch_events() -> None:
    events = [_watch("octocat/repo-a", "2026-07-05T10:30:00Z"),
              _watch("octocat/repo-a", "2026-07-05T11:15:00Z"),
              _watch("octocat/repo-b", "2026-07-06T09:00:00Z")]
    daily = extract_daily_deltas(events, REPO_MAP)
    assert daily == {
        1001: {"2026-07-05": {"stars": 2, "forks": 0, "open_issues": 0}},
        1002: {"2026-07-06": {"stars": 1, "forks": 0, "open_issues": 0}},
    }


def test_extract_daily_deltas_fork_counts_parent_only() -> None:
    # A ForkEvent means someone forked OUR repo (+1 fork). The forkee is the
    # NEW fork's metadata, which must never inflate our stars/forks.
    forkee = {"stargazers_count": 999, "forks_count": 88, "watchers_count": 44}
    events = [_fork("octocat/repo-a", "2026-07-06T09:05:00Z", forkee)]
    daily = extract_daily_deltas(events, REPO_MAP)
    assert daily == {
        1001: {"2026-07-06": {"stars": 0, "forks": 1, "open_issues": 0}},
    }


def test_extract_daily_deltas_issues_events() -> None:
    events = [
        _issue("octocat/repo-a", "2026-07-06T09:10:00Z", "opened"),
        _issue("octocat/repo-a", "2026-07-06T09:20:00Z", "closed"),
        _issue("octocat/repo-a", "2026-07-07T01:00:00Z", "reopened"),
        _issue("octocat/repo-a", "2026-07-07T02:00:00Z", "labeled"),  # no open-count change
    ]
    daily = extract_daily_deltas(events, REPO_MAP)
    assert daily[1001]["2026-07-06"] == {"stars": 0, "forks": 0, "open_issues": 0}
    assert daily[1001]["2026-07-07"] == {"stars": 0, "forks": 0, "open_issues": 1}


def test_extract_daily_deltas_ignores_unrelated() -> None:
    # PushEvent (no core signal), an unknown type, a repo outside the universe,
    # and an unparseable timestamp all contribute nothing.
    events = [
        _push("octocat/repo-a", "2026-07-06T09:30:00Z"),
        {"type": "ReleaseEvent", "repo": {"name": "octocat/repo-a"}, "created_at": "2026-07-06T09:40:00Z", "payload": {}},
        _watch("other/project", "2026-07-06T09:50:00Z"),
        _watch("octocat/repo-a", "not-a-timestamp"),
    ]
    assert extract_daily_deltas(events, REPO_MAP) == {}


# -- pure engine: reconstruct_absolutes --------------------------------------


def test_reconstruct_absolutes_walks_backwards() -> None:
    # current stars=100: two star events on 07-05 and one (plus a fork) on
    # 07-06. The newest day anchors to "now", each older day subtracts every
    # event from then on — so 07-06 = 99 stars / 4 forks and 07-05 = 97 / 4.
    deltas = {
        1001: {
            "2026-07-05": {"stars": 2, "forks": 0, "open_issues": 0},
            "2026-07-06": {"stars": 1, "forks": 1, "open_issues": 0},
        }
    }
    stats = {1001: {"stars": 100, "forks": 5, "open_issues": 3}}
    assert reconstruct_absolutes(deltas, stats) == {
        1001: {
            "2026-07-05": {"stars": 97, "forks": 4, "open_issues": 3},
            "2026-07-06": {"stars": 99, "forks": 4, "open_issues": 3},
        }
    }


def test_reconstruct_absolutes_drops_repo_without_stats() -> None:
    deltas = {1001: {"2026-07-06": {"stars": 1, "forks": 0, "open_issues": 0}}}
    assert reconstruct_absolutes(deltas, {}) == {}


def test_reconstruct_absolutes_clamps_at_zero() -> None:
    # Stale current stats (already lower than historical events imply) clamp to
    # 0 rather than producing negative history.
    deltas = {1001: {"2026-07-06": {"stars": 50, "forks": 0, "open_issues": 0}}}
    stats = {1001: {"stars": 10, "forks": 2, "open_issues": 0}}
    assert reconstruct_absolutes(deltas, stats) == {
        1001: {"2026-07-06": {"stars": 0, "forks": 2, "open_issues": 0}},
    }


# -- runner layer ------------------------------------------------------------


def _events_by_hour() -> dict[str, list[dict]]:
    return {
        "2026-07-05-10.json.gz": [_watch("octocat/repo-a", "2026-07-05T10:30:00Z")],
        "2026-07-05-11.json.gz": [_watch("octocat/repo-a", "2026-07-05T11:15:00Z")],
        "2026-07-06-09.json.gz": [
            _watch("octocat/repo-a", "2026-07-06T09:00:00Z"),
            _fork("octocat/repo-a", "2026-07-06T09:05:00Z"),
            _issue("octocat/repo-a", "2026-07-06T09:10:00Z", "opened"),
            _issue("octocat/repo-a", "2026-07-06T09:20:00Z", "closed"),
        ],
    }


def _runner_store(events_by_hour=None, state=None, tracked=None, stats=None) -> tuple[FakeStore, FakeDownloader]:
    store = FakeStore(
        tracked_surfaced=tracked if tracked is not None else [(1001, "octocat", "repo-a")],
        repo_stats=stats if stats is not None else {1001: {"stars": 100, "forks": 5, "open_issues": 3}},
        state=state,
    )
    downloader = FakeDownloader(events_by_hour)
    return store, downloader


def test_runner_writes_reconstructed_rows_when_window_complete() -> None:
    store, downloader = _runner_store(events_by_hour=_events_by_hour())
    # months_back=1 -> a 720-hour window, all within one run (batch_hours=1000).
    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=1000,
        max_runtime_seconds=None, downloader=downloader,
    )

    result = runner.run()

    assert result.window_complete is True
    assert result.stopped_early is False
    assert result.hours_processed == 720
    assert result.events_processed == 6
    assert result.repos_seen == 1
    assert result.snapshots_written == 2
    assert store.snapshots == [
        {"repo_id": 1001, "taken_at": "2026-07-05T00:00:00Z", "kind": "core",
         "stars": 97, "forks": 4, "open_issues": 3},
        {"repo_id": 1001, "taken_at": "2026-07-06T00:00:00Z", "kind": "core",
         "stars": 99, "forks": 4, "open_issues": 3},
    ]
    # Deltas are cleared once written; resume starts at the end of the window.
    assert store.state[BACKFILL_DELTAS_KEY] == {}
    assert store.state[BACKFILL_LAST_HOUR_KEY] == "2026-08-01T12:00:00Z"
    # The very first download is the oldest hour of the window.
    assert downloader.calls[0] == GH_ARCHIVE_BASE + "2026-07-02-12.json.gz"


def test_runner_banks_deltas_when_stopped_early() -> None:
    store, downloader = _runner_store(events_by_hour={"2026-07-02-12.json.gz": [_watch("octocat/repo-a", "2026-07-02T12:30:00Z")]})
    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=5,
        max_runtime_seconds=None, downloader=downloader,
    )

    result = runner.run()

    assert result.window_complete is False
    assert result.stopped_early is True
    assert result.hours_processed == 5
    assert result.snapshots_written == 0
    # The day's delta is banked (not lost) for the next run to continue with.
    assert store.state[BACKFILL_DELTAS_KEY] == {
        1001: {"2026-07-02": {"stars": 1, "forks": 0, "open_issues": 0}},
    }
    assert store.snapshots == []


def test_runner_resumes_from_last_processed_hour() -> None:
    store, downloader = _runner_store(
        state={BACKFILL_LAST_HOUR_KEY: "2026-07-03T00:00:00Z"},
    )
    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=3,
        max_runtime_seconds=None, downloader=downloader,
    )

    runner.run()

    # The first fetched hour is the stored resume point, not the window start.
    assert downloader.calls[0] == GH_ARCHIVE_BASE + "2026-07-03-00.json.gz"
    assert len(downloader.calls) == 3


def test_runner_records_download_errors_and_continues() -> None:
    store, downloader = _runner_store()

    def failing(url: str) -> list[dict]:
        downloader.calls.append(url)
        raise requests.RequestException("boom")

    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=3,
        max_runtime_seconds=None, downloader=failing,
    )

    result = runner.run()

    assert result.hours_processed == 3
    assert result.events_processed == 0
    errors = store.state[BACKFILL_ERRORS_KEY]
    assert len(errors) == 3
    assert errors[0]["hour"] == "2026-07-02-12"
    assert errors[0]["error"] == "boom"


def test_runner_reconstructs_from_persisted_deltas() -> None:
    # A prior run banked deltas (jsonb round-trip: string keys). This run
    # completes the window and must reconstruct using the persisted deltas.
    store, downloader = _runner_store(
        state={BACKFILL_DELTAS_KEY: {
            "1001": {"2026-07-05": {"stars": 2, "forks": 0, "open_issues": 0}},
        }},
    )
    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=1000,
        max_runtime_seconds=None, downloader=downloader,
    )

    result = runner.run()

    assert result.window_complete is True
    assert store.snapshots == [
        {"repo_id": 1001, "taken_at": "2026-07-05T00:00:00Z", "kind": "core",
         "stars": 98, "forks": 5, "open_issues": 3},
    ]


def test_runner_no_tracked_repos_is_noop() -> None:
    store, _ = _runner_store(tracked=[])
    runner = ArchiveBackfillRunner(
        store, now=lambda: NOW, months_back=1, batch_hours=1000,
        max_runtime_seconds=None, downloader=lambda url: [],
    )

    result = runner.run()

    assert result.hours_processed == 0
    assert result.window_complete is False
    assert store.snapshots == []
