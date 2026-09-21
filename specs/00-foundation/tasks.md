# R01 — Foundation — Tasks

- [x] Scaffold Next.js + TypeScript + Tailwind app
- [x] ESLint/Prettier/TS strict config
- [x] Docker Compose Postgres for local dev
- [x] Prisma schema (Condominium, User, Role) + migration
- [x] Auth.js credentials provider + JWT session + `getCurrentActor()`
- [x] `authz.ts` policy helpers
- [x] Repository pattern base (`condominiumId` required)
- [x] Design tokens (CSS vars) + Tailwind theme extension
- [x] App shell layout (sidebar/topbar) + sign-in page
- [x] Seed script
- [x] Vitest setup + first unit/integration tests
- [x] Playwright setup + sign-in E2E
- [x] CI workflow updated to run all of the above

## Analyze note
No open ambiguities material to architecture/security/UX/cost were found — proceeding without a clarification round. Production DB/host choice is deferred to a human checkpoint before deploy (see spec.md Risks).

## Converge (2026-09-21)
- Typecheck, lint, unit (4), component (2) and integration (7) tests pass; `npm run build` succeeds; all 3 Playwright E2E scenarios pass locally.
- Notable implementation decisions beyond the plan:
  - Next.js 16 renamed the middleware convention to `proxy.ts` — followed that instead of `middleware.ts`.
  - `auth.config.ts` (edge-safe) vs `auth.ts` (Node/Prisma) split, required because `proxy.ts` runs on the Edge runtime and can't import Prisma.
  - `trustHost: true` added — required for a self-hosted deployment (not Vercel) or Auth.js rejects the request host.
  - Repository functions take the Prisma client as an explicit argument (not the app singleton) so they can be exercised against an isolated `condopilot_test` database in integration tests.
  - One high-severity dependency finding (`deepmerge-ts` via the Prisma CLI peer dependency) documented with disposition in `docs/security.md` — no runtime exposure, CI audit only blocks on critical.
- Status: **converged**. R02 (Agent Core) may proceed.
