"""Environment configuration for the worker processes.

Reads the keys documented in `.env.example`. `from_env` accepts a mapping so
tests can pass a dict instead of touching `os.environ`.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Mapping

DEFAULT_RATE_BUDGET_PER_HOUR = 5000  # architecture §6
DEFAULT_SIGNIFICANCE_THRESHOLD = 0.5  # the surface gate (architecture §4, ADR-0003)


@dataclass(frozen=True)
class Settings:
    database_url: str
    github_tokens: tuple[str, ...]
    rate_budget_per_hour: int = DEFAULT_RATE_BUDGET_PER_HOUR
    significance_threshold: float = DEFAULT_SIGNIFICANCE_THRESHOLD

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> "Settings":
        env = env if env is not None else os.environ

        database_url = (env.get("DATABASE_URL") or "").strip()
        if not database_url:
            raise ValueError("DATABASE_URL is required")

        tokens = tuple(t.strip() for t in (env.get("GITHUB_TOKENS") or "").split(",") if t.strip())
        if not tokens:
            raise ValueError("GITHUB_TOKENS is required (comma-separated)")

        try:
            budget = int(env.get("GITHUB_API_BUDGET_PER_HOUR", str(DEFAULT_RATE_BUDGET_PER_HOUR)))
        except ValueError as exc:
            raise ValueError("GITHUB_API_BUDGET_PER_HOUR must be an integer") from exc

        try:
            threshold = float(env.get("SIGNIFICANCE_THRESHOLD", str(DEFAULT_SIGNIFICANCE_THRESHOLD)))
        except ValueError as exc:
            raise ValueError("SIGNIFICANCE_THRESHOLD must be a number") from exc

        return cls(
            database_url=database_url,
            github_tokens=tokens,
            rate_budget_per_hour=budget,
            significance_threshold=threshold,
        )
