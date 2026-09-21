# R09 — Quality Center — Spec & Plan

## Purpose
The screen that presents test status and release-gate progress (HERO.md screen 10), without pretending to run
the full test suite inside a web request.

## Design decision: no live test execution from the app
Shelling out to `vitest`/`playwright` from a page request is slow, fragile under concurrent requests, and not
something a deployed app should do on demand. Instead:
1. **Test counts are computed live and safely** — the page counts `*.test.ts(x)` files under `src/` and
   `*.spec.ts` files under `e2e/`, and counts `it(`/`test(` occurrences in each, via plain `fs` reads (no process
   spawning, no shell). Always accurate, zero risk.
2. **Release-gate pass/fail is a maintained checklist** (`src/quality/gates.ts`), mirroring
   `docs/release-gates.md` — gate status is a judgment call (did CI actually pass, was this manually verified),
   not something inferable from the filesystem. Kept in sync by hand, same discipline as every phase's own
   `checklist.md`.
3. The authoritative, live-executed result is CI (`.github/workflows/ci.yml`) — the page links there rather than
   duplicating it.

## Tasks
- [x] `src/quality/gates.ts` — typed gate list mirroring `docs/release-gates.md`
- [x] `/quality` page: live file/test counts (fs-based) + the gate checklist, grouped like the doc
- [x] Update `docs/release-gates.md` itself to reflect true current status
- [x] Unit test for the counting helper

## Converge (2026-09-21)
Status: **converged**. R10 (Landing) is next.
