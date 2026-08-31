# QueerPulse — style rules (read before building any UI)

Full reference: [`design-system.md`](./design-system.md). This file is the short,
non-negotiable checklist. When in doubt, match an existing page.

## Colour

- Tokens only — never hard-code hex. Use `var(--plum) / --accent / --accent-ink /
--cream / --paper / --jade / --jade-rgb / --accent-rgb / --ink / --ink-60 / --ink-40`.
- **Page backgrounds are `--cream` (warm off-white). Never a pure-white page/section
  background.**
- `--paper` (#FFFFFF) is _only_ for **small/medium card surfaces** sitting on cream,
  with `border: 1px solid rgba(var(--line-rgb), .09)`. Don't let a large, sparse area read as a
  white void — give it a plum or cream-tinted treatment instead (see Emphasis/success).
- **Never write rgb channels by hand.** Every brand colour publishes an `-rgb` token
  (`--plum-rgb --line-rgb --cream-rgb --accent-rgb --jade-rgb --amber-rgb --danger-rgb
  --violet-rgb --rose-rgb --ink-rgb --desk-violet-rgb --scrim-rgb`) so a translucent use
  still follows the theme: `rgba(var(--jade-rgb), .2)`. Borders use `--line-rgb`, which
  flips to cream in dark mode; backgrounds and drop shadows use `--plum-rgb`, which does
  not. `check-design-tokens` fails the build on any raw triple in any `.css` under `src/`,
  and it names the token you meant. The only two triples it allows are
  `rgba(255,255,255,…)` (an inset top-highlight) and `rgba(0,0,0,…)` (a photographic wash).
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
- **Never write a px `font-size`.** Reach for a role name first (`--text-body`,
  `--text-body-lg`, `--text-body-sm`, `--text-caption`, `--text-label`, `--text-eyebrow`)
  and a numeric step (`--text-8` … `--text-20`, in 0.5s) only when no role fits. Headings
  that scale with the viewport use the fluid set: `--text-hero --text-display --text-title
  --text-heading`. A hand-rolled `clamp(28px, 4vw, 44px)` is a fifth curve nobody chose.

## Scale ← the other four things that were being hardcoded

Colour had a gate and the four scales below did not, which is how 8,573 literal font
sizes, 2,999 literal radii, 570 literal shadows and 156 raw z-indexes accumulated. All
four now go through `check-css-scale`, which counts them and fails the build when a count
grows. The tokens live in `src/styles/tokens/`; read the comments there before adding one.

- **Radius** → a role name (`--radius-card` 22, `--radius-panel` 20, `--radius-badge` 14,
  `--radius-tag` 7, `--radius-pill` 999, `--radius-avatar` 50%) or a numeric step
  `--radius-1` … `--radius-30`. Above 30px the value describes an organic blob shape, so it
  stays literal.
- **Shadow** → the elevation scale, picked by how far off the page the surface sits:
  `--shadow-e1` hairline (resting card) · `--shadow-e2` raised (chip, pill, sticky bar) ·
  `--shadow-e3` floating (dropdown, popover) · `--shadow-e4` overlay (modal, sheet). Pair a
  resting step with `--shadow-lift` on hover instead of inventing a hover value.
- **Ring** → a focus or selection ring carries state rather than depth: `--ring-accent`,
  `--ring-accent-strong`, `--ring-accent-soft`, `--ring-jade`, `--ring-danger`,
  `--ring-plum`, `--ring-plum-soft`, `--ring-paper`, `--ring-cream`. A component rule that
  out-specifies the global `:focus-visible` restates it as
  `outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); box-shadow: var(--ring-cream)`.
- **Stacking** → place an overlay by name, never by picking a number bigger than whatever
  it collided with: `--z-raised --z-sticky --z-nav --z-popover --z-modal --z-modal-nested
  --z-lightbox --z-skip-link --z-room-loader --z-toast`. A bare 1/2/3 is fine for layering
  inside one component (a badge over an avatar); anything above 3 needs a token.
- **Scrim & blur** → `--scrim-soft` (a sheet that still shows context) · `--scrim` (the
  default for dialogs) · `--scrim-strong` (lightbox, full-screen media); glass surfaces use
  `--blur-sm --blur-md --blur-lg`. A scrim does not flip with the theme, on purpose.

## Icons

- Always a **react-icons** component. Never a Unicode glyph as an icon or affordance.
  `local/no-emoji` and `local/no-glyph-icon` are hard ESLint errors covering emoji, the
  dingbats, the single guillemets `‹ ›`, Miscellaneous Technical (`⏱`), Geometric Shapes
  (`▸ ◇`) and Enclosed Alphanumerics (`ⓘ`).
- Genuine typography stays legal and is allowlisted by name: `·` `…` `•` `–` `—` `“ ”`
  `‘ ’` `°` `§` `№`, the Portuguese quotation marks `« »`, and the keycap `⌘`. The
  multiplication sign `×` and the arrows block are legal too: in this codebase they are
  prose ("2400 × 2400", "{from} → {to}"), and no lexical rule can tell those from an
  affordance.
- **No linter can see a CSS `content:` value.** Five glyph affordances still live there
  and need replacing by hand: `persona-skins.css:3654` (`◇`),
  `AccountSuspendedPage.module.css:76` and `ForOrganisationsPage.module.css:195` (`✓`),
  `DirectorySpacePage.module.css:63` (`›`), `ForOrganisationsPage.module.css:43` (`×`).

## Components

- Buttons → the `<Button>` component (`variant="primary|ghost|ghost-dark|jade"`,
  `size="md|lg"`, polymorphic via `to`/`href`). Never `class="btn btn-*"` or bare
  `<button>` styled ad-hoc.
- Cards → `--radius-card` (22px), `--paper` bg, the standard border, `--shadow-e1` at
  rest and `--shadow-lift` on hover.
- Avatars → initials on a tinted circle (never photos in static demos).
- Images → tinted placeholder slots (coral/jade/plum tints).

## Motion

- Easing `cubic-bezier(.22,.68,.16,1)` (exposed as `var(--ease)`).
- Respect `prefers-reduced-motion`.

## Forms

- Required fields are marked (`*` + hint) and gate their submit button (disabled until
  valid). Disabled buttons: dimmed + `not-allowed`, no hover colour flip.
