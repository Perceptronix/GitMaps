# 06 — `momentum_scores` materialized rankings

**Type:** task
**Status:** ready-for-agent

**What to build:** the materialized, decomposed Momentum score per period. `repo_id` FK; `period` (`1d` | `7d` | `30d`); `computed_at`; `score`; `decomposition` JSONB (per-signal contributions plus age and size normalization factors — the ADR-0002 transparency requirement); `rank` INT. Index `(period, computed_at, score DESC)` for ranking reads; `(repo_id, period)` for the latest-score lookup. Upsert semantics: the latest `computed_at` per `(repo_id, period)` serves reads, so a re-run of the day's compute replaces that day's rows without duplicates. Trending, Fast-growing, node size, and the analytics breakdown all read from here.

**Blocked by:** 03

- [ ] `momentum_scores` exists with full column set; PK on `(repo_id, period, computed_at)`.
- [ ] `(period, computed_at, score DESC)` index supports rank queries.
- [ ] Latest-row-per-`(repo_id, period)` lookup is efficient via the `(repo_id, period)` index.
- [ ] Upsert works: re-running a day's compute replaces that day's rows without duplicates.
- [ ] `decomposition` JSONB stores per-signal contributions.
