# R11 — Final Demo — Spec & Plan

## Purpose
The deliverables `CLAUDE.md`'s "Demo requirement" lists: working demo, polished landing (R10, done),
screenshots, architecture diagram, test report, security report, demo video, GitHub-ready README — everything
achievable without a human at the keyboard, produced honestly from what actually exists and actually passes.

## What's produced here, and how, without fabricating anything
1. **Health endpoint + smoke test** — closes the one remaining release gate (`docs/release-gates.md`'s "smoke
   tests"). `/api/health` checks DB connectivity; `scripts/smoke-test.mjs` drives it plus sign-in, one agent
   turn and one tool execution against a running instance, per `docs/testing-strategy.md`'s Smoke section.
2. **Architecture diagram** — a Mermaid diagram in `docs/architecture.md`, which GitHub renders natively from a
   markdown code fence. No external diagramming tool, no image asset to keep in sync.
3. **Screenshots** — a Playwright script (not a test — nothing to assert) signs in and captures every real page
   (landing, sign-in, dashboard, agent with a real HERO.md exchange, residents, billing, reservations,
   notifications, security, quality), saved to `docs/screenshots/`. Real rendered pages, not mockups.
4. **Test report** (`docs/test-report.md`) and **security report** (`docs/security-report.md`) — written from
   this session's actual verified runs and the security posture already documented across R01–R09, not
   re-derived or estimated.
5. **Demo video** — Playwright's built-in video recording, driving the exact `docs/demo-script.md` scenes
   against the real app, saved as a `.webm`. This is a real automated walkthrough of the real product; it has
   no voice-over (nothing here can add narration) — noted as a gap for the user if they want a narrated version.
6. **Mobile sanity check** — a Playwright run at a phone viewport asserting no horizontal overflow and that key
   controls stay reachable, closing that UX gate.
7. **README polish + LICENSE** — MIT (standard, permissive, no controversy for a portfolio project); confirms
   the README's setup steps are still accurate end-to-end.

## Explicitly not attempted here (needs the human)
- Deploying anywhere public (new external service/account — a human checkpoint per `docs/claude-workflow.md`).
- A narrated/edited version of the demo video.
- Choosing a different license than MIT, if the user wants something else.

## Converge (2026-09-21)
Status: converged once the tasks below are checked off and the full suite (unit/integration/E2E/smoke) passes.
