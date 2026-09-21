# R04 — Financial — Checklist

## Engineering
- [x] typecheck / lint
- [x] unit (`matchesAny`)
- [x] integration (HERO phrase resolution, denial+trace, self-scoping, tenant isolation) — 6 scenarios
- [x] E2E (manager delinquency table, resident own-history view)

## Security
- [x] financial visibility rule enforced by `minRole: MANAGER` on `getResidentsInDebt` — a resident asking is
      `DENIED` and the denial is traced (first concrete example for R08's Security Center)
- [x] `getMyDebt` is hard-scoped to `actor.userId` server-side — no user id is ever taken from parsed text
- [x] found and fixed a real bug while writing these tests: JS regex `\b` does not treat accented letters (á, í,
      ã) as word characters, so `/\binadimplent\b/`-style patterns silently never matched real pt-BR input
      (including "está aí" in R02's own `ping` tool, and "moradores do condomínio" in R03). Replaced every
      tool matcher with substring matching (`src/agent/match.ts`) instead of regex word boundaries.

## Spec
- [x] R02's deferred acceptance criterion — *"LocalHeuristicProvider resolves the HERO.md demo phrases"* — is
      now satisfied for the delinquency phrase (test: `financial.tool.integration.test.ts`). The reservation
      phrase remains deferred to R05.

## Converge
Status: **converged**. R05 (Reservations) may proceed.
