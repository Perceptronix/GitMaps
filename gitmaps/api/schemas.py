"""Pydantic response models for the GitMaps API."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class RepoBase(BaseModel):
    """Base repository fields."""

    id: int
    owner: str
    name: str
    full_name: str
    description: Optional[str] = None
    topics: list[str] = Field(default_factory=list)
    language: Optional[str] = None
    license: Optional[str] = None
    homepage: Optional[str] = None
    archived: bool = False
    is_fork: bool = False
    created_at: Optional[datetime] = None
    pushed_at: Optional[datetime] = None
    stars: int = 0
    forks: int = 0
    watchers: int = 0
    open_issues: int = 0


class RepoMapPosition(BaseModel):
    """Repository position on the semantic map."""

    repo_id: int
    x: float
    y: float
    cluster_id: Optional[int] = None
    domain: Optional[str] = None
    name: Optional[str] = None
    owner: Optional[str] = None
    stars: int = 0


class ClusterPosition(BaseModel):
    """Cluster centroid position."""

    cluster_id: int
    domain: str
    label: str
    member_count: int
    x: float
    y: float


class MapResponse(BaseModel):
    """Full map response with clusters and repos."""

    clusters: list[ClusterPosition]
    repos: list[RepoMapPosition]
    total: int = 0  # repos with a map position (what discovery/surfacing produced)
    updated_at: Optional[datetime] = None


class ClusterSummary(BaseModel):
    """Cluster summary for list endpoints."""

    id: int
    domain: str
    label: str
    member_count: int
    centroid_x: Optional[float] = None
    centroid_y: Optional[float] = None
    computed_at: Optional[datetime] = None


class ClustersResponse(BaseModel):
    """Paginated cluster list."""

    items: list[ClusterSummary]
    page: int
    per_page: int
    total: int
    total_pages: int


class MomentumSignal(BaseModel):
    """Single signal contribution in momentum decomposition."""

    signal: str
    start: Optional[float] = None
    end: Optional[float] = None
    growth: float
    span_days: float
    growth_per_day: float
    prior_floor: float
    size_factor: float
    target_per_day: float
    weight: float
    score: float
    contribution: float


class MomentumPeriod(BaseModel):
    """Momentum score for one period."""

    period: str
    score: float
    window_days: int
    age_days: Optional[float] = None
    age_factor: float
    age_cap: float
    max_signal_score: float
    signals: dict[str, MomentumSignal]


class MomentumScores(BaseModel):
    """All momentum periods for a repository."""

    repo_id: int
    computed_at: datetime
    periods: dict[str, MomentumPeriod]


class SimilarRepo(BaseModel):
    """Similar repository result."""

    id: int
    owner: str
    name: str
    full_name: str
    description: Optional[str] = None
    language: Optional[str] = None
    topics: list[str] = Field(default_factory=list)
    stars: int
    surfaced: bool
    similarity: float


class SimilarResponse(BaseModel):
    """Similar repositories response."""

    source: str
    items: list[SimilarRepo]


class RepoDetail(RepoBase):
    """Full repository detail with all enrichment."""

    tracked: bool = False
    surfaced: bool = False
    surfaced_at: Optional[datetime] = None
    significance_score: Optional[float] = None
    significance_vars: Optional[dict[str, Any]] = None
    domains: list[str] = Field(default_factory=list)
    domains_fingerprint: Optional[str] = None
    classified_at: Optional[datetime] = None
    embedding_fingerprint: Optional[str] = None
    embedded_at: Optional[datetime] = None
    cluster_id: Optional[int] = None
    clustered_at: Optional[datetime] = None
    map_x: Optional[float] = None
    map_y: Optional[float] = None
    momentum: Optional[MomentumScores] = None


class SearchFilters(BaseModel):
    """Search filter parameters."""

    query: Optional[str] = None
    language: Optional[str] = None
    topics: Optional[list[str]] = None
    domains: Optional[list[str]] = None
    min_stars: Optional[int] = None
    max_stars: Optional[int] = None
    tracked: Optional[bool] = None
    surfaced: Optional[bool] = None
    has_cluster: Optional[bool] = None
    has_map_position: Optional[bool] = None


class SearchResponse(BaseModel):
    """Paginated search results."""

    items: list[RepoBase]
    page: int
    per_page: int
    total: int
    total_pages: int
    query: Optional[str] = None


class TrendingFilters(BaseModel):
    """Trending filter parameters."""

    period: str = "7d"  # 1d, 7d, 30d
    language: Optional[str] = None
    topic: Optional[str] = None
    domain: Optional[str] = None
    min_score: Optional[float] = None
    surfaced_only: bool = False


class TrendingResponse(BaseModel):
    """Trending repositories response."""

    items: list[RepoBase]
    period: str
    page: int
    per_page: int
    total: int
    total_pages: int


class ErrorResponse(BaseModel):
    """Error response."""

    error: str
    detail: Optional[str] = None