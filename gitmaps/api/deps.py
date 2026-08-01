"""Shared API dependencies and utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Any, Optional

from fastapi import Depends, Query

from gitmaps.config import Settings
from gitmaps.db import Db
from gitmaps.repo_store import RepoStore


# Global singletons for the app (initialized on startup)
_settings: Settings | None = None
_db: Db | None = None


def get_db() -> Db:
    """Get the database connection (singleton)."""
    global _db
    if _db is None:
        settings = get_settings()
        _db = Db.connect(settings.database_url)
    return _db


def get_settings() -> Settings:
    """Get the application settings (singleton)."""
    global _settings
    if _settings is None:
        _settings = Settings.from_env()
    return _settings


def get_store() -> RepoStore:
    """Dependency to get the RepoStore."""
    return RepoStore(get_db())


@dataclass(frozen=True)
class PaginationParams:
    """Pagination parameters for list endpoints."""

    page: int = 1
    per_page: int = 20

    def __post_init__(self) -> None:
        if self.page < 1:
            raise ValueError("page must be >= 1")
        if self.per_page < 1 or self.per_page > 100:
            raise ValueError("per_page must be in [1, 100]")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page


@dataclass(frozen=True)
class SortParams:
    """Sort parameters for list endpoints."""

    sort: str = "id"
    order: str = "asc"

    def __post_init__(self) -> None:
        valid_orders = ("asc", "desc")
        if self.order.lower() not in valid_orders:
            raise ValueError(f"order must be one of {valid_orders}")


def pagination_params(
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    per_page: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> PaginationParams:
    """Dependency for pagination parameters."""
    return PaginationParams(page=page, per_page=per_page)


def sort_params(
    sort: Annotated[str, Query(description="Field to sort by")] = "id",
    order: Annotated[str, Query(description="Sort order (asc|desc)")] = "asc",
) -> SortParams:
    """Dependency for sort parameters."""
    return SortParams(sort=sort, order=order)


StoreDep = Annotated[RepoStore, Depends(get_store)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
PaginationDep = Annotated[PaginationParams, Depends(pagination_params)]
SortDep = Annotated[SortParams, Depends(sort_params)]