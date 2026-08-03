"""GitHub GraphQL v4 batch-fetch client.

One query aliases up to `batch_size` `repository(owner:, name:)` lookups, so
a batch of repos that previously needed N REST calls (metadata + readme +
languages) arrives in a single request. Reuses the token pool / rate-limit
waiting / backoff machinery from `TokenPoolMixin` (client.py) — the only
transport difference is that GraphQL reports its *point* quota in the query
response (`rateLimit { cost, remaining, resetAt }`) rather than in headers.

Failures are handled at two distinct granularities:

* **Per-repo** — a renamed/deleted repo comes back as a null alias; that repo
  maps to `None` in the result list and the rest of the batch is unaffected.
* **Whole-batch** — a 4xx/5xx/rate-limit/network failure raises
  `GitHubApiError` / `RateLimitError` (same contract as the REST client), so
  callers like the collector can fall back to REST without changing their
  error handling.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol, Sequence

import requests

from gitmaps.github.client import GitHubApiError, TokenPoolMixin

GRAPHQL_ENDPOINT = "https://api.github.com/graphql"
DEFAULT_BATCH_SIZE = 50
DEFAULT_README_MAX_CHARS = 2000

#: Fields requested per aliased `repository`. README arrives via
#: `object(expression: "HEAD:README.md")`, truncated to `readme_max_chars`.
_REPO_FIELDS = """\
databaseId
stargazerCount
forkCount
watchers { totalCount }
issues(states: OPEN) { totalCount }
primaryLanguage { name }
description
homepageUrl
repositoryTopics(first: 10) { nodes { topic { name } } }
pushedAt
createdAt
isArchived
isFork
licenseInfo { spdxId key }
readme: object(expression: "HEAD:README.md") { ... on Blob { text } }"""


class GraphQLBatchClient(Protocol):
    """The duck-typed batch-fetch seam (collector enrichment, tests).

    `fetch_repos_batch` returns one entry per input full_name, in order:
    a `RepoData` for resolvable repos and `None` for renamed/deleted ones. A
    whole-batch failure raises `GitHubApiError` / `RateLimitError`.
    """

    def fetch_repos_batch(self, full_names: Sequence[str]) -> list[RepoData | None]: ...


def _reset_epoch(reset_at: str | None) -> float:
    """ISO8601 `resetAt` from the rateLimit block -> epoch seconds."""
    if not reset_at:
        return 0.0
    try:
        return datetime.fromisoformat(reset_at.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


@dataclass(frozen=True)
class RepoData:
    """One repository as fetched by `fetch_repos_batch`.

    The REST-shaped view (`as_rest_dict`) carries the exact keys the pipeline's
    `repo_to_row` consumes, so downstream code is unchanged whether a repo
    arrived via REST search, REST detail, or this GraphQL batch path.
    """

    id: int | None
    full_name: str
    owner: str
    name: str
    description: str | None
    topics: list[str]
    language: str | None
    license: str | None
    homepage: str | None
    archived: bool
    is_fork: bool
    created_at: str | None
    pushed_at: str | None
    stars: int
    forks: int
    watchers: int
    open_issues: int
    readme: str | None

    @classmethod
    def from_node(
        cls,
        node: dict[str, Any],
        full_name: str,
        *,
        readme_max_chars: int | None,
    ) -> "RepoData":
        """Map one GraphQL `repository` alias node to RepoData.

        Nullable sub-objects (primaryLanguage, licenseInfo, repositoryTopics,
        README, watchers, issues) are tolerated individually — a null never
        raises, it maps to None / [] / 0.
        """
        owner, _, name = full_name.partition("/")
        topics: list[str] = []
        for t in (node.get("repositoryTopics") or {}).get("nodes") or []:
            topic_name = (t.get("topic") or {}).get("name")
            if topic_name:
                topics.append(topic_name)
        readme = (node.get("readme") or {}).get("text")
        license_info = node.get("licenseInfo") or {}
        return cls(
            id=node.get("databaseId"),
            full_name=full_name,
            owner=owner,
            name=name,
            description=node.get("description"),
            topics=topics,
            language=(node.get("primaryLanguage") or {}).get("name"),
            license=license_info.get("spdxId") or license_info.get("key"),
            homepage=node.get("homepageUrl"),
            archived=bool(node.get("isArchived", False)),
            is_fork=bool(node.get("isFork", False)),
            created_at=node.get("createdAt"),
            pushed_at=node.get("pushedAt"),
            stars=node.get("stargazerCount") or 0,
            forks=node.get("forkCount") or 0,
            watchers=(node.get("watchers") or {}).get("totalCount") or 0,
            open_issues=(node.get("issues") or {}).get("totalCount") or 0,
            readme=readme[:readme_max_chars] if readme and readme_max_chars else readme,
        )

    def as_rest_dict(self) -> dict[str, Any]:
        """The GitHub REST repository-object shape `repo_to_row` consumes."""
        return {
            "id": self.id,
            "owner": {"login": self.owner},
            "name": self.name,
            "full_name": self.full_name,
            "description": self.description,
            "topics": self.topics,
            "language": self.language,
            "license": {"spdx_id": self.license} if self.license else None,
            "homepage": self.homepage,
            "archived": self.archived,
            "fork": self.is_fork,
            "created_at": self.created_at,
            "pushed_at": self.pushed_at,
            "stargazers_count": self.stars,
            "forks_count": self.forks,
            "subscribers_count": self.watchers,
            "open_issues_count": self.open_issues,
        }


class GraphQLClient(TokenPoolMixin):
    """GraphQL v4 client. Like the REST client: round-robins the token pool,
    waits out rate limits, retries 5xx with backoff, raises `RateLimitError`
    when the point quota is exhausted and can't be waited out."""

    def __init__(
        self,
        tokens: list[str],
        *,
        session: requests.Session | None = None,
        base_url: str = GRAPHQL_ENDPOINT,
        batch_size: int = DEFAULT_BATCH_SIZE,
        readme_max_chars: int = DEFAULT_README_MAX_CHARS,
        **mixin_kwargs: Any,
    ) -> None:
        super().__init__(tokens, session=session, **mixin_kwargs)
        if batch_size <= 0:
            raise ValueError(f"batch_size must be positive, got {batch_size}")
        self._base_url = base_url
        self._batch_size = batch_size
        self._readme_max_chars = readme_max_chars

    # -- public API ---------------------------------------------------------

    def fetch_repos_batch(self, full_names: Sequence[str]) -> list[RepoData | None]:
        """Fetch up to `batch_size` repos per GraphQL request.

        Returns one entry per input `full_name`, in the same order: a
        `RepoData` for resolvable repos, `None` for ones GraphQL couldn't
        resolve (renamed/deleted). A whole-batch failure raises
        `GitHubApiError` / `RateLimitError` so callers fall back to REST.
        """
        results: list[RepoData | None] = []
        for start in range(0, len(full_names), self._batch_size):
            chunk = full_names[start : start + self._batch_size]
            query = self._build_query(chunk)
            payload = self._post(query)
            results.extend(self._map_response(payload, chunk))
        return results

    # -- internals ----------------------------------------------------------

    def _build_query(self, full_names: Sequence[str]) -> str:
        aliases: list[str] = []
        for i, full_name in enumerate(full_names):
            owner, _, name = full_name.partition("/")
            aliases.append(
                f"r{i}: repository(owner: {json.dumps(owner)}, name: {json.dumps(name)}) {{\n"
                f"  {_REPO_FIELDS}\n"
                f"}}"
            )
        body = "\n".join(aliases)
        return f"query {{\n  rateLimit {{ cost remaining resetAt }}\n{body}\n}}"

    def _map_response(
        self, payload: dict[str, Any], full_names: Sequence[str]
    ) -> list[RepoData | None]:
        data = payload.get("data") or {}
        out: list[RepoData | None] = []
        for i, full_name in enumerate(full_names):
            node = data.get(f"r{i}")
            out.append(
                RepoData.from_node(node, full_name, readme_max_chars=self._readme_max_chars)
                if node
                else None
            )
        return out

    def _post(self, query: str) -> dict[str, Any]:
        def send(token) -> requests.Response:
            headers = {"Authorization": f"Bearer {token.token}"}
            return self._session.request("POST", self._base_url, json={"query": query}, headers=headers)

        resp, token = self._request_loop("graphql", send)
        payload = resp.json()

        # A query-level failure (auth, schema error) carries `errors` with
        # no `data` — raise so callers can fall back to REST. Partial
        # per-alias nulls still come back under `data` and are handled by
        # the mapper, not here.
        if payload.get("errors") and not payload.get("data"):
            messages = "; ".join(str(e.get("message", "")) for e in payload["errors"])
            raise GitHubApiError(f"graphql query failed: {messages}")

        # Point quota comes back in the response body, not headers.
        rate_limit = (payload.get("data") or {}).get("rateLimit") or {}
        if rate_limit.get("remaining") is not None:
            try:
                token.remaining = int(rate_limit["remaining"])
            except (TypeError, ValueError):
                pass
        reset = _reset_epoch(rate_limit.get("resetAt"))
        if reset:
            token.reset_at = reset

        return payload

    # -- transport hooks (GraphQL overrides the REST defaults in the mixin) --

    def _consume_token_quota(self, token, resp: requests.Response) -> None:
        # GraphQL reports points in the body's rateLimit block, applied in
        # `_post` on success — nothing to learn from headers.
        return None

    def _is_rate_limited(self, resp: requests.Response) -> bool:
        # Every GraphQL 403 is a point-quota exhaustion (no meaningful scope
        # distinction from the status alone).
        return True

    def _rate_limit_reset(self, resp: requests.Response) -> float:
        # 403s carry no X-RateLimit-Reset; best-effort one-minute window.
        return self._clock() + 60
