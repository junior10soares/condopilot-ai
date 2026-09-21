# Test Report

Generated 2026-09-21, from an actual local run of the full suite (not estimated). Regenerate before any
release with `npm run test:ci` and `npm run test:e2e`; live counts are also always visible at `/quality` after
signing in.

## Summary

| Layer                          | Tool       | Files | Cases | Result      |
| ------------------------------ | ---------- | ----- | ----- | ----------- |
| Unit / component / integration | Vitest     | 18    | 61    | all passing |
| E2E (incl. smoke)              | Playwright | 10    | 17    | all passing |

Counted directly (`find` + `grep`, matching `src/quality/count-tests.ts`'s own method) rather than estimated —
re-run the same commands, or check `/quality` after signing in, to reproduce these numbers.

## Coverage by area

- **Foundation (R01)**: sign-in flow, password verification, tenant-scoped repository access, authz policy
  helpers (deny by role, deny cross-tenant, self-or-role).
- **Agent core (R02)**: tool registry (duplicate registration, lookup), local heuristic provider (matching,
  clarify fallback, prompt-injection-style input rejected), full pipeline (success, denial+trace, clarify,
  confirmation required→executed, tool exceptions never surfacing as success) — against an isolated test
  database, never the dev database.
- **Residents (R03)**: email masking rules, resident-directory tool, tenant + role scoping.
- **Financial (R04)**: delinquency tool (manager-only, denied+traced for a resident), self-scoped debt lookup,
  the exact HERO.md phrase _"Quais moradores estão inadimplentes?"_ resolved end-to-end.
- **Reservations (R05)**: date/time parsing (never guesses), availability, **3-way concurrent booking race** —
  exactly one winner under a real Postgres `SERIALIZABLE` transaction — confirmation flow, cancel authorization,
  the exact HERO.md phrase _"Reserve o salão para Carlos amanhã às 19h."_ resolved end-to-end.
- **Notifications (R06)**: broadcast tool (manager-only, denied+traced), clarify-on-empty-body, per-recipient
  audit fields.
- **Agent Playground (R07)**: both HERO.md phrases driven through the real chat UI end-to-end, including the
  confirmation click; unrecognized input never fabricates a tool call.
- **Security (R08)**: rate limiter (per-key isolation, window reset), a tripped limit is traced; resident
  blocked from the Security Center; a real denied event produced by an actual chat attempt shows up there.
- **Quality Center (R09)**: live test-file/case counting against this repository's own files.
- **Landing (R10)**: hero + demo mockup render; a signed-in visitor is redirected away from `/`.
- **Final demo (R11)**: `/api/health` + sign-in + one full agent turn, driven exactly as
  `docs/testing-strategy.md`'s Smoke section describes; a mobile-viewport pass for layout sanity.

## What's intentionally not covered

- API/contract tests: n/a — no public external API surface at this stage.
- A real (non-local) LLM provider: not wired by default (see `docs/architecture.md`), so there's nothing to
  test against; the `ModelProvider` interface exists for one to be added later.
