# R08 — Security — Spec & Plan

## Status of the threat model (`docs/security.md`) going into this phase
Already implemented and tested across R01–R06, not new work here:
- **authentication** — Auth.js credentials, bcrypt, generic error (R01).
- **authorization / broken access control / IDOR** — `authz.ts` (`requireRole`, `assertSameTenant`,
  `requireSelfOrRole`), enforced in every repository and every tool (R01–R06).
- **tenant isolation** — every repository/tool takes `condominiumId` explicitly; integration-tested per feature.
- **prompt injection / indirect prompt injection** — no instruction-following model in the default path;
  `LocalHeuristicProvider` matches fixed patterns only (regression test in R02, extended below).
- **input validation** — Zod on every tool input/output and every form.
- **audit events** — `AgentExecution` traces every turn incl. denials (R02); `Notification.sentByUserId` (R06).
- **secret handling** — `.env` gitignored, `AUTH_SECRET` generated not hardcoded, no secrets in traces/logs.

## New in this phase
1. **Rate limiting** — was not implemented anywhere. Add an in-memory, fixed-window limiter
   (`src/lib/rate-limit.ts`) applied per-actor at the top of `runAgentTurn`. Single-instance only by design (see
   ponytail note in the file) — the free/local deployment target for this portfolio project is one process; a
   distributed limiter (Redis `INCR`+`EXPIRE`) is the documented upgrade path if that ever changes.
2. **`RATE_LIMITED` turn status** — new `AgentTurnStatus` enum value + migration, so a throttled turn is a first-
   class, traced outcome rather than reusing `ERROR` (which would conflate "you're going too fast" with "the
   tool broke").
3. **Security Center page (`/security`)** — manager/admin only. Shows recent `DENIED` and `RATE_LIMITED`
   executions (who, what tool, when) — the audit trail R02–R06 already produce, finally made visible, which is
   the actual point of a "Security Center" screen (HERO.md screen 9).
4. **Consolidated security test note** — this phase doesn't duplicate R01–R06's authz/tenant/injection tests
   (they already exist and pass); it adds the tests for what's actually new (rate limiting) and documents where
   the rest already live, for `docs/release-gates.md`'s "authorization tests / tenant isolation tests / prompt
   injection tests" checkboxes.

## Acceptance criteria
- Exceeding the per-actor limit returns `RATE_LIMITED`, never executes the tool, and is traced.
- A `RESIDENT` cannot view `/security` (redirects/denies — same pattern as the rest of the app).
- The Security Center only ever shows data from the viewer's own condominium.

## Tasks
- [x] `RATE_LIMITED` enum value + migration
- [x] `src/lib/rate-limit.ts` (in-memory fixed window) + unit tests
- [x] Wire into `runAgentTurn`, traced like every other outcome
- [x] `/security` page (MANAGER/ADMIN only), listing denied + rate-limited executions
- [x] Integration test: rate limit trips and is traced; UI access control test

## Converge (2026-09-21)
Status: **converged**. R09 (Quality Center) is next.
