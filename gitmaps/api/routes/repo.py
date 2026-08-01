"""GET /repo/:id endpoint — full repository detail."""

from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path

from gitmaps.api.deps import StoreDep, get_store
from gitmaps.api.schemas import RepoDetail, MomentumScores, MomentumPeriod, MomentumSignal
from gitmaps.momentum import PERIOD_DAYS

router = APIRouter()


@router.get(
    "/repo/{repo_id}",
    response_model=RepoDetail,
    summary="Get repository detail",
    description="Returns full repository metadata including domains, momentum scores, cluster assignment, and map position.",
)
async def get_repo(
    store: StoreDep,
    repo_id: int = Path(..., ge=1, description="Repository ID"),
) -> RepoDetail:
    """Get a single repository by ID with all enrichment data."""
    repo = store.get_repo_detail(repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail=f"Repository {repo_id} not found")

    return RepoDetail(
        id=repo["id"],
        owner=repo["owner"],
        name=repo["name"],
        full_name=repo["full_name"],
        description=repo["description"],
        topics=repo["topics"],
        language=repo["language"],
        license=repo["license"],
        homepage=repo["homepage"],
        archived=repo["archived"],
        is_fork=repo["is_fork"],
        created_at=repo["created_at"],
        pushed_at=repo["pushed_at"],
        stars=repo["stars"],
        forks=repo["forks"],
        watchers=repo["watchers"],
        open_issues=repo["open_issues"],
        tracked=repo["tracked"],
        surfaced=repo["surfaced"],
        surfaced_at=repo["surfaced_at"],
        significance_score=repo["significance_score"],
        significance_vars=repo["significance_vars"],
        domains=repo["domains"],
        domains_fingerprint=repo["domains_fingerprint"],
        classified_at=repo["classified_at"],
        embedding_fingerprint=repo["embedding_fingerprint"],
        embedded_at=repo["embedded_at"],
        cluster_id=repo["cluster_id"],
        clustered_at=repo["clustered_at"],
        map_x=repo["map_x"],
        map_y=repo["map_y"],
        momentum=repo["momentum"],
    )