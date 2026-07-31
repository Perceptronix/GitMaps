"""Seam 1 — GitHubClient over an injected HTTP session.

Verifies authentication, retries, rate limiting, pagination, search
capping, and logging. No network: every request is served by FakeSession.
"""

from __future__ import annotations

import logging

import pytest
import requests

from gitmaps.github.client import GitHubApiError, GitHubClient, RateLimitError

from conftest import FakeResponse, FakeSession, RecordingClock, make_repo


def make_client(session: FakeSession, tokens: list[str] = ["t1"], **kwargs) -> GitHubClient:
    return GitHubClient(tokens, session=session, **kwargs)


def link_header(*, next_url: str = "", last_url: str = "") -> dict[str, str]:
    parts = []
    if next_url:
        parts.append(f'<{next_url}>; rel="next"')
    if last_url:
        parts.append(f'<{last_url}>; rel="last"')
    return {"Link": ", ".join(parts)}


def test_auth_header_uses_bearer_token() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(json_body={"ok": True}))
    client = make_client(session)

    client.get("/rate_limit")

    _, _, _, headers = session.calls[0]
    assert headers["Authorization"] == "Bearer t1"
    assert headers["Accept"] == "application/vnd.github+json"
    assert headers["X-GitHub-Api-Version"] == "2022-11-28"


def test_token_pool_rotates_across_requests() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(json_body={"a": 1}))
    session.responses.append(FakeResponse(json_body={"b": 2}))
    client = make_client(session, tokens=["t1", "t2"])

    client.get("/a")
    client.get("/b")

    auths = [call[3]["Authorization"] for call in session.calls]
    assert auths == ["Bearer t1", "Bearer t2"]


def test_retries_on_server_error_with_backoff(caplog) -> None:
    clock = RecordingClock()
    session = FakeSession()
    session.responses.append(FakeResponse(status_code=502, json_body={}))
    session.responses.append(FakeResponse(status_code=502, json_body={}))
    session.responses.append(FakeResponse(json_body={"ok": True}))
    with caplog.at_level(logging.WARNING):
        client = make_client(session, backoff_base=0.5, clock=clock.now, sleep=clock.sleep, rng=lambda: 0.5)
        body = client.get("/repos/octocat/hello-world")

    assert body == {"ok": True}
    assert len(session.calls) == 3
    assert clock.sleeps == [0.5, 1.0]  # exponential backoff (rng midpoint = no jitter shift)
    assert "Retrying" in caplog.text


def test_backoff_applies_jitter() -> None:
    clock = RecordingClock()
    session = FakeSession()
    session.responses.append(FakeResponse(status_code=502, json_body={}))
    session.responses.append(FakeResponse(status_code=502, json_body={}))
    session.responses.append(FakeResponse(json_body={"ok": True}))
    rng = iter([0.0, 1.0]).__next__  # min jitter, then max jitter
    client = make_client(session, backoff_base=1.0, jitter=0.5, clock=clock.now, sleep=clock.sleep, rng=rng)

    client.get("/x")

    assert clock.sleeps == [0.5, 3.0]  # 1*(1-0.5), then 2*(1+0.5)


def test_retries_on_network_error() -> None:
    clock = RecordingClock()
    session = FakeSession()
    session.raise_once = requests.ConnectionError("boom")
    session.responses.append(FakeResponse(json_body={"ok": True}))
    client = make_client(session, clock=clock.now, sleep=clock.sleep, rng=lambda: 0.5)

    assert client.get("/ok") == {"ok": True}
    assert len(session.calls) == 2


def test_waits_until_rate_limit_reset_before_requesting() -> None:
    clock = RecordingClock()
    session = FakeSession()
    session.responses.append(FakeResponse(json_body={"ok": True}))
    client = make_client(session, clock=clock.now, sleep=clock.sleep, rate_limit_buffer=5)
    client._tokens[0].remaining = 0
    client._tokens[0].reset_at = clock.now() + 100

    client.get("/ok")

    assert clock.sleeps == [105.0]  # reset + buffer
    assert len(session.calls) == 1


def test_rate_limited_403_rotates_and_succeeds() -> None:
    clock = RecordingClock()
    session = FakeSession()
    session.responses.append(
        FakeResponse(
            status_code=403,
            json_body={"message": "API rate limit exceeded for t1."},
            headers={"X-RateLimit-Remaining": "0"},
        )
    )
    session.responses.append(FakeResponse(json_body={"ok": True}))
    client = make_client(session, tokens=["t1", "t2"], clock=clock.now, sleep=clock.sleep)

    assert client.get("/ok") == {"ok": True}
    # first attempt used t1 (rate limited), retry rotated to t2
    auths = [call[3]["Authorization"] for call in session.calls]
    assert auths == ["Bearer t1", "Bearer t2"]


def test_rate_limit_exhausted_raises_rate_limit_error(caplog) -> None:
    clock = RecordingClock()
    session = FakeSession()
    for _ in range(4):  # initial + 3 retries
        session.responses.append(
            FakeResponse(
                status_code=403,
                json_body={"message": "API rate limit exceeded."},
                headers={"X-RateLimit-Remaining": "0"},
            )
        )
    client = make_client(session, max_retries=3, clock=clock.now, sleep=clock.sleep)

    with pytest.raises(RateLimitError):
        client.get("/ok")


def test_client_error_raises_without_retry() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(status_code=404, json_body={"message": "Not Found"}))
    client = make_client(session)

    with pytest.raises(GitHubApiError) as excinfo:
        client.get("/repos/missing/missing")

    assert "404" in str(excinfo.value)
    assert len(session.calls) == 1


def test_paginate_follows_link_next() -> None:
    session = FakeSession()
    session.responses.append(
        FakeResponse(
            json_body=[{"n": 1}, {"n": 2}],
            headers=link_header(next_url="https://api.github.com/x?page=2", last_url="https://api.github.com/x?page=2"),
        )
    )
    session.responses.append(FakeResponse(json_body=[{"n": 3}]))
    client = make_client(session)

    items = list(client.paginate("/x", per_page=2))

    assert [i["n"] for i in items] == [1, 2, 3]
    assert session.calls[1][1].endswith("/x")
    assert session.calls[1][2]["page"] == "2"  # parsed from the Link header's query string


def test_search_paginates_and_caps_at_max_results() -> None:
    session = FakeSession()
    # 3 pages of 2, total 6; per_page=2, max_results=5 -> fetches 3 pages, yields 5
    for _ in range(2):
        session.responses.append(FakeResponse(json_body={"total_count": 6, "items": [make_repo(), make_repo()]}))
    session.responses.append(FakeResponse(json_body={"total_count": 6, "items": [make_repo(), make_repo()]}))
    client = make_client(session)

    results = list(client.search("created:>=2026-07-01", per_page=2, max_results=5))

    assert len(results) == 5
    assert len(session.calls) == 3  # fetched exactly 3 pages, no page 4


def test_search_stops_at_total_count() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(json_body={"total_count": 2, "items": [make_repo(), make_repo()]}))
    session.responses.append(FakeResponse(json_body={"total_count": 2, "items": []}))
    client = make_client(session)

    results = list(client.search("created:>=2026-07-01", per_page=2))

    assert len(results) == 2
    assert len(session.calls) == 2
