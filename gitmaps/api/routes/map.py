"""GET /map endpoint — the semantic map clusters and repo positions."""

from __future__ import annotations

from decimal import Decimal
from fastapi import APIRouter, Depends

from gitmaps.api.deps import PaginationDep, StoreDep
from gitmaps.api.schemas import MapResponse, ClusterPosition, RepoMapPosition
from gitmaps.repo_store import RepoStore

router = APIRouter()


@router.get(
    "/map",
    response_model=MapResponse,
    summary="Get the semantic map",
    description="Returns all cluster centroids and repository positions for the semantic map visualization.",
)
async def get_map(
    store: StoreDep,
    pagination: PaginationDep,
) -> MapResponse:
    """Get the full semantic map data.

    Returns cluster centroids and all repository positions. Supports pagination
    for repositories (clusters are typically small enough to return all).
    """
    # Get all cluster positions using store method
    cluster_rows = store.list_cluster_positions()
    clusters = [
        ClusterPosition(
            cluster_id=row[0],
            domain=row[1],
            label=row[2],
            member_count=row[3] or 0,
            x=float(row[4]) if isinstance(row[4], Decimal) else row[4],
            y=float(row[5]) if isinstance(row[5], Decimal) else row[5],
        )
        for row in cluster_rows
    ]

    # Get paginated repo positions using store method
    repo_rows = store.list_repo_positions(pagination.limit, pagination.offset)
    repos = [
        RepoMapPosition(
            repo_id=row[0],
            x=float(row[1]) if isinstance(row[1], Decimal) else row[1],
            y=float(row[2]) if isinstance(row[2], Decimal) else row[2],
            cluster_id=row[3],
            stars=row[4] or 0,
            owner=row[5],
            name=row[6],
            domain=row[7],
        )
        for row in repo_rows
    ]

    # Get total count
    total_repos = store.count_repo_positions()

    # Get the latest layout run timestamp
    updated_at = store.get_state("layout.last_run_at")

    return MapResponse(
        clusters=clusters,
        repos=repos,
        updated_at=updated_at,
    )