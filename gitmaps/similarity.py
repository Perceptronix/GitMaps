"""The Similar repositories service — a Repository's nearest neighbors by embedding.

Implements the `/repos/{owner}/{name}/similar` read from architecture §9: given
a source Repository, query the shared pgvector HNSW index (`repos.embedding`,
migration 04) for its nearest neighbors by cosine distance, never the source
itself, with optional language / topic filters. Every result carries its cosine
similarity score (`1 - cosine_distance`), so a caller can show *how* similar.

This phase is the embedding-space retrieval only. The PRD's momentum re-rank
("the unknown doppelgänger outranks the famous twin") is a later phase built on
top of this retrieval — `SimilarRepo` is the seam it re-orders, which is why the
result stays a plain ordered list here.

Pure engine + store seam, same shape as momentum/promotion: the SQL lives in
`RepoStore.find_similar`, `SimilarityService` orchestrates source lookup and the
query, and unit tests substitute a recording store.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence


class SimilarityError(RuntimeError):
    """Base error for the Similar repositories service."""


class RepoNotFoundError(SimilarityError):
    """The source Repository is not in the tracked universe."""


class RepoNotEmbeddedError(SimilarityError):
    """The source Repository has no embedding yet (semantic stage 1 hasn't run)."""


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    """Cosine similarity between two vectors — the score the ANN query returns.

    This is the client-side statement of the SQL's `1 - (a <=> b)` contract,
    kept pure so tests can assert exact expected scores without Postgres.
    """
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


@dataclass(frozen=True)
class SimilarityConfig:
    """Similar repositories tunables. Tuning these is tuning the feature."""

    top_n: int = 10
    #: None = no relevance floor; set to a [0, 1]-ish value to drop far matches.
    min_similarity: float | None = None

    def __post_init__(self) -> None:
        if self.top_n <= 0:
            raise ValueError(f"top_n must be positive, got {self.top_n}")
        if self.min_similarity is not None and not -1.0 <= self.min_similarity <= 1.0:
            raise ValueError(f"min_similarity must be in [-1, 1], got {self.min_similarity}")


@dataclass(frozen=True)
class SimilarRepo:
    """One nearest neighbor of the source Repository, with its similarity score."""

    id: int
    owner: str
    name: str
    full_name: str
    description: str | None
    language: str | None
    topics: tuple[str, ...]
    stars: int
    surfaced: bool
    similarity: float


def row_to_similar(row: tuple) -> SimilarRepo:
    """Convert a RepoStore.find_similar row to SimilarRepo (SIMILAR_COLUMNS order)."""
    (
        id_, owner, name, full_name, description, language, topics, stars, surfaced, similarity,
    ) = row
    return SimilarRepo(
        id=id_, owner=owner, name=name, full_name=full_name,
        description=description, language=language,
        topics=tuple(topics or ()), stars=stars, surfaced=bool(surfaced),
        similarity=round(float(similarity), 6),
    )


class SimilarityService:
    """Orchestrates a Similar repositories query over the store seam.

    `store` is duck-typed: anything with `get_similar_source(full_name)` and
    `find_similar(...)` (a RepoStore in production; a fake in tests).
    """

    def __init__(self, store, *, config: SimilarityConfig | None = None) -> None:
        self._store = store
        self._config = config or SimilarityConfig()

    def similar(
        self,
        full_name: str,
        *,
        language: str | None = None,
        topic: str | None = None,
    ) -> list[SimilarRepo]:
        """Top-N nearest neighbors of `full_name` by embedding cosine, source excluded.

        Raises `RepoNotFoundError` when the source Repository isn't in the
        universe, and `RepoNotEmbeddedError` when it hasn't been embedded yet.
        """
        source = self._store.get_similar_source(full_name)
        if source is None:
            raise RepoNotFoundError(f"unknown repository {full_name!r}")
        repo_id, embedding, _, _ = source
        if embedding is None:
            raise RepoNotEmbeddedError(
                f"{full_name!r} has no embedding yet — run the semantic embed job first"
            )
        rows = self._store.find_similar(
            repo_id,
            embedding,
            limit=self._config.top_n,
            language=language,
            topic=topic,
            min_similarity=self._config.min_similarity,
        )
        return [row_to_similar(row) for row in rows]
