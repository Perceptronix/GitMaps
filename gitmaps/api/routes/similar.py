"""GET /similar/:id endpoint — similar repositories."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from gitmaps.api.deps import StoreDep, get_store
from gitmaps.api.schemas import SimilarResponse, SimilarRepo
from gitmaps.similarity import (
    SimilarityConfig,
    SimilarityService,
    RepoNotFoundError,
    RepoNotEmbeddedError,
)

router = APIRouter()


@router.get(
    "/similar/{repo_id}",
    response_model=SimilarResponse,
    summary="Get similar repositories",
    description="Returns the nearest neighbor repositories by embedding cosine similarity.",
)
async def get_similar(
    store: StoreDep,
    repo_id: int = Path(..., ge=1, description="Repository ID"),
    language: str | None = Query(None, description="Filter by primary language"),
    topic: str | None = Query(None, description="Filter by topic"),
    min_similarity: float | None = Query(None, ge=-1.0, le=1.0, description="Minimum similarity floor"),
    top_n: int = Query(10, ge=1, le=50, description="Number of results to return"),
) -> SimilarResponse:
    """Get similar repositories for a given repo ID."""
    # Get the repo info
    repo_info = store.get_repo_by_id(repo_id)
    if not repo_info:
        raise HTTPException(status_code=404, detail=f"Repository {repo_id} not found")

    full_name = repo_info["full_name"]
    embedding = repo_info["embedding"]
    if not embedding:
        raise HTTPException(status_code=422, detail=f"Repository {full_name} has no embedding yet")

    # Use the SimilarityService
    config = SimilarityConfig(top_n=top_n, min_similarity=min_similarity)
    service = SimilarityService(store, config=config)

    try:
        similar_repos = service.similar(
            full_name,
            language=language,
            topic=topic,
        )
    except RepoNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RepoNotEmbeddedError as e:
        raise HTTPException(status_code=422, detail=str(e))

    items = [
        SimilarRepo(
            id=r.id,
            owner=r.owner,
            name=r.name,
            full_name=r.full_name,
            description=r.description,
            language=r.language,
            topics=list(r.topics),
            stars=r.stars,
            surfaced=r.surfaced,
            similarity=r.similarity,
        )
        for r in similar_repos
    ]

    return SimilarResponse(source=full_name, items=items)