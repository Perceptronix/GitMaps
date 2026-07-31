# 08 — `ingestion_state` job/budget state

**Type:** task
**Status:** ready-for-agent

**What to build:** the worker's coordination state, keyed key/value. Rows for job last-run watermarks, the rolling per-hour GitHub rate budget, `embedding_model_version`, and `layout_version`. This is how the worker's jobs stay idempotent, throttle against the API budget, and stay version-aware through the database — the single shared runtime channel between the worker and the API.

**Blocked by:** 01

- [ ] Key/value table with a natural primary key on the key.
- [ ] All documented keys representable: watermarks, rate budget, `embedding_model_version`, `layout_version`.
- [ ] Read/write semantics safe under the worker's single-writer model.
- [ ] Migration applies cleanly on fresh and existing databases.
