"""GET /clusters endpoint — list clusters with filters."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from gitmaps.api.deps import PaginationDep, SortDep, StoreDep
from gitmaps.api.schemas import ClustersResponse, ClusterSummary

router = APIRouter()


@router.get(
    "/clusters",
    response_model=ClustersResponse,
    summary="List clusters",
    description="Returns a paginated list of clusters with optional filtering by domain.",
)
async def list_clusters(
    store: StoreDep,
    pagination: PaginationDep,
    sort: SortDep,
    domain: str | None = Query(None, description="Filter by technology domain"),
) -> ClustersResponse:
    """List all clusters with pagination, sorting, and filtering."""
    return store.list_clusters(
        pagination=pagination,
        sort=sort,
        domain=domain,
    )