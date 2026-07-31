# 09 — Schema integration verification

**Type:** task
**Status:** ready-for-agent

**What to build:** the finish line that proves the whole tier correct before any worker/API feature builds on it. Apply every migration from an empty database; re-run idempotently on a populated one with data intact; seed a fixture that exercises all six tables (one repository through `candidates` → `repos` → `snapshots` → `momentum_scores` → `clusters` → `ingestion_state`); run sanity queries — ANN nearest-by-cosine, a growth-series read, a momentum ranking read, a candidates queue scan. This is the tier's "demoable on its own" marker.

**Blocked by:** 02, 03, 04, 05, 06, 07, 08

- [ ] Fresh database bootstraps all tables and indexes from empty.
- [ ] Idempotent re-run on a populated database leaves data intact.
- [ ] Fixture spanning all six tables seeds and reads back correctly.
- [ ] Sanity queries pass: ANN nearest-by-cosine, growth series, momentum ranking, queue scan.
- [ ] A failing migration aborts cleanly with a clear message.
