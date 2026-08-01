"""GET /trending endpoint — momentum-ranked repositories."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from gitmaps.api.deps import PaginationDep, StoreDep
from gitmaps.api.schemas import TrendingResponse

router = APIRouter()


@router.get(
    "/trending",
    response_model=TrendingResponse,
    summary="Get trending repositories",
    description="Returns repositories ranked by momentum score for a given period.",
)
async def get_trending(
    store: StoreDep,
    pagination: PaginationDep,
    period: str = Query("7d", pattern="^(1d|7d|30d)$", description="Momentum period"),
    language: str | None = Query(None, description="Filter by primary language"),
    topic: str | None = Query(None, description="Filter by topic"),
    domain: str | None = Query(None, description="Filter by technology domain"),
    min_score: float | None = Query(None, ge=0.0, description="Minimum momentum score"),
    surfaced_only: bool = Query(False, description="Only return surfaced repositories"),
) -> TrendingResponse:
    """Get trending repositories by momentum score."""
    return store.get_trending(
        pagination=pagination,
        period=period,
        language=language,
        topic=topic,
        domain=domain,
        min_score=min_score,
        surfaced_only=surfaced_only,
    )