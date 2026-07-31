# 05 — `snapshots` growth time-series

**Type:** task
**Status:** ready-for-agent

**What to build:** the growth series that Momentum and analytics run on. `repo_id` FK; `taken_at`; `kind` (`core` | `deep`); core signal columns (`stars`, `forks`, `watchers`, `open_issues`); deep columns (`contributors`, `commit_activity` JSONB). `UNIQUE(repo_id, taken_at, kind)` so a repository gets at most one core and one deep point per timestamp; index `(repo_id, taken_at DESC)` for series reads; index on `kind` for cadence scans. This is what makes the tiered daily/weekly snapshot cadence (architecture D-03) storable and growth charts + momentum inputs possible.

**Blocked by:** 03

- [ ] `snapshots` exists with the full column set and primary key.
- [ ] `UNIQUE(repo_id, taken_at, kind)` enforced.
- [ ] `(repo_id, taken_at DESC)` index supports series queries; `kind` index supports cadence scans.
- [ ] Foreign key to `repos` with defined delete behavior.
