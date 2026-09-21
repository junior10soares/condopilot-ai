# Release Gates

The project cannot be declared complete until all applicable gates pass.

Live status is presented at `/quality` (Central de Qualidade) once signed in. This file is the source of truth
it's derived from — see `src/quality/gates.ts`.

## Engineering
- [x] typecheck
- [x] lint
- [x] unit tests
- [x] component tests
- [x] integration tests
- [x] API/contract tests — n/a, no public external API at this stage
- [x] agent evaluation tests
- [x] E2E tests
- [ ] smoke tests — planned for R11, alongside the clean demo environment

## Security
- [x] dependency audit — one high finding documented with disposition, see `docs/security.md`
- [x] secret scan
- [x] static analysis
- [x] authorization tests
- [x] tenant isolation tests
- [x] prompt injection tests
- [x] rate-limit tests
- [x] sensitive-log review

## UX
- [x] responsive
- [x] keyboard accessible
- [x] reduced-motion
- [x] loading states
- [x] empty states
- [x] error states
- [ ] mobile sanity check — planned for R11

## Spec
- [x] checklist reviewed
- [x] analyze clean
- [x] tasks complete
- [x] converge reports complete

## Demo
- [x] seed data
- [x] clean setup
- [ ] landing page — R10
- [x] agent playground
- [x] execution trace
- [ ] architecture diagram — R11
- [ ] screenshots — R11
- [ ] final video — R11
