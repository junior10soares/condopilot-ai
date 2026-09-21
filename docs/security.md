# Security Requirements

## Threat model

Consider at minimum:

- authentication attacks;
- broken access control;
- IDOR;
- prompt injection;
- indirect prompt injection;
- tool abuse;
- data leakage;
- insecure direct database access;
- SSRF;
- XSS;
- CSRF where applicable;
- credential leakage;
- excessive resource consumption;
- replay/idempotency issues;
- malicious file/input payloads;
- dependency vulnerabilities.

## Agent security

1. Treat all user/model/tool content as untrusted.
2. Keep system instructions separate from user-controlled content.
3. Use allowlisted tools.
4. Validate tool arguments with schemas.
5. Enforce authorization inside the tool/service layer.
6. Apply rate limits.
7. Apply timeouts and execution budgets.
8. Require confirmation for destructive or consequential operations.
9. Make sensitive operations auditable.
10. Prevent cross-tenant data access.

## Data protection

- secrets only through environment/secret management;
- never commit `.env`;
- minimize stored personal data;
- sanitize logs;
- define retention for traces;
- encrypt data in transit;
- use provider/database encryption at rest where available.

## Security testing

The CI pipeline should include:

- dependency audit;
- secret scanning;
- static analysis;
- authorization tests;
- prompt-injection regression tests;
- API validation tests;
- E2E security scenarios.

## Release rule

A critical security finding blocks release.
A high finding requires explicit documented disposition before release.

## Known findings / dispositions

### `deepmerge-ts` via `prisma` (high, GHSA-ggr8-5vv4-36mx) — resolved

- **What**: `@prisma/client` declares `prisma` (the CLI) as a peer dependency, which pulled transitive `prisma`
  CLI packages into `node_modules` even in a production install. `@prisma/config@6.19.3` depended on a
  vulnerable `deepmerge-ts@7.x` (stack exhaustion on recursive input).
- **Exploitability**: none in this application even before the fix — the vulnerable code path only runs when
  the Prisma **CLI** is invoked (`prisma migrate`, `prisma db push`, `prisma studio`) against schema/config
  input controlled by the developer, never at runtime by the Next.js server.
- **Fix**: pinned `deepmerge-ts` to `^8.0.2` (patched) via `package.json`'s `overrides`, without downgrading
  `prisma` itself. Verified `prisma migrate status` and the full test suite still pass against the overridden
  version. `npm audit` now reports 0 vulnerabilities.
