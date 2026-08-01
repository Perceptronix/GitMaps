"""The embedding pipeline — semantic stage 1, with a pluggable provider.

Implements the `embed` job from architecture §7: for each Repository in the
embedding universe, compose its semantic content (identity, description,
topics, primary language, homepage, truncated README), embed it through a
pluggable `EmbeddingProvider`, and store the vector on `repos.embedding`
(D-05, D-11).

The pass is incremental by construction:

  * **Universe** — surfaced Repositories by default (the map/search set,
    architecture §7); `EmbeddingConfig.universe="all"` widens it.
  * **Due** — a Repository is due when it has never been embedded
    (`embedding IS NULL`), or its content may have changed since last embed
    (`embedded_at < pushed_at`), or the provider's model version changed
    (a full pass).
  * **Skip** — within the due set, a Repository whose freshly-computed
    semantic fingerprint matches the stored one is skipped (content
    unchanged) and its `embedded_at` advances, so it is not re-fetched until
    the next push.

The provider is the only model-specific thing here: local and cloud models
are swapped at `build_embedding_provider`, never in the pipeline. The engine
is pure — it imports nothing from the collector, promotion engine, snapshot
worker, or momentum engine (it shares only the HTTP client and timeutil).
"""

from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Sequence

import requests

from gitmaps.budget import RATE_BUDGET_KEY, rate_budget_state
from gitmaps.github.client import GitHubApiError, RateLimitError
from gitmaps.timeutil import utc_stamp

DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_DIMENSION = 384

#: Documented ingestion_state key (ticket 08 convention): the embedding model
#: version the stored vectors were produced with.
MODEL_VERSION_KEY = "embedding_model_version"


class EmbeddingProviderError(RuntimeError):
    """The provider failed to produce embeddings (network, shape, or API error)."""


class EmbeddingProvider(ABC):
    """The pluggable embedding seam (D-11): local and cloud models swap here.

    `embed(texts)` is the batch pipeline path; `embed_query(query)` is the
    search-time path the read API will use later. The model version is a
    stable string recorded in `ingestion_state`; when it changes, the runner
    does a full re-embed pass.
    """

    def __init__(self, *, model_name: str, dimension: int) -> None:
        if dimension <= 0:
            raise ValueError(f"dimension must be positive, got {dimension}")
        self.model_name = model_name
        self.dimension = dimension

    @property
    def embedding_model_version(self) -> str:
        return f"{self.model_name}:{self.dimension}"

    @abstractmethod
    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        """Embed a batch of texts into fixed-dimension vectors."""

    def embed_query(self, query: str) -> list[float]:
        """Embed a single search query into one vector (batch of one)."""
        return self.embed([query])[0]


class SentenceTransformerEmbedder(EmbeddingProvider):
    """A real open sentence-encoder via sentence-transformers (D-05, D-11).

    Default local model: `sentence-transformers/all-MiniLM-L6-v2` — the compact
    384-d encoder the migration's vector(384) is dimensioned for (architecture
    §7). Vectors are L2-normalized so cosine distance == euclidean distance.
    The model loads lazily on the first embed (once per process, §7) and may
    be injected (`sentence_transformer`) so unit tests never load a real model;
    the swap-in proves the seam — the pipeline never changes.
    """

    def __init__(
        self,
        *,
        model_name: str = DEFAULT_MODEL,
        dimension: int = DEFAULT_DIMENSION,
        sentence_transformer: Any | None = None,
    ) -> None:
        super().__init__(model_name=model_name, dimension=dimension)
        self._st = sentence_transformer  # injected fake, or None -> lazy-load

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        import numpy as np  # local import keeps the pure pipeline module light

        out = self._model().encode(list(texts), normalize_embeddings=True)
        vectors = np.atleast_2d(out).tolist()
        result = [[float(v) for v in row] for row in vectors]
        for vector in result:
            if len(vector) != self.dimension:
                raise EmbeddingProviderError(
                    f"model output dimension {len(vector)} != configured {self.dimension}"
                )
        return result

    def _model(self) -> Any:
        if self._st is None:
            from sentence_transformers import SentenceTransformer

            self._st = SentenceTransformer(self.model_name)
        return self._st


class HttpEmbeddingProvider(EmbeddingProvider):
    """Cloud-style provider over an HTTP `/embeddings` endpoint (OpenAI shape).

    POSTs `{"model": ..., "input": [...]}` to `url` and parses
    `{"data": [{"embedding": [...]}, ...]}`. This is the swap-in that proves
    the seam: the pipeline never changes, only this provider's wiring.
    """

    def __init__(
        self,
        url: str,
        *,
        model: str = "embedding",
        dimension: int = DEFAULT_DIMENSION,
        api_key: str | None = None,
        session: requests.Session | None = None,
        timeout: float = 30.0,
    ) -> None:
        super().__init__(model_name=model, dimension=dimension)
        self._url = url
        self._model = model
        self._api_key = api_key
        self._session = session if session is not None else requests.Session()
        self._timeout = timeout

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        resp = self._session.post(
            self._url,
            json={"model": self._model, "input": list(texts)},
            headers=headers,
            timeout=self._timeout,
        )
        if resp.status_code >= 400:
            raise EmbeddingProviderError(
                f"embedding endpoint returned {resp.status_code}: {getattr(resp, 'text', '')[:200]}"
            )
        vectors = [item["embedding"] for item in (resp.json() or {}).get("data") or []]
        if len(vectors) != len(texts):
            raise EmbeddingProviderError(f"expected {len(texts)} embeddings, got {len(vectors)}")
        for vector in vectors:
            if len(vector) != self.dimension:
                raise EmbeddingProviderError(
                    f"expected dimension {self.dimension}, got {len(vector)}"
                )
        return vectors


def build_embedding_provider(
    *,
    provider: str = "local",
    model: str = DEFAULT_MODEL,
    dimension: int = DEFAULT_DIMENSION,
    http_url: str | None = None,
    http_api_key: str | None = None,
) -> EmbeddingProvider:
    """Build the configured provider (local | http) — the pluggable seam.

    The pipeline never changes when a provider is swapped (D-11); this factory
    is the one wiring point, fed by Settings (config.py).
    """
    if provider == "local":
        return SentenceTransformerEmbedder(model_name=model, dimension=dimension)
    if provider == "http":
        if not http_url:
            raise ValueError("EMBEDDING_HTTP_URL is required when EMBEDDING_PROVIDER=http")
        return HttpEmbeddingProvider(http_url, model=model, dimension=dimension, api_key=http_api_key)
    raise ValueError(f"unknown embedding provider {provider!r} (expected 'local' or 'http')")


@dataclass(frozen=True)
class EmbeddingConfig:
    """Pipeline tunables. Tuning these is tuning the embedding pass."""

    readme_max_chars: int = 2000  # READMEs are truncated before composing/embedding
    universe: str = "surfaced"    # "surfaced" (map/search set) | "all" (every repo)

    def __post_init__(self) -> None:
        if self.readme_max_chars <= 0:
            raise ValueError(f"readme_max_chars must be positive, got {self.readme_max_chars}")
        if self.universe not in ("surfaced", "all"):
            raise ValueError(f"universe must be 'surfaced' or 'all', got {self.universe!r}")


def compose_semantic_text(
    *,
    full_name: str | None,
    description: str | None,
    topics: Sequence[str],
    language: str | None,
    homepage: str | None,
    readme: str | None,
    readme_max_chars: int,
) -> str:
    """Compose the semantic content a Repository is embedded on.

    The order is fixed so identical content always composes identical text
    (and therefore an identical fingerprint): identity, description, topics
    (sorted for determinism), primary language, homepage, then the truncated
    README. Absent parts are simply omitted.
    """
    parts: list[str] = []
    if full_name:
        parts.append(full_name.strip())
    if description and description.strip():
        parts.append(description.strip())
    if topics:
        parts.append(" ".join(sorted(topics)))
    if language:
        parts.append(language.strip())
    if homepage:
        parts.append(homepage.strip())
    if readme:
        parts.append(readme[:readme_max_chars])
    return "\n".join(parts)


def semantic_fingerprint(text: str) -> str:
    """Stable content hash of the composed semantic text (md5; not for security)."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class RepoEmbeddingInput:
    """A repo row read for embedding (EMBEDDING_COLUMNS order, see repo_store.py)."""

    id: int
    owner: str
    name: str
    full_name: str
    description: str | None
    topics: tuple[str, ...]
    language: str | None
    homepage: str | None
    embedding_fingerprint: str | None


def embedding_row_to_input(row: tuple) -> RepoEmbeddingInput:
    """Convert a repos embedding SELECT row to RepoEmbeddingInput."""
    (
        id_, owner, name, full_name, description, topics, language,
        homepage, fingerprint,
    ) = row
    return RepoEmbeddingInput(
        id=id_, owner=owner, name=name, full_name=full_name,
        description=description, topics=tuple(topics or ()),
        language=language, homepage=homepage, embedding_fingerprint=fingerprint,
    )


@dataclass(frozen=True)
class EmbeddingResult:
    model_version: str
    force_full: bool
    repos_seen: int
    embedded: int
    skipped: int     # content unchanged — verified and skipped
    errors: int      # readme fetch failures (non-404), repo skipped
    readme_fetches: int
    rate_limited: bool


class EmbeddingRunner:
    """Orchestrates the embedding pass over the store + readme client seams.

    `client` is duck-typed: anything with `get_readme(owner, name) -> str | None`
    (the GitHubClient in production; a fake in tests). `store` is a RepoStore.
    """

    def __init__(
        self,
        client,
        store,
        provider: EmbeddingProvider,
        *,
        now: Callable[[], datetime] | None = None,
        config: EmbeddingConfig | None = None,
        batch_size: int = 100,
        budget_per_hour: int | None = None,
    ) -> None:
        self._client = client
        self._store = store
        self._provider = provider
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or EmbeddingConfig()
        self._batch_size = batch_size
        self._budget_per_hour = budget_per_hour

    def run(self) -> EmbeddingResult:
        run_stamp = utc_stamp(self._now())
        provider_version = self._provider.embedding_model_version
        stored_version = self._store.get_state(MODEL_VERSION_KEY)
        # None (first run) or a different version -> full pass. This is how a
        # model upgrade deliberately re-embeds the whole universe (§7, D-05).
        force_full = stored_version != provider_version

        seen = embedded = skipped = errors = readme_fetches = 0
        rate_limited = False
        offset = 0

        # Rolling per-hour rate budget (§6): read the current hour's counter;
        # if another run already spent it, abort before any request. One README
        # fetch charges 1 against the same pool the snapshot jobs draw from.
        budget = rate_budget_state(self._store, self._now()) if self._budget_per_hour is not None else None

        while True:
            rows = self._page(force_full, offset)
            if not rows:
                break
            for row in rows:
                if budget is not None and budget["used"] >= self._budget_per_hour:
                    rate_limited = True
                    break
                inp = embedding_row_to_input(row)
                seen += 1
                # Charge up front: a request is consumed whether it succeeds or
                # fails, so aborted calls still count (§6).
                if budget is not None:
                    budget["used"] += 1
                try:
                    readme = self._client.get_readme(inp.owner, inp.name)
                except RateLimitError:
                    # All tokens exhausted — abort the batch rather than
                    # sleeping through the reset once per remaining repo.
                    rate_limited = True
                    break
                except GitHubApiError:
                    errors += 1
                    continue
                readme_fetches += 1

                text = compose_semantic_text(
                    full_name=inp.full_name, description=inp.description,
                    topics=inp.topics, language=inp.language,
                    homepage=inp.homepage, readme=readme,
                    readme_max_chars=self._config.readme_max_chars,
                )
                fingerprint = semantic_fingerprint(text)
                if (
                    not force_full
                    and inp.embedding_fingerprint is not None
                    and inp.embedding_fingerprint == fingerprint
                ):
                    # Content unchanged since last embed — skip, but advance
                    # embedded_at so the repo is not re-fetched until the next
                    # push. (A repo's stored fingerprint always accompanies its
                    # embedding, so a fingerprint match implies it is embedded.)
                    skipped += 1
                    self._store.touch_embedded_at(inp.id, run_stamp)
                    continue

                vector = self._provider.embed([text])[0]
                self._store.store_embedding(inp.id, vector, fingerprint, run_stamp)
                embedded += 1

            offset += self._batch_size
            if rate_limited or len(rows) < self._batch_size:
                break

        if budget is not None:
            self._store.set_state(RATE_BUDGET_KEY, budget)

        self._store.set_state(MODEL_VERSION_KEY, provider_version)
        self._store.set_state("embedding.last_run_at", run_stamp)
        self._store.set_state("embedding.last_embedded", embedded)
        self._store.set_state("embedding.last_skipped", skipped)

        return EmbeddingResult(
            model_version=provider_version,
            force_full=force_full,
            repos_seen=seen,
            embedded=embedded,
            skipped=skipped,
            errors=errors,
            readme_fetches=readme_fetches,
            rate_limited=rate_limited,
        )

    def _page(self, force_full: bool, offset: int) -> list[tuple]:
        if force_full:
            return self._store.list_all_for_embedding(self._config.universe, self._batch_size, offset)
        return self._store.list_due_for_embedding(self._config.universe, self._batch_size, offset)
