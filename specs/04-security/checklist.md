# R08 — Security — Checklist

## Engineering
- [x] typecheck / lint / build
- [x] unit: `checkRateLimit` (per-key isolation, window reset via fake timers)
- [x] integration: rate limit trips at the configured threshold and is traced
- [x] E2E: resident blocked from `/security`; manager sees a real denied event after a resident tries a
      manager-only tool through the actual chat UI

## Security (release-gates.md checkboxes, with where each lives)
- [x] authorization tests — `src/lib/authz.test.ts` (R01) + every feature's integration tests (R03–R08)
- [x] tenant isolation tests — `src/repositories/users.integration.test.ts` (R01) + per-feature tests (R03–R08)
- [x] prompt injection tests — `src/agent/providers/local-heuristic.test.ts` (R02)
- [x] rate-limit tests — this phase
- [x] sensitive-log review — traces store zod-validated business args only (`src/agent/trace.ts`); no passwords,
      tokens or secrets anywhere in the codebase log/trace paths (manually re-checked while building this page)

## New this phase
- [x] `RATE_LIMITED` as a first-class, traced `AgentTurnStatus`
- [x] `/security` page, MANAGER/ADMIN only, surfacing denied + rate-limited executions with the actor's name

## Converge
Status: **converged**. R09 (Quality Center) is next.
