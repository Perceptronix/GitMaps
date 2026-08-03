"""Live rolled-back integration test for the GraphQL v4 batch client.

Skips when no `GITHUB_TOKENS` is available (CI / a box without the `.env`).
Fetches a small batch of well-known repos through the real GitHub GraphQL
endpoint and verifies the RepoData mapping — including the per-repo null path
for a name that (almost certainly) never resolves. The `github_tokens` setting
is read from env or `.env`, matching the layout/momentum integration pattern.
"""

from __future__ import annotations

import os

import pytest

from gitmaps.github.client import RateLimitError
from gitmaps.github.graphql_client import GraphQLClient


def _tokens() -> list[str] | None:
    if os.environ.get("GITHUB_TOKENS"):
        return [t.strip() for t in os.environ["GITHUB_TOKENS"].split(",") if t.strip()]
    try:
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("GITHUB_TOKENS="):
                    value = line.split("=", 1)[1].strip().strip("'\"")
                    return [t.strip() for t in value.split(",") if t.strip()]
    except OSError:
        return None
    return None


@pytest.fixture
def live_client() -> GraphQLClient:
    tokens = _tokens()
    if not tokens:
        pytest.skip("GITHUB_TOKENS not available")
    try:
        return GraphQLClient(tokens, batch_size=10)
    except Exception as exc:  # pragma: no cover - depends on the box
        pytest.skip(f"GraphQL client init failed: {exc}")


#: Well-known, long-lived repos plus one name that should never resolve.
FULL_NAMES = [
    "octocat/Hello-World",
    "python/cpython",
    "facebook/react",
    "octocat/this-repo-definitely-does-not-exist-9f3k2",
]


def test_fetch_repos_batch_against_live_graphql(live_client) -> None:
    if live_client is None:
        pytest.skip("GraphQL client unavailable")
    try:
        result = live_client.fetch_repos_batch(FULL_NAMES)
    except RateLimitError as exc:  # pragma: no cover - box-dependent
        pytest.skip(f"GraphQL rate limited: {exc}")

    assert len(result) == len(FULL_NAMES)
    by_name = {rd.full_name: rd for rd in result if rd is not None}
    assert len(by_name) == 3  # the three real repos resolved

    hello = by_name["octocat/Hello-World"]
    assert hello.id is not None
    assert hello.owner == "octocat" and hello.name == "Hello-World"
    assert hello.stars >= 0 and hello.forks >= 0
    assert hello.created_at is not None
    # every resolved repo carries a REST-shaped dict repo_to_row can consume
    from gitmaps.repo_store import repo_to_row

    row = repo_to_row(hello.as_rest_dict())
    assert row["full_name"] == "octocat/Hello-World"
    assert row["id"] == hello.id

    # the unresolvable name is None, and the batch did not raise
    assert result[FULL_NAMES.index("octocat/this-repo-definitely-does-not-exist-9f3k2")] is None
