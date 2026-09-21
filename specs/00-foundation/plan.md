# R01 — Foundation — Plan

## Stack decisions (free-tier friendly)
- Next.js 15 (App Router), TypeScript, React 19.
- Tailwind CSS v4 for styling; design tokens as CSS variables consumed by Tailwind theme.
- PostgreSQL via Docker Compose for local dev (`docker-compose.yml`), Prisma as ORM/migrations.
- Auth.js (NextAuth v5) — Credentials provider, bcrypt, JWT session strategy (no external auth SaaS).
- Zod for all input/output schema validation (forms, API routes, tool schemas later).
- Vitest + Testing Library for unit/component/integration; Playwright for E2E.
- ESLint + Prettier + TypeScript strict mode.
- No paid services anywhere in the default path. `.env.example` documents optional paid integrations as opt-in only.

## Data model (Prisma, initial)
- `Condominium(id, name, createdAt)`
- `User(id, condominiumId, name, email, passwordHash, role, createdAt)`
- Role enum: `RESIDENT | MANAGER | ADMIN`
- Unique index on `email`.
- Every future tenant table (Resident profile extensions, Reservation, Notification, AgentExecution, etc.) carries `condominiumId` with an index.

## Layers
- `src/lib/db.ts` — Prisma client singleton.
- `src/lib/auth.ts` — Auth.js config + `getCurrentActor()` helper (reads session -> `{ userId, condominiumId, role }`).
- `src/lib/authz.ts` — tiny policy helpers (`requireRole`, `assertSameTenant`) reused by every future tool/service — this is the seam R08 (Security) builds on.
- `src/repositories/*` — one file per entity; every read/write function takes `condominiumId` as a required first argument (compile-time guardrail against cross-tenant leaks).
- `src/app/(auth)/sign-in` — sign-in page.
- `src/app/(app)/layout.tsx` — authenticated shell (sidebar, topbar), redirects to sign-in if no session.
- `src/styles/tokens.css` — design tokens from `docs/design-system.md`.

## Seed
- `prisma/seed.ts`: 1 condominium ("Residencial Aurora"), 1 manager (manager@condopilot.demo), 1 resident (carlos@condopilot.demo), password `Demo@123` for both (documented only in README/demo docs, never real credentials).

## Test plan
- Unit: `authz.ts` policy helpers (deny cross-tenant, deny wrong role).
- Integration: repository functions reject/ignore calls without `condominiumId`; sign-in flow against test DB.
- Component: sign-in form validation + error states.
- E2E: sign in -> land on dashboard -> sign out.

## Out of scope here
LLM/agent runtime (R02), business screens (R03+) — foundation only provides the shell and auth they mount into.
