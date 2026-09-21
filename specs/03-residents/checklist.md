# R03 — Residents — Checklist

## Engineering
- [x] typecheck / lint
- [x] unit tests (`maskEmail`, `presentResidentsForActor`)
- [x] component test (`DataTable`)
- [x] integration tests (`listResidents` tool via pipeline, both roles, isolated test DB)
- [x] E2E (manager sees directory with real emails)

## Security
- [x] tenant isolation inherited from R01's `listUsersForCondominium` (condominiumId required)
- [x] privacy rule enforced in one shared function (`presentResidentsForActor`), used by both the page and the
      agent tool — no duplicate/divergent masking logic
- [x] agent tool output schema deliberately excludes email (least data exposure through the agent path)

## UX
- [x] empty state for a condominium with no residents
- [x] responsive table (`overflow-x-auto`)

## Architecture note
While building this phase, refactored `Tool.execute` to take `{ db }` as an explicit first argument (same
Prisma-client-injection pattern as R01 repositories) instead of importing the app singleton — R02's `ping` tool
was reading from the dev database even when the pipeline was tracing to the test database. Fixed before more
tools could inherit the same inconsistency.

## Converge
Status: **converged**. R04 (Financial) may proceed.
