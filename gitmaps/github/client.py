"""Reusable GitHub API clients — REST and GraphQL v4.

Authentication, rate limiting, retries, and logging shared by both transports.
No policy logic lives here beyond HTTP behaviour; discovery and storage
decisions live in the collector (architecture §3-§4).

Design notes
------------
* **Token pool** — `GITHUB_TOKENS` is comma-separated and treated as one
  shared pool (architecture §6). Requests round-robin across tokens; a token
  seen returning no quota is skipped until its reset.
* **Rate limiting** — the REST client enforces it from response headers
  (`X-RateLimit-Remaining`); the GraphQL client enforces it from the query's
  `rateLimit { cost, remaining, resetAt }` block. When every token is
  exhausted the client sleeps until the earliest reset (+ a buffer), then
  retries once; if still limited it raises `RateLimitError`.
* **Retries** — exponential backoff on 5xx and transient network errors.
  4xx (client) errors are not retried, except 403 with a rate-limit signal.
* **Time** — `clock` and `sleep` are injectable so tests control the clock.
"""

from __future__ import annotations

import logging
import random
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

    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class RateLimitError(GitHubApiError):
    """The API rate limit was hit and could not be waited out."""


@dataclass
class TokenState:
    token: str
    remaining: int = 5000  # rate-limit quota; 5000 until the first response
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


class TokenPoolMixin:
    """Token-pool rotation, rate-limit waiting, and backoff — shared by the
    REST (`GitHubClient`) and GraphQL (`GraphQLClient`) transports.

    Rate limiting differs per transport: REST learns quota from response
    headers, GraphQL from the query's `rateLimit` block. Both report it the
    same way (`_update_token`), so the pool/wait machinery is transport-free.
    """

    def __init__(
        self,
        tokens: list[str],
        *,
        session: requests.Session | None = None,
        max_retries: int = 3,
        backoff_base: float = 0.5,
        retry_on: tuple[int, ...] = DEFAULT_RETRY_ON,
        rate_limit_buffer: float = 5.0,
        jitter: float = 0.1,
        clock: Callable[[], float] | None = None,
        sleep: Callable[[float], None] | None = None,
        rng: Callable[[], float] | None = None,
    ) -> None:
        if not tokens:
            raise ValueError(f"{type(self).__name__} requires at least one token")
        self._tokens = [TokenState(t) for t in tokens]
        self._session = session or requests.Session()
        self._max_retries = max_retries
        self._backoff_base = backoff_base
        self._retry_on = retry_on
        self._rate_limit_buffer = rate_limit_buffer
        self._jitter = jitter
        self._clock = clock or time.time
        self._sleep = sleep or time.sleep
        self._rng = rng or random.random
        self._next_index = 0

    # -- token pool ---------------------------------------------------------

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
        delay = self._backoff_base * (2 ** attempt)
        if self._jitter:
            # ±jitter percent, so a thundering herd of workers doesn't retry
            # in lockstep (architecture §6 "exponential jitter").
            delay *= 1.0 + self._jitter * (self._rng() * 2.0 - 1.0)
        return delay

    # -- shared send/retry loop --------------------------------------------

    def _request_loop(
        self,
        label: str,
        send: Callable[[TokenState], requests.Response],
    ) -> tuple[requests.Response, TokenState]:
        """Send one HTTP request with the transport's retry/rate-limit policy.

        The one loop both transports share: pick a token (waiting out an
        exhausted pool), send, consume the token's quota, then classify the
        response — network error → backoff/retry; rate limit → backoff/retry;
        5xx → backoff/retry; other 4xx → raise; success → return. Transport
        differences live in three overridable hooks:
        `_consume_token_quota`, `_is_rate_limited`, `_rate_limit_reset`.
        """
        attempt = 0
        while True:
            token = self._pick_token()
            if token is None:
                logger.warning("All %d tokens exhausted; waiting for rate limit reset", len(self._tokens))
                self._wait_for_earliest_reset()
                token = self._pick_token() or self._tokens[0]
            self._wait_if_exhausted(token)

            try:
                resp = send(token)
            except requests.RequestException as exc:
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s network error (%s); Retrying in %.1fs (attempt %d/%d)",
                        label, exc.__class__.__name__, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise GitHubApiError(f"{label} failed after {attempt + 1} attempts: {exc}") from exc

            self._consume_token_quota(token, resp)

            if resp.status_code == 403 and self._is_rate_limited(resp):
                token.remaining = 0
                token.reset_at = self._rate_limit_reset(resp)
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s rate limited; Retrying in %.1fs (attempt %d/%d)",
                        label, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise RateLimitError(
                    f"{label} rate limit exceeded after {attempt + 1} attempts",
                    status_code=resp.status_code,
                )

            if resp.status_code in self._retry_on:
                if attempt < self._max_retries:
                    delay = self._backoff(attempt)
                    logger.warning(
                        "%s returned %d; Retrying in %.1fs (attempt %d/%d)",
                        label, resp.status_code, delay, attempt + 1, self._max_retries,
                    )
                    self._sleep(delay)
                    attempt += 1
                    continue
                raise GitHubApiError(
                    f"{label} failed: {resp.status_code} after {attempt + 1} attempts",
                    status_code=resp.status_code,
                )

            if resp.status_code >= 400:
                raise GitHubApiError(
                    f"{label} failed: {resp.status_code} {self._error_message(resp)}",
                    status_code=resp.status_code,
                )

            return resp, token

    # -- transport hooks (REST defaults; GraphQL overrides) -----------------

    def _consume_token_quota(self, token: TokenState, resp: requests.Response) -> None:
        """Learn the token's remaining quota from the response. REST reads
        headers; GraphQL reads the query's `rateLimit` block on success."""
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

    def _rate_limit_reset(self, resp: requests.Response) -> float:
        return self._reset_from(resp) or (self._clock() + 60)

    def _reset_from(self, resp: requests.Response) -> float | None:
        reset = resp.headers.get("X-RateLimit-Reset")
        try:
            return float(reset) if reset else None
        except ValueError:
            return None

    def _error_message(self, resp: requests.Response) -> str:
        try:
            return str(resp.json().get("message", ""))
        except ValueError:
            return ""


class GitHubClient(TokenPoolMixin):
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
        jitter: float = 0.1,
        clock: Callable[[], float] | None = None,
        sleep: Callable[[float], None] | None = None,
        rng: Callable[[], float] | None = None,
    ) -> None:
        super().__init__(
            tokens,
            session=session,
            max_retries=max_retries,
            backoff_base=backoff_base,
            retry_on=retry_on,
            rate_limit_buffer=rate_limit_buffer,
            jitter=jitter,
            clock=clock,
            sleep=sleep,
            rng=rng,
        )
        self._base_url = base_url.rstrip("/")

    # -- public API ---------------------------------------------------------

    def get(self, path: str, *, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> Any:
        """GET a JSON resource, raising GitHubApiError on failure."""
        return self._request("GET", path, params=params, headers=headers).json()

    def get_readme(self, owner: str, name: str) -> str | None:
        """A repository's raw README text, or None when it has none (GitHub 404).

        READMEs are the semantic layer's primary content source (architecture
        §7); the embedding pipeline fetches them through this one method.
        `Accept: application/vnd.github.raw` asks GitHub for the plain text,
        not the base64-wrapped JSON object the endpoint returns by default.
        """
        try:
            resp = self._request(
                "GET",
                f"/repos/{owner}/{name}/readme",
                headers={"Accept": "application/vnd.github.raw"},
            )
        except GitHubApiError as exc:
            if exc.status_code == 404:
                return None
            raise
        return resp.text

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
        """Yield search-repository items, stopping at an empty page or max_results.

        GitHub's search API caps pagination at 1,000 results and 422s any page
        past that. Search results are also pagination-unstable (repos churn
        between page requests), so a page can come back partial and the loop
        would otherwise walk into the cap. The 422 is therefore end-of-results,
        not an error — yield what we have and stop.
        """
        page = 1
        fetched = 0
        while fetched < max_results:
            try:
                resp = self._request(
                    "GET",
                    "/search/repositories",
                    params={"q": query, "per_page": per_page, "page": page},
                )
            except GitHubApiError as exc:
                if exc.status_code == 422 and "first 1000 search results" in str(exc):
                    return  # reached GitHub's hard cap on this query
                raise
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

        def send(token: TokenState) -> requests.Response:
            request_headers = dict(base_headers)
            request_headers["Authorization"] = f"Bearer {token.token}"
            return self._session.request(method, url, params=params, headers=request_headers)

        resp, _ = self._request_loop(f"{method} {path}", send)
        return resp
