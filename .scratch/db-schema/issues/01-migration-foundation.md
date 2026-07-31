# 01 — Migration foundation

**Type:** task
**Status:** ready-for-agent

**What to build:** the mechanism every table lands on — a versioned, idempotent migration runner that the worker applies at boot, with a tracking table recording applied migrations. Any migration must apply cleanly from an empty database and re-run safely on a live one (idempotent). Schema changes are additive migrations only; a shipped migration is immutable. This is what makes every later schema ticket safe to land incrementally.

**Blocked by:** None — can start immediately.

- [ ] A fresh database applies migrations in order and records each in the tracking table.
- [ ] Re-running the runner on an already-migrated database is a no-op and exits cleanly.
- [ ] Two appliers booting concurrently do not race (locking or single-applier semantics).
- [ ] A failed migration aborts without partial application and reports clearly.
- [ ] The runner reports which migrations applied / are pending.
- [ ] Documented convention: additive migrations only; shipped migrations are immutable.
