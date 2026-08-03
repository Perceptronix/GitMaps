"""GraphQL v4 batch-fetch client.

Verifies query construction, response mapping, partial-null handling, point
rate-limit tracking, batching, and whole-batch failures. No network: every
request is served by FakeSession.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from gitmaps.github.client import GitHubApiError, RateLimitError
from gitmaps.github.graphql_client import GraphQLClient, RepoData

from conftest import FakeResponse, FakeSession, RecordingClock, make_repo


def make_client(session: FakeSession, tokens: list[str] = ["t1"], **kwargs) -> GraphQLClient:
    return GraphQLClient(tokens, session=session, **kwargs)


def rate_limit_block(cost: int = 2, remaining: int = 4900) -> dict:
    return {"cost": cost, "remaining": remaining, "resetAt": "2026-08-03T16:00:00Z"}


def graphql_node(**overrides: object) -> dict:
    """A well-formed `repository` alias node, mirroring `make_repo` fields."""
    node = {
        "databaseId": 1001,
        "stargazerCount": 42,
        "forkCount": 7,
        "watchers": {"totalCount": 3},
        "issues": {"totalCount": 2},
        "primaryLanguage": {"name": "Python"},
        "description": "a test repository",
        "homepageUrl": "https://example.com",
        "repositoryTopics": {"nodes": [{"topic": {"name": "python"}}, {"topic": {"name": "demo"}}]},
        "pushedAt": "2026-07-30T10:00:00Z",
        "createdAt": "2026-07-01T10:00:00Z",
        "isArchived": False,
        "isFork": False,
        "licenseInfo": {"spdxId": "MIT", "key": "mit"},
        "readme": {"text": "# Hello\nWorld"},
    }
    node.update(overrides)
    return node


def response(payload: dict, status_code: int = 200) -> FakeResponse:
    return FakeResponse(status_code=status_code, json_body=payload)


# ---------------------------------------------------------------------------
# Query construction
# ---------------------------------------------------------------------------


def test_builds_one_query_aliasing_each_repo() -> None:
    session = FakeSession()
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r0": None}}))
    client = make_client(session)

    client.fetch_repos_batch(["octocat/hello-world"])

    _, url, _, _ = session.calls[0]
    assert url.endswith("/graphql")
    query = session.bodies[0]["query"]
    # rateLimit is requested so point cost is visible to the client
    assert "rateLimit" in query
    assert "r0: repository(owner: \"octocat\", name: \"hello-world\")" in query
    # the spec field set is present
    for field in ("databaseId", "stargazerCount", "forkCount", "primaryLanguage",
                  "homepageUrl", "repositoryTopics", "isArchived", "isFork",
                  "licenseInfo", "HEAD:README.md"):
        assert field in query


def test_splits_large_batches_into_one_request_per_chunk() -> None:
    session = FakeSession()
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r0": None, "r1": None}}))
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r2": None}}))
    client = make_client(session, batch_size=2)

    client.fetch_repos_batch(["a/x", "b/y", "c/z"])

    assert len(session.calls) == 2
    assert "r0: repository(owner: \"a\"" in session.bodies[0]["query"]
    assert "r1: repository(owner: \"b\"" in session.bodies[0]["query"]
    # alias numbering restarts per chunk: the second request holds c/z as r0
    assert "r0: repository(owner: \"c\"" in session.bodies[1]["query"]


# ---------------------------------------------------------------------------
# Response mapping
# ---------------------------------------------------------------------------


def test_maps_full_response_to_repo_data() -> None:
    session = FakeSession()
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r0": graphql_node()}}))
    client = make_client(session)

    result = client.fetch_repos_batch(["octocat/hello-world"])

    assert len(result) == 1
    rd = result[0]
    assert rd is not None
    assert rd.full_name == "octocat/hello-world"
    assert rd.id == 1001
    assert rd.stars == 42
    assert rd.forks == 7
    assert rd.watchers == 3
    assert rd.open_issues == 2
    assert rd.language == "Python"
    assert rd.topics == ["python", "demo"]
    assert rd.license == "MIT"
    assert rd.readme == "# Hello\nWorld"
    assert not rd.archived and not rd.is_fork


def test_maps_to_rest_dict_that_repo_to_row_consumes() -> None:
    from gitmaps.repo_store import repo_to_row

    rd = RepoData.from_node(graphql_node(), "octocat/hello-world", readme_max_chars=100)
    row = repo_to_row(rd.as_rest_dict())

    assert row["id"] == 1001
    assert row["full_name"] == "octocat/hello-world"
    assert row["stars"] == 42
    assert row["watchers"] == 3  # GraphQL watchers.totalCount -> subscribers_count
    assert row["license"] == "MIT"


def test_truncates_readme_to_configured_max_chars() -> None:
    session = FakeSession()
    session.responses.append(
        response({"data": {"rateLimit": rate_limit_block(), "r0": graphql_node(readme={"text": "x" * 3000})}})
    )
    client = make_client(session, readme_max_chars=2000)

    rd = client.fetch_repos_batch(["octocat/hello-world"])[0]

    assert rd is not None and len(rd.readme) == 2000


# ---------------------------------------------------------------------------
# Partial failures — null aliases never raise
# ---------------------------------------------------------------------------


def test_null_repo_alias_maps_to_none_not_raise() -> None:
    session = FakeSession()
    session.responses.append(
        response({"data": {"rateLimit": rate_limit_block(), "r0": graphql_node(), "r1": None}})
    )
    client = make_client(session)

    result = client.fetch_repos_batch(["octocat/hello-world", "deleted/vanished"])

    assert result[0] is not None
    assert result[1] is None  # renamed/deleted repos stay None, batch succeeds


def test_null_subfields_map_to_empty_or_none() -> None:
    node = graphql_node(
        primaryLanguage=None, licenseInfo=None, readme=None,
        repositoryTopics=None, watchers=None, issues=None,
    )
    session = FakeSession()
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r0": node}}))
    client = make_client(session)

    rd = client.fetch_repos_batch(["octocat/hello-world"])[0]

    assert rd is not None
    assert rd.language is None
    assert rd.license is None
    assert rd.readme is None
    assert rd.topics == []
    assert rd.watchers == 0
    assert rd.open_issues == 0


# ---------------------------------------------------------------------------
# Point-based rate limiting
# ---------------------------------------------------------------------------


def test_rate_limit_block_updates_token_points() -> None:
    session = FakeSession()
    session.responses.append(
        response({"data": {"rateLimit": {"cost": 7, "remaining": 400, "resetAt": "2026-08-03T16:00:00Z"}, "r0": None}})
    )
    client = make_client(session)

    client.fetch_repos_batch(["octocat/hello-world"])

    assert client._tokens[0].remaining == 400


def test_second_request_waits_until_reset_when_points_exhausted() -> None:
    clock = RecordingClock(epoch=1_000_000.0)
    # resetAt 60s after the current clock — parse -> epoch 1_000_060
    reset_at = datetime.fromtimestamp(1_000_060, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    session = FakeSession()
    session.responses.append(
        response({"data": {"rateLimit": {"cost": 1, "remaining": 0, "resetAt": reset_at}, "r0": None}})
    )
    session.responses.append(
        response({"data": {"rateLimit": {"cost": 1, "remaining": 100, "resetAt": reset_at}, "r0": None}})
    )
    client = make_client(session, clock=clock.now, sleep=clock.sleep)

    client.fetch_repos_batch(["octocat/hello-world"])  # first call exhausts points
    client.fetch_repos_batch(["octocat/hello-world"])  # second call waits out the reset

    assert clock.sleeps and max(clock.sleeps) > 55  # slept through the reset window (+buffer)


def test_403_rate_limited_raises_rate_limit_error() -> None:
    clock = RecordingClock(epoch=1_000_000.0)
    session = FakeSession()
    # one 403 per attempt (max_retries=2 -> 3 attempts) before the client gives up
    for _ in range(3):
        session.responses.append(FakeResponse(status_code=403, json_body={"message": "rate limit exceeded"}))
    client = make_client(session, clock=clock.now, sleep=clock.sleep, backoff_base=0.0, jitter=0.0, max_retries=2)

    with pytest.raises(RateLimitError):
        client.fetch_repos_batch(["octocat/hello-world"])

    assert len(session.calls) == 3  # exactly max_retries+1 attempts, then raised


def test_http_error_raises_github_api_error() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(status_code=401, json_body={"message": "Bad credentials"}))
    client = make_client(session)

    with pytest.raises(GitHubApiError):
        client.fetch_repos_batch(["octocat/hello-world"])


def test_query_level_errors_raise_when_no_data() -> None:
    # `errors` without `data` = whole-query failure (auth/schema), not a
    # partial-null situation — the caller must fall back to REST.
    session = FakeSession()
    session.responses.append(
        FakeResponse(status_code=200, json_body={"errors": [{"message": "Bad credentials"}]})
    )
    client = make_client(session)

    with pytest.raises(GitHubApiError, match="Bad credentials"):
        client.fetch_repos_batch(["octocat/hello-world"])


def test_errors_with_partial_data_still_uses_the_data() -> None:
    # GitHub can return errors (e.g. a field deprecation) AND data; the data is
    # still authoritative and should be mapped.
    session = FakeSession()
    session.responses.append(
        response(
            {
                "errors": [{"message": "ignored field warning"}],
                "data": {"rateLimit": rate_limit_block(), "r0": graphql_node()},
            }
        )
    )
    client = make_client(session)

    result = client.fetch_repos_batch(["octocat/hello-world"])

    assert result[0] is not None and result[0].stars == 42


def test_retries_on_server_error_then_succeeds() -> None:
    session = FakeSession()
    session.responses.append(FakeResponse(status_code=500, json_body={}))
    session.responses.append(response({"data": {"rateLimit": rate_limit_block(), "r0": None}}))
    client = make_client(session, backoff_base=0.0, jitter=0.0)

    result = client.fetch_repos_batch(["octocat/hello-world"])

    assert result == [None]
    assert len(session.calls) == 2
