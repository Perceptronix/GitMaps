"""Shared fakes for the collector and snapshot-worker test suites.

The fakes live at the agreed seams:
  * FakeSession / FakeClient — the HTTP seam (no network in tests)
  * FakeDb / FakeStore        — the DB / orchestration seams
"""

from __future__ import annotations

import time
from types import SimpleNamespace
from typing import Any, Callable, Iterator

from gitmaps.github.client import GitHubApiError, RateLimitError


class FakeResponse:
    """Minimal stand-in for a requests.Response."""

    def __init__(
        self,
        status_code: int = 200,
        json_body: Any = None,
        headers: dict[str, str] | None = None,
        text: str = "",
    ) -> None:
        self.status_code = status_code
        self._json = json_body
        self.headers = headers or {}
        self.text = text

    def json(self) -> Any:
        return self._json


class FakeSession:
    """Scripted session: returns queued responses; records every call."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict, dict]] = []  # (method, url, params, headers)
        self.responses: list[FakeResponse] = []
        self.raise_once: Exception | None = None

    def request(self, method: str, url: str, params: dict | None = None, headers: dict | None = None) -> FakeResponse:
        self.calls.append((method, url, params or {}, headers or {}))
        if self.raise_once is not None:
            exc, self.raise_once = self.raise_once, None
            raise exc
        if not self.responses:
            raise AssertionError("no scripted response for " + url)
        return self.responses.pop(0)


class FakeDb:
    """Recording DB: captures SQL + params; simulates rows and transaction state."""

    def __init__(self) -> None:
        self.executed: list[tuple[str, Any]] = []
        self.fetchone_result: Any = None
        self.fetchall_result: list[Any] = []
        # Optional per-query overrides: sql substring -> rows. First match wins.
        self.fetchall_by_substring: dict[str, list[Any]] = {}
        self.commits = 0
        self.rollbacks = 0
        self.closed = False

    def _cursor(self, sql: str, params: Any, rowcount: int) -> SimpleNamespace:
        self.executed.append((sql, params))
        rows = next((v for k, v in self.fetchall_by_substring.items() if k in sql), self.fetchall_result)
        return SimpleNamespace(
            rowcount=rowcount,
            fetchone=lambda: self.fetchone_result,
            fetchall=lambda: rows,
        )

    def execute(self, sql: str, params: Any = None) -> SimpleNamespace:
        return self._cursor(sql, params, rowcount=1 if params is not None else 0)

    def executemany(self, sql: str, seq: list[Any]) -> SimpleNamespace:
        return self._cursor(sql, list(seq), rowcount=len(seq))

    def commit(self) -> None:
        self.commits += 1

    def rollback(self) -> None:
        self.rollbacks += 1

    def close(self) -> None:
        self.closed = True

    def __enter__(self) -> "FakeDb":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()


class FakeClient:
    """Dependency-injected client: scripted per-path GET responses + search items.

    Mirrors the subset of GitHubClient the runners use: `search` (discovery),
    `get` (snapshot fetches), and `get_readme` (embedding). Pass `get_error`
    as a set of paths whose GET/readme should raise GitHubApiError. A readme
    path with no scripted response means "no README" (the real client's 404).
    """

    def __init__(
        self,
        repos: list[dict] | None = None,
        responses: dict[str, Any] | None = None,
        get_error: set[str] | None = None,
        rate_limit: set[str] | None = None,
    ) -> None:
        self.repos = list(repos or [])
        self.responses = dict(responses or {})
        self.get_error = set(get_error or ())
        self.rate_limit = set(rate_limit or ())
        self.calls: list[tuple[str, str]] = []  # ("search"|"get"|"get_readme", path)

    def search(self, query: str, per_page: int = 100) -> Iterator[dict]:
        self.calls.append(("search", query))
        yield from self.repos

    def get(self, path: str, *, params: dict | None = None, headers: dict | None = None) -> Any:
        self.calls.append(("get", path))
        if path in self.rate_limit:
            raise RateLimitError(f"{path} rate limited")
        if path in self.get_error:
            raise GitHubApiError(f"{path} failed")
        if path not in self.responses:
            raise AssertionError(f"no scripted response for {path}")
        return self.responses[path]

    def get_readme(self, owner: str, name: str) -> Any:
        path = f"/repos/{owner}/{name}/readme"
        self.calls.append(("get_readme", path))
        if path in self.rate_limit:
            raise RateLimitError(f"{path} rate limited")
        if path in self.get_error:
            raise GitHubApiError(f"{path} failed")
        return self.responses.get(path)  # None = no README (GitHub 404)


class FakeStore:
    """In-memory store: records upserts, snapshots, touches, and state."""

    def __init__(
        self,
        state: dict[str, Any] | None = None,
        due: list[tuple] | None = None,
        candidates: list[tuple] | None = None,
        tracked_not_surfaced: list[tuple] | None = None,
        snapshot_repo_ids: list[int] | None = None,
        momentum_snapshots: dict[int, list[tuple]] | None = None,
        repo_created_at: dict[int, Any] | None = None,
        embedding_due: list[tuple] | None = None,
        embedding_all: list[tuple] | None = None,
        similar_sources: dict[str, tuple] | None = None,
        similar_rows: list[tuple] | None = None,
        classification_due: list[tuple] | None = None,
        clustering_all: list[tuple] | None = None,
        clustering_due: list[tuple] | None = None,
        cluster_member_rows: list[tuple] | None = None,
        layout_member_rows: list[tuple] | None = None,
        layout_due: list[tuple] | None = None,
        cluster_position_rows: list[tuple] | None = None,
    ) -> None:
        self.state: dict[str, Any] = dict(state or {})
        self.upserted: list[dict] = []
        self.due: list[tuple] = list(due or [])
        self.due_calls: list[tuple[str, str, int]] = []
        self.snapshots: list[dict] = []
        self.touched: list[int] = []
        self.candidates: list[tuple] = list(candidates or [])
        self.tracked_not_surfaced: list[tuple] = list(tracked_not_surfaced or [])
        self.tracked_promotions: list[int] = []
        self.surfaced_promotions: list[tuple[int, str]] = []
        self.significance_stored: list[tuple[int, float, dict]] = []
        # momentum pipeline
        self.snapshot_repo_ids: list[int] = list(snapshot_repo_ids or [])
        self.momentum_snapshots: dict[int, list[tuple]] = dict(momentum_snapshots or {})
        self.repo_created_at: dict[int, Any] = dict(repo_created_at or {})
        self.momentum_rows: list[dict] = []
        self.repo_id_calls: list[tuple[int, int]] = []  # (limit, offset)
        self.momentum_get_calls: list[tuple[int, str, str]] = []  # (repo_id, since, until)
        self.rank_calls: list[tuple[str, str]] = []  # (period, computed_at)
        # embedding pipeline
        self.embedding_due: list[tuple] = list(embedding_due or [])
        self.embedding_all: list[tuple] = list(embedding_all or [])
        self.embedding_due_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.embedding_all_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.embedding_stored: list[dict] = []
        self.embedded_touched: list[tuple[int, str]] = []  # (repo_id, embedded_at)
        # similarity pipeline
        self.similar_sources: dict[str, tuple] = dict(similar_sources or {})  # full_name -> (id, embedding, language, topics)
        self.similar_rows: list[tuple] = list(similar_rows or [])
        self.similar_source_calls: list[str] = []  # full_name lookups
        self.similar_calls: list[dict] = []  # find_similar kwargs
        # classification pipeline
        self.classification_due: list[tuple] = list(classification_due or [])
        self.classification_due_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.classification_all_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.classification_stored: list[dict] = []  # {repo_id, domains, fingerprint, classified_at}
        self.classification_touched: list[tuple[int, str]] = []  # (repo_id, classified_at)
        # clustering pipeline
        self.clustering_all: list[tuple] = list(clustering_all or [])
        self.clustering_due: list[tuple] = list(clustering_due or [])
        self.clustering_all_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.clustering_due_calls: list[tuple[str, int, int]] = []  # (universe, limit, offset)
        self.clusters: list[dict] = []  # inserted cluster rows (id, domain, label, label_source, member_count)
        self.cluster_id_seq: int = 0
        self.cluster_memberships: list[tuple] = []  # (cluster_id|None, clustered_at, repo_id)
        self.cluster_member_rows: list[tuple] = list(cluster_member_rows or [])  # (cluster_id, domain, embedding)
        self.cluster_assignments: list[tuple[int, int, str]] = []  # (repo_id, cluster_id, clustered_at)
        self.cluster_touches: list[tuple[int, str]] = []  # (repo_id, clustered_at)
        # layout pipeline
        self.layout_member_rows: list[tuple] = list(layout_member_rows or [])  # (repo_id, cluster_id, embedding)
        self.layout_due: list[tuple] = list(layout_due or [])  # (repo_id, cluster_id)
        self.cluster_position_rows: list[tuple] = list(cluster_position_rows or [])  # (cluster_id, x, y)
        self.cluster_positions_written: list[tuple[int, float, float]] = []  # (cluster_id, x, y)
        self.repo_positions_written: list[tuple[int, float, float]] = []  # (x, y, repo_id)

    def upsert(self, repo: dict) -> int:
        self.upserted.append(repo)
        return 1

    def upsert_many(self, repos: list[dict]) -> int:
        self.upserted.extend(repos)
        return len(repos)

    def get_state(self, key: str) -> Any:
        return self.state.get(key)

    def set_state(self, key: str, value: Any) -> None:
        self.state[key] = value

    def list_due_repos(self, kind: str, cutoff: str, limit: int) -> list[tuple]:
        self.due_calls.append((kind, cutoff, limit))
        return self.due[:limit]

    def insert_snapshot(self, repo_id: int, taken_at: str, kind: str, **fields: Any) -> int:
        self.snapshots.append({"repo_id": repo_id, "taken_at": taken_at, "kind": kind, **fields})
        return 1

    def touch_snapshot_times(self, repo_id: int) -> None:
        self.touched.append(repo_id)

    def list_candidates(self, limit: int = 100) -> list[tuple]:
        return self.candidates[:limit]

    def list_tracked_not_surfaced(self, limit: int = 100) -> list[tuple]:
        return self.tracked_not_surfaced[:limit]

    def promote_to_tracked(self, repo_id: int) -> int:
        self.tracked_promotions.append(repo_id)
        return 1

    def promote_to_surfaced(self, repo_id: int, surfaced_at: str) -> int:
        self.surfaced_promotions.append((repo_id, surfaced_at))
        return 1

    def store_significance(self, repo_id: int, score: float, decomposition: dict) -> None:
        self.significance_stored.append((repo_id, score, decomposition))

    def list_snapshot_repo_ids(self, limit: int = 100, offset: int = 0) -> list[int]:
        self.repo_id_calls.append((limit, offset))
        return self.snapshot_repo_ids[offset:offset + limit]

    def get_snapshots(self, repo_id: int, since: str, until: str) -> list[tuple]:
        self.momentum_get_calls.append((repo_id, since, until))
        return self.momentum_snapshots.get(repo_id, [])

    def get_repo_created_at(self, repo_id: int) -> Any:
        return self.repo_created_at.get(repo_id)

    def upsert_momentum(
        self,
        repo_id: int,
        period: str,
        computed_at: str,
        score: float,
        decomposition: dict,
        rank: int | None = None,
    ) -> int:
        self.momentum_rows.append(
            {"repo_id": repo_id, "period": period, "computed_at": computed_at,
             "score": score, "decomposition": decomposition, "rank": rank}
        )
        return 1

    def rank_momentum(self, period: str, computed_at: str) -> None:
        self.rank_calls.append((period, computed_at))

    def list_due_for_embedding(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        self.embedding_due_calls.append((universe, limit, offset))
        return self.embedding_due[offset:offset + limit]

    def list_all_for_embedding(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        self.embedding_all_calls.append((universe, limit, offset))
        return self.embedding_all[offset:offset + limit]

    def store_embedding(self, repo_id: int, vector, fingerprint: str, embedded_at: str) -> int:
        self.embedding_stored.append(
            {"repo_id": repo_id, "vector": vector, "fingerprint": fingerprint, "embedded_at": embedded_at}
        )
        return 1

    def touch_embedded_at(self, repo_id: int, embedded_at: str) -> None:
        self.embedded_touched.append((repo_id, embedded_at))

    def get_similar_source(self, full_name: str) -> tuple | None:
        self.similar_source_calls.append(full_name)
        return self.similar_sources.get(full_name)

    def find_similar(
        self,
        repo_id: int,
        query_vector,
        *,
        limit: int,
        language: str | None = None,
        topic: str | None = None,
        min_similarity: float | None = None,
    ) -> list[tuple]:
        self.similar_calls.append(
            {"repo_id": repo_id, "query_vector": query_vector, "limit": limit,
             "language": language, "topic": topic, "min_similarity": min_similarity}
        )
        return self.similar_rows[:limit]

    def list_due_for_classification(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        self.classification_due_calls.append((universe, limit, offset))
        return self.classification_due[offset : offset + limit]

    def list_all_for_classification(self, universe: str = "surfaced", limit: int = 100, offset: int = 0) -> list[tuple]:
        self.classification_all_calls.append((universe, limit, offset))
        return self.classification_due[offset : offset + limit]

    def store_classification(self, repo_id: int, domains: list[str], fingerprint: str, classified_at: str) -> int:
        self.classification_stored.append(
            {"repo_id": repo_id, "domains": domains, "fingerprint": fingerprint, "classified_at": classified_at}
        )
        return 1

    def touch_classified_at(self, repo_id: int, classified_at: str) -> None:
        self.classification_touched.append((repo_id, classified_at))

    def list_all_for_clustering(self, universe: str = "surfaced", limit: int = 200, offset: int = 0) -> list[tuple]:
        self.clustering_all_calls.append((universe, limit, offset))
        return self.clustering_all[offset : offset + limit]

    def list_due_for_clustering(self, universe: str = "surfaced", limit: int = 200, offset: int = 0) -> list[tuple]:
        self.clustering_due_calls.append((universe, limit, offset))
        return self.clustering_due[offset : offset + limit]

    def delete_clusters(self) -> None:
        self.clusters.clear()

    def insert_cluster(self, *, domain: str, label: str, member_count: int, computed_at: str) -> int:
        self.cluster_id_seq += 1
        self.clusters.append(
            {"id": self.cluster_id_seq, "domain": domain, "label": label,
             "label_source": "terms", "member_count": member_count, "computed_at": computed_at}
        )
        return self.cluster_id_seq

    def set_cluster_memberships(self, rows: list[tuple]) -> None:
        self.cluster_memberships.extend(rows)

    def get_cluster_members(self) -> list[tuple]:
        return list(self.cluster_member_rows)

    def assign_repo_to_cluster(self, repo_id: int, cluster_id: int, clustered_at: str) -> None:
        self.cluster_assignments.append((repo_id, cluster_id, clustered_at))
        for cluster in self.clusters:
            if cluster["id"] == cluster_id:
                cluster["member_count"] += 1

    def touch_clustered_at(self, repo_id: int, clustered_at: str) -> None:
        self.cluster_touches.append((repo_id, clustered_at))

    # -- layout pipeline (Phase 8) ------------------------------------------

    def list_layout_members(self) -> list[tuple]:
        return list(self.layout_member_rows)

    def set_cluster_position(self, cluster_id: int, x: float, y: float) -> None:
        self.cluster_positions_written.append((cluster_id, x, y))

    def list_cluster_positions(self) -> list[tuple]:
        # Return in format: (id, domain, label, centroid_x, centroid_y)
        result = []
        for c in self.cluster_position_rows:
            if len(c) == 3:
                # Old format: (id, x, y)
                result.append((c[0], "Unknown", f"Cluster {c[0]}", c[1], c[2]))
            elif len(c) == 5:
                # New format: (id, domain, label, x, y)
                result.append((c[0], c[1], c[2], c[3], c[4]))
        return result

    def list_due_layout(self) -> list[tuple]:
        return list(self.layout_due)

    def list_repo_positions(self, limit: int, offset: int) -> list[tuple]:
        """Get paginated repository map positions."""
        # FakeStore doesn't store individual repo positions, so we derive from layout_member_rows
        # Filter for those that would have positions (those with cluster positions)
        result = []
        for repo_id, cluster_id, embedding in self.layout_member_rows:
            # Check if this cluster has a position
            has_position = any(c[0] == cluster_id for c in self.cluster_position_rows)
            if has_position:
                # Use the cluster position as the repo position (simplified)
                for c in self.cluster_position_rows:
                    if c[0] == cluster_id:
                        # Handle both old (3-tuple) and new (5-tuple) format
                        if len(c) == 3:
                            x, y = c[1], c[2]
                        else:
                            x, y = c[3], c[4]
                        result.append((repo_id, x, y))
                        break
        return result[offset:offset + limit]

    def count_repo_positions(self) -> int:
        """Get total count of repositories with map positions."""
        count = 0
        for repo_id, cluster_id, embedding in self.layout_member_rows:
            if any(c[0] == cluster_id for c in self.cluster_position_rows):
                count += 1
        return count

    def set_repo_positions(self, rows: list[tuple]) -> None:
        """Bulk-write map_x/map_y for repo ids."""
        self.repo_positions_written.extend(rows)

    def get_state(self, key: str):
        """Get state value."""
        return self.state.get(key)

    def get_repo_by_id(self, repo_id: int):
        """Get repo by ID for FakeStore."""
        # Return a fake repo with embedding for testing
        if repo_id == 999999:
            return None
        return {"full_name": f"owner/repo{repo_id}", "embedding": [0.1, 0.2, 0.3]}

    def get_repo_detail(self, repo_id: int):
        """Get repo detail for FakeStore."""
        if repo_id == 999999:
            return None
        return {
            "id": repo_id,
            "owner": "test",
            "name": f"repo{repo_id}",
            "full_name": f"test/repo{repo_id}",
            "description": "Test repo",
            "topics": [],
            "language": "Python",
            "license": "MIT",
            "homepage": None,
            "archived": False,
            "is_fork": False,
            "created_at": None,
            "pushed_at": None,
            "stars": 100,
            "forks": 10,
            "watchers": 5,
            "open_issues": 2,
            "tracked": True,
            "surfaced": True,
            "surfaced_at": None,
            "significance_score": 0.8,
            "significance_vars": {},
            "domains": ["AI"],
            "domains_fingerprint": "abc123",
            "classified_at": None,
            "embedding_fingerprint": "def456",
            "embedded_at": None,
            "cluster_id": 1,
            "clustered_at": None,
            "map_x": 0.5,
            "map_y": 0.5,
            "momentum": None,
        }

    def list_clusters(self, *, pagination, sort, domain: str | None = None):
        """List clusters with pagination, sorting, and filtering for FakeStore."""
        from gitmaps.api.schemas import ClustersResponse, ClusterSummary

        items = []
        for c in self.cluster_position_rows:
            # Handle both old (id, x, y) and new (id, domain, label, x, y) format
            if len(c) == 3:
                # Old format
                cluster_id, x, y = c
                domain_val = "Unknown"
                label = f"Cluster {cluster_id}"
            elif len(c) == 5:
                # New format
                cluster_id, domain_val, label, x, y = c
            else:
                continue

            if domain and domain_val != domain:
                continue
            items.append(ClusterSummary(
                id=cluster_id,
                domain=domain_val,
                label=label,
                member_count=3,
                centroid_x=x,
                centroid_y=y,
                computed_at=None,
            ))

        # Sort
        valid_sort = {"id": "id", "domain": "domain", "label": "label", "member_count": "member_count", "computed_at": "computed_at"}
        sort_field = valid_sort.get(sort.sort, "id")
        reverse = sort.order.lower() == "desc"

        # Sort items
        if sort_field == "id":
            items.sort(key=lambda x: x.id, reverse=reverse)
        elif sort_field == "domain":
            items.sort(key=lambda x: x.domain, reverse=reverse)
        elif sort_field == "label":
            items.sort(key=lambda x: x.label, reverse=reverse)
        elif sort_field == "member_count":
            items.sort(key=lambda x: x.member_count, reverse=reverse)
        elif sort_field == "computed_at":
            items.sort(key=lambda x: x.computed_at or "", reverse=reverse)

        total = len(items)
        per_page = pagination.per_page
        offset = pagination.offset
        page = pagination.page

        paginated_items = items[offset:offset + per_page]
        total_pages = (total + per_page - 1) // per_page

        return ClustersResponse(
            items=paginated_items,
            page=page,
            per_page=per_page,
            total=total,
            total_pages=total_pages,
        )

    def search_repos(
        self,
        *,
        pagination,
        sort,
        q: str | None = None,
        language: str | None = None,
        topics: list[str] | None = None,
        domains: list[str] | None = None,
        min_stars: int | None = None,
        max_stars: int | None = None,
        tracked: bool | None = None,
        surfaced: bool | None = None,
        has_cluster: bool | None = None,
        has_map_position: bool | None = None,
    ):
        """Search repositories for FakeStore."""
        from gitmaps.api.schemas import SearchResponse, RepoBase

        # FakeStore doesn't have real repos - return empty results
        return SearchResponse(
            items=[],
            page=pagination.page,
            per_page=pagination.per_page,
            total=0,
            total_pages=0,
            query=q,
        )

    def get_trending(
        self,
        *,
        pagination,
        period: str,
        language: str | None = None,
        topic: str | None = None,
        domain: str | None = None,
        min_score: float | None = None,
        surfaced_only: bool = False,
    ):
        """Get trending repositories for FakeStore."""
        from gitmaps.api.schemas import TrendingResponse, RepoBase

        return TrendingResponse(
            items=[],
            period=period,
            page=pagination.page,
            per_page=pagination.per_page,
            total=0,
            total_pages=0,
        )


def fixed_clock(epoch: float) -> tuple[Callable[[], float], list[float]]:
    """Return a `now()` at a fixed epoch plus a recorder for `sleep()` calls."""
    sleeps: list[float] = []
    return (lambda: epoch, sleeps)


class RecordingClock:
    """Advanceable clock + a recording sleep for rate-limit tests."""

    def __init__(self, epoch: float = 1_000_000.0) -> None:
        self.now_value = epoch
        self.sleeps: list[float] = []

    def now(self) -> float:
        return self.now_value

    def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now_value += seconds


def make_repo(**overrides: Any) -> dict:
    """A well-formed GitHub REST repository object for tests."""
    repo: dict[str, Any] = {
        "id": 1001,
        "owner": {"login": "octocat"},
        "name": "hello-world",
        "full_name": "octocat/hello-world",
        "description": "a test repository",
        "topics": ["python", "demo"],
        "language": "Python",
        "license": {"spdx_id": "MIT"},
        "homepage": "https://example.com",
        "archived": False,
        "fork": False,
        "created_at": "2026-07-01T10:00:00Z",
        "pushed_at": "2026-07-30T10:00:00Z",
        "stargazers_count": 42,
        "forks_count": 7,
        "subscribers_count": 3,
        "open_issues_count": 2,
    }
    repo.update(overrides)
    return repo
