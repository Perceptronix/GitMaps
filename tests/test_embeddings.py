"""Seam 1 (providers + pure composition) and Seam 2 (EmbeddingRunner).

Seam 1 pins the pluggable provider seam (local + http), the deterministic
compose/fingerprint logic, and the provider factory. Seam 2 drives
EmbeddingRunner over FakeStore + FakeClient: incremental embed, skip-unchanged,
re-embed-on-change, force-full on model change, pagination, readme error
handling, and the model-version/progress state it writes.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

import pytest

from gitmaps.embeddings import (
    DEFAULT_MODEL,
    EmbeddingConfig,
    EmbeddingProviderError,
    EmbeddingRunner,
    HttpEmbeddingProvider,
    LocalHashEmbedder,
    build_embedding_provider,
    compose_semantic_text,
    embedding_row_to_input,
    semantic_fingerprint,
)

from conftest import FakeClient, FakeResponse, FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
MODEL_VERSION_KEY = "embedding_model_version"


class FakeProvider:
    """Scripted, deterministic provider for runner tests."""

    model_name = "fake"
    dimension = 4

    def __init__(self, version: str = "fake:4") -> None:
        self._version = version
        self.calls: list[list[str]] = []

    @property
    def embedding_model_version(self) -> str:
        return self._version

    def embed(self, texts) -> list[list[float]]:
        self.calls.append(list(texts))
        return [[0.25 * (i + 1) for i in range(self.dimension)] for _ in texts]

    def embed_query(self, query: str) -> list[float]:
        return self.embed([query])[0]


def embed_row(
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
    """A repos embedding SELECT row (EMBEDDING_COLUMNS order)."""
    return (repo_id, owner, name, full_name, description, list(topics), language, homepage, fingerprint)


def expected_fp(row: tuple, readme: str | None = None) -> str:
    """The fingerprint the runner computes for a row (metadata + optional readme)."""
    text = compose_semantic_text(
        full_name=row[3], description=row[4], topics=row[5],
        language=row[6], homepage=row[7], readme=readme,
        readme_max_chars=2000,
    )
    return semantic_fingerprint(text)


def make_runner(store, client=None, provider=None, **kwargs) -> tuple[EmbeddingRunner, FakeProvider]:
    provider = provider or FakeProvider()
    client = client or FakeClient()
    return EmbeddingRunner(client, store, provider, now=lambda: NOW, **kwargs), provider


# -- Seam 1: pure composition + fingerprint ---------------------------------


def test_compose_includes_all_fields() -> None:
    text = compose_semantic_text(
        full_name="octocat/hello", description="A demo repo", topics=["cli", "python"],
        language="Python", homepage="https://example.com", readme="# Hello",
        readme_max_chars=2000,
    )
    assert "octocat/hello" in text
    assert "A demo repo" in text
    assert "python" in text and "cli" in text
    assert "Python" in text
    assert "https://example.com" in text
    assert "# Hello" in text


def test_compose_sorts_topics_deterministically() -> None:
    kwargs = dict(full_name="x", description=None, language=None, homepage=None, readme=None, readme_max_chars=10)
    a = compose_semantic_text(topics=["z", "a", "m"], **kwargs)
    b = compose_semantic_text(topics=["m", "z", "a"], **kwargs)
    assert a == b
    assert a.index("a") < a.index("m") < a.index("z")


def test_compose_truncates_readme() -> None:
    text = compose_semantic_text(
        full_name=None, description=None, topics=[], language=None,
        homepage=None, readme="x" * 100, readme_max_chars=10,
    )
    assert text == "x" * 10


def test_compose_omits_absent_parts() -> None:
    text = compose_semantic_text(
        full_name="o/r", description=None, topics=[], language=None,
        homepage=None, readme=None, readme_max_chars=10,
    )
    assert text == "o/r"


def test_fingerprint_stable_and_sensitive() -> None:
    text = compose_semantic_text(
        full_name="o/r", description="same", topics=["a"], language="Go",
        homepage=None, readme=None, readme_max_chars=10,
    )
    assert semantic_fingerprint(text) == semantic_fingerprint(text)
    assert semantic_fingerprint(text) != semantic_fingerprint(text + "!")


# -- Seam 1: LocalHashEmbedder ---------------------------------------------


def test_local_embedder_is_deterministic_and_normalized() -> None:
    emb = LocalHashEmbedder(dimension=16, model_name="test")
    v1 = emb.embed(["machine learning is great"])
    v2 = emb.embed(["machine learning is great"])
    assert v1 == v2
    assert len(v1[0]) == 16
    norm = math.sqrt(sum(x * x for x in v1[0]))
    assert abs(norm - 1.0) < 1e-9


def test_local_embedder_distinguishes_different_text() -> None:
    emb = LocalHashEmbedder(dimension=64)
    a = emb.embed(["web framework for javascript"])
    b = emb.embed(["deep learning in rust"])
    assert a[0] != b[0]


def test_local_embedder_empty_text_is_zero_vector() -> None:
    emb = LocalHashEmbedder(dimension=8)
    assert emb.embed([""]) == [[0.0] * 8]


def test_local_embedder_query_matches_embed() -> None:
    emb = LocalHashEmbedder(dimension=16)
    assert emb.embed_query("hello world") == emb.embed(["hello world"])[0]


def test_local_embedder_reports_version() -> None:
    emb = LocalHashEmbedder(dimension=8, model_name="m")
    assert emb.embedding_model_version == "m:8"


def test_local_embedder_rejects_bad_dimension() -> None:
    with pytest.raises(ValueError):
        LocalHashEmbedder(dimension=0)


# -- Seam 1: HttpEmbeddingProvider (the cloud swap-in) ----------------------


class FakeEmbeddingSession:
    def __init__(self, response: FakeResponse) -> None:
        self.response = response
        self.calls: list[tuple] = []

    def post(self, url, json=None, headers=None, timeout=None) -> FakeResponse:
        self.calls.append((url, json, headers, timeout))
        return self.response


def http_provider(session: FakeEmbeddingSession, **kwargs) -> HttpEmbeddingProvider:
    return HttpEmbeddingProvider(
        "https://emb.example/v1/embeddings", model="emb-m", dimension=2,
        session=session, **kwargs,
    )


def test_http_provider_posts_payload_and_parses() -> None:
    session = FakeEmbeddingSession(
        FakeResponse(json_body={"data": [{"embedding": [0.1, 0.2]}, {"embedding": [0.3, 0.4]}]})
    )
    provider = http_provider(session, api_key="secret")

    vectors = provider.embed(["a", "b"])

    url, payload, headers, _ = session.calls[0]
    assert url == "https://emb.example/v1/embeddings"
    assert payload == {"model": "emb-m", "input": ["a", "b"]}
    assert headers["Authorization"] == "Bearer secret"
    assert vectors == [[0.1, 0.2], [0.3, 0.4]]
    assert provider.embedding_model_version == "emb-m:2"


def test_http_provider_sends_auth_only_when_key_present() -> None:
    session = FakeEmbeddingSession(FakeResponse(json_body={"data": [{"embedding": [0.1, 0.2]}]}))
    provider = http_provider(session)

    provider.embed(["a"])

    _, _, headers, _ = session.calls[0]
    assert "Authorization" not in headers


def test_http_provider_rejects_short_batch() -> None:
    session = FakeEmbeddingSession(FakeResponse(json_body={"data": [{"embedding": [0.1, 0.2]}]}))
    provider = http_provider(session)

    with pytest.raises(EmbeddingProviderError):
        provider.embed(["a", "b"])


def test_http_provider_rejects_bad_dimension() -> None:
    session = FakeEmbeddingSession(FakeResponse(json_body={"data": [{"embedding": [0.1, 0.2, 0.3]}]}))
    provider = http_provider(session)

    with pytest.raises(EmbeddingProviderError):
        provider.embed(["a"])


def test_http_provider_raises_on_http_error() -> None:
    session = FakeEmbeddingSession(FakeResponse(status_code=500, text="boom"))
    provider = http_provider(session)

    with pytest.raises(EmbeddingProviderError):
        provider.embed(["a"])


# -- Seam 1: provider factory -----------------------------------------------


def test_build_local_provider() -> None:
    provider = build_embedding_provider(provider="local", model="m", dimension=8)
    assert isinstance(provider, LocalHashEmbedder)
    assert provider.model_name == "m"
    assert provider.dimension == 8


def test_build_http_provider() -> None:
    provider = build_embedding_provider(provider="http", model="m", dimension=8, http_url="https://x")
    assert isinstance(provider, HttpEmbeddingProvider)


def test_build_http_without_url_raises() -> None:
    with pytest.raises(ValueError, match="EMBEDDING_HTTP_URL"):
        build_embedding_provider(provider="http")


def test_build_unknown_provider_raises() -> None:
    with pytest.raises(ValueError):
        build_embedding_provider(provider="wat")


def test_default_model_constant_is_the_local_default() -> None:
    assert DEFAULT_MODEL == "local-hash-v1"


# -- Seam 2: EmbeddingRunner over FakeStore ---------------------------------


def test_runner_embeds_due_repos() -> None:
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[embed_row(repo_id=1), embed_row(repo_id=2)])
    runner, _ = make_runner(store)

    result = runner.run()

    assert result.repos_seen == 2
    assert result.embedded == 2
    assert result.skipped == 0
    assert result.force_full is False
    assert store.embedding_due_calls == [("surfaced", 100, 0)]
    assert store.embedding_all_calls == []
    assert [s["repo_id"] for s in store.embedding_stored] == [1, 2]
    assert all(s["fingerprint"] == expected_fp(embed_row(repo_id=s["repo_id"])) for s in store.embedding_stored)
    assert all(s["embedded_at"] == STAMP for s in store.embedding_stored)
    assert store.embedded_touched == []


def test_runner_skips_unchanged_repo() -> None:
    row = embed_row(repo_id=7)
    stored = list(row[:8]) + [expected_fp(row)]  # matching fingerprint
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[tuple(stored)])
    runner, _ = make_runner(store)

    result = runner.run()

    assert result.embedded == 0
    assert result.skipped == 1
    assert result.repos_seen == 1
    assert store.embedding_stored == []
    assert store.embedded_touched == [(7, STAMP)]  # embedded_at advanced, not re-embedded


def test_runner_reembeds_when_fingerprint_changes() -> None:
    row = embed_row(repo_id=7, fingerprint="stale-fingerprint")
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[row])
    runner, _ = make_runner(store)

    result = runner.run()

    assert result.embedded == 1
    assert store.embedding_stored[0]["fingerprint"] == expected_fp(row)


def test_force_full_on_model_version_change_reembeds_everything() -> None:
    unchanged = embed_row(repo_id=1)
    unchanged = list(unchanged[:8]) + [expected_fp(unchanged)]  # fingerprint matches current content
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:3"}, embedding_all=[tuple(unchanged), embed_row(repo_id=2)])
    runner, _ = make_runner(store)

    result = runner.run()

    assert result.force_full is True
    assert result.embedded == 2  # even the fingerprint-unchanged repo is re-embedded
    assert result.skipped == 0
    assert store.embedding_all_calls == [("surfaced", 100, 0)]
    assert store.embedding_due_calls == []


def test_first_run_is_a_full_pass() -> None:
    store = FakeStore(embedding_all=[embed_row(repo_id=1)])
    runner, _ = make_runner(store)

    result = runner.run()

    assert result.force_full is True
    assert store.embedding_all_calls == [("surfaced", 100, 0)]
    assert result.embedded == 1


def test_runner_paginates() -> None:
    rows = [embed_row(repo_id=i) for i in range(5)]
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=rows)
    runner, _ = make_runner(store, batch_size=2)

    result = runner.run()

    assert store.embedding_due_calls == [("surfaced", 2, 0), ("surfaced", 2, 2), ("surfaced", 2, 4)]
    assert result.repos_seen == 5
    assert result.embedded == 5


def test_runner_embeds_from_metadata_when_no_readme() -> None:
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[embed_row(repo_id=1)])
    runner, _ = make_runner(store, client=FakeClient())  # no readme scripted -> None (404)

    result = runner.run()

    assert result.embedded == 1
    assert result.readme_fetches == 1
    assert store.embedding_stored[0]["fingerprint"] == expected_fp(embed_row(repo_id=1), readme=None)


def test_runner_includes_readme_in_semantic_content() -> None:
    row = embed_row(repo_id=1)
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[row])
    client = FakeClient(responses={"/repos/octocat/hello/readme": "# Hi there"})
    runner, _ = make_runner(store, client=client)

    result = runner.run()

    assert result.embedded == 1
    fp_with_readme = expected_fp(row, readme="# Hi there")
    assert store.embedding_stored[0]["fingerprint"] == fp_with_readme
    assert fp_with_readme != expected_fp(row, readme=None)  # the README changed the content


def test_runner_skips_repo_on_readme_fetch_error() -> None:
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[embed_row(repo_id=1)])
    client = FakeClient(get_error={"/repos/octocat/hello/readme"})
    runner, _ = make_runner(store, client=client)

    result = runner.run()

    assert result.errors == 1
    assert result.embedded == 0
    assert store.embedding_stored == []


def test_runner_aborts_batch_on_rate_limit() -> None:
    store = FakeStore(
        state={MODEL_VERSION_KEY: "fake:4"},
        embedding_due=[embed_row(repo_id=1), embed_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    client = FakeClient(rate_limit={"/repos/octocat/hello/readme"})
    runner, _ = make_runner(store, client=client)

    result = runner.run()

    assert result.rate_limited is True
    assert result.repos_seen == 1  # first repo consumed, then the batch aborted
    assert result.embedded == 0
    assert store.embedding_stored == []


def test_runner_aborts_when_budget_already_spent() -> None:
    store = FakeStore(
        state={MODEL_VERSION_KEY: "fake:4", "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 1}},
        embedding_due=[embed_row(repo_id=1)],
    )
    runner, _ = make_runner(store, budget_per_hour=1)

    result = runner.run()

    assert result.rate_limited is True
    assert result.repos_seen == 0
    assert result.readme_fetches == 0
    assert store.embedding_stored == []


def test_runner_charges_budget_per_readme_and_persists() -> None:
    store = FakeStore(
        state={MODEL_VERSION_KEY: "fake:4", "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 0}},
        embedding_due=[embed_row(repo_id=1), embed_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    runner, _ = make_runner(store, budget_per_hour=2)

    result = runner.run()

    assert result.embedded == 2
    assert result.readme_fetches == 2
    assert store.state["rate_budget"] == {"hour": "2026-07-31T12:00:00Z", "used": 2}


def test_runner_stops_mid_batch_when_budget_hit() -> None:
    store = FakeStore(
        state={MODEL_VERSION_KEY: "fake:4", "rate_budget": {"hour": "2026-07-31T12:00:00Z", "used": 0}},
        embedding_due=[embed_row(repo_id=1), embed_row(repo_id=2, name="other", full_name="octocat/other")],
    )
    runner, _ = make_runner(store, budget_per_hour=1)

    result = runner.run()

    assert result.embedded == 1
    assert result.rate_limited is True
    assert result.repos_seen == 1
    assert store.state["rate_budget"]["used"] == 1


def test_runner_resets_budget_when_hour_rolls_over() -> None:
    # A previous hour's spend must not carry into this hour.
    store = FakeStore(
        state={MODEL_VERSION_KEY: "fake:4", "rate_budget": {"hour": "2026-07-31T11:00:00Z", "used": 5000}},
        embedding_due=[embed_row(repo_id=1)],
    )
    runner, _ = make_runner(store, budget_per_hour=100)

    result = runner.run()

    assert result.embedded == 1
    assert result.rate_limited is False


def test_runner_records_model_version_and_progress() -> None:
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[embed_row(repo_id=1)])
    runner, _ = make_runner(store)

    runner.run()

    assert store.state[MODEL_VERSION_KEY] == "fake:4"
    assert store.state["embedding.last_run_at"] == STAMP
    assert store.state["embedding.last_embedded"] == 1
    assert store.state["embedding.last_skipped"] == 0


def test_runner_passes_universe_through_to_store() -> None:
    store = FakeStore(state={MODEL_VERSION_KEY: "fake:4"}, embedding_due=[embed_row(repo_id=1)])
    runner, _ = make_runner(store, config=EmbeddingConfig(universe="all"))

    runner.run()

    assert store.embedding_due_calls == [("all", 100, 0)]


def test_embedding_config_validates() -> None:
    with pytest.raises(ValueError):
        EmbeddingConfig(universe="wat")
    with pytest.raises(ValueError):
        EmbeddingConfig(readme_max_chars=0)


def test_embedding_row_to_input_maps() -> None:
    inp = embedding_row_to_input(embed_row(repo_id=1, topics=("cli", "python")))

    assert inp.id == 1
    assert inp.owner == "octocat"
    assert inp.name == "hello"
    assert inp.full_name == "octocat/hello"
    assert inp.description == "A test repo"
    assert inp.topics == ("cli", "python")
    assert inp.language == "Python"
    assert inp.homepage == "https://example.com"
    assert inp.embedding_fingerprint is None
