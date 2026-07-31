"""Environment configuration for the worker processes.

Reads the keys documented in `.env.example`. `from_env` accepts a mapping so
tests can pass a dict instead of touching `os.environ`.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Mapping

from gitmaps.momentum import DEFAULT_WEIGHTS, SIGNALS, validate_momentum_weights

DEFAULT_RATE_BUDGET_PER_HOUR = 5000  # architecture §6
DEFAULT_SIGNIFICANCE_THRESHOLD = 0.5  # the surface gate (architecture §4, ADR-0003)


def parse_momentum_weights(raw: str) -> dict[str, float]:
    """Parse MOMENTUM_SIGNAL_WEIGHTS (a JSON object) with strict validation.

    The object must contain exactly the five growth signals and sum to 1.0 —
    the decomposition reports the same weights, so a silent mismatch would
    break the transparency contract (ADR-0002). The shape rules are the ones
    `MomentumConfig` enforces (see `validate_momentum_weights`).
    """
    try:
        parsed = json.loads(raw)
    except ValueError as exc:
        raise ValueError("MOMENTUM_SIGNAL_WEIGHTS must be a JSON object") from exc
    if not isinstance(parsed, dict):
        raise ValueError("MOMENTUM_SIGNAL_WEIGHTS must be a JSON object")

    missing = set(SIGNALS) - set(parsed)
    unknown = set(parsed) - set(SIGNALS)
    if missing or unknown:
        raise ValueError(
            f"MOMENTUM_SIGNAL_WEIGHTS must cover exactly {list(SIGNALS)}; "
            f"missing={sorted(missing)} unknown={sorted(unknown)}"
        )

    try:
        weights = {signal: float(parsed[signal]) for signal in SIGNALS}
    except (TypeError, ValueError) as exc:
        raise ValueError("MOMENTUM_SIGNAL_WEIGHTS values must be numbers") from exc

    validate_momentum_weights(weights)  # sum-to-1.0 and non-negativity
    return weights


@dataclass(frozen=True)
class Settings:
    database_url: str
    github_tokens: tuple[str, ...]
    rate_budget_per_hour: int = DEFAULT_RATE_BUDGET_PER_HOUR
    significance_threshold: float = DEFAULT_SIGNIFICANCE_THRESHOLD
    momentum_signal_weights: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))

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

        raw_weights = env.get("MOMENTUM_SIGNAL_WEIGHTS")
        weights = parse_momentum_weights(raw_weights) if raw_weights else DEFAULT_WEIGHTS

        return cls(
            database_url=database_url,
            github_tokens=tokens,
            rate_budget_per_hour=budget,
            significance_threshold=threshold,
            momentum_signal_weights=weights,
        )
