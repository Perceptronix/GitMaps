"""A reusable GitHub REST API client.

Authentication, rate limiting, retries, pagination, and logging — the
collector's HTTP seam. No policy logic lives here beyond HTTP behaviour;
discovery and storage decisions live in the collector (architecture §3-§4).

Design notes
------------
* **Token pool** — `GITHUB_TOKENS` is comma-separated and treated as one
  shared pool (architecture §6). Requests round-robin across tokens; a token
  seen returning `X-RateLimit-Remaining: 0` is skipped until its reset.
* **Rate limiting** — enforced from response headers. When every token is
  exhausted the client sleeps until the earliest reset (+ a buffer), then
  retries once; if still limited it raises `RateLimitError`.
* **Retries** — exponential backoff on 5xx and transient network errors.
  4xx (client) errors are not retried, except 403 with a rate-limit signal.
* **Time** — `clock` and `sleep` are injectable so tests control the clock.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, Callable, Iterator
from urllib.parse import parse_qs, urlsplit

import requests

logger = logging.getLogger("gitmaps.github.client")

DEFAULT_RETRY_ON = (500, 502, 503, 504)
API_VERSION = "2022-11-28"
MAX_SEARCH_RESULTS = 1000  # GitHub's hard cap on search pagination


class GitHubApiError(RuntimeError):
    """A request failed after retries, or a non-retryable error status."""


class RateLimitError(GitHubApiError):
    """The API rate limit was hit and could not be waited out."""


@dataclass
class TokenState:
    token: str
    remaining: int = 5000  # X-RateLimit-Remaining; 5000 until the first response
    reset_at: float = 0.0  # epoch seconds; 0 means "no known reset"


def _next_link(link_header: str) -> str:
    """Return the URL tagged rel=next in a Link header, or ''."""
    for part in link_header.split(","):
        url, _, params = part.partition(";")
        if 'rel="next"' in params:
            return url.strip()[1:-1]  # strip <>
    return ""


def _split_query(url: str) -> tuple[str, dict[str, str]]:
    """Split an absolute URL into (path, {query param: value})."""
    parts = urlsplit(url)
    query = {k: v[0] for k, v in parse_qs(parts.query).items()}
    return parts.path, query


class GitHubClient:
    def __init__(
        self,
        tokens: list[str],
        *,
        session: requests.Session | None = None,
        base_url: str = "https://api.github.com",
        max_retries: int = 3,
        backoff_base: float = 0.5,
        retry_on: tuple[int, ...] = DEFAULT_RETRY_ON,
        rate_limit_buffer: float = 5.0,
        clock: Callable[[], float] | None = None,
        sleep: Callable[[float], None] | None = None,
    ) -> None:
        if not tokens:
            raise ValueError("GitHubClient requires at least one token")
        self._tokens = [TokenState(t) for t in tokens]
        self._session = session or requests.Session()
        self._base_url = base_url.rstrip("/")
        self._max_retries = max_retries
        self._backoff_base = backoff_base
        self._retry_on = retry_on
        self._rate_limit_buffer = rate_limit_buffer
        self._clock = clock or time.time
        self._sleep = sleep or time.sleep
        self._next_index = 0

    # -- public API ---------------------------------------------------------

    def get(self, path: str, *, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> Any:
        """GET a JSON resource, raising GitHubApiError on failure."""
        return self._request("GET", path, params=params, headers=headers).json()

    def paginate(self, path: str, *, per_page: int = 100, params: dict[str, Any] | None = None) -> Iterator[dict]:
        """Yield every item of a list endpoint, following Link rel=next."""
        current: dict[str, Any] = dict(params or {})
        current.setdefault("page", 1)
        current.setdefault("per_page", per_page)
        while True:
            resp = self._request("GET", path, params=current)
            items = resp.json()
            if not isinstance(items, list):
                return
            yield from items
            next_url = _next_link(resp.headers.get("Link", ""))
            if not next_url:
                return
            path, extra = _split_query(next_url)
            current = {**current, **extra}

    def search(
        self,
        query: str,
        *,
        per_page: int = 100,
        max_results: int = MAX_SEARCH_RESULTS,
    ) -> Iterator[dict]:
        """Yield search-repository items, stopping at an empty page or max_results."""
        page = 1
        fetched = 0
        while fetched < max_results:
            resp = self._request(
                "GET",
                "/search/repositories",
                params={"q": query, "per_page": per_page, "page": page},
            )
            items = resp.json().get("items") or []
            if not items:
                return
            for item in items:
                if fetched >= max_results:
                    return
                fetched += 1
                yield item
            page += 1

    # -- internals ----------------------------------------------------------

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> requests.Response:
        url = self._base_url + path if path.startswith("/") else path
        base_headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": API_VERSION,
        }
        if headers:
            base_headers.update(headers)

        attempt = 0
        while True:
            token = self._pick_token()
            if token is None:
                logger.warning("All %d tokens exhausted; waiting for rate limit reset", len(self._tokens))
                self._wait_for_earliest_reset()
                token = self._pick_token() or self._tokens[0]
            self._wait_if_exhausted(token)

            request_headers = dict(base_headers)
            request_headers["Authorization"] = f"Bearer {token.token}"
            try:
                resp = self._session.request(method, url, params=params, headers=request_headers)
            except requests.RequestException as exc:
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s %s network error (%s); Retrying in %.1fs (attempt %d/%d)",
                        method, path, exc.__class__.__name__, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise GitHubApiError(f"{method} {path} failed after {attempt + 1} attempts: {exc}") from exc

            self._update_token(token, resp)

            if resp.status_code == 403 and self._is_rate_limited(resp):
                token.remaining = 0
                token.reset_at = self._reset_from(resp) or (self._clock() + 60)
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s %s rate limited; Retrying in %.1fs (attempt %d/%d)",
                        method, path, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise RateLimitError(f"{method} {path} rate limit exceeded after {attempt + 1} attempts")

            if resp.status_code in self._retry_on:
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s %s returned %d; Retrying in %.1fs (attempt %d/%d)",
                        method, path, resp.status_code, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise GitHubApiError(
                    f"{method} {path} failed: {resp.status_code} after {attempt + 1} attempts"
                )

            if resp.status_code >= 400:
                message = self._error_message(resp)
                raise GitHubApiError(f"{method} {path} failed: {resp.status_code} {message}")

            return resp

    def _pick_token(self) -> TokenState | None:
        """Round-robin over tokens that currently have quota."""
        for _ in range(len(self._tokens)):
            token = self._tokens[self._next_index % len(self._tokens)]
            self._next_index += 1
            if self._has_quota(token):
                return token
        return None

    def _has_quota(self, token: TokenState) -> bool:
        return token.remaining > 0 or self._clock() >= token.reset_at

    def _wait_if_exhausted(self, token: TokenState) -> None:
        if token.remaining <= 0:
            wait = token.reset_at + self._rate_limit_buffer - self._clock()
            if wait > 0:
                logger.warning("Token exhausted until %s; sleeping %.1fs", token.reset_at, wait)
                self._sleep(wait)

    def _wait_for_earliest_reset(self) -> None:
        earliest = min(t.reset_at for t in self._tokens)
        wait = earliest + self._rate_limit_buffer - self._clock()
        if wait > 0:
            logger.warning("All tokens exhausted; sleeping %.1fs until reset", wait)
            self._sleep(wait)

    def _backoff(self, attempt: int) -> float:
        return self._backoff_base * (2 ** attempt)

    def _update_token(self, token: TokenState, resp: requests.Response) -> None:
        remaining = resp.headers.get("X-RateLimit-Remaining")
        reset = resp.headers.get("X-RateLimit-Reset")
        if remaining is not None:
            try:
                token.remaining = int(remaining)
            except ValueError:
                pass
        if reset is not None:
            try:
                token.reset_at = float(reset)
            except ValueError:
                pass

    def _is_rate_limited(self, resp: requests.Response) -> bool:
        if resp.headers.get("X-RateLimit-Remaining") == "0":
            return True
        try:
            message = str(resp.json().get("message", ""))
        except ValueError:
            return False
        return "rate limit" in message.lower()

    def _error_message(self, resp: requests.Response) -> str:
        try:
            return str(resp.json().get("message", ""))
        except ValueError:
            return ""

    def _reset_from(self, resp: requests.Response) -> float | None:
        reset = resp.headers.get("X-RateLimit-Reset")
        try:
            return float(reset) if reset else None
        except ValueError:
            return None
