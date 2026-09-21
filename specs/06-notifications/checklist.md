# R06 — Notifications — Checklist

## Engineering
- [x] typecheck / lint / build
- [x] integration: denial+trace (resident broadcasting), clarify-on-empty-body, confirmation flow, per-recipient
      audit fields (`sentByUserId`, one row per resident)
- [x] E2E: manager broadcasts through the real chat UI, resident sees it on `/notifications`, cross-checked with
      a second isolated browser context so the two sessions never share cookies/state

## Security
- [x] `sendBroadcastNotification` is `MANAGER`-only and `requiresConfirmation` (bulk action, material effect)
- [x] every notification is attributable (`sentByUserId`) — audit trail per `docs/security.md`
- [x] no real send anywhere — matches `.env.example`'s "optional integrations, never required for the demo"

## Converge
Status: **converged**. R08 (Security Center) is next.
