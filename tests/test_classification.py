"""Seam tests for the technology classification pipeline (Phase 6.5).

Three layers, mirroring the embedding suite:
  * store layer — RepoStore due/full classification SELECTs and the domains
    write over FakeDb: the SQL shape, the universe fragment, and the params.
  * pure layer — the keyword classifier + config validation: multi-domain
    assignment, case-insensitive word-bounded matching, and the configurable/
    extensible taxonomy contract (including the taxonomy-change full pass).
  * runner layer — ClassificationRunner over FakeStore + FakeClient:
    incremental classify, skip-unchanged, taxonomy-change re-classify, readme
    error handling, rate budget, pagination, and progress state.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from gitmaps.classification import (
    DEFAULT_TAXONOMY,
    TAXONOMY_VERSION_KEY,
    ClassificationConfig,
    ClassificationRunner,
    classify_domains,
    classification_row_to_input,
    taxonomy_fingerprint,
)
from gitmaps.embeddings import compose_semantic_text, semantic_fingerprint
from gitmaps.repo_store import RepoStore

from conftest import FakeClient, FakeDb, FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"


def classify_row(
    *,
    repo_id: int = 1,
    owner: str = "octocat",
    name: str = "hello",
    full_name: str = "octocat/hello",
    description: str = "A test repo",
    topics=("cli", "python"),
    language: str = "Python",
    homepage: str = "https://example.com",
    fingerprint=None,
) -> tuple:
    """A repos classification SELECT row (CLASSIFICATION_COLUMNS order)."""
    return (repo_id, owner, name, full_name, description, list(topics), language, homepage, fingerprint)


def composed_text(row: tuple, readme: str | None = None) -> str:
    return compose_semantic_text(
        full_name=row[3], description=row[4], topics=row[5],
        language=row[6], homepage=row[7], readme=readme,
        readme_max_chars=2000,
    )


def expected_fp(row: tuple, readme: str | None = None) -> str:
    """The fingerprint the runner computes for a row (metadata + optional readme)."""
    return semantic_fingerprint(composed_text(row, readme))


def expected_domains(row: tuple, readme: str | None = None) -> tuple[str, ...]:
    return classify_domains(composed_text(row, readme))


def make_runner(store, client=None, **kwargs) -> ClassificationRunner:
    return ClassificationRunner(client or FakeClient(), store, now=lambda: NOW, **kwargs)


# -- store layer -------------------------------------------------------------


def test_list_due_for_classification_query_shape() -> None:
    db = FakeDb()
    db.fetchall_result = [classify_row(repo_id=1)]
    rows = RepoStore(db).list_due_for_classification("surfaced", limit=10, offset=5)

    sql, params = db.executed[-1]
    assert "SELECT r.id, r.owner, r.name" in sql
    assert "r.domains_fingerprint IS NULL OR r.classified_at IS NULL OR r.classified_at < r.pushed_at" in sql
    assert "AND r.surfaced" in sql  # surfaced universe
    assert "ORDER BY r.id" in sql and "LIMIT %s OFFSET %s" in sql
    assert params == (10, 5)
    assert rows == [classify_row(repo_id=1)]


def test_list_due_for_classification_universe_all() -> None:
    db = FakeDb()
    RepoStore(db).list_due_for_classification("all", limit=10, offset=0)
    sql, _ = db.executed[-1]
    assert "r.surfaced" not in sql


def test_list_all_for_classification_uses_where_clause() -> None:
    db = FakeDb()
    RepoStore(db).list_all_for_classification("surfaced", limit=10, offset=0)
    sql, params = db.executed[-1]
    assert "WHERE r.surfaced" in sql
    assert params == (10, 0)


def test_list_classification_invalid_universe_raises() -> None:
    db = FakeDb()
    with pytest.raises(ValueError):
        RepoStore(db).list_due_for_classification("bogus", limit=10, offset=0)
    with pytest.raises(ValueError):
        RepoStore(db).list_all_for_classification("bogus", limit=10, offset=0)


def test_store_classification_writes_row() -> None:
    db = FakeDb()
    rc = RepoStore(db).store_classification(42, ["AI", "Frontend"], "fp123", STAMP)

    sql, params = db.executed[-1]
    assert "UPDATE repos SET" in sql
    assert "domains = %s" in sql and "domains_fingerprint = %s" in sql and "classified_at = %s" in sql
    assert params == (["AI", "Frontend"], "fp123", STAMP, 42)
    assert rc == 1


def test_touch_classified_at() -> None:
    db = FakeDb()
    RepoStore(db).touch_classified_at(42, STAMP)
    sql, params = db.executed[-1]
    assert "classified_at = %s" in sql
    assert params == (STAMP, 42)


# -- pure layer: the classifier ---------------------------------------------


def test_classify_assigns_matching_domains_sorted() -> None:
    assert classify_domains("An AI-powered React dashboard with Docker") == (
        "AI", "DevOps", "Frontend",
    )


def test_classify_supports_multiple_domains() -> None:
    assert classify_domains("A blockchain smart-contract wallet for ios") == (
        "Blockchain", "Mobile",
    )


def test_classify_is_case_insensitive() -> None:
    assert classify_domains("BUILT WITH AN LLM AND MACHINE LEARNING") == (
        "AI", "Machine Learning",
    )


def test_classify_is_word_bounded() -> None:
    tiny = (("AI", ("ai",)),)
    assert classify_domains("AI-powered", tiny) == ("AI",)
    assert classify_domains("send an email, watch Taiwan", tiny) == ()  # "email"/"Taiwan" contain 'ai'
    assert classify_domains("the ai model", tiny) == ("AI",)


def test_classify_no_match_returns_empty() -> None:
    assert classify_domains("a plain repo about cats") == ()


def test_classify_ignores_negated_keywords() -> None:
    tiny_ai = (("AI", ("ai",)),)
    # "NOT AI SLOP" disclaims AI rather than claiming it.
    assert classify_domains("NOT AI SLOP", tiny_ai) == ()
    assert classify_domains("not AI", tiny_ai) == ()
    assert classify_domains("no docker here", (("DevOps", ("docker",)),)) == ()
    assert classify_domains("without docker", (("DevOps", ("docker",)),)) == ()
    # A plain positive occurrence is unaffected.
    assert classify_domains("an AI model", tiny_ai) == ("AI",)
    assert classify_domains("we deploy docker", (("DevOps", ("docker",)),)) == ("DevOps",)


def test_classify_negation_guard_spares_hyphenated_compounds() -> None:
    cyber = (("Cybersecurity", ("malware", "exploit")),)
    # "anti-malware" is a compound word, not a negation — still Cybersecurity.
    assert classify_domains("anti-malware and exploit protection", cyber) == ("Cybersecurity",)


def test_classify_uses_custom_extensible_taxonomy() -> None:
    custom = (("Networking", ("dns",)), ("Databases", ("postgres",)))
    assert classify_domains("a dns server backed by postgres", custom) == ("Databases", "Networking")
    # A custom taxonomy replaces, not extends, the default.
    assert classify_domains("an AI dashboard", custom) == ()


def test_classify_result_is_taxonomy_order_independent() -> None:
    a = (("Zulu", ("alpha",)), ("Alpha", ("beta",)))
    b = (("Alpha", ("beta",)), ("Zulu", ("alpha",)))
    assert classify_domains("alpha and beta", a) == classify_domains("alpha and beta", b)


def test_default_taxonomy_covers_example_domains() -> None:
    domains = {domain for domain, _ in DEFAULT_TAXONOMY}
    for example in (
        "AI", "AI Agents", "RAG", "Machine Learning", "Frontend", "Backend",
        "DevOps", "Cybersecurity", "Data Engineering", "Mobile",
        "Game Development", "Blockchain", "Networking", "Cloud", "Databases",
    ):
        assert example in domains, example


def test_taxonomy_fingerprint_changes_with_taxonomy() -> None:
    base = taxonomy_fingerprint(DEFAULT_TAXONOMY)
    changed = DEFAULT_TAXONOMY[:-1] + (("Databases", ("postgres", "duckdb")),)
    assert taxonomy_fingerprint(changed) != base
    # And it is stable for the same taxonomy.
    assert taxonomy_fingerprint(DEFAULT_TAXONOMY) == base


def test_classify_cicd_cross_cutting_keywords() -> None:
    # CI/CD keywords should match across multiple domains
    text = "A project with github actions ci/cd pipeline for testing and deployment"
    domains = classify_domains(text)
    # Should match DevOps (primary CI/CD domain)
    assert "DevOps" in domains
    # And should also match domains that now include CI/CD keywords
    assert "Backend" in domains  # backend has ci/cd, pipeline, testing, deployment
    assert "Frontend" in domains  # frontend has ci/cd, pipeline, testing, deploy
    assert "Cloud" in domains  # cloud has ci/cd, pipeline, deployment
    assert "AI" in domains  # AI has ci/cd, pipeline, testing
    assert "Machine Learning" in domains  # ML has ci/cd, pipeline, mlops
    assert "Data Engineering" in domains  # Data Eng has ci/cd, pipeline


def test_classify_cicd_specific_tools() -> None:
    # Specific CI/CD tool keywords
    assert "DevOps" in classify_domains("Uses gitlab ci for builds")
    assert "DevOps" in classify_domains("Deployed with github workflow")
    assert "DevOps" in classify_domains("Azure pipelines configuration")
    assert "DevOps" in classify_domains("Jenkins build server")
    assert "DevOps" in classify_domains("CircleCI config")
    assert "DevOps" in classify_domains("Travis CI setup")
    assert "DevOps" in classify_domains("ArgoCD for gitops")
    assert "DevOps" in classify_domains("Flux continuous delivery")
    assert "DevOps" in classify_domains("Tekton pipelines")
    assert "DevOps" in classify_domains("Drone CI")
    assert "DevOps" in classify_domains("Woodpecker CI")


def test_classify_networking_protocol_keywords() -> None:
    # Networking protocol-specific keywords
    text = "An http proxy server handling https requests with grpc and websocket support"
    domains = classify_domains(text)
    assert "Networking" in domains
    assert "Backend" in domains  # backend has grpc, rest api, graphql


def test_classify_networking_infrastructure_keywords() -> None:
    # Networking infrastructure keywords
    assert "Networking" in classify_domains("nginx reverse proxy configuration")
    assert "Networking" in classify_domains("haproxy load balancer setup")
    assert "Networking" in classify_domains("envoy service mesh sidecar")
    assert "Networking" in classify_domains("istio service mesh")
    assert "Networking" in classify_domains("api gateway pattern")
    assert "Networking" in classify_domains("cdn edge caching")
    assert "Networking" in classify_domains("dns resolution")
    assert "Networking" in classify_domains("express.js middleware")
    assert "Networking" in classify_domains("express server routing")


def test_classify_networking_http_specifics() -> None:
    # HTTP-specific terms from real issues
    text = "Fixed trailer header issue with status code 304 in express.js server"
    domains = classify_domains(text)
    assert "Networking" in domains


def test_classify_cicd_no_false_positive_on_unrelated() -> None:
    # CI/CD keywords shouldn't match unrelated text. The bare 2-letter
    # abbreviations "ci"/"cd" are deliberately NOT taxonomy keywords (see the
    # Backend block comment) — so none of these should land in DevOps OR
    # Backend, even though "\bcd\b" word-bounds to the hyphen in "cd-rom".
    for text in ("ancient civilization", "civic engagement", "abcd code",
                 "cd-rom drive", "the ci directory", "scientific computing with ci"):
        domains = classify_domains(text)
        assert "DevOps" not in domains, text
        assert "Backend" not in domains, text
    # "pipeline" in a non-CI context is not DevOps (only compound CI terms are).
    assert "DevOps" not in classify_domains("graphics rendering pipeline")


def test_classify_no_bare_language_abbreviations() -> None:
    # "ts", "js", "py" are not taxonomy keywords: the taxonomy is
    # domain-based, not language-based (language lives on `repos.language`),
    # and word-bounded bare abbreviations would misclassify unrelated prose.
    # "js"/"ts"/"py" as standalone words match nothing here.
    assert classify_domains("plain js for a small tool") == ()
    assert classify_domains("a ts project") == ()
    assert classify_domains("py scripts and notebooks") == ()
    # Substrings of longer words must never match: "it's", "sets", "happy",
    # "projects", "outputs".
    for text in ("it's fine", "sets of tools", "happy users",
                 "projects list", "outputs stored"):
        assert classify_domains(text) == (), text


def test_classify_networking_no_false_positive_on_unrelated() -> None:
    # Networking keywords shouldn't match unrelated text
    assert "Networking" not in classify_domains("status code review meeting")
    assert "Networking" not in classify_domains("header image for blog")
    assert "Networking" not in classify_domains("trailer park management")
    assert "Networking" not in classify_domains("proxy war history")
    assert "Networking" not in classify_domains("express shipping")


# -- pure layer: config validation ------------------------------------------

def test_config_validates_readme_max_chars() -> None:
    with pytest.raises(ValueError):
        ClassificationConfig(readme_max_chars=0)


def test_config_validates_universe() -> None:
    with pytest.raises(ValueError):
        ClassificationConfig(universe="bogus")


def test_config_validates_taxonomy_shape() -> None:
    with pytest.raises(ValueError, match="non-empty name"):
        ClassificationConfig(taxonomy=(("", ("ai",)),))
    with pytest.raises(ValueError, match="at least one keyword"):
        ClassificationConfig(taxonomy=(("AI", ()),))
    with pytest.raises(ValueError, match="duplicate"):
        ClassificationConfig(taxonomy=(("AI", ("ai",)), ("AI", ("llm",))))


def test_classification_row_to_input_maps_row() -> None:
    row = classify_row(repo_id=7, fingerprint="fp")
    inp = classification_row_to_input(row)
    assert inp.id == 7 and inp.full_name == "octocat/hello"
    assert inp.topics == ("cli", "python")
    assert inp.domains_fingerprint == "fp"


# -- runner layer ------------------------------------------------------------

def test_runner_classifies_due_repos() -> None:
    rows = [classify_row(repo_id=1), classify_row(repo_id=2, name="other", full_name="octocat/other")]
    store = FakeStore(classification_due=rows)

    result = make_runner(store).run()

    assert result.repos_seen == 2
    assert result.classified == 2
    assert result.skipped == 0
    assert result.errors == 0
    assert result.force_full is True  # no stored taxonomy version yet
    assert store.classification_all_calls == [("surfaced", 100, 0)]
    assert store.classification_due_calls == []
    stored = store.classification_stored
    assert [s["repo_id"] for s in stored] == [row[0] for row in rows]
    for s, row in zip(stored, rows):
        assert s["domains"] == list(expected_domains(row))
        assert s["fingerprint"] == expected_fp(row)
        assert s["classified_at"] == STAMP
    assert store.classification_touched == []


def test_runner_skips_unchanged_repo() -> None:
    row = classify_row(repo_id=7)
    due = list(row[:8]) + [expected_fp(row)]  # matching stored fingerprint
    store = FakeStore(state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)}, classification_due=[tuple(due)])

    result = make_runner(store).run()

    assert result.force_full is False
    assert result.skipped == 1
    assert result.classified == 0
    assert store.classification_stored == []
    assert store.classification_touched == [(7, STAMP)]


def test_runner_reclassifies_when_taxonomy_changes() -> None:
    row = classify_row(repo_id=7)
    due = list(row[:8]) + [expected_fp(row)]  # stored under the OLD taxonomy
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY[:-1])},
        classification_due=[tuple(due)],
    )
    # A changed taxonomy must force a full pass: the matching fingerprint must
    # NOT skip — every repo is re-classified under the new rules.
    result = make_runner(store).run()

    assert result.force_full is True
    assert result.classified == 1
    assert result.skipped == 0
    assert store.classification_all_calls == [("surfaced", 100, 0)]


def test_runner_classifies_from_metadata_when_no_readme() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[classify_row(repo_id=1, description="A React frontend", topics=("web",))],
    )
    result = make_runner(store).run()

    assert result.classified == 1
    assert store.classification_stored[0]["domains"] == ["Frontend"]


def test_runner_includes_readme_in_input() -> None:
    row = classify_row(repo_id=1, description="plain", topics=("x",))
    client = FakeClient(responses={"/repos/octocat/hello/readme": "# Hello\nA Docker containerized web server."})
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[row],
    )
    result = make_runner(store, client=client).run()

    assert result.classified == 1
    stored = store.classification_stored[0]
    # Metadata alone matches nothing; the README's "Docker"/"web server" add domains.
    assert stored["domains"] == ["Backend", "DevOps"]
    assert stored["fingerprint"] == expected_fp(row, readme="# Hello\nA Docker containerized web server.")


def test_runner_skips_repo_on_readme_fetch_error() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[classify_row(repo_id=1)],
    )
    client = FakeClient(get_error={"/repos/octocat/hello/readme"})
    result = make_runner(store, client=client).run()

    assert result.errors == 1
    assert result.classified == 0
    assert store.classification_stored == []


def test_runner_aborts_batch_on_rate_limit() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[classify_row(repo_id=1), classify_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    client = FakeClient(rate_limit={"/repos/octocat/hello/readme"})
    result = make_runner(store, client=client).run()

    assert result.rate_limited is True
    assert result.repos_seen == 1  # first repo consumed, then the batch aborted
    assert result.classified == 0
    assert store.classification_stored == []


def test_runner_aborts_when_budget_already_spent() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY), "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 1}},
        classification_due=[classify_row(repo_id=1)],
    )
    result = make_runner(store, budget_per_hour=1).run()

    assert result.rate_limited is True
    assert result.repos_seen == 0
    assert result.readme_fetches == 0
    assert store.classification_stored == []


def test_runner_charges_budget_per_readme_and_persists() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY), "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 0}},
        classification_due=[classify_row(repo_id=1), classify_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    result = make_runner(store, budget_per_hour=2).run()

    assert result.classified == 2
    assert result.readme_fetches == 2
    assert store.state["rate_budget"] == {"hour": "2026-07-31T12:00:00Z", "used": 2}


def test_runner_stops_mid_batch_when_budget_hit() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY), "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 0}},
        classification_due=[classify_row(repo_id=1), classify_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    result = make_runner(store, budget_per_hour=1).run()

    assert result.rate_limited is True
    assert result.classified == 1
    assert result.repos_seen == 1
    assert store.state["rate_budget"] == {"hour": "2026-07-31T12:00:00Z", "used": 1}


def test_runner_resets_budget_when_hour_rolls_over() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY), "rate_budget": {"hour": "2026-07-31T11:00:00Z", "used": 9}},
        classification_due=[classify_row(repo_id=1)],
    )
    result = make_runner(store, budget_per_hour=1).run()

    assert result.rate_limited is False
    assert result.classified == 1
    assert store.state["rate_budget"] == {"hour": "2026-07-31T12:00:00Z", "used": 1}


def test_runner_paginates() -> None:
    rows = [classify_row(repo_id=i) for i in range(1, 4)]
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=rows,
    )
    result = make_runner(store, batch_size=2).run()

    assert result.classified == 3
    assert store.classification_due_calls == [("surfaced", 2, 0), ("surfaced", 2, 2)]


def test_runner_passes_universe_through_to_store() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[classify_row(repo_id=1)],
    )
    make_runner(store, config=ClassificationConfig(universe="all")).run()

    assert store.classification_due_calls == [("all", 100, 0)]


def test_runner_records_taxonomy_version_and_progress() -> None:
    store = FakeStore(
        state={TAXONOMY_VERSION_KEY: taxonomy_fingerprint(DEFAULT_TAXONOMY)},
        classification_due=[classify_row(repo_id=1)],
    )
    make_runner(store).run()

    assert store.state[TAXONOMY_VERSION_KEY] == taxonomy_fingerprint(DEFAULT_TAXONOMY)
    assert store.state["classification.last_run_at"] == STAMP
    assert store.state["classification.last_classified"] == 1
    assert store.state["classification.last_skipped"] == 0
