"""Seam tests for the semantic clustering pipeline (Phase 7).

Three layers, mirroring the classification/embedding suites:
  * store layer — the clustering SELECTs (full + due) over FakeDb, the replace-
    the-set writes, and the incremental assignment/bump/touch SQL shapes.
  * pure layer — HDBSCAN (scikit-learn's, the architecture-review choice),
    centroid/nearest-cluster helpers, the term-based labeler, config validation,
    and the version fingerprint that triggers a full recompute.
  * runner layer — ClusteringRunner over FakeStore: full-pass replace + assign,
    multi-domain resolution, incremental nearest-centroid assignment, noise
    handling, pagination, and the force_full/version transitions.

The runner tests drive real HDBSCAN over hand-built, well-separated blobs, so
they exercise the actual clustering algorithm (the requirement), not a mock.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from gitmaps.clustering import (
    CLUSTERING_VERSION_KEY,
    ClusterKey,
    ClusteringConfig,
    ClusteringResult,
    ClusteringRunner,
    RepoClusterInput,
    centroid,
    cluster_by_domain,
    cluster_embeddings,
    clustering_due_row_to_input,
    clustering_row_to_input,
    clustering_version,
    extract_terms,
    label_cluster,
    nearest_cluster,
    normalize,
    pick_best_cluster,
)
from gitmaps.repo_store import RepoStore

from conftest import FakeDb, FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"

#: Two well-separated 3-d blobs (internal spread ~0.3) plus far outliers — a
#: shape verified to make scikit-learn HDBSCAN emit [0,0,0,0, 1,1,1,1, -1,-1]
#: with min_cluster_size=3, so runner assertions can rely on it.
BLOB_A: list[list[float]] = [[1, 0, 0], [0.95, 0.31, 0], [0.99, 0.14, 0], [0.93, 0.37, 0]]
BLOB_B: list[list[float]] = [[0, 1, 0], [0.31, 0.95, 0], [0.14, 0.99, 0], [0.37, 0.93, 0]]
NOISE_PTS: list[list[float]] = [[0.4, 0.4, 0.8], [0.45, 0.5, 0.75]]


def one_hot(idx: int, dim: int = 3, value: float = 1.0) -> list[float]:
    vec = [0.0] * dim
    vec[idx] = value
    return vec


def cluster_row(
    *,
    repo_id: int,
    embedding: list[float] | str,
    domains=("AI",),
    full_name: str = "octocat/hello",
    description: str = "A test repository",
    topics=("cli",),
    language: str = "Python",
) -> tuple:
    """A CLUSTERING_COLUMNS row (id, embedding, domains, full_name, description, topics, language)."""
    return (repo_id, embedding, list(domains), full_name, description, list(topics), language)


def make_member(description: str, topics, language: str | None = "Python"):
    return RepoClusterInput(
        id=0, embedding=[], domains=("AI",), full_name="x/y",
        description=description, topics=tuple(topics), language=language,
    )


# -- store layer -------------------------------------------------------------


def test_list_all_for_clustering_query_shape() -> None:
    db = FakeDb()
    db.fetchall_result = [cluster_row(repo_id=1, embedding="[1.0,0.0]")]
    rows = RepoStore(db).list_all_for_clustering("surfaced", limit=10, offset=5)

    sql, params = db.executed[-1]
    assert "SELECT r.id, r.embedding, r.domains" in sql
    assert "r.embedding IS NOT NULL" in sql
    assert "cardinality(r.domains) > 0" in sql
    assert "AND r.surfaced" in sql  # surfaced-only universe
    assert "ORDER BY r.id" in sql
    assert "LIMIT %s OFFSET %s" in sql
    assert params == (10, 5)
    assert rows == [cluster_row(repo_id=1, embedding="[1.0,0.0]")]


def test_list_all_for_clustering_universe_all() -> None:
    db = FakeDb()
    RepoStore(db).list_all_for_clustering("all", limit=10, offset=0)
    sql, _ = db.executed[-1]
    assert "AND r.surfaced" not in sql


def test_list_all_for_clustering_rejects_unknown_universe() -> None:
    db = FakeDb()
    with pytest.raises(ValueError):
        RepoStore(db).list_all_for_clustering("bogus", limit=10, offset=0)


def test_list_due_for_clustering_adds_clustered_at_gate() -> None:
    db = FakeDb()
    RepoStore(db).list_due_for_clustering("surfaced", limit=10, offset=0)

    sql, params = db.executed[-1]
    assert "r.clustered_at IS NULL" in sql
    assert "r.embedding IS NOT NULL" in sql
    assert "cardinality(r.domains) > 0" in sql
    assert params == (10, 0)


def test_delete_clusters_drops_the_set() -> None:
    db = FakeDb()
    RepoStore(db).delete_clusters()
    sql, _ = db.executed[-1]
    assert "DELETE FROM clusters" in sql


def test_insert_cluster_returns_generated_id_and_terms_source() -> None:
    db = FakeDb()
    db.fetchone_result = (55,)
    cluster_id = RepoStore(db).insert_cluster(
        domain="Databases", label="Databases vector search", member_count=3, computed_at=STAMP
    )
    sql, params = db.executed[-1]
    assert "INSERT INTO clusters" in sql
    assert "label_source" in sql and "'terms'" in sql  # D-06 term labeling
    assert "RETURNING id" in sql
    assert params == ("Databases", "Databases vector search", 3, STAMP)
    assert cluster_id == 55


def test_set_cluster_memberships_bulk_params_with_noise_null() -> None:
    db = FakeDb()
    RepoStore(db).set_cluster_memberships([(7, STAMP, 1), (None, STAMP, 2)])
    sql, params = db.executed[-1]
    assert "UPDATE repos SET cluster_id = %s, clustered_at = %s WHERE id = %s" in sql
    assert params == [(7, STAMP, 1), (None, STAMP, 2)]


def test_set_cluster_memberships_skips_empty() -> None:
    db = FakeDb()
    RepoStore(db).set_cluster_memberships([])
    assert db.executed == []  # no empty executemany hits the db


def test_get_cluster_members_parses_embeddings() -> None:
    db = FakeDb()
    db.fetchall_result = [(1, "AI", "[1.0,0.0]"), (1, "AI", "[0.9,0.1]"), (2, "Databases", "[0.0,1.0]")]
    rows = RepoStore(db).get_cluster_members()
    assert rows == [(1, "AI", [1.0, 0.0]), (1, "AI", [0.9, 0.1]), (2, "Databases", [0.0, 1.0])]


def test_get_cluster_members_skips_null_embeddings() -> None:
    db = FakeDb()
    db.fetchall_result = [(1, "AI", None)]
    assert RepoStore(db).get_cluster_members() == []


def test_assign_repo_to_cluster_updates_repo_and_bumps_count() -> None:
    db = FakeDb()
    RepoStore(db).assign_repo_to_cluster(42, 7, STAMP)
    sqls = [sql for sql, _ in db.executed]
    assert "UPDATE repos SET cluster_id = %s, clustered_at = %s WHERE id = %s" in sqls
    assert "UPDATE clusters SET member_count = member_count + 1 WHERE id = %s" in sqls
    assert db.executed[-1][1] == (7,)


def test_touch_clustered_at_marks_noise_processed() -> None:
    db = FakeDb()
    RepoStore(db).touch_clustered_at(42, STAMP)
    sql, params = db.executed[-1]
    assert "UPDATE repos SET clustered_at = %s WHERE id = %s" in sql
    assert params == (STAMP, 42)


# -- pure layer --------------------------------------------------------------


def test_clustering_row_to_input_parses_row() -> None:
    inp = clustering_row_to_input(
        (7, "[1.0,0.0,0.5]", ["AI", "Databases"], "octocat/hello", "desc", ["cli"], "Python")
    )
    assert inp.id == 7
    assert inp.embedding == [1.0, 0.0, 0.5]
    assert inp.domains == ("AI", "Databases")
    assert inp.full_name == "octocat/hello"
    assert inp.description == "desc"
    assert inp.topics == ("cli",)
    assert inp.language == "Python"


def test_clustering_due_row_to_input_parses_row() -> None:
    assert clustering_due_row_to_input((9, "[1.0,0.0]", ["AI"])) == (9, [1.0, 0.0], ("AI",))


def test_normalize_handles_zero_vector() -> None:
    assert normalize([0.0, 0.0]) == [0.0, 0.0]


def test_centroid_is_normalized_mean() -> None:
    c = centroid([[1, 0, 0], [0.99, 0.141, 0]])
    assert c[2] == pytest.approx(0.0)
    assert (c[0] ** 2 + c[1] ** 2) ** 0.5 == pytest.approx(1.0)
    assert c[0] == pytest.approx(0.995 / (0.995**2 + 0.0705**2) ** 0.5)


def test_cluster_embeddings_separates_clear_blobs() -> None:
    labels = cluster_embeddings(BLOB_A + BLOB_B + NOISE_PTS, ClusteringConfig(min_cluster_size=3))
    # Blob A and blob B each form one cluster; the two far points are noise.
    assert labels[0] == labels[1] == labels[2] == labels[3] >= 0
    assert labels[4] == labels[5] == labels[6] == labels[7] >= 0
    assert labels[0] != labels[4]
    assert labels[8] == -1 and labels[9] == -1


def test_cluster_embeddings_too_few_members_all_noise() -> None:
    labels = cluster_embeddings([[1, 0, 0], [0.9, 0.1, 0], [0.8, 0.2, 0]], ClusteringConfig(min_cluster_size=5))
    assert labels == [-1, -1, -1]


def test_cluster_embeddings_single_point_is_noise() -> None:
    assert cluster_embeddings([[1, 0, 0]], ClusteringConfig(min_cluster_size=3)) == [-1]


def test_pick_best_cluster_prefers_nearest_centroid() -> None:
    a = (ClusterKey("AI", 0), [1.0, 0.0, 0.0])
    b = (ClusterKey("Databases", 1), [0.9, 0.436, 0.0])
    assert pick_best_cluster([0.99, 0.14, 0.0], [b, a]) == ClusterKey("AI", 0)


def test_pick_best_cluster_ties_resolve_to_first_sorted() -> None:
    a = (ClusterKey("AI", 0), [1.0, 0.0, 0.0])
    b = (ClusterKey("Databases", 0), [1.0, 0.0, 0.0])
    assert pick_best_cluster([0.99, 0.1, 0.0], [b, a]) == ClusterKey("AI", 0)  # "AI" < "Databases"


def test_nearest_cluster_returns_best_above_threshold() -> None:
    assert nearest_cluster([0.99, 0.14, 0], [(1, [1, 0, 0]), (2, [0.9, 0.436, 0])], 0.8) == 1


def test_nearest_cluster_none_below_threshold() -> None:
    assert nearest_cluster([0, 1, 0], [(1, [1, 0, 0])], 0.75) is None


def test_nearest_cluster_none_when_no_candidates() -> None:
    assert nearest_cluster([1, 0, 0], [], 0.75) is None


def test_nearest_cluster_lowest_id_wins_ties() -> None:
    assert nearest_cluster([1, 0, 0], [(9, [1, 0, 0]), (3, [1, 0, 0])], 0.75) == 3


def test_extract_terms_from_metadata() -> None:
    terms = extract_terms(
        description="A vector similarity search toolkit",
        topics=["vector-search", "nlp"],
        language="Python",
    )
    assert {"vector", "search", "toolkit", "similarity", "nlp", "python"} <= terms
    assert "a" not in terms  # too short


def test_extract_terms_handles_absent_metadata() -> None:
    assert extract_terms(description=None, topics=[], language=None) == set()


def test_label_cluster_picks_dominant_discriminating_terms() -> None:
    members = [
        make_member("A vector similarity search engine", ["vector-search"], language=None),
        make_member("Vector indexing for embeddings", ["vector-search"], language=None),
        make_member("Semantic search over vector stores", ["vector"], language=None),
    ]
    counts = {"vector": 3, "search": 2, "similarity": 1, "engine": 1,
              "indexing": 1, "embeddings": 1, "semantic": 1, "stores": 1}
    label = label_cluster(
        "Databases", members, domain_term_counts=counts, domain_size=3,
        config=ClusteringConfig(),
    )
    assert label.startswith("Databases")
    assert "vector" in label and "search" in label


def test_label_cluster_drops_the_domain_name_term() -> None:
    members = [
        make_member("An AI agents framework", ["ai-agents"], language=None),
        make_member("AI agents for coding", ["ai"], language=None),
        make_member("Build AI agents quickly", ["ai-agents"], language=None),
    ]
    counts = {"ai": 3, "agents": 3, "framework": 1, "coding": 1, "build": 1, "quickly": 1}
    label = label_cluster(
        "AI", members, domain_term_counts=counts, domain_size=3, config=ClusteringConfig()
    )
    # The bare domain word "ai" is not repeated; the distinguishing terms are.
    assert label.startswith("AI") and "ai" not in label.lower().split()[1:]
    assert "agents" in label


def test_label_cluster_truncates_long_labels() -> None:
    config = ClusteringConfig(label_max_terms=4, label_max_chars=20)
    members = [make_member("One two three four five six seven", ["one", "two", "three", "four", "five"])]
    label = label_cluster(
        "AI", members,
        domain_term_counts={"one": 1, "two": 1, "three": 1, "four": 1, "five": 1},
        domain_size=1, config=config,
    )
    assert len(label) <= 20
    assert label  # never empty


def test_label_cluster_empty_members_falls_back_to_domain() -> None:
    assert label_cluster("AI", [], domain_term_counts={}, domain_size=0, config=ClusteringConfig()) == "AI"


def test_config_validates_params() -> None:
    with pytest.raises(ValueError):
        ClusteringConfig(min_cluster_size=0)
    with pytest.raises(ValueError):
        ClusteringConfig(min_samples=0)
    with pytest.raises(ValueError):
        ClusteringConfig(cluster_selection_epsilon=-0.1)
    with pytest.raises(ValueError):
        ClusteringConfig(similarity_threshold=1.5)
    with pytest.raises(ValueError):
        ClusteringConfig(label_max_terms=0)
    with pytest.raises(ValueError):
        ClusteringConfig(universe="bogus")


def test_clustering_version_changes_with_tuning() -> None:
    base = clustering_version(ClusteringConfig())
    assert clustering_version(ClusteringConfig()) == base
    assert clustering_version(ClusteringConfig(min_cluster_size=10)) != base
    assert clustering_version(ClusteringConfig(similarity_threshold=0.9)) != base
    assert clustering_version(ClusteringConfig(universe="all")) != base


def test_cluster_by_domain_returns_resolved_single_clusters() -> None:
    members = [
        RepoClusterInput(id=i, embedding=v, domains=("AI",), full_name="a",
                         description="agent", topics=("agents",), language=None)
        for i, v in zip(range(1, 5), BLOB_A)
    ] + [
        RepoClusterInput(id=i, embedding=v, domains=("AI",), full_name="b",
                         description="rust cli", topics=("cli",), language=None)
        for i, v in zip(range(5, 9), BLOB_B)
    ] + [
        RepoClusterInput(id=50, embedding=[0.05, 0.99, 0.05], domains=("AI", "Databases"),
                         full_name="shared", description="agent", topics=("agents",), language=None),
    ]
    # A second domain so repo 50 is genuinely multi-domain.
    members += [
        RepoClusterInput(id=i, embedding=v, domains=("Databases",), full_name="c",
                         description="agent", topics=("agents",), language=None)
        for i, v in zip(range(11, 15), BLOB_A)
    ] + [
        RepoClusterInput(id=i, embedding=v, domains=("Databases",), full_name="d",
                         description="rust cli", topics=("cli",), language=None)
        for i, v in zip(range(15, 19), BLOB_B)
    ]

    dc = cluster_by_domain(members, ClusteringConfig(min_cluster_size=3))

    # Every resolved member belongs to exactly one cluster; the shared repo 50
    # is listed once, in the AI cluster that also holds the other blob-B repos.
    resolved_ids = [i for _, idxs in dc.resolved_groups for i in idxs]
    assert len(resolved_ids) == len(set(resolved_ids))  # no repo counted twice
    shared_idx = next(i for i, m in enumerate(members) if m.id == 50)
    assert dc.resolved[shared_idx].domain == "AI"
    ai_b = next(idxs for k, idxs in dc.resolved_groups if k.domain == "AI" and 5 in idxs)
    assert shared_idx in ai_b  # blob-B (5,6,7,8) + shared repo 50
    db_b = next(idxs for k, idxs in dc.resolved_groups if k.domain == "Databases" and 15 in idxs)
    assert shared_idx not in db_b  # the Databases blob-B keeps its own members only
    assert len(dc.resolved_groups) == 4  # two domains x two blobs
    assert dc.domains_clustered == 2


# -- runner layer ------------------------------------------------------------


def _runner(store: FakeStore, **kwargs):
    return ClusteringRunner(store, now=lambda: NOW, config=ClusteringConfig(min_cluster_size=3), **kwargs)


def test_runner_full_pass_clusters_replaces_and_assigns() -> None:
    rows = [
        cluster_row(repo_id=i, embedding=v, domains=("AI",),
                    description="An AI agent orchestration framework",
                    topics=["ai-agents", "orchestration"], language="Python")
        for i, v in zip(range(1, 5), BLOB_A)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("AI",),
                    description="A rust cli for terminals",
                    topics=["cli", "terminal"], language="Rust")
        for i, v in zip(range(5, 9), BLOB_B)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("AI",),
                    description="random unrelated stuff", topics=[], language="Go")
        for i, v in zip(range(9, 11), NOISE_PTS)
    ]
    store = FakeStore(clustering_all=rows)

    result = _runner(store).run()

    assert isinstance(result, ClusteringResult)
    assert result.force_full is True
    assert result.repos_seen == 10
    assert result.domains_clustered == 1
    assert result.clusters_created == 2
    assert result.repos_assigned == 8
    assert result.noise == 2

    # The cluster set was replaced with two term-labeled rows.
    assert len(store.clusters) == 2
    assert {c["label_source"] for c in store.clusters} == {"terms"}
    assert all(c["computed_at"] == STAMP for c in store.clusters)
    assert all(c["domain"] == "AI" for c in store.clusters)
    ai_labels = sorted(c["label"] for c in store.clusters)
    assert ai_labels[0].startswith("AI") and "agent" in ai_labels[0]
    assert ai_labels[1].startswith("AI") and "rust" in ai_labels[1]

    # Assignments: the two blobs each own a distinct cluster; noise stays NULL;
    # every considered repo's clustered_at advances.
    by_repo = {repo_id: (cluster_id, at) for cluster_id, at, repo_id in store.cluster_memberships}
    assert set(by_repo) == {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    assert by_repo[1][0] == by_repo[4][0] != by_repo[5][0]
    assert by_repo[5][0] == by_repo[8][0]
    assert by_repo[9][0] is None and by_repo[10][0] is None
    assert all(at == STAMP for cluster_id, at in by_repo.values())


def test_runner_full_pass_resolves_multidomain_repo_to_one_cluster() -> None:
    # Two domains that share the same two-blob geometry; repo 50 sits in both,
    # so it is a candidate in both domains and must resolve to exactly one.
    rows = [
        cluster_row(repo_id=i, embedding=v, domains=("AI",),
                    description="agent orchestration", topics=["agents"])
        for i, v in zip(range(1, 5), BLOB_A)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("AI",),
                    description="rust cli terminals", topics=["cli"])
        for i, v in zip(range(5, 9), BLOB_B)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("Databases",),
                    description="agent orchestration", topics=["agents"])
        for i, v in zip(range(11, 15), BLOB_A)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("Databases",),
                    description="rust cli terminals", topics=["cli"])
        for i, v in zip(range(15, 19), BLOB_B)
    ] + [
        cluster_row(repo_id=50, embedding=[0.05, 0.99, 0.05], domains=("AI", "Databases"),
                    description="agent vector hybrid", topics=["agents", "vector"]),
    ]
    store = FakeStore(clustering_all=rows)

    result = _runner(store).run()

    assert result.clusters_created == 4  # two domains x two blobs
    assert result.repos_assigned == 17  # 8 AI + 8 Databases + the shared repo
    assert result.noise == 0

    by_repo = {repo_id: cluster_id for cluster_id, _at, repo_id in store.cluster_memberships}
    # repo 50 lands in the "AI" blob-B cluster (the identical centroids tie and
    # resolve lexicographically to "AI"); it never receives two cluster_ids.
    ai_blob_a, ai_blob_b = by_repo[1], by_repo[5]
    assert ai_blob_a != ai_blob_b
    assert by_repo[50] == ai_blob_b

    # member_count matches the actual assignments: the shared repo 50 is
    # counted once, in the cluster it resolved to, never in both domains.
    counts = {c["id"]: c["member_count"] for c in store.clusters}
    assigned: dict[int, int] = {}
    for cluster_id, _at, _repo in store.cluster_memberships:
        if cluster_id is not None:
            assigned[cluster_id] = assigned.get(cluster_id, 0) + 1
    assert assigned == counts
    assert counts[ai_blob_b] == 5  # blob-B (5,6,7,8) + shared repo 50


def test_runner_full_pass_ignores_repos_without_domains() -> None:
    store = FakeStore(clustering_all=[cluster_row(repo_id=1, embedding=[1, 0, 0], domains=())])
    result = _runner(store).run()
    assert result.repos_seen == 1
    assert result.domains_clustered == 0
    assert result.clusters_created == 0
    assert result.repos_assigned == 0
    # The repo belongs to no domain, so it is only marked as considered, never
    # assigned (the real store's SELECT filters domains != '{}' anyway).
    assert store.cluster_memberships == [(None, STAMP, 1)]


def test_runner_full_pass_skips_domains_below_min_cluster_size() -> None:
    # 8 members (two blobs) in one domain, min_cluster_size=3 -> clustered.
    store = FakeStore(
        clustering_all=[
            cluster_row(repo_id=i, embedding=v, domains=("AI",))
            for i, v in zip(range(1, 9), BLOB_A + BLOB_B)
        ]
    )
    result = _runner(store).run()
    assert result.domains_clustered == 1
    assert result.clusters_created == 2

    # 2 members < min_cluster_size=3 -> the domain is never clustered.
    sparse = FakeStore(clustering_all=[cluster_row(repo_id=i, embedding=v, domains=("AI",)) for i, v in zip(range(1, 3), BLOB_A)])
    result = ClusteringRunner(sparse, now=lambda: NOW, config=ClusteringConfig(min_cluster_size=3)).run()
    assert result.domains_clustered == 0
    assert result.clusters_created == 0
    assert result.repos_assigned == 0
    assert {c for c, _a, _r in sparse.cluster_memberships} == {None}  # all noise


def test_runner_full_pass_records_progress_state() -> None:
    rows = [
        cluster_row(repo_id=i, embedding=v, domains=("AI",), description="agent orchestration", topics=["agents"])
        for i, v in zip(range(1, 5), BLOB_A)
    ] + [
        cluster_row(repo_id=i, embedding=v, domains=("AI",), description="rust cli terminals", topics=["cli"])
        for i, v in zip(range(5, 9), BLOB_B)
    ]
    store = FakeStore(clustering_all=rows)
    _runner(store).run()

    assert store.state[CLUSTERING_VERSION_KEY] == clustering_version(ClusteringConfig(min_cluster_size=3))
    assert store.state["clustering.last_run_at"] == STAMP
    assert store.state["clustering.last_seen"] == 8
    assert store.state["clustering.last_clusters"] == 2
    assert store.state["clustering.last_assigned"] == 8
    assert store.state["clustering.last_noise"] == 0


def test_runner_full_pass_paginates() -> None:
    rows = [
        cluster_row(repo_id=i, embedding=v, domains=("AI",))
        for i, v in zip(range(1, 7), BLOB_A + BLOB_B[:2])
    ]
    store = FakeStore(clustering_all=rows)
    ClusteringRunner(store, now=lambda: NOW, config=ClusteringConfig(min_cluster_size=3), batch_size=4).run()
    assert store.clustering_all_calls == [("surfaced", 4, 0), ("surfaced", 4, 4)]


def test_runner_incremental_assigns_new_repos_to_nearest_cluster() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: clustering_version(config)},
        clustering_due=[(101, [1, 0, 0], ["AI"]), (102, [0, 1, 0], ["AI"])],
        cluster_member_rows=[(1, "AI", [1, 0, 0]), (1, "AI", [0.99, 0.02, 0.0])],
    )
    result = ClusteringRunner(store, now=lambda: NOW, config=config).run()

    assert result.force_full is False
    assert result.repos_seen == 2
    assert result.repos_assigned == 1
    assert result.noise == 1
    assert store.clustering_due_calls == [("surfaced", 200, 0)]
    assert store.cluster_assignments == [(101, 1, STAMP)]
    assert store.cluster_touches == [(102, STAMP)]


def test_runner_incremental_filters_clusters_by_repo_domain() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    # The only cluster is in "Databases"; repo 101 carries only "AI", so it can
    # never be assigned even though its embedding is identical to the centroid.
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: clustering_version(config)},
        clustering_due=[(101, [1, 0, 0], ["AI"])],
        cluster_member_rows=[(1, "Databases", [1, 0, 0])],
    )
    result = ClusteringRunner(store, now=lambda: NOW, config=config).run()
    assert result.repos_assigned == 0
    assert result.noise == 1
    assert store.cluster_touches == [(101, STAMP)]


def test_runner_incremental_without_clusters_leaves_all_noise() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: clustering_version(config)},
        clustering_due=[(101, [1, 0, 0], ["AI"])],
        cluster_member_rows=[],
    )
    result = ClusteringRunner(store, now=lambda: NOW, config=config).run()
    assert result.repos_assigned == 0
    assert result.noise == 1
    assert store.cluster_touches == [(101, STAMP)]


def test_runner_incremental_paginates() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: clustering_version(config)},
        clustering_due=[(101, [1, 0, 0], ["AI"]), (102, [1, 0, 0], ["AI"])],
        cluster_member_rows=[(1, "AI", [1, 0, 0])],
    )
    ClusteringRunner(store, now=lambda: NOW, config=config, batch_size=1).run()
    # A batch smaller than the set keeps paging until an empty page.
    assert store.clustering_due_calls == [("surfaced", 1, 0), ("surfaced", 1, 1), ("surfaced", 1, 2)]
    assert store.cluster_assignments == [(101, 1, STAMP), (102, 1, STAMP)]


def test_runner_incremental_records_progress_state() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: clustering_version(config)},
        clustering_due=[(101, [1, 0, 0], ["AI"])],
        cluster_member_rows=[(1, "AI", [1, 0, 0])],
    )
    ClusteringRunner(store, now=lambda: NOW, config=config).run()
    assert store.state["clustering.last_seen"] == 1
    assert store.state["clustering.last_assigned"] == 1
    assert store.state["clustering.last_noise"] == 0


def test_runner_force_full_when_tuning_changes() -> None:
    config = ClusteringConfig(min_cluster_size=3)
    stored_version = clustering_version(ClusteringConfig(min_cluster_size=5))
    store = FakeStore(
        state={CLUSTERING_VERSION_KEY: stored_version},
        clustering_all=[cluster_row(repo_id=i, embedding=v, domains=("AI",)) for i, v in zip(range(1, 5), BLOB_A)],
        clustering_due=[(101, [1, 0, 0], ["AI"])],
    )
    result = ClusteringRunner(store, now=lambda: NOW, config=config).run()
    assert result.force_full is True
    assert store.clustering_all_calls  # the full universe was read
    assert not store.clustering_due_calls
    assert store.state[CLUSTERING_VERSION_KEY] == clustering_version(config)
