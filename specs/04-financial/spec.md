# R04 — Financial — Spec & Plan

## Purpose
Delinquency lookup with a real financial-visibility rule: residents see only their own charges; only
managers/admins can see who else owes money. This is the first HERO.md demo phrase:
*"Quais moradores estão inadimplentes?"*

## Data model
`Charge(id, condominiumId, userId, description, amountCents, dueDate, paidAt?)`. Delinquent = has at least one
charge with `dueDate < now` and `paidAt == null`.

## Requirements
1. `listChargesForUser(db, condominiumId, userId)` — a resident's own charges (paid + unpaid).
2. `listResidentsInDebt(db, condominiumId)` — manager view: every resident with at least one overdue unpaid
   charge, plus total owed.
3. Agent tool `getResidentsInDebt` — **`minRole: MANAGER`**. A resident asking this is denied (and the denial is
   traced — this is the R08 Security Center's first real example). Matches "inadimplente", "devendo", "atraso
   no pagamento", "quem está devendo".
4. Agent tool `getMyDebt` — `minRole: RESIDENT`, always scoped to `actor.userId` regardless of what the model
   "hears" (no id ever comes from parsed text) — matches "minha dívida", "eu devo", "meus boletos".
5. `/billing` page: managers see the full delinquency table; residents see only their own charge history.

## Acceptance criteria
- A `RESIDENT` actor cannot retrieve any other resident's financial data through the UI or the agent, full stop.
- `getResidentsInDebt` triggered by a resident returns `DENIED`, traced.
- `LocalHeuristicProvider` resolves *"Quais moradores estão inadimplentes?"* to `getResidentsInDebt` — the R02
  acceptance criterion deferred here is now satisfied for this half of the HERO demo (unit test added).

## Tasks
- [x] `Charge` model + migration + seed data (some paid, some overdue, across both demo users)
- [x] `src/repositories/charges.ts`
- [x] `getResidentsInDebt` tool (MANAGER) + `getMyDebt` tool (RESIDENT, self-scoped)
- [x] `/billing` page (role-aware view)
- [x] Unit/integration tests: tenant + role scoping, HERO phrase resolution, denial-and-trace for a resident
- [x] E2E: manager asks the agent... (deferred to R07, same as R02 — no chat UI yet); E2E covers the `/billing`
      page directly instead

## Converge (2026-09-21)
Status: **converged**. R05 (Reservations) may proceed.
