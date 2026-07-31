"""Shared fakes for the collector test suite.

The fakes live at the three agreed seams:
  * FakeSession  — the HTTP seam (no network in tests)
  * FakeDb       — the DB seam (recording, no Postgres in unit tests)
  * FakeClient / FakeStore — the orchestration seam
"""

from __future__ import annotations

import time
from types import SimpleNamespace
from typing import Any, Callable, Iterator


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
    """Recording DB: captures SQL + params; simulates rowcount and reads."""

    def __init__(self) -> None:
        self.executed: list[tuple[str, Any]] = []
        self.fetchone_result: Any = None

    def _cursor(self, sql: str, params: Any, rowcount: int) -> SimpleNamespace:
        self.executed.append((sql, params))
        return SimpleNamespace(rowcount=rowcount, fetchone=lambda: self.fetchone_result)

    def execute(self, sql: str, params: Any = None) -> SimpleNamespace:
        return self._cursor(sql, params, rowcount=1 if params is not None else 0)

    def executemany(self, sql: str, seq: list[Any]) -> SimpleNamespace:
        return self._cursor(sql, list(seq), rowcount=len(seq))


class FakeClient:
    """Dependency-injected GitHubClient stand-in for orchestration tests."""

    def __init__(self, repos: list[dict]) -> None:
        self.repos = list(repos)
        self.requests_made = 0

    def search(self, query: str, per_page: int = 100) -> Iterator[dict]:
        self.requests_made += 1
        yield from self.repos


class FakeStore:
    """In-memory RepoStore stand-in: records upserts and key/value state."""

    def __init__(self, state: dict[str, Any] | None = None) -> None:
        self.state: dict[str, Any] = dict(state or {})
        self.upserted: list[dict] = []

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
