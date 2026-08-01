"""Seam tests for the Similar repositories service (architecture §9).

Two layers, mirroring the momentum/promotion suites:
  * store layer — RepoStore.find_similar / get_similar_source over FakeDb:
    the HNSW ANN query is written index-eligible, the source is excluded, the
    optional language / topic / min-similarity filters become WHERE clauses, and
    the embedding column's text form is normalized back to a list of floats.
  * service layer — SimilarityService over FakeStore: source lookup, error
    paths, filter/limit passthrough, and score round-tripping.
"""

from __future__ import annotations

import pytest

from gitmaps.repo_store import RepoStore, parse_pgvector, vector_to_pgvector
from gitmaps.similarity import (
    RepoNotEmbeddedError,
    RepoNotFoundError,
    SimilarRepo,
    SimilarityConfig,
    SimilarityService,
    cosine_similarity,
    row_to_similar,
)

from conftest import FakeDb, FakeStore

# -- store layer -------------------------------------------------------------


def test_find_similar_uses_hnsw_cosine_query_and_excludes_source() -> None:
    db = FakeDb()
    RepoStore(db).find_similar(42, [0.1, 0.2], limit=10)

    sql, params = db.executed[-1]
    # Index-eligible ANN shape (migration 04): ORDER BY on the `<=>` operator.
    assert "1 - (r.embedding <=> %s::vector) AS similarity" in sql
    assert "ORDER BY r.embedding <=> %s::vector" in sql
    assert "AND r.id != %s" in sql  # the source repo is excluded
    assert "WHERE r.embedding IS NOT NULL" in sql
    assert "LIMIT %s" in sql
    assert params == ["[0.1,0.2]", 42, "[0.1,0.2]", 10]


def test_find_similar_optional_language_filter() -> None:
    db = FakeDb()
    RepoStore(db).find_similar(42, [0.1, 0.2], limit=10, language="Python")

    sql, params = db.executed[-1]
    assert "AND r.language = %s" in sql
    assert params == ["[0.1,0.2]", 42, "Python", "[0.1,0.2]", 10]


def test_find_similar_optional_topic_filter() -> None:
    db = FakeDb()
    RepoStore(db).find_similar(42, [0.1, 0.2], limit=10, topic="cli")

    sql, params = db.executed[-1]
    assert "AND %s = ANY(r.topics)" in sql
    assert params == ["[0.1,0.2]", 42, "cli", "[0.1,0.2]", 10]


def test_find_similar_optional_min_similarity_floor() -> None:
    db = FakeDb()
    RepoStore(db).find_similar(42, [0.1, 0.2], limit=10, min_similarity=0.5)

    sql, params = db.executed[-1]
    assert "AND 1 - (r.embedding <=> %s::vector) >= %s" in sql
    assert params == ["[0.1,0.2]", 42, "[0.1,0.2]", 0.5, "[0.1,0.2]", 10]


def test_find_similar_combines_all_filters() -> None:
    db = FakeDb()
    RepoStore(db).find_similar(42, [0.1, 0.2], limit=5, language="Python", topic="ml", min_similarity=0.3)

    sql, params = db.executed[-1]
    assert "AND r.language = %s" in sql
    assert "AND %s = ANY(r.topics)" in sql
    assert "AND 1 - (r.embedding <=> %s::vector) >= %s" in sql
    assert params == ["[0.1,0.2]", 42, "Python", "ml", "[0.1,0.2]", 0.3, "[0.1,0.2]", 5]


def test_find_similar_returns_rows() -> None:
    db = FakeDb()
    db.fetchall_result = [
        (2, "o", "n", "a/b", "desc", "Python", ["cli"], 7, True, 0.875),
    ]
    rows = RepoStore(db).find_similar(1, [0.1, 0.2], limit=10)

    assert rows == [(2, "o", "n", "a/b", "desc", "Python", ["cli"], 7, True, 0.875)]


def test_get_similar_source_resolves_and_normalizes_embedding() -> None:
    # psycopg2 without the pgvector caster returns the vector column as text.
    db = FakeDb()
    db.fetchone_result = (42, "[-0.04,0.02]", "Python", ["web"])

    source = RepoStore(db).get_similar_source("octocat/hello")

    sql, params = db.executed[-1]
    assert "SELECT id, embedding, language, topics FROM repos WHERE full_name = %s" in sql
    assert params == ("octocat/hello",)
    assert source == (42, [-0.04, 0.02], "Python", ["web"])


def test_get_similar_source_missing_returns_none() -> None:
    db = FakeDb()
    db.fetchone_result = None
    assert RepoStore(db).get_similar_source("nope/missing") is None


def test_parse_pgvector_handles_text_and_list_forms() -> None:
    assert parse_pgvector("[-0.04,0.02,0.1]") == [-0.04, 0.02, 0.1]
    assert parse_pgvector([-0.04, 0.02, 0.1]) == [-0.04, 0.02, 0.1]
    assert parse_pgvector("[]") == []
    assert parse_pgvector(None) is None


# -- service layer -----------------------------------------------------------

def sim_row(id_: int, similarity: float, **overrides: object) -> tuple:
    fields = dict(
        owner="octocat", name="hello", full_name="octocat/hello",
        description="a similar repo", language="Python", topics=["cli"],
        stars=7, surfaced=True, similarity=similarity,
    )
    fields.update(overrides)
    return (
        id_, fields["owner"], fields["name"], fields["full_name"],
        fields["description"], fields["language"], list(fields["topics"]),
        fields["stars"], fields["surfaced"], fields["similarity"],
    )


SOURCE = (1, [0.1, 0.2], "Python", ["web"])


def test_similar_returns_neighbors_with_scores() -> None:
    store = FakeStore(
        similar_sources={"octocat/hello": SOURCE},
        similar_rows=[sim_row(2, 0.9, full_name="a/one"), sim_row(3, 0.7, full_name="b/two")],
    )

    result = SimilarityService(store).similar("octocat/hello")

    assert [r.full_name for r in result] == ["a/one", "b/two"]
    assert [r.similarity for r in result] == [0.9, 0.7]
    assert isinstance(result[0], SimilarRepo)
    assert result[0].id == 2 and result[0].topics == ("cli",) and result[0].surfaced is True


def test_similar_excludes_source_and_passes_config_and_filters() -> None:
    store = FakeStore(similar_sources={"octocat/hello": SOURCE}, similar_rows=[sim_row(2, 0.9)])
    service = SimilarityService(store, config=SimilarityConfig(top_n=5, min_similarity=0.3))

    service.similar("octocat/hello", language="Python", topic="ml")

    call = store.similar_calls[-1]
    assert call["repo_id"] == 1  # the source's id — the SQL excludes it from results
    assert call["query_vector"] == [0.1, 0.2]
    assert call["limit"] == 5
    assert call["language"] == "Python"
    assert call["topic"] == "ml"
    assert call["min_similarity"] == 0.3


def test_similar_without_filters_passes_none() -> None:
    store = FakeStore(similar_sources={"octocat/hello": SOURCE}, similar_rows=[])
    SimilarityService(store).similar("octocat/hello")
    call = store.similar_calls[-1]
    assert call["language"] is None and call["topic"] is None and call["min_similarity"] is None


def test_similar_unknown_source_raises() -> None:
    store = FakeStore(similar_sources={})
    with pytest.raises(RepoNotFoundError):
        SimilarityService(store).similar("missing/repo")


def test_similar_source_not_embedded_raises() -> None:
    store = FakeStore(similar_sources={"octocat/hello": (1, None, "Python", [])})
    with pytest.raises(RepoNotEmbeddedError):
        SimilarityService(store).similar("octocat/hello")


def test_config_validates_top_n_and_min_similarity() -> None:
    with pytest.raises(ValueError):
        SimilarityConfig(top_n=0)
    with pytest.raises(ValueError):
        SimilarityConfig(min_similarity=1.5)
    assert SimilarityConfig(min_similarity=-0.2).min_similarity == -0.2  # any [-1, 1] is legal
    assert SimilarityConfig(min_similarity=None).min_similarity is None  # default: no floor


def test_row_to_similar_maps_store_row() -> None:
    row = (42, "octocat", "hello", "octocat/hello", "desc", "Python", ["cli", "web"], 7, True, 0.8754)

    repo = row_to_similar(row)

    assert repo.id == 42
    assert repo.full_name == "octocat/hello"
    assert repo.language == "Python"
    assert repo.topics == ("cli", "web")
    assert repo.stars == 7 and repo.surfaced is True
    assert repo.similarity == round(0.8754, 6)


def test_cosine_similarity_is_the_score_contract() -> None:
    assert cosine_similarity([1.0, 0.0, 0.0], [1.0, 0.0, 0.0]) == pytest.approx(1.0)
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)
    assert cosine_similarity([1.0, 0.0], [-1.0, 0.0]) == pytest.approx(-1.0)
    assert cosine_similarity([1.0, 1.0], [1.0, 0.0]) == pytest.approx(0.5 ** 0.5)
    assert cosine_similarity([0.0, 0.0], [1.0, 0.0]) == 0.0  # zero vectors are neutral
    assert cosine_similarity([0.9, 0.1], [1.0, 0.0]) == pytest.approx(0.9 / (0.81 + 0.01) ** 0.5)


def test_vector_round_trip_through_pgvector_literal() -> None:
    vec = [-0.04278893, -0.039186575, 0.01982746]
    assert parse_pgvector(vector_to_pgvector(vec)) == vec
