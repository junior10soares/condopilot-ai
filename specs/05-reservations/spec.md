# R05 — Reservations — Spec & Plan

## Purpose
Availability + booking of common areas with real conflict prevention. Second HERO.md demo phrase:
*"Reserve o salão para Carlos amanhã às 19h."*

## Data model
- `CommonArea(id, condominiumId, name)` — seeded: "Salão de Festas".
- `Reservation(id, condominiumId, commonAreaId, userId, startsAt, endsAt, status: CONFIRMED|CANCELLED, note?,
  createdAt, cancelledAt?)`.

## Security decision: booking ownership is never taken from free text
The demo phrase says "para Carlos" (for Carlos). A reservation's `userId` is **always the authenticated actor**,
never a name parsed from text — matching R04's `getMyDebt` precedent and `docs/agent-contract.md`'s "never guess
critical identifiers". "Carlos" is stored as a free-text `note` on the reservation instead. If the manager is
actually booking *on behalf of* a resident, that's a delegated-booking feature for a later phase, not something
a name mention in a sentence should silently grant.

## Conflict prevention
`createReservation` re-checks for an overlapping `CONFIRMED` reservation on the same common area **inside a
`SERIALIZABLE` transaction**, so Postgres itself rejects the loser of two concurrent conflicting bookings with a
serialization failure, which is translated into a `ReservationConflictError` → the tool responds with a business
error rather than a fabricated success. No custom locking code; this is what the isolation level is for.

## Agent tools
1. `checkReservationAvailability` — `minRole: RESIDENT`, no confirmation. Matches "disponibilidade do salão",
   "salão está livre", "posso reservar o salão".
2. `createReservation` — `minRole: RESIDENT`, **`requiresConfirmation: true`** (financial/consequential action
   per `docs/agent-contract.md`). Matches "reserve o salão", "reservar o salão", "quero reservar o salão", and
   extracts a bounded, explainable date/time: `amanhã` → tomorrow, `(\d{1,2})h` → hour, fixed 3-hour duration.
   No match on time/date → falls through to `clarify`, never guesses.
3. `cancelReservation` — `minRole: RESIDENT`, `requiresConfirmation: true`. Owner or `MANAGER`/`ADMIN` only
   (`requireSelfOrRole`).

## Acceptance criteria
- Two concurrent `createReservation` calls for the same overlapping slot: exactly one succeeds.
- `createReservation` never executes without a confirmed second call (inherited from R02's pipeline).
- A resident cannot cancel another resident's reservation; a manager can.
- `LocalHeuristicProvider` resolves *"Reserve o salão para Carlos amanhã às 19h."* to `createReservation` with
  `startsAt` = tomorrow 19:00 — the second and last half of R02's deferred HERO-phrase acceptance criterion.

## Tasks
- [x] `CommonArea` + `Reservation` models, migration, seed (one common area)
- [x] `src/repositories/reservations.ts` (availability check, serializable create, cancel)
- [x] Three agent tools
- [x] `/reservations` page (availability + own reservations + cancel action for managers)
- [x] Unit tests: date/time parser
- [x] Integration tests: conflict prevention (concurrent), confirmation flow, cancel authorization, tenant scope,
      HERO phrase resolution
- [x] E2E: reservations page renders

## Converge (2026-09-21)
Status: **converged**. R06 (Notifications) may proceed.
