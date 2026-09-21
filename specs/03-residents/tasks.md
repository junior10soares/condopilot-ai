# R03 — Residents — Plan & Tasks

(Combined plan+tasks from here on — the spec-driven pattern is established; a separate plan.md per small
feature is process overhead without added signal at this scale.)

## Plan
- `src/lib/privacy.ts` — `maskEmail(email)`, `presentResidentsForActor(actor, residents)` (self/manager see
  real email, everyone else sees it masked). Pure functions — unit-testable without a DB.
- `src/components/ui/data-table.tsx` — minimal semantic `<table>` wrapper (no new dependency; matches
  design-system.md's `DataTable` component requirement without pulling in a table library for one list).
- `src/app/(app)/residents/page.tsx` — replaces the R01 placeholder; server component, `getCurrentActor()` +
  `listUsersForCondominium` (from R01) + `presentResidentsForActor`.
- `src/agent/tools/list-residents.tool.ts` — wraps the same repository + privacy function.

## Tasks
- [x] `maskEmail` / `presentResidentsForActor` + unit tests
- [x] `DataTable` component
- [x] Residents page (real data, masked emails)
- [x] `listResidents` agent tool + matcher
- [x] Integration test: resident sees masked emails, manager sees real ones
- [x] Component test for the residents page
- [x] E2E: manager signs in, sees the resident directory with real emails

## Converge (2026-09-21)
- Typecheck, lint, full test suite, build and E2E all pass (see commit).
- Status: **converged**. R04 (Financial) may proceed.
