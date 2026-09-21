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

### `deepmerge-ts` / `mysql2` via `prisma` (high, GHSA-ggr8-5vv4-36mx and related)

- **What**: `@prisma/client` declares `prisma` (the CLI) as a peer dependency, which pulls transitive `prisma`
  CLI packages into `node_modules` even in a production install. Those CLI packages depend on a vulnerable
  `deepmerge-ts` (stack exhaustion on recursive input) and, in some resolutions, `mysql2` (auth downgrade /
  decompression bomb — irrelevant here, this project only uses the PostgreSQL driver).
- **Exploitability**: none in this application. The vulnerable code paths only run when the Prisma **CLI** is
  invoked (`prisma migrate`, `prisma db push`, `prisma studio`) against schema/config input controlled by the
  developer, never at runtime by the Next.js server, and never on attacker-controlled input.
- **Fix considered**: `npm audit fix --force` downgrades to `prisma@6.12.0`, a breaking change that loses
  functionality used elsewhere in this stack, for a finding with no runtime exposure.
- **Disposition**: accepted, tracked here. Re-evaluate when Prisma ships a patched CLI release line.
