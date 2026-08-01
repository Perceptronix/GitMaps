"""Unit tests for the FastAPI application."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from gitmaps.api.main import create_app
from gitmaps.api.deps import get_store, get_db, get_settings, _settings, _db
from gitmaps.config import Settings
from gitmaps.db import Db
from conftest import FakeStore


@pytest.fixture
def store() -> FakeStore:
    """Create a FakeStore with sample data."""
    return FakeStore(
        layout_member_rows=[
            (1, 1, [0.1, 0.2]),
            (2, 1, [0.15, 0.25]),
            (3, 2, [0.8, 0.9]),
        ],
        layout_due=[(4, 2)],
        cluster_position_rows=[
            (1, "AI", "Cluster 1", 0.5, 0.5),
            (2, "Frontend", "Cluster 2", -0.5, -0.5),
        ],
    )


@pytest.fixture
def mock_settings() -> Settings:
    """Create mock settings for testing."""
    return Settings(
        database_url="postgresql://test:test@localhost/test",
        github_tokens=("test_token",),
        rate_budget_per_hour=5000,
        significance_threshold=0.5,
        momentum_signal_weights={"stars": 0.35, "forks": 0.15, "watchers": 0.10, "contributors": 0.20, "commits": 0.20},
        embedding_provider="local",
        embedding_model="test-model",
        embedding_dimension=384,
    )


@pytest.fixture
def client(store: FakeStore, mock_settings: Settings) -> TestClient:
    """Create a test client with the FakeStore injected."""
    # Reset global singletons
    import gitmaps.api.deps as deps_module
    deps_module._settings = mock_settings
    deps_module._db = None

    class MockDb:
        def execute(self, sql, params=None):
            from types import SimpleNamespace
            return SimpleNamespace(fetchone=lambda: None, fetchall=lambda: [])
        def commit(self): pass
        def rollback(self): pass
        def close(self): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass

    deps_module._db = MockDb()

    app = create_app()

    # Override the get_store dependency
    app.dependency_overrides[get_store] = lambda: store

    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    """Health check returns ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_map(client: TestClient, store: FakeStore) -> None:
    """GET /map returns clusters and repo positions."""
    response = client.get("/api/v1/map")
    assert response.status_code == 200
    data = response.json()
    assert "clusters" in data
    assert "repos" in data
    assert len(data["clusters"]) == 2
    assert data["clusters"][0]["cluster_id"] == 1
    assert data["clusters"][0]["x"] == 0.5
    assert data["clusters"][0]["y"] == 0.5


def test_get_repo_not_found(client: TestClient) -> None:
    """GET /repo/:id returns 404 for unknown repo."""
    response = client.get("/api/v1/repo/999999")
    assert response.status_code == 404


def test_get_similar_not_found(client: TestClient) -> None:
    """GET /similar/:id returns 404 for unknown repo."""
    response = client.get("/api/v1/similar/999999")
    assert response.status_code == 404


def test_list_clusters(client: TestClient) -> None:
    """GET /clusters returns paginated list."""
    response = client.get("/api/v1/clusters")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "per_page" in data
    assert "total" in data
    assert "total_pages" in data


def test_search_repos(client: TestClient) -> None:
    """GET /search returns paginated results."""
    response = client.get("/api/v1/search")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "per_page" in data
    assert "total" in data
    assert "total_pages" in data


def test_get_trending(client: TestClient) -> None:
    """GET /trending returns paginated results."""
    response = client.get("/api/v1/trending")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "period" in data
    assert "page" in data
    assert "per_page" in data
    assert "total" in data
    assert "total_pages" in data


def test_trending_invalid_period(client: TestClient) -> None:
    """GET /trending with invalid period returns 422 (validation error)."""
    response = client.get("/api/v1/trending?period=invalid")
    assert response.status_code == 422


def test_pagination_params(client: TestClient) -> None:
    """Pagination parameters work correctly."""
    response = client.get("/api/v1/clusters?page=2&per_page=5")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 2
    assert data["per_page"] == 5


def test_sort_params(client: TestClient) -> None:
    """Sort parameters work correctly."""
    response = client.get("/api/v1/clusters?sort=domain&order=desc")
    assert response.status_code == 200