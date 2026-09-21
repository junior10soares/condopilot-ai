# Claude Code Workflow

## First session

1. Inspect the repository.
2. Read `CLAUDE.md`.
3. Read `HERO.md`.
4. Read `docs/architecture.md`, `docs/security.md`, `docs/testing-strategy.md`.
5. Check current Spec Kit state.
6. Do not implement until the applicable spec is approved.

## Feature cycle

Use:

`/speckit.specify`
`/speckit.clarify`
`/speckit.plan`
`/speckit.checklist`
`/speckit.tasks`
`/speckit.analyze`
`/speckit.implement`
`/speckit.converge`

Repeat implementation and convergence when gaps remain.

## Review prompts

After implementation, ask Claude Code to:
- review authorization;
- review tool boundaries;
- review tenant isolation;
- review error handling;
- review logs for sensitive data;
- review tests for missing edge cases;
- run the complete quality gate.

## Human checkpoints

The human owner approves:
- architectural trade-offs;
- new external services;
- production secrets;
- destructive migrations;
- production deployment;
- public release.
