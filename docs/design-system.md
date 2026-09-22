# Design System

## Visual identity

CondoPilot AI should feel:

- intelligent;
- premium;
- technical;
- trustworthy;
- modern.

## Color tokens

Use semantic tokens rather than hard-coded colors.

Suggested palette:

- Background: #070A12
- Surface: #0E1322
- Surface elevated: #141B2D
- Text: #F7F8FC
- Muted: #9AA4B2
- Primary: #7C5CFF
- Secondary: #20D4FF
- Success: #31D07C
- Warning: #FFB547
- Danger: #FF5D73

Gradient:
`linear-gradient(135deg, #7C5CFF 0%, #20D4FF 100%)`

Use the gradient primarily for hero emphasis, CTA, active states and selected agent events.

## Typography

Use a modern sans-serif.
Clear hierarchy:

- display;
- heading;
- body;
- caption;
- mono for technical traces.

## Components

Required reusable components:

- Button
- Card
- Badge
- Dialog
- Drawer
- DataTable
- EmptyState
- ErrorState
- Skeleton
- Toast
- CommandBar
- AgentMessage
- ToolCall
- ExecutionTimeline
- StatusIndicator

## Accessibility

- keyboard navigation;
- visible focus;
- sufficient contrast;
- semantic HTML;
- ARIA only where needed;
- reduced motion;
- errors announced appropriately.

## Motion

Centralize motion tokens.
Respect `prefers-reduced-motion`.
Never make functionality dependent on animation.

### As implemented

- Tokens: `--duration-micro` (180ms, hover/press), `--duration-panel` (320ms, entrances), `--ease-standard`,
  `--ease-out` — `src/app/globals.css`.
- `Button` (`src/components/ui/button.tsx`) is the single source of hover/active/focus/disabled states —
  `active:scale-[0.97]`, gradient glow on hover for the primary variant, `disabled:opacity-50
disabled:cursor-not-allowed`. Every button in the app goes through it.
- `.animate-fade-in-up` — chat messages, empty states, hero copy entrance. Staggered via inline
  `[animation-delay:Nms]` where a sequence matters (hero copy → CTA).
- `.animate-pulse-dot` / `.animate-spin-token` — the agent "thinking" indicator and button loading spinner.
- Active nav item gets a `var(--gradient-brand)` accent bar (`src/components/shell/sidebar-nav.tsx`), matching
  "gradient for active states" above.
- `.bg-hero-grid` / `.bg-hero-glow` (landing hero only) — subtle grid + restrained glow. Applied as a
  background **layer** behind the content (`absolute inset-0`), never on the element holding real text/buttons —
  `mask-image` clips its own element's painted content, so putting it directly on a content container silently
  clips that content too (found and fixed on the landing hero).
- All the above respect the global `prefers-reduced-motion` rule already in `globals.css`; none of it gates
  functionality — every animated element works identically instantly with motion disabled.

## Logo

`public/logo-mark.svg` (icon only, also `src/app/icon.svg` as the favicon) and `public/logo-lockup.svg` (icon +
wordmark). A ring built from an arc + a trailing dot, gradient-filled — reads as both a "C" (CondoPilot) and an
AI/signal node. Minimum clear space: half the mark's width on every side. Don't recolor outside the brand
gradient; don't stretch non-uniformly.
