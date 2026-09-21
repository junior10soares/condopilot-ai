# R02 — Agent Core — Tasks

- [x] `AgentExecution` model + migration
- [x] `Tool` / `ModelProvider` / `PlannerDecision` / `AgentTurnResult` types
- [x] Tool registry (`registerTool`, `getTool`, `listTools`, per-tool matcher)
- [x] `LocalHeuristicProvider` (free, deterministic, no API key)
- [x] Provider selection via `LLM_PROVIDER` (default `local`)
- [x] `runAgentTurn` pipeline: validate → plan → authorize → validate args → confirm → execute → validate result → respond → trace
- [x] Trace recorder (`recordExecution`)
- [x] Example tool (`ping`) proving the pipeline end-to-end
- [x] Unit + integration tests for every pipeline branch

## Deferred to later phases
- Verify `LocalHeuristicProvider` resolves the exact HERO.md demo phrases — needs R04's `getResidentsInDebt`
  and R05's reservation-creation tool to exist; add the assertion when those tools are registered.
- HTTP/UI entry point into `runAgentTurn` — R07 (Agent Playground).
- A real (opt-in) LLM `ModelProvider` implementation — not required for the free portfolio path; the interface
  is ready for it.

## Converge (2026-09-21)
- Typecheck, lint, and the full test suite (25 tests, 6 files) pass; `npm run build` succeeds.
- Design choice beyond the plan: `runAgentTurn` and `recordExecution` take the `PrismaClient` as an explicit
  argument (same pattern as R01's repositories) so integration tests run against the isolated test database
  without touching the dev database.
- Status: **converged**. R03 (Residents) may proceed and will add the first real business tool.
