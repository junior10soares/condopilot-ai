# R01 — Foundation — Checklist

## Engineering
- [x] typecheck
- [x] lint
- [x] unit tests (authz policies)
- [x] component tests (sign-in form)
- [x] integration tests (tenant isolation, credential verification against isolated test DB)
- [x] E2E (sign-in, wrong password, sign-out, unauthenticated redirect)
- [ ] smoke test script (deferred to R11 — needs the seeded multi-feature environment to be meaningful)

## Security
- [x] passwords hashed (bcrypt), never logged
- [x] generic sign-in error (no user enumeration)
- [x] session carries `condominiumId` + `role`; single `getCurrentActor()` read path
- [x] `authz.ts` policy helpers with unit coverage
- [x] repositories require an explicit `condominiumId`/tenant scope argument
- [x] unauthenticated app routes redirect (`proxy.ts` + defense-in-depth check in `(app)/layout.tsx`)
- [x] dependency audit run; one high finding documented (docs/security.md)
- [x] secret scanning wired into CI (gitleaks)
- [ ] rate limiting — not applicable yet (no public mutation endpoints until R05/R06)

## UX
- [x] responsive (tested at mobile width)
- [x] keyboard accessible (native form controls, visible focus ring)
- [x] reduced-motion respected (global media query)
- [x] loading state (pending sign-in button)
- [x] empty states (placeholder nav pages)
- [x] error states (sign-in form)

## Spec
- [x] spec/plan/tasks written before implementation
- [x] no open ambiguities blocking this phase
- [x] tasks complete
- [x] converge check below
