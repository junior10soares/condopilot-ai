# R06 — Notifications — Spec & Plan

## Purpose
Notification **simulation** (never a real send — no paid provider required, matches `.env.example`'s optional,
never-required WhatsApp/email integrations) plus an audit trail of what was "sent", to whom, and by whom.

## Data model
`Notification(id, condominiumId, recipientUserId, channel, subject, body, sentByUserId, sentAt)`.
`channel` is a free-text label (e.g. `"EMAIL"`) — there is no real transport, so no channel-specific config.

## Requirements
1. `sendBroadcastNotification` agent tool — `minRole: MANAGER` (bulk action affecting every resident),
   **`requiresConfirmation: true`** (bulk operation with side effects, per `docs/agent-contract.md`). Creates one
   `Notification` row per resident in the condominium. Matches phrasing like "avisar os moradores sobre <texto>"
   / "notificar moradores: <texto>" — the captured `<texto>` becomes the body; no match on a non-empty body →
   `clarify` (never sends an empty/guessed notification).
2. `/notifications` page: managers see everything sent in the condominium (recipient, body, when); residents see
   only notifications addressed to them.

## Acceptance criteria
- A resident cannot trigger `sendBroadcastNotification` (denied + traced, same pattern as R04's
  `getResidentsInDebt`).
- Every notification row records who sent it (`sentByUserId`) — auditable, per `docs/security.md`.
- A resident's `/notifications` view never includes another resident's notification.

## Tasks
- [x] `Notification` model + migration
- [x] `src/repositories/notifications.ts`
- [x] `sendBroadcastNotification` agent tool
- [x] `/notifications` page (role-aware)
- [x] Unit/integration tests: denial+trace, tenant isolation, per-recipient audit fields
- [x] E2E: manager broadcasts via the agent chat, resident sees it in their own notifications page

## Converge (2026-09-21)
Status: **converged**. R08 (Security Center) is next.
