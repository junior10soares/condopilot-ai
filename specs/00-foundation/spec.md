# R01 — Foundation — Spec

## Purpose
Provide the multi-tenant base every other feature builds on: auth, condominium (tenant) model, database, design system tokens, and app shell.

## Actors
- **Resident**: belongs to one condominium, limited read access to own data.
- **Manager/Staff**: belongs to one condominium, can manage residents/reservations/notifications for that condominium.
- **Admin**: platform-level, seed/ops only (no cross-tenant UI in v1).

## Requirements
1. Users authenticate with email + password (Auth.js credentials provider, bcrypt hash, JWT session).
2. Every table that stores tenant data has a `condominiumId` column; every query is scoped by it — no query may omit the scope.
3. A user belongs to exactly one condominium and has exactly one role (`RESIDENT`, `MANAGER`, `ADMIN`).
4. Session exposes `userId`, `condominiumId`, `role` — this triple is the sole source of truth for authorization elsewhere.
5. App shell: authenticated layout with sidebar nav (screens from HERO.md), top bar, theme tokens from `docs/design-system.md`.
6. Unauthenticated access to any app route redirects to sign-in.
7. Seed script creates one demo condominium, one manager, one resident, sample data, for local free use.

## Non-goals (v1)
- Multi-condominium membership per user.
- Social login / SSO.
- Self-service signup (accounts are seeded/created by a manager or seed script).

## Acceptance criteria
- Sign in with seeded credentials succeeds; wrong password fails with generic error (no user enumeration).
- Session/JWT carries `condominiumId` + `role`; a helper `getCurrentActor()` is the only way route handlers/tools read identity.
- A Postgres query helper/repository cannot compile or run without a `condominiumId` filter for tenant tables (enforced via repository pattern, tested).
- All app routes under `(app)` require a session.
- Design tokens (colors, typography scale, motion durations) exist as CSS variables / Tailwind theme extension matching `docs/design-system.md`.

## Risks / decisions
- Free choice: Postgres via Docker Compose for local dev (no paid cloud DB required). Production deploy target chosen later with the user (needs an external account — human checkpoint).
