# R07 — Agent Playground — Spec & Plan

## Purpose
The one screen that makes R02–R05 visible: a chat UI over `runAgentTurn`, with a confirmation step for
consequential actions and a compact per-turn execution trace (tool, status, latency) — the "agent execution
trace" HERO.md calls out as its own screen is covered here inline rather than as a separate page, to avoid
building two UIs for the same seven fields; R08's Security Center is the place for a cross-conversation trace
list.

## Reordering note
The roadmap lists R06 (Notifications) before R07. Implementing R07 first instead: the agent backend (R02–R05)
has been fully working and tested for two phases with zero UI to show for it — that's the single largest gap
in the portfolio demo right now, and notifications don't depend on it. R06 follows immediately after.

## Requirements
1. `sendAgentMessage` server action wraps `runAgentTurn(db, actor, ...)` — the app's real Prisma singleton, real
   `getCurrentActor()`. No new authorization path; it's the same pipeline R02–R05 already tested.
2. Chat UI: message list (user + agent turns), text input, send button, loading state while awaiting a turn.
3. `PENDING_CONFIRMATION` turns render an inline confirm/cancel card — confirming resends the exact `{tool,
   args}` pair the server returned (never re-parses the original text), cancelling drops it.
4. Every agent turn shows a compact trace line: tool name (or "—" for clarify/error), status badge, and the
   turn's response message.
5. Loading, empty, and error states; keyboard-operable (native form + buttons); reduced-motion respected
   (existing global CSS rule already covers this — no per-component motion added here).

## Tasks
- [x] `sendAgentMessage` server action
- [x] Chat UI (message list, input, confirmation card, trace line, status badges)
- [x] `/agent` page wired to it, replacing the placeholder
- [x] E2E: both HERO.md demo phrases typed into the real chat UI, end to end (including the confirmation click
      for the reservation)

## Converge (2026-09-21)
Status: **converged**. R06 (Notifications) is next.
