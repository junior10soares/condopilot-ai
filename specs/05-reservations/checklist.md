# R05 — Reservations — Checklist

## Engineering
- [x] typecheck / lint
- [x] unit (`parseReservationTime`, 5 scenarios incl. never guessing an out-of-range hour)
- [x] integration — repository: availability, single conflict, **3-way concurrent conflict** (exactly 1 of 3
      succeeds), tenant-scoped
- [x] integration — agent tools: HERO phrase → `PENDING_CONFIRMATION` → confirm → booked; clarify-not-guess when
      time is missing; availability check; self-scoped cancel with its own confirmation step
- [x] E2E (reservations page renders with the seeded common area)

## Security
- [x] booking ownership (`userId`) is always `actor.userId` — the demo's "para Carlos" is stored as a free-text
      `note`, never used to redirect who the reservation belongs to (documented decision in spec.md)
- [x] `createReservation` and `cancelMyReservation` both require confirmation (consequential actions)
- [x] cancel-by-UI enforces `requireSelfOrRole(actor, reservation.userId, "MANAGER")` — a resident cannot cancel
      someone else's booking, a manager can
- [x] conflict prevention is a real Postgres `SERIALIZABLE` transaction, not an app-level check-then-write race

## Spec
- [x] R02's deferred acceptance criterion is now fully satisfied: both HERO.md demo phrases resolve correctly
      end-to-end (delinquency in R04, reservation here)

## Converge
Status: **converged**. R06 (Notifications) may proceed.
