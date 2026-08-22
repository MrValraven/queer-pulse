# QueerPulse — style rules (read before building any UI)

Full reference: [`design-system.md`](./design-system.md). This file is the short,
non-negotiable checklist. When in doubt, match an existing page.

## Colour

- Tokens only — never hard-code hex. Use `var(--plum) / --accent / --accent-ink /
--cream / --paper / --jade / --jade-rgb / --accent-rgb / --ink / --ink-60 / --ink-40`.
- **Page backgrounds are `--cream` (warm off-white). Never a pure-white page/section
  background.**
- `--paper` (#FFFFFF) is _only_ for **small/medium card surfaces** sitting on cream,
  with `border: 1px solid rgba(var(--line-rgb), .09)`. The raw channels `rgba(45,27,61,…)`
  fail the `check-design-tokens` build gate: borders use `--line-rgb` (flips in dark mode),
  backgrounds and shadows use `--plum-rgb` (does not). Don't let a large, sparse area read as a
  white void — give it a plum or cream-tinted treatment instead (see Emphasis/success).
- Decorative colour = low-opacity radial orbs (coral/jade 12–18%) in `::before/::after`.
  Never solid blocks of colour as decoration.

## Emphasis & success states ← the common mistake

Confirmation / success / "you're done" surfaces use the **plum panel** pattern, the same
emphasis treatment as the manifesto/gatherings/outro and the create-gathering success:

- `background: var(--plum)`, `color: var(--cream)`, rounded.
- Serif title (Fraunces) with an italic `<em>` in **coral** accent.
- Tinted success icon (jade), body text in `rgba(247,243,238,.8)`, meta in `~.5`.
- Buttons on plum use `variant="ghost-dark"` (or primary coral).

Don't render a success as a big empty white card.

## Type

- Display/H1–H3, pull quotes → **Fraunces** serif, weight 300–500, italic `<em>` = coral.
- Body, UI, buttons, labels, nav → **DM Sans**. No monospace anywhere.

## Components

- Buttons → the `<Button>` component (`variant="primary|ghost|ghost-dark|jade"`,
  `size="md|lg"`, polymorphic via `to`/`href`). Never `class="btn btn-*"` or bare
  `<button>` styled ad-hoc.
- Cards → `--radius-card` (22px), `--paper` bg, the standard border + hover lift.
- Avatars → initials on a tinted circle (never photos in static demos).
- Images → tinted placeholder slots (coral/jade/plum tints).

## Motion

- Easing `cubic-bezier(.22,.68,.16,1)` (exposed as `var(--ease)`).
- Respect `prefers-reduced-motion`.

## Forms

- Required fields are marked (`*` + hint) and gate their submit button (disabled until
  valid). Disabled buttons: dimmed + `not-allowed`, no hover colour flip.
