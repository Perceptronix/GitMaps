"""Seam 2 — RepoStore over the Db seam.

Verifies the GitHub API object → repos-row mapping (the decision-rich logic),
the upsert SQL, and ingestion_state round-trips. No Postgres in these tests;
FakeDb records the SQL + params.
"""

from __future__ import annotations

import pytest

from gitmaps.repo_store import RepoStore, embedding_queries, repo_to_row, vector_to_pgvector

from conftest import FakeDb, make_repo


def test_repo_to_row_maps_github_object() -> None:
    row = repo_to_row(make_repo())

    assert row["id"] == 1001
    assert row["owner"] == "octocat"
    assert row["name"] == "hello-world"
    assert row["full_name"] == "octocat/hello-world"
    assert row["topics"] == ["python", "demo"]
    assert row["language"] == "Python"
    assert row["license"] == "MIT"
    assert row["archived"] is False
    assert row["is_fork"] is False
    assert row["created_at"] == "2026-07-01T10:00:00Z"
    assert row["pushed_at"] == "2026-07-30T10:00:00Z"
    assert row["stars"] == 42
    assert row["forks"] == 7
    assert row["watchers"] == 3  # subscribers_count — the true watch count
    assert row["open_issues"] == 2


def test_repo_to_row_handles_missing_optional_fields() -> None:
    row = repo_to_row(make_repo(license=None, homepage=None, topics=[], description=None))

    assert row["license"] is None
    assert row["homepage"] is None
    assert row["topics"] == []
    assert row["description"] is None


def test_repo_to_row_uses_full_name_fallback() -> None:
    repo = make_repo()
    del repo["full_name"]
    row = repo_to_row(repo)

    assert row["full_name"] == "octocat/hello-world"


def test_upsert_conflicts_on_github_id() -> None:
    db = FakeDb()
    RepoStore(db).upsert(make_repo())

    sql, params = db.executed[-1]
    assert "ON CONFLICT (id) DO UPDATE" in sql
    assert "repos" in sql
    assert params["id"] == 1001
    assert params["stars"] == 42


def test_upsert_returns_affected_rows() -> None:
    db = FakeDb()
    assert RepoStore(db).upsert(make_repo()) == 1


def test_upsert_conflict_refreshes_owner_and_name_on_rename() -> None:
    # Regression for the review finding: a renamed repository must update its
    # owner/name too, not leave them stale while full_name changes.
    db = FakeDb()
    RepoStore(db).upsert(make_repo())

    sql, _ = db.executed[-1]
    assert "owner      = EXCLUDED.owner" in sql
    assert "name       = EXCLUDED.name" in sql


def test_upsert_many_batches_executemany() -> None:
    db = FakeDb()
    RepoStore(db).upsert_many([make_repo(), make_repo(id=1002)])

    sql, seq = db.executed[-1]
    assert "ON CONFLICT (id) DO UPDATE" in sql
    assert len(seq) == 2


def test_set_state_upserts_json_value() -> None:
    db = FakeDb()
    RepoStore(db).set_state("discovery.last_run_at", "2026-07-31T00:00:00Z")

    sql, params = db.executed[-1]
    assert "ON CONFLICT (key) DO UPDATE" in sql
    assert params[0] == "discovery.last_run_at"
    assert '"2026-07-31T00:00:00Z"' in params[1]


def test_get_state_returns_parsed_jsonb_value() -> None:
    # FakeDb simulates psycopg2's native jsonb parsing: the driver returns the
    # parsed Python object, not the raw JSON text.
    db = FakeDb()
    db.fetchone_result = ({"count": 5},)
    assert RepoStore(db).get_state("discovery.last_count") == {"count": 5}


def test_get_state_returns_bare_string_values() -> None:
    db = FakeDb()
    db.fetchone_result = ("2026-07-31T00:00:00Z",)
    assert RepoStore(db).get_state("discovery.since") == "2026-07-31T00:00:00Z"


def test_get_state_missing_returns_none() -> None:
    db = FakeDb()
    db.fetchone_result = None
    assert RepoStore(db).get_state("nope") is None


def test_list_due_repos_core_uses_cutoff_and_limit() -> None:
    db = FakeDb()
    db.fetchall_result = [(1001, "octocat", "hello-world")]
    rows = RepoStore(db).list_due_repos("core", "2026-07-31T00:00:00Z", 100)

    sql, params = db.executed[-1]
    assert "FROM repos r" in sql and "tracked" in sql
    assert params == ("2026-07-31T00:00:00Z", 100)
    assert rows == [(1001, "octocat", "hello-world")]


def test_list_due_repos_deep_uses_per_kind_lateral() -> None:
    db = FakeDb()
    db.fetchall_result = []
    RepoStore(db).list_due_repos("deep", "2026-07-31T00:00:00Z", 50)

    sql, params = db.executed[-1]
    assert "LATERAL" in sql and "kind = 'deep'" in sql
    assert params == ("2026-07-31T00:00:00Z", 50)


def test_list_due_repos_rejects_unknown_kind() -> None:
    db = FakeDb()
    try:
        RepoStore(db).list_due_repos("monthly", "2026-07-31T00:00:00Z", 10)
        assert False, "expected ValueError"
    except ValueError as exc:
        assert "core" in str(exc) and "deep" in str(exc)


def test_insert_snapshot_core_params() -> None:
    db = FakeDb()
    RepoStore(db).insert_snapshot(
        1001, "2026-07-31T12:00:00Z", "core",
        stars=42, forks=7, watchers=3, open_issues=2,
    )

    sql, params = db.executed[-1]
    assert "ON CONFLICT (repo_id, taken_at, kind) DO NOTHING" in sql
    assert params[:4] == (1001, "2026-07-31T12:00:00Z", "core", 42)
    assert params[4:] == (7, 3, 2, None, None)  # deep fields absent


def test_insert_snapshot_deep_encodes_commit_activity_json() -> None:
    db = FakeDb()
    weeks = [{"week": "2026-07-01", "total": 5}]
    RepoStore(db).insert_snapshot(1001, "2026-07-31T12:00:00Z", "deep", contributors=12, commit_activity=weeks)

    sql, params = db.executed[-1]
    assert params[0] == 1001 and params[2] == "deep"
    assert params[7] == 12
    assert '"week"' in params[8]  # json-encoded commit_activity


def test_list_candidates_sql_and_rows() -> None:
    db = FakeDb()
    db.fetchall_result = [(42, 80, 10, 3, "2026-01-01T00:00:00Z", "2026-07-30T00:00:00Z",
                           "desc", "https://x", ["python"], False, False, None)]
    rows = RepoStore(db).list_candidates(50)

    sql, params = db.executed[-1]
    assert "WHERE NOT tracked" in sql
    assert params == (50,)
    assert rows[0][0] == 42 and rows[0][8] == ["python"]


def test_list_tracked_not_surfaced_sql() -> None:
    db = FakeDb()
    db.fetchall_result = []
    RepoStore(db).list_tracked_not_surfaced(25)

    sql, params = db.executed[-1]
    assert "WHERE tracked AND NOT surfaced" in sql
    assert params == (25,)


def test_promote_to_tracked_sql() -> None:
    db = FakeDb()
    RepoStore(db).promote_to_tracked(42)

    sql, params = db.executed[-1]
    assert "SET tracked = true" in sql
    assert "AND NOT tracked" in sql  # idempotent: no-op when already tracked
    assert params == (42,)


def test_promote_to_surfaced_sql() -> None:
    db = FakeDb()
    RepoStore(db).promote_to_surfaced(42, "2026-07-31T12:00:00Z")

    sql, params = db.executed[-1]
    assert "SET surfaced = true, surfaced_at = %s" in sql
    assert "AND NOT surfaced" in sql
    assert params == ("2026-07-31T12:00:00Z", 42)


def test_touch_snapshot_times_sets_both_columns() -> None:
    db = FakeDb()
    RepoStore(db).touch_snapshot_times(1001)

    sql, params = db.executed[-1]
    assert "last_snapshot_at = now()" in sql
    assert "first_snapshot_at = COALESCE(first_snapshot_at, now())" in sql
    assert params == (1001,)


def test_list_snapshot_repo_ids_sql() -> None:
    db = FakeDb()
    db.fetchall_result = [(1001,), (1002,)]
    repo_ids = RepoStore(db).list_snapshot_repo_ids(100, 50)

    sql, params = db.executed[-1]
    assert "SELECT DISTINCT repo_id FROM snapshots" in sql
    assert "LIMIT %s OFFSET %s" in sql
    assert params == (100, 50)
    assert repo_ids == [1001, 1002]


def test_get_snapshots_sql_and_rows() -> None:
    db = FakeDb()
    db.fetchall_result = [("2026-07-31T12:00:00Z", "core", 42, 7, 3, 2, None, None)]
    rows = RepoStore(db).get_snapshots(1001, "2026-07-24T12:00:00Z", "2026-07-31T12:00:00Z")

    sql, params = db.executed[-1]
    assert "taken_at, kind, stars, forks, watchers, open_issues, contributors, commit_activity" in sql
    assert params == (1001, "2026-07-24T12:00:00Z", "2026-07-31T12:00:00Z")
    assert rows == [("2026-07-31T12:00:00Z", "core", 42, 7, 3, 2, None, None)]


def test_get_repo_created_at_sql() -> None:
    db = FakeDb()
    db.fetchone_result = ("2026-07-01T10:00:00Z",)
    assert RepoStore(db).get_repo_created_at(1001) == "2026-07-01T10:00:00Z"

    sql, params = db.executed[-1]
    assert "SELECT created_at FROM repos WHERE id = %s" in sql
    assert params == (1001,)


def test_get_repo_created_at_missing_returns_none() -> None:
    db = FakeDb()
    db.fetchone_result = None
    assert RepoStore(db).get_repo_created_at(1001) is None


def test_upsert_momentum_sql_and_params() -> None:
    db = FakeDb()
    RepoStore(db).upsert_momentum(1001, "7d", "2026-07-31T12:00:00Z", 0.4375, {"score": 0.4375}, rank=3)

    sql, params = db.executed[-1]
    assert "INSERT INTO momentum_scores" in sql
    assert "ON CONFLICT (repo_id, period, computed_at) DO UPDATE" in sql
    assert params[:4] == (1001, "7d", "2026-07-31T12:00:00Z", 0.4375)
    assert '"score"' in params[4]  # decomposition json-encoded
    assert params[5] == 3


def test_rank_momentum_sql() -> None:
    db = FakeDb()
    RepoStore(db).rank_momentum("7d", "2026-07-31T12:00:00Z")

    sql, params = db.executed[-1]
    assert "ROW_NUMBER() OVER (ORDER BY score DESC NULLS LAST)" in sql
    assert "UPDATE momentum_scores" in sql
    assert params == ("7d", "2026-07-31T12:00:00Z", "7d", "2026-07-31T12:00:00Z")


def test_list_due_for_embedding_sql_surfaced() -> None:
    db = FakeDb()
    db.fetchall_result = [(1, "octocat", "hello", "octocat/hello", "d", ["python"], "Python", "https://x", None)]
    rows = RepoStore(db).list_due_for_embedding("surfaced", 100, 0)

    sql, params = db.executed[-1]
    assert "r.embedding IS NULL OR r.embedded_at IS NULL OR r.embedded_at < r.pushed_at" in sql
    assert "AND r.surfaced" in sql
    assert params == (100, 0)
    assert rows[0][0] == 1 and rows[0][8] is None


def test_list_all_for_embedding_sql_surfaced() -> None:
    db = FakeDb()
    db.fetchall_result = []
    RepoStore(db).list_all_for_embedding("surfaced", 50, 10)

    sql, params = db.executed[-1]
    assert "WHERE r.surfaced" in sql
    assert "r.embedding IS NULL" not in sql  # full pass: no due filter
    assert params == (50, 10)


def test_list_due_for_embedding_universe_all_omits_surfaced_filter() -> None:
    db = FakeDb()
    db.fetchall_result = []
    RepoStore(db).list_due_for_embedding("all", 100, 0)

    sql, _ = db.executed[-1]
    assert "surfaced" not in sql


def test_embedding_queries_reject_unknown_universe() -> None:
    with pytest.raises(ValueError):
        embedding_queries("wat")


def test_store_embedding_formats_vector_and_params() -> None:
    db = FakeDb()
    RepoStore(db).store_embedding(1001, [0.1, 0.25, -0.5], "abc123", "2026-07-31T12:00:00Z")

    sql, params = db.executed[-1]
    assert "embedding = %s::vector" in sql
    assert params == ("[0.1,0.25,-0.5]", "abc123", "2026-07-31T12:00:00Z", 1001)


def test_touch_embedded_at_sql() -> None:
    db = FakeDb()
    RepoStore(db).touch_embedded_at(1001, "2026-07-31T12:00:00Z")

    sql, params = db.executed[-1]
    assert "SET embedded_at = %s" in sql
    assert params == ("2026-07-31T12:00:00Z", 1001)


def test_vector_to_pgvector_formatting() -> None:
    assert vector_to_pgvector([0.0, 1.0]) == "[0.0,1.0]"
    assert vector_to_pgvector([0.1, 0.25, -0.5]) == "[0.1,0.25,-0.5]"
    assert vector_to_pgvector([]) == "[]"
