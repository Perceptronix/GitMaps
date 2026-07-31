"""Settings.from_env — parsing and validation, against a dict not os.environ."""

from __future__ import annotations

import pytest

from gitmaps.config import DEFAULT_RATE_BUDGET_PER_HOUR, Settings


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
