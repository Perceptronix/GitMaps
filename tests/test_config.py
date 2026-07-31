"""Settings.from_env — parsing and validation, against a dict not os.environ."""

from __future__ import annotations

import pytest

from gitmaps.config import (
    DEFAULT_RATE_BUDGET_PER_HOUR,
    Settings,
    parse_momentum_weights,
)
from gitmaps.momentum import DEFAULT_WEIGHTS


def base_env() -> dict[str, str]:
    return {
        "DATABASE_URL": "postgresql://postgres:pw@db.example.supabase.co:5432/postgres",
        "GITHUB_TOKENS": "ghp_one,ghp_two",
    }


def test_reads_required_keys() -> None:
    settings = Settings.from_env(base_env())

    assert settings.database_url == "postgresql://postgres:pw@db.example.supabase.co:5432/postgres"
    assert settings.github_tokens == ("ghp_one", "ghp_two")
    assert settings.rate_budget_per_hour == DEFAULT_RATE_BUDGET_PER_HOUR


def test_single_token_is_accepted() -> None:
    settings = Settings.from_env({**base_env(), "GITHUB_TOKENS": "ghp_only"})

    assert settings.github_tokens == ("ghp_only",)


def test_strips_whitespace_and_empty_entries() -> None:
    settings = Settings.from_env({**base_env(), "GITHUB_TOKENS": " ghp_one , ,ghp_two "})

    assert settings.github_tokens == ("ghp_one", "ghp_two")


def test_missing_database_url_raises() -> None:
    with pytest.raises(ValueError, match="DATABASE_URL"):
        Settings.from_env({k: v for k, v in base_env().items() if k != "DATABASE_URL"})


def test_missing_or_empty_tokens_raise() -> None:
    with pytest.raises(ValueError, match="GITHUB_TOKENS"):
        Settings.from_env({**base_env(), "GITHUB_TOKENS": ""})
    with pytest.raises(ValueError, match="GITHUB_TOKENS"):
        Settings.from_env({**base_env(), "GITHUB_TOKENS": " , "})


def test_budget_override_and_invalid_value() -> None:
    assert Settings.from_env({**base_env(), "GITHUB_API_BUDGET_PER_HOUR": "1000"}).rate_budget_per_hour == 1000

    with pytest.raises(ValueError, match="integer"):
        Settings.from_env({**base_env(), "GITHUB_API_BUDGET_PER_HOUR": "lots"})


def test_significance_threshold_default_and_override() -> None:
    assert Settings.from_env(base_env()).significance_threshold == 0.5
    assert Settings.from_env({**base_env(), "SIGNIFICANCE_THRESHOLD": "0.7"}).significance_threshold == 0.7


def test_invalid_threshold_raises() -> None:
    with pytest.raises(ValueError, match="SIGNIFICANCE_THRESHOLD"):
        Settings.from_env({**base_env(), "SIGNIFICANCE_THRESHOLD": "high"})


def test_momentum_weights_default_when_unset() -> None:
    settings = Settings.from_env(base_env())

    assert settings.momentum_signal_weights == DEFAULT_WEIGHTS
    assert settings.momentum_signal_weights["stars"] == 0.35


def test_momentum_weights_override() -> None:
    raw = '{"stars":0.5,"forks":0.1,"watchers":0.1,"contributors":0.15,"commits":0.15}'
    settings = Settings.from_env({**base_env(), "MOMENTUM_SIGNAL_WEIGHTS": raw})

    assert settings.momentum_signal_weights["stars"] == 0.5
    assert settings.momentum_signal_weights["commits"] == 0.15


def test_momentum_weights_parse_validates_shape() -> None:
    # Must be a JSON object covering exactly the five signals and summing to 1.
    with pytest.raises(ValueError, match="JSON object"):
        parse_momentum_weights("not-json")
    with pytest.raises(ValueError, match="JSON object"):
        parse_momentum_weights("[1, 2]")
    with pytest.raises(ValueError, match="missing"):
        parse_momentum_weights('{"stars": 1.0}')
    with pytest.raises(ValueError, match="unknown"):
        parse_momentum_weights(
            '{"stars":0.2,"forks":0.2,"watchers":0.2,"contributors":0.2,"commits":0.2,"bogus":0.0}'
        )
    with pytest.raises(ValueError, match="numbers"):
        parse_momentum_weights(
            '{"stars":"lots","forks":0.2,"watchers":0.2,"contributors":0.2,"commits":0.2}'
        )
    with pytest.raises(ValueError, match="sum to 1.0"):
        parse_momentum_weights(
            '{"stars":1.0,"forks":0.15,"watchers":0.10,"contributors":0.20,"commits":0.20}'
        )
    with pytest.raises(ValueError, match="non-negative"):
        parse_momentum_weights(
            '{"stars":-0.1,"forks":0.35,"watchers":0.10,"contributors":0.35,"commits":0.30}'
        )


def test_embedding_defaults_when_unset() -> None:
    settings = Settings.from_env(base_env())

    assert settings.embedding_provider == "local"
    assert settings.embedding_model == "sentence-transformers/all-MiniLM-L6-v2"
    assert settings.embedding_dimension == 384
    assert settings.embedding_http_url is None
    assert settings.embedding_http_api_key is None


def test_embedding_provider_and_dimension_override() -> None:
    settings = Settings.from_env(
        {
            **base_env(),
            "EMBEDDING_PROVIDER": "http",
            "EMBEDDING_MODEL": "text-embedding-3-small",
            "EMBEDDING_DIMENSION": "1536",
            "EMBEDDING_HTTP_URL": "https://api.openai.com/v1/embeddings",
            "EMBEDDING_HTTP_API_KEY": "sk-test",
        }
    )

    assert settings.embedding_provider == "http"
    assert settings.embedding_model == "text-embedding-3-small"
    assert settings.embedding_dimension == 1536
    assert settings.embedding_http_url == "https://api.openai.com/v1/embeddings"
    assert settings.embedding_http_api_key == "sk-test"


def test_embedding_invalid_provider_raises() -> None:
    with pytest.raises(ValueError, match="EMBEDDING_PROVIDER"):
        Settings.from_env({**base_env(), "EMBEDDING_PROVIDER": "wat"})


def test_embedding_invalid_dimension_raises() -> None:
    with pytest.raises(ValueError, match="EMBEDDING_DIMENSION"):
        Settings.from_env({**base_env(), "EMBEDDING_DIMENSION": "wide"})
    with pytest.raises(ValueError, match="EMBEDDING_DIMENSION"):
        Settings.from_env({**base_env(), "EMBEDDING_DIMENSION": "0"})
