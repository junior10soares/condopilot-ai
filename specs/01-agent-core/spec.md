# R02 — Agent Core — Spec

## Purpose
The runtime that lets the agent act: a fixed pipeline (validate → context → intent → policy → tool → validate
result → respond → trace), a typed tool registry, and a swappable model adapter. No tool call ever bypasses
authorization; no model output is trusted without schema validation. This is infrastructure — R03+ register the
actual business tools (residents, financial, reservations, notifications) into the registry built here.

## Requirements
1. **Tool contract**: every tool declares a Zod input schema, a Zod output schema, a `minRole`, whether it
   requires confirmation, and an `execute(actor, args)` function. A tool cannot be registered without all of these.
2. **Pipeline** (`runAgentTurn`): raw user text → zod-validate the turn request → build context (actor, recent
   trace) → intent/planner selects a registered tool + args (or asks a clarifying question, or answers directly
   with no tool) → policy check (`requireRole` + tenant scope, from R01's `authz.ts`) → tool executes → tool
   output is validated against its own output schema → response composed → execution persisted as a trace.
3. **Model abstraction**: a `ModelProvider` interface with one implementation shipped by default —
   `LocalHeuristicProvider`, a deterministic, free, no-API-key pt-BR intent matcher. `LLM_PROVIDER=local` (the
   default) selects it. The interface is designed so an OpenAI-compatible provider can be added later without
   touching the pipeline.
4. **Confirmation**: a tool marked `requiresConfirmation` never executes on the first pass — the pipeline returns
   a `pending_confirmation` turn result; a second call with `confirmed: true` (same conversation) is required to
   execute.
5. **Ambiguity**: if the planner cannot map the input to a registered tool with enough arguments, the pipeline
   returns a `clarify` result (a question), never guesses identifiers/dates/amounts.
6. **Untrusted input**: user text and any tool output are data, never instructions — the planner's tool-selection
   logic runs on fixed pattern rules (v1), not by feeding user text into an unconstrained prompt that could be
   redirected ("ignore previous instructions" has no effect because there is no instruction-following LLM in the
   default path).
7. **Trace**: every turn persists an `AgentExecution` row: id, actor (userId/condominiumId), input (sanitized),
   matched intent, tool name + args (sanitized — no secrets), tool result status, latency, error classification
   if any. No secrets or full stack traces stored.
8. **Failure handling**: invalid args → reject before execution; authorization failure → deny + trace; tool
   throws → controlled error turn result + trace, never a fabricated success.

## Non-goals (v1)
- Real LLM wired by default (adapter exists, provider is opt-in via env).
- Multi-turn memory beyond the current conversation's confirmation state.
- Streaming token-by-token output (R07 can simulate progressive reveal client-side).

## Acceptance criteria
- A tool cannot be called without its Zod input schema validating first.
- A `RESIDENT`-role actor cannot trigger a tool whose `minRole` is `MANAGER` — pipeline returns a denial, and a
  trace row records the denial (for R08's Security Center).
- A tool marked `requiresConfirmation` never runs without an explicit confirmed follow-up turn.
- Unrecognized input returns a `clarify` result, never a fabricated tool call.
- Every turn (success, denial, clarify, error) produces exactly one `AgentExecution` trace row.
- `LocalHeuristicProvider` correctly resolves the two HERO.md demo phrases to intents in a unit test.
