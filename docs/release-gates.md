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
- [x] smoke tests — `/api/health` + sign-in + one agent turn, `e2e/smoke.spec.ts`

## Security

- [x] dependency audit — 0 vulnerabilities (`npm audit`); one prior high finding fixed via override, see `docs/security.md`
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
- [x] mobile sanity check — `e2e/mobile-sanity.spec.ts`, 390px viewport, no horizontal overflow

## Spec

- [x] checklist reviewed
- [x] analyze clean
- [x] tasks complete
- [x] converge reports complete

## Demo

- [x] seed data
- [x] clean setup
- [x] landing page
- [x] agent playground
- [x] execution trace
- [x] architecture diagram — Mermaid in `docs/architecture.md`
- [x] screenshots — `docs/screenshots/`
- [x] final video — `docs/demo-video/demo.webm` (automated walkthrough, no narration)

All gates applicable to this stage are green.
