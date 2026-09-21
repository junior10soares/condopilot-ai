# R09 — Quality Center — Checklist

## Engineering
- [x] typecheck / lint / build (fixed a Next.js file-tracing warning by marking the intentional whole-tree scan)
- [x] unit tests for `countTests` (against this repo's own real test files — no fixtures needed)
- [x] E2E: manager sees live counts + the grouped gate checklist

## Design
- [x] No live test-runner execution from the app (documented decision in spec.md) — counts are fs-based and
      safe; gate pass/fail is a maintained checklist, same discipline as every phase's `checklist.md`
- [x] `docs/release-gates.md` updated to reflect true current status, not left at all-unchecked

## Fixed while testing
`e2e/security-center.spec.ts` asserted `getByRole("cell", { name: "Carlos Silva" })` with no disambiguation —
after enough repeated local E2E runs against the same dev database, that resolved to multiple rows (every
prior run's denied-action trace is still there) and failed with a strict-mode violation. Added `.first()`
(rows are already ordered newest-first), matching the same fix already applied to `reservations.spec.ts` in R07.

## Converge
Status: **converged**. R10 (Landing) is next.
