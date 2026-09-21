# R02 — Agent Core — Checklist

## Engineering
- [x] typecheck
- [x] lint
- [x] unit tests (tool-registry, local-heuristic provider)
- [x] integration tests (full pipeline against isolated test DB — 7 scenarios)
- [x] agent/tool tests (denial, confirmation, clarify-on-bad-args, error handling)
- [ ] E2E — deferred to R07 (Agent Playground), which gives the pipeline an HTTP/UI entry point

## Security
- [x] every tool call schema-validated before execution
- [x] authorization enforced in the pipeline (`requireRole`), independent of what the planner "decided"
- [x] confirmation required, and re-validated server-side, for tools marked `requiresConfirmation`
- [x] tool failures never surface as a fabricated success (explicit test)
- [x] prompt-injection-style input falls through to `clarify` (no instruction-following model in the default path)
- [x] every turn (success/denied/clarify/error/pending) produces exactly one trace row, tenant-scoped

## Spec
- [x] spec/plan/tasks written before implementation
- [x] no open ambiguities blocking this phase
- [ ] HERO.md demo-phrase acceptance criterion — deferred: verified once R04 (financial) and R05
      (reservations) register the real tools those phrases target; tracked in tasks.md
- [x] converge check below
