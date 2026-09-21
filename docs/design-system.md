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
