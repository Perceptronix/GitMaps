"""GET /search endpoint — full-text search with filters."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from gitmaps.api.deps import PaginationDep, SortDep, StoreDep
from gitmaps.api.schemas import SearchResponse, RepoBase

router = APIRouter()


@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Search repositories",
    description="Full-text search over repository name, description, and topics with optional filters.",
)
async def search_repos(
    store: StoreDep,
    pagination: PaginationDep,
    sort: SortDep,
    q: str | None = Query(None, description="Search query (name, description, topics)"),
    language: str | None = Query(None, description="Filter by primary language"),
    topics: list[str] | None = Query(None, description="Filter by topics (any match)"),
    domains: list[str] | None = Query(None, description="Filter by technology domains (any match)"),
    min_stars: int | None = Query(None, ge=0, description="Minimum stars"),
    max_stars: int | None = Query(None, ge=0, description="Maximum stars"),
    tracked: bool | None = Query(None, description="Filter by tracked status"),
    surfaced: bool | None = Query(None, description="Filter by surfaced status"),
    has_cluster: bool | None = Query(None, description="Filter by cluster assignment"),
    has_map_position: bool | None = Query(None, description="Filter by map position"),
) -> SearchResponse:
    """Search repositories with full-text and filter support."""
    return store.search_repos(
        pagination=pagination,
        sort=sort,
        q=q,
        language=language,
        topics=topics,
        domains=domains,
        min_stars=min_stars,
        max_stars=max_stars,
        tracked=tracked,
        surfaced=surfaced,
        has_cluster=has_cluster,
        has_map_position=has_map_position,
    )