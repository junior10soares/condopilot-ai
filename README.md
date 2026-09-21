# CondoPilot AI

> An AI agent that doesn't just answer. It acts.

CondoPilot AI is a portfolio-grade demonstration of secure agent engineering applied to condominium operations.

## Goals

- demonstrate Spec-Driven Development;
- demonstrate a real agent/tool architecture;
- demonstrate security and authorization;
- demonstrate full-stack engineering;
- demonstrate observability;
- demonstrate automated testing from unit to E2E;
- produce a polished visual demo suitable for GitHub, LinkedIn and portfolio presentation.

## Core capabilities

- conversational agent;
- resident lookup;
- delinquency lookup;
- reservation availability;
- reservation creation;
- notification simulation;
- execution trace;
- tool-call observability;
- confirmation flows;
- security events;
- seeded demo data.

## Engineering principles

Security-first, test-first where practical, typed boundaries, least privilege, deterministic business rules, observable agent execution and accessible UI.

## Development workflow

This project uses GitHub Spec Kit with Claude Code.

Current Spec Kit documentation describes the production-oriented flow as:

`/speckit-constitution`
`/speckit-specify`
`/speckit-clarify`
`/speckit-plan`
`/speckit-checklist`
`/speckit-tasks`
`/speckit-analyze`
`/speckit-implement`
`/speckit-converge`

Repeat implement/converge until the feature is complete.

## Claude Code

Read `CLAUDE.md` before implementation.

Claude Code is the senior engineering agent for this repository. Human approval remains required for consequential actions.

## Project status

Foundation (R01) is implemented: multi-tenant auth, app shell, design tokens, seeded demo data, and the full
test pyramid (unit/component/integration/E2E) wired into CI. See `specs/00-roadmap.md` for what's next.

## Getting started (local, 100% free)

Requirements: Node 22+, Docker.

```bash
docker compose up -d          # Postgres on localhost:55432
cp .env.example .env          # then set AUTH_SECRET (npx auth secret)
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo accounts (seeded): `manager@condopilot.demo` / `carlos@condopilot.demo`, password `Demo@123`.

```bash
npm run typecheck
npm run lint
npm run test          # unit + component + integration (needs condopilot_test DB, see below)
npm run test:e2e      # Playwright
```

Integration tests use an isolated database. Create it once with:
`docker exec <postgres-container> psql -U condopilot -d condopilot -c "CREATE DATABASE condopilot_test;"`
then `DATABASE_URL=<TEST_DATABASE_URL from .env.example> npx prisma db push`.

## License

Choose a license before public release.
