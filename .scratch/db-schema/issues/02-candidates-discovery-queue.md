# 02 — `candidates` discovery queue

**Type:** task
**Status:** ready-for-agent

**What to build:** the table backing the discovery stage — `full_name` PK, `discovered_at`, `source`, `last_checked_at`, `screen_score`, `status` (`pending` | `tracked` | `rejected`), plus an index on `(status, last_checked_at)` for the worker's "what still needs screening" scan. This lets discovery enqueue candidate repos, screen them, and record promotion/rejection without touching any other table.

**Blocked by:** 01

- [ ] `candidates` exists with the full column set and `full_name` primary key.
- [ ] A uniqueness rule prevents duplicate enqueues of the same repository.
- [ ] Index on `(status, last_checked_at)` supports the pending-screening scan.
- [ ] Migration applies cleanly on fresh and existing databases.
