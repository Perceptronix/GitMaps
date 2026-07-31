# 03 — `repos` universe core table

**Type:** task
**Status:** ready-for-agent

**What to build:** the central table every tier references. `id` PK (GitHub repo id); `owner`, `name`, `full_name` UNIQUE; metadata (`description`, `topics` array, `language`, `license`, `homepage`, `archived`, `is_fork`); `created_at`, `pushed_at` (the age signal); `tracked` / `surfaced` booleans (the two tiers); `significance_score` + `significance_vars` JSONB (gate result + components, transparency); latest-signal columns (`stars`, `forks`, `watchers`, `open_issues`, `contributors`); lifecycle timestamps (`first_snapshot_at`, `last_snapshot_at`, `surfaced_at`). Indexes on the tier flags. The embedding column and cluster foreign key land additively in tickets 04 and 07 — leave those seams open. This makes discovery→tracking, snapshots, momentum, and layout each reference one row per known repository.

**Blocked by:** 01

- [ ] `repos` exists with the full column set and `id` primary key.
- [ ] `full_name` is unique; `owner` / `name` columns present.
- [ ] `tracked` / `surfaced` booleans with sensible defaults; significance fields present.
- [ ] Indexes on `tracked` and `surfaced` support tier scans.
- [ ] Table is additive-migration-ready for the embedding column (04) and cluster FK (07).
