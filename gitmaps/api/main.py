"""FastAPI application factory and configuration."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gitmaps.api.routes import map as map_router
from gitmaps.api.routes import repo as repo_router
from gitmaps.api.routes import similar as similar_router
from gitmaps.api.routes import clusters as clusters_router
from gitmaps.api.routes import search as search_router
from gitmaps.api.routes import trending as trending_router
from gitmaps.api.deps import get_db, get_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan - startup and shutdown."""
    # Startup: ensure DB connection works
    db = get_db()
    with db:
        db.execute("SELECT 1")
    yield
    # Shutdown: close DB connection
    from gitmaps.api.deps import _db as db_instance
    if db_instance is not None:
        db_instance.close()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="GitMaps API",
        description="Semantic map of GitHub repositories — clustering, similarity, and momentum",
        version="0.9.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS for local development (web dev server)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict to web domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(map_router.router, prefix="/api/v1")
    app.include_router(repo_router.router, prefix="/api/v1")
    app.include_router(similar_router.router, prefix="/api/v1")
    app.include_router(clusters_router.router, prefix="/api/v1")
    app.include_router(search_router.router, prefix="/api/v1")
    app.include_router(trending_router.router, prefix="/api/v1")

    # Health check
    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app