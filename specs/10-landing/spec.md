# R10 — Landing — Spec & Plan

## Purpose
The public page (HERO.md screen 1): hero statement, capabilities, a demo-moment mockup, engineering principles.
Replaces the R01 placeholder at `/`.

## Marketing constraints (from HERO.md — enforced, not just noted)
- Never claim production-readiness the release gates don't back up. Copy says "testado end-to-end" (true —
  `/quality` proves it) and avoids words like "pronto para produção".
- Never fabricate numbers. No invented benchmark/accuracy/customer figures. The one place a count appears
  (capabilities/pillars) is a qualitative list, not a metric.
- The demo-moment section is explicitly a **mockup** (styled, static, labelled), not a live embed — it must not
  be mistaken for a real running agent, which lives at `/agent` behind auth.

## Requirements
1. Hero: headline + subheadline (from HERO.md's hero/supporting statement) + primary CTA ("Entrar").
2. Signed-in visitors hitting `/` are redirected straight to `/dashboard` — no reason to show marketing copy to
   someone already using the product.
3. Demo-moment mockup reproduces the two real HERO.md phrases and their real tool names (`getResidentsInDebt`,
   `createReservation`) — accurate to what R02–R07 actually built, not invented example output.
4. Capabilities grid, engineering-principles section, footer.
5. Accessible: semantic headings, sufficient contrast (existing tokens), reduced-motion respected (global rule
   already covers it — no new animation introduced beyond existing transition utilities).

## Tasks
- [x] Redirect authenticated visitors from `/` to `/dashboard`
- [x] Hero section
- [x] Demo-moment mockup (accurate tool names/phrases)
- [x] Capabilities + principles sections
- [x] Footer
- [x] E2E: hero content renders; signed-in visitor redirected

## Converge (2026-09-21)
Status: **converged**. R11 (Final Demo) is next.
