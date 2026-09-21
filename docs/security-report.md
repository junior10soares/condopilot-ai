# Security Report

Consolidates `docs/security.md`'s threat model with what was actually implemented, where, and how it's tested.
Generated 2026-09-21. See `/security` (Security Center, manager/admin only) for the live audit trail this
architecture produces at runtime.

## Threat model coverage

| Item                                         | Status                                | Where                                                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication                               | Implemented                           | Auth.js credentials, bcrypt hashing, generic error (no user enumeration) — `src/lib/auth.ts`                                                                                                        |
| Broken access control / IDOR                 | Implemented                           | `src/lib/authz.ts` (`requireRole`, `assertSameTenant`, `requireSelfOrRole`), enforced in every repository and agent tool                                                                            |
| Tenant isolation                             | Implemented                           | every repository/tool takes `condominiumId` as an explicit, required argument — never inferred from client input                                                                                    |
| Prompt injection / indirect prompt injection | Implemented                           | no instruction-following model in the default path; `LocalHeuristicProvider` matches fixed substrings only — a prompt-injection-style string has no special effect, it just fails to match (tested) |
| Tool abuse / unrestricted capability         | Implemented                           | fixed tool registry, Zod-validated input **and output** on every tool, no arbitrary SQL/shell/HTTP anywhere in the agent path (`docs/agent-contract.md`'s forbidden list)                           |
| Data leakage                                 | Implemented                           | email masking for non-owners/non-managers (R03); financial data never crosses tenant or role boundaries (R04)                                                                                       |
| Insecure direct DB access                    | Implemented                           | the model never receives a database handle; only typed tool functions do                                                                                                                            |
| SSRF                                         | N/A                                   | the app makes no outbound HTTP calls to user-influenced URLs                                                                                                                                        |
| XSS                                          | Implemented                           | React's default escaping everywhere; no `dangerouslySetInnerHTML` in the codebase                                                                                                                   |
| CSRF                                         | Implemented                           | Auth.js's built-in CSRF protection on the credentials flow; mutating actions are Next.js Server Actions (POST-only, same-origin)                                                                    |
| Credential leakage                           | Implemented                           | `.env` gitignored, `AUTH_SECRET` generated per-environment, never committed; no secrets in `AgentExecution` traces (`src/agent/trace.ts` only stores zod-validated business args)                   |
| Excessive resource consumption               | Implemented                           | per-actor rate limiting on every agent turn (R08); tool input size bounds (e.g. notification body capped at 500 chars)                                                                              |
| Replay / idempotency                         | Partially addressed                   | reservation conflicts are prevented at the database level (`SERIALIZABLE` transaction); no idempotency-key mechanism for retried mutations yet — low risk at this scale, noted as a gap             |
| Malicious file/input payloads                | N/A                                   | no file upload surface in this version                                                                                                                                                              |
| Dependency vulnerabilities                   | Implemented, one documented exception | `npm audit` in CI (blocks on critical); one high finding (`deepmerge-ts` via the Prisma CLI peer dependency) has no runtime exposure and is dispositioned in `docs/security.md`                     |

## Authorization model, concretely

Every tool declares a `minRole`. The pipeline checks it with `requireRole` **before** validating arguments or
executing — a denial never reaches business logic, and it's always traced. Two real, tested examples:
`getResidentsInDebt` and `sendBroadcastNotification` are `MANAGER`-only; a resident attempting either is denied
and the denial shows up in the Security Center.

## Confirmation policy

`requiresConfirmation: true` on `createReservation`, `cancelMyReservation`, and `sendBroadcastNotification` (all
consequential/bulk actions per `docs/agent-contract.md`). The pipeline never executes such a tool on the first
pass; the confirmed follow-up call is **re-validated** (schema + authorization) exactly like a first call — a
client cannot skip either check by claiming confirmation.

## Rate limiting

In-memory, fixed-window, per-actor (`src/lib/rate-limit.ts`), 20 turns / 10 seconds by default. Deliberately
documented as single-instance-only (see the `ponytail:` comment in that file) with a stated upgrade path
(Redis `INCR`+`EXPIRE`) if this ever runs on more than one process.

## CI security gates (`.github/workflows/ci.yml`)

- Secret scanning: `gitleaks/gitleaks-action`.
- Dependency audit: `npm audit --audit-level=critical` (blocks only on critical — see the documented high-finding
  exception above).
- Static analysis: ESLint with Next.js + TypeScript strict rules.
- Every authorization/tenant-isolation/prompt-injection/rate-limit test from the suite (see `docs/test-report.md`).

## Known gaps (honest, not fabricated as "handled")

- No idempotency-key layer for retried mutations.
- No distributed rate limiting (single-instance only, by design for this deployment target).
- No real LLM provider wired by default — the model-abstraction attack surface (indirect prompt injection via a
  real model's tool-selection reasoning) doesn't exist yet in this build; it would need its own review before a
  real provider is added, per `docs/security.md`'s agent-security checklist.
- No automated dependency-vulnerability monitoring beyond the CI-time `npm audit` snapshot (no Dependabot/Renovate
  configured).
