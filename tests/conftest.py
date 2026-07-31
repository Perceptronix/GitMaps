"""Shared fakes for the collector and snapshot-worker test suites.

The fakes live at the agreed seams:
  * FakeSession / FakeClient — the HTTP seam (no network in tests)
  * FakeDb / FakeStore        — the DB / orchestration seams
"""

from __future__ import annotations

import time
from types import SimpleNamespace
from typing import Any, Callable, Iterator

from gitmaps.github.client import GitHubApiError


class FakeResponse:
    """Minimal stand-in for a requests.Response."""

    def __init__(
        self,
        status_code: int = 200,
        json_body: Any = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        self.status_code = status_code
        self._json = json_body
        self.headers = headers or {}

    def json(self) -> Any:
        return self._json


class FakeSession:
    """Scripted session: returns queued responses; records every call."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict, dict]] = []  # (method, url, params, headers)
        self.responses: list[FakeResponse] = []
        self.raise_once: Exception | None = None

    def request(self, method: str, url: str, params: dict | None = None, headers: dict | None = None) -> FakeResponse:
        self.calls.append((method, url, params or {}, headers or {}))
        if self.raise_once is not None:
            exc, self.raise_once = self.raise_once, None
            raise exc
        if not self.responses:
            raise AssertionError("no scripted response for " + url)
        return self.responses.pop(0)


class FakeDb:
    """Recording DB: captures SQL + params; simulates rows and transaction state."""

    def __init__(self) -> None:
        self.executed: list[tuple[str, Any]] = []
        self.fetchone_result: Any = None
        self.fetchall_result: list[Any] = []
        self.commits = 0
        self.rollbacks = 0
        self.closed = False

    def _cursor(self, sql: str, params: Any, rowcount: int) -> SimpleNamespace:
        self.executed.append((sql, params))
        return SimpleNamespace(
            rowcount=rowcount,
            fetchone=lambda: self.fetchone_result,
            fetchall=lambda: self.fetchall_result,
        )

    def execute(self, sql: str, params: Any = None) -> SimpleNamespace:
        return self._cursor(sql, params, rowcount=1 if params is not None else 0)

    def executemany(self, sql: str, seq: list[Any]) -> SimpleNamespace:
        return self._cursor(sql, list(seq), rowcount=len(seq))

    def commit(self) -> None:
        self.commits += 1

    def rollback(self) -> None:
        self.rollbacks += 1

    def close(self) -> None:
        self.closed = True

    def __enter__(self) -> "FakeDb":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()


class FakeClient:
    """Dependency-injected client: scripted per-path GET responses + search items.

    Mirrors the subset of GitHubClient the runners use: `search` (discovery)
    and `get` (snapshot fetches). Pass `get_error` as a set of paths whose GET
    should raise GitHubApiError.
    """

    def __init__(
        self,
        repos: list[dict] | None = None,
        responses: dict[str, Any] | None = None,
        get_error: set[str] | None = None,
    ) -> None:
        self.repos = list(repos or [])
        self.responses = dict(responses or {})
        self.get_error = set(get_error or ())
        self.calls: list[tuple[str, str]] = []  # ("search"|"get", path)

    def search(self, query: str, per_page: int = 100) -> Iterator[dict]:
        self.calls.append(("search", query))
        yield from self.repos

    def get(self, path: str, *, params: dict | None = None, headers: dict | None = None) -> Any:
        self.calls.append(("get", path))
        if path in self.get_error:
            raise GitHubApiError(f"{path} failed")
        if path not in self.responses:
            raise AssertionError(f"no scripted response for {path}")
        return self.responses[path]


class FakeStore:
    """In-memory store: records upserts, snapshots, touches, and state."""

    def __init__(self, state: dict[str, Any] | None = None, due: list[tuple] | None = None) -> None:
        self.state: dict[str, Any] = dict(state or {})
        self.upserted: list[dict] = []
        self.due: list[tuple] = list(due or [])
        self.due_calls: list[tuple[str, str, int]] = []
        self.snapshots: list[dict] = []
        self.touched: list[int] = []

    def upsert(self, repo: dict) -> int:
        self.upserted.append(repo)
        return 1

    def upsert_many(self, repos: list[dict]) -> int:
        self.upserted.extend(repos)
        return len(repos)

    def get_state(self, key: str) -> Any:
        return self.state.get(key)

    def set_state(self, key: str, value: Any) -> None:
        self.state[key] = value

    def list_due_repos(self, kind: str, cutoff: str, limit: int) -> list[tuple]:
        self.due_calls.append((kind, cutoff, limit))
        return self.due[:limit]

    def insert_snapshot(self, repo_id: int, taken_at: str, kind: str, **fields: Any) -> int:
        self.snapshots.append({"repo_id": repo_id, "taken_at": taken_at, "kind": kind, **fields})
        return 1

    def touch_snapshot_times(self, repo_id: int) -> None:
        self.touched.append(repo_id)


def fixed_clock(epoch: float) -> tuple[Callable[[], float], list[float]]:
    """Return a `now()` at a fixed epoch plus a recorder for `sleep()` calls."""
    sleeps: list[float] = []
    return (lambda: epoch, sleeps)


class RecordingClock:
    """Advanceable clock + a recording sleep for rate-limit tests."""

    def __init__(self, epoch: float = 1_000_000.0) -> None:
        self.now_value = epoch
        self.sleeps: list[float] = []

    def now(self) -> float:
        return self.now_value

    def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now_value += seconds


def make_repo(**overrides: Any) -> dict:
    """A well-formed GitHub REST repository object for tests."""
    repo: dict[str, Any] = {
        "id": 1001,
        "owner": {"login": "octocat"},
        "name": "hello-world",
        "full_name": "octocat/hello-world",
        "description": "a test repository",
        "topics": ["python", "demo"],
        "language": "Python",
        "license": {"spdx_id": "MIT"},
        "homepage": "https://example.com",
        "archived": False,
        "fork": False,
        "created_at": "2026-07-01T10:00:00Z",
        "pushed_at": "2026-07-30T10:00:00Z",
        "stargazers_count": 42,
        "forks_count": 7,
        "subscribers_count": 3,
        "open_issues_count": 2,
    }
    repo.update(overrides)
    return repo
