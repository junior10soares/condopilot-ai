# R03 — Residents — Spec

## Purpose
A resident directory: who lives in the condominium, which unit, who's a manager — with tenant isolation and a
privacy rule (not everyone should see everyone's email).

## Requirements
1. Any authenticated user sees the full resident directory for **their own condominium only** (name, unit, role).
2. Email is visible only to the row's own owner or to `MANAGER`/`ADMIN` — residents see other residents' emails
   masked (`c****s@***.com` style).
3. An agent tool `listResidents` (minRole `RESIDENT`, no confirmation) returns the same masked-per-viewer shape
   and is triggered by pt-BR phrases like "quem mora", "lista de moradores", "moradores do condomínio".

## Acceptance criteria
- A resident of condo A can never see users of condo B (enforced by the existing R01 repository, which requires
  `condominiumId`).
- A `RESIDENT` actor viewing the directory sees masked emails for everyone except themselves; a `MANAGER` sees
  all emails unmasked.
- The `listResidents` tool output is masked the same way, for the same reason (it goes through the same
  authorization actor, not a privileged bypass).
