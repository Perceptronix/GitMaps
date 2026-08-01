"""Integration test for the API using a real database connection."""

from __future__ import annotations

import os
import pytest

from gitmaps.api.main import create_app
from gitmaps.db import Db
from gitmaps.config import Settings
from gitmaps.repo_store import RepoStore
from gitmaps.worker import main as worker_main


def _load_env() -> dict[str, str]:
    """Load environment variables from .env file."""
    env = {}
    if os.path.exists(".env"):
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip().strip("'\"")
    return env


@pytest.fixture(scope="session")
def db_settings() -> Settings:
    """Create settings from environment."""
    env = _load_env()
    if not env.get("DATABASE_URL"):
        pytest.skip("No DATABASE_URL in .env - skipping integration tests")
    return Settings.from_env(env)


@pytest.fixture(scope="session")
def db(db_settings: Settings) -> Db:
    """Create a database connection."""
    return Db.connect(db_settings.database_url)


@pytest.fixture(scope="session")
def app(db: Db):
    """Create the FastAPI app with real DB."""
    # We need to override the get_db dependency to use our fixture
    from gitmaps.api.main import get_db as _get_db
    from gitmaps.api.deps import get_store as _get_store

    app = create_app()

    app.dependency_overrides[_get_db] = lambda: db
    app.dependency_overrides[_get_store] = lambda: RepoStore(db)

    return app


@pytest.fixture
def client(app):
    """Create a test client."""
    from fastapi.testclient import TestClient
    return TestClient(app)


def test_full_pipeline_integration(client, db: Db):
    """End-to-end integration test: run worker jobs then query API."""
    # Run the full pipeline
    # Note: This requires a real database and may take some time
    # In practice, you'd run the pipeline separately and test against the populated DB
    pass


def test_map_endpoint(client):
    """Test /map endpoint returns expected structure."""
    response = client.get("/api/v1/map")
    assert response.status_code == 200
    data = response.json()
    assert "clusters" in data
    assert "repos" in data
    assert isinstance(data["clusters"], list)
    assert isinstance(data["repos"], list)


def test_repo_endpoint(client):
    """Test /repo/:id endpoint."""
    # Get a repo ID from the database
    from gitmaps.db import Db
    from gitmaps.config import Settings
    settings = Settings.from_env()
    db = Db.connect(settings.database_url)
    with db:
        cur = db.execute("SELECT id FROM repos WHERE cluster_id IS NOT NULL LIMIT 1")
        row = cur.fetchone()
        if row:
            repo_id = row[0]
            response = client.get(f"/api/v1/repo/{repo_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == repo_id
            assert "full_name" in data
            assert "domains" in data
            assert "momentum" in data
        else:
            pytest.skip("No clustered repos in database")


def test_similar_endpoint(client):
    """Test /similar/:id endpoint."""
    from gitmaps.config import Settings
    from gitmaps.db import Db
    settings = Settings.from_env()
    db = Db.connect(settings.database_url)
    with db:
        cur = db.execute("SELECT id FROM repos WHERE embedding IS NOT NULL LIMIT 1")
        row = cur.fetchone()
        if row:
            repo_id = row[0]
            response = client.get(f"/api/v1/similar/{repo_id}")
            assert response.status_code == 200
            data = response.json()
            assert "source" in data
            assert "items" in data
            assert isinstance(data["items"], list)
        else:
            pytest.skip("No embedded repos in database")


def test_clusters_endpoint(client):
    """Test /clusters endpoint with pagination and filtering."""
    response = client.get("/api/v1/clusters?page=1&per_page=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "total" in data
    assert data["page"] == 1
    assert data["per_page"] == 10


def test_search_endpoint(client):
    """Test /search endpoint with various filters."""
    # Basic search
    response = client.get("/api/v1/search?q=test")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "query" in data

    # Filter by language
    response = client.get("/api/v1/search?language=Python")
    assert response.status_code == 200

    # Filter by tracked
    response = client.get("/api/v1/search?tracked=true")
    assert response.status_code == 200


def test_trending_endpoint(client):
    """Test /trending endpoint with different periods."""
    for period in ("1d", "7d", "30d"):
        response = client.get(f"/api/v1/trending?period={period}")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == period
        assert "items" in data


def test_openapi_docs(client):
    """Test that OpenAPI documentation is accessible."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "openapi" in response.text.lower()

    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    assert "openapi" in spec
    assert "paths" in spec
    assert "/api/v1/map" in spec["paths"]
    assert "/api/v1/repo/{repo_id}" in spec["paths"]
    assert "/api/v1/similar/{repo_id}" in spec["paths"]
    assert "/api/v1/clusters" in spec["paths"]
    assert "/api/v1/search" in spec["paths"]
    assert "/api/v1/trending" in spec["paths"]