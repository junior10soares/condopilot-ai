# R07 — Agent Playground — Checklist

## Engineering
- [x] typecheck / lint / build
- [x] E2E: both HERO.md demo phrases through the real chat UI (including clicking Confirmar for the reservation)
- [x] E2E: unrecognized input shows the clarify state, never a fabricated tool result

## Security
- [x] no new authorization surface — `sendAgentMessage` calls the same `runAgentTurn(db, actor, ...)` R02–R05
      already authorize and trace; the server action never accepts an actor/tenant from the client
- [x] confirming a `PENDING_CONFIRMATION` turn resends exactly the `{tool, args}` pair the **server** returned —
      the client never re-parses or edits it

## UX (design-system.md)
- [x] loading state ("Pensando...", `aria-live="polite"`)
- [x] empty state (suggested prompts before the first message)
- [x] input labelled (`sr-only` label + `htmlFor`), keyboard-submittable form
- [x] status badges reuse the existing `Badge` component and color tokens
- [x] reduced-motion: no new animation was added; the existing global CSS rule already covers this page

## Fixed while testing
- `e2e/reservations.spec.ts` asserted on `getByText("Salão de Festas")`, which became ambiguous once the agent
  booked a real reservation (a new table row also says "Salão de Festas") — a good sign the two features are
  actually integrated. Narrowed the assertion to the unique "Áreas disponíveis: ..." string.
- The new HERO-phrase-2 E2E test books a real slot against the dev database, so it wasn't safely rerunnable —
  added a `beforeAll` cleanup in `e2e/agent-playground.spec.ts` that clears tomorrow's Salão de Festas
  reservations first.
- That cleanup needs `DATABASE_URL` inside the Playwright test-runner process, so `test:e2e` now runs via
  `node --env-file-if-exists=.env`. That exposed a real, pre-existing bug: `.env`/`.env.example` (inherited from
  the R01 scaffold) set `NODE_ENV=development`, which leaked into the webServer's `next build` step once loaded
  this way and broke the production build (`Cannot read properties of null (reading 'useContext')` prerendering
  `/_global-error` — Next.js explicitly warns against a stale `NODE_ENV`). Removed the line; Next.js sets
  `NODE_ENV` itself per command and should never be told to otherwise.

## Converge
Status: **converged**. R06 (Notifications) is next.
