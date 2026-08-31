# QueerPulse Design System

A queer professional network rooted in Lisbon. QueerPulse connects LGBTQ+ professionals, creatives, activists and community members — for work, community, culture and mutual support.

**Source:** Built from the `QueerPulse homepage` project (~140 HTML pages + shared JS/CSS). No external Figma or codebase attached.

---

## Products & surfaces

| Surface             | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| **Homepage**        | Marketing/landing — hero, manifesto, member discovery grid, gatherings, stories |
| **Member platform** | Feed, profiles, connect, messages, communities, dating                          |
| **Magazine**        | Monthly editorial — features, essays, interviews, reviews                       |
| **Resources**       | Health, legal, safety, trans hub, harm reduction, library                       |
| **Gatherings**      | Event listings, RSVP, host tools, recap                                         |
| **Jobs & economy**  | Job board, barter exchange, micro-grants, skills                                |
| **Governance**      | Transparency reports, moderation, finances                                      |
| **Settings**        | Accessibility, notifications, privacy, security, data export                    |

All surfaces share `qp-base.css`, `qp-common.js`, and `qp-nav-extras.js`.

---

## Visual foundations

### Colors

- **Plum** `#2D1B3D` — brand anchor. Nav, headings, plum-background sections, auth avatar.
- **Accent** `#E8775A` — coral/terracotta. Primary CTA, italic emphasis, live dot. Swappable via Tweaks.
- **Cream** `#F7F3EE` — warm off-white page background. Never pure white.
- **Paper** `#FFFFFF` — card surface (inside cream bg).
- **Jade** `#4A8C6F` — live/verified/success green. XP bars, verified badge, "open" dot.
- **Ink** `#1A1A1F` → 60% → 40% opacity steps for body / secondary / tertiary text.

### Typography

- **Fraunces** (optical-size serif) — all display, H1–H3, editorial pull quotes, manifesto. Weight 300–500. Italic in `<em>` → coral accent. Tight letter-spacing (–.02em), low line-height (1.0–1.1).
- **DM Sans** — all UI, body copy, buttons, labels, nav. Weight 400–700.
- **No monospace font** used on any surface.

### Backgrounds & sections

Pages alternate between two background modes:

1. **Cream** (`#F7F3EE`) — default. White paper cards sit on top.
2. **Plum** (`#2D1B3D`) — manifesto, gatherings, skills, outro. Text is cream; accent italic for emphasis.

Decorative radial gradient orbs (coral + jade, low opacity 12–18%) float in hero and plum sections as `::before`/`::after` pseudos. Never use solid blocks of colour as decoration.

### Cards

- `border-radius: var(--radius-card)` (22px)
- `background: var(--paper)`, `border: 1px solid rgba(var(--line-rgb), .09)`
- Resting shadow: `var(--shadow-e1)`
- Hover: `translateY(-4px)` + `var(--shadow-lift)`
- Borders use `--line-rgb` (theme-switched, flips to cream in dark mode); backgrounds and
  shadows use `--plum-rgb` (not theme-switched). Every brand colour publishes an `-rgb`
  channel token for exactly this, and `scripts/check-design-tokens.mjs` fails the build on
  a hand-written channel triple in any `.css` under `src/`.

### Navigation

Floating glass pill — `backdrop-filter: blur(18px) saturate(1.5)`, cream bg at 66% opacity, plum border. Fixed 18px from top. Contains mega-nav dropdowns (mode A: full-width, mode B: cursor-following card).

### Buttons

Pill shape (`border-radius: 999px`). Three variants: **primary** (coral bg), **ghost** (outlined plum), **ghost-dark** (outlined cream on plum sections). Hover: `translateY(-1px)` + colour shift.

### Motion

- Primary easing: `cubic-bezier(.22,.68,.16,1)` — spring-like, used everywhere
- Scroll reveal: opacity 0→1 + translateY(22px→0), 900ms
- Grid stagger: 40ms delay per `--i` variable
- Skeleton shimmer: 200% → -200% background-position, 1.5s infinite
- All animations gate on `@media (prefers-reduced-motion: no-preference)`

### Imagery

No illustrations drawn in SVG. Image slots are `<image-slot>` web components with tinted placeholder frames (coral, jade, plum tints). Avatars use initials on tinted circle backgrounds — never photos for static demos.

### Hover / press states

- Cards: lift (`translateY(-4px)`) + heavier shadow
- Buttons: lift + darken
- Nav links: accent underline slides in from left
- Ghost buttons: border darkens, slight bg wash
- Gathering rows: pad-left increase + bg wash

### Dark mode

`[data-theme="dark"]` swaps `--cream` → `#0e0820`, `--paper` → `#1a1030`, `--ink` inverts to rgba-cream. Plum and accent unchanged.

### The primitive scales

The four scales below were added on 2026-08-31, after a scan found the design system was
being bypassed wherever it had no NAME for a value: 8,573 literal `font-size` declarations
against 89 token uses, 2,999 literal radii over 31 distinct steps, 570 hand-written
`box-shadow` strings over 335 distinct values, and 156 raw `z-index` numbers. Sibling
surfaces rounded, lifted and layered differently for no reason, and type could not be
retuned globally at all.

Each scale is a set of PRIMITIVES at the exact values that were already shipping, so
adopting them changed no rendered output. Reach for a role name first; a numeric step is
for the sizes no role covers. `scripts/check-css-scale.mjs` holds each category against a
committed budget and fails the build when a count grows.

**Type:** `--text-8` … `--text-20` in 0.5 steps, plus the roles `--text-body-lg`
`--text-body` `--text-body-sm` `--text-caption` `--text-label` `--text-eyebrow`, which
alias into the scale. Viewport-scaled headings use the fluid set `--text-hero`
`--text-display` `--text-title` `--text-heading` instead of a hand-rolled `clamp()`.

**Corner radii:** `--radius-1` … `--radius-30`, plus the roles `--radius-tag` (7)
`--radius-badge` (14) `--radius-panel` (20) `--radius-card` (22) `--radius-pill` (999)
`--radius-avatar` (50%). A value above 30px describes an organic blob shape, so those stay
literal and are budgeted.

**Elevation:** four resting steps and one hover lift, picked by how far off the page the
surface is meant to sit:

| Token           | Role                                    |
| --------------- | --------------------------------------- |
| `--shadow-e1`   | hairline: a resting card                |
| `--shadow-e2`   | raised: a chip, pill or sticky bar      |
| `--shadow-e3`   | floating: a dropdown or popover         |
| `--shadow-e4`   | overlay: a modal or sheet               |
| `--shadow-lift` | the 4px hover lift, paired with a step  |

**Rings:** a focus or selection ring is a `box-shadow` with no offset and no blur, and it
carries STATE where elevation carries depth. Roughly a third of the literal shadows were
rings written by hand in a dozen near-identical opacities: `--ring-accent`
`--ring-accent-strong` `--ring-accent-soft` `--ring-jade` `--ring-danger` `--ring-plum`
`--ring-plum-soft` `--ring-paper` `--ring-cream`. A component rule that out-specifies the
global `:focus-visible` restates it with `--focus-ring`, `--focus-ring-offset` and
`--ring-cream` rather than copying the numbers; a single-colour coral ring there silently
reintroduces the 2.63:1 failure the two-tone ring exists to fix.

**Scrim and blur:** `--scrim-soft` (a sheet that still shows context), `--scrim` (the
default for dialogs and sheets), `--scrim-strong` (lightbox, full-screen media), and the
glass steps `--blur-sm` `--blur-md` `--blur-lg`. The scrim base is a near-black that
deliberately does not flip with the theme: a scrim is the absence of the page, and a dark
scrim over a dark page is still what "the page is behind this" looks like.

### Stacking order

One named scale in `tokens/layers.css` for everything that overlaps, so a new overlay is
placed by NAME. Before it, 47 distinct literals were in use and several feature overlays
sat at 1000, above the shared Modal at 220, so a dialog opened from those surfaces
rendered underneath it.

`--z-raised` (3) → `--z-sticky` (20) → `--z-nav` (100) → `--z-popover` (200) →
`--z-modal` (220) → `--z-modal-nested` (240) → `--z-lightbox` (300) → `--z-skip-link`
(1000) → `--z-room-loader` (2000) → `--z-toast` (9999)

A bare 1/2/3 is fine for layering inside one component (a badge over an avatar, a gradient
over an image): it is local to one stacking context and has no relationship to app chrome.
Anything above 3 needs a token, and the build gate enforces that.

---

## Content fundamentals

- **Voice:** Warm, direct, second person ("you"). Never corporate. Never condescending.
- **Casing:** Sentence case throughout. Only eyebrows, footer column heads, and category chips use ALL CAPS.
- **Emphasis:** Fraunces italic `<em>` in accent colour — never bold for display-level emphasis.
- **Emoji:** Reserved for toasts, wellbeing check-in widget, and notification icons only. Never in body copy or headings.
- **Language:** Bilingual EN/PT. All pages support `qpSetLang('pt')` runtime switching via a text-node walker.
- **Tone:** Safety-conscious (quick-exit button in nav), community-first, non-transactional. Avoid FOMO language.
- **Numbers:** Used sparingly and meaningfully — "520 members", "6 spots left". Countup animation on scroll via `[data-countup]`.

---

## Iconography

**In the React app, every icon is a `react-icons` component.** Two hard ESLint errors hold
that line: `local/no-emoji` (emoji, dingbats, and the single guillemets `‹ ›`) and
`local/no-glyph-icon` (Miscellaneous Technical `⏱`, Geometric Shapes `▸ ◇`, Enclosed
Alphanumerics `ⓘ`). Genuine typography is allowlisted by name and stays legal: `·` `…`
`•` `“ ”` `‘ ’` `°` `§` `№`, the Portuguese quotation marks `« »`, and the keycap `⌘`. The
multiplication sign `×` and the arrows block are legal too, because in this codebase they
are prose ("2400 × 2400", "{from} → {to}") in 170 places. No linter can read a CSS
`content:` value, so glyph affordances there are found by hand; the five still open are
listed in `STYLE-RULES.md`.

The prototype's own convention, preserved here because the design files still follow it:
inline SVG (stroke, no fill), `stroke-width: 2.2`, `stroke-linecap: round`, monochrome via
`currentColor`, standard viewBox `0 0 24 24`. Common patterns:

- Search: `<circle cx="11" cy="11" r="7"/> <path d="m21 21-4.35-4.35"/>`
- Check: `<polyline points="20 6 9 17 4 12"/>`
- Hamburger: three `<line>` horizontals
- Chevron: `▾` unicode (nav) or SVG polyline

---

## File index

```
styles.css              Root entry point, imported once by consumers
tokens/
  colors.css            Brand palette + ink scale + `-rgb` channels + dark mode
  typography.css        Font families, fluid display scale, --text-8 … --text-20
  spacing.css           Radii (roles + --radius-1 … --radius-30), gaps, rhythm, nav dims
  effects.css           Easing, durations, keyframes, --shadow-e1 … e4, --ring-*, scrim, blur
  layers.css            The named z-index scale, --z-raised … --z-toast
  breakpoints.css       @custom-media names + --bp-* lengths
qp-base.css             Shared base rules (nav, buttons, cards, footer, toasts, skeletons)
qp-common.js            Scroll reveal, mega-nav, i18n EN↔PT, toast API, countup, skeleton helpers
qp-nav-extras.js        Search overlay, profile dropdown, notifications, mobile drawer, wellbeing widget
guidelines/             Foundation specimen cards (Design System tab)
  colors-brand.card.html
  colors-accent.card.html
  colors-text.card.html
  colors-dark.card.html
  type-display.card.html
  type-body.card.html
  type-labels.card.html
  type-emphasis.card.html
  spacing-radii.card.html
  spacing-shadows.card.html
  spacing-rhythm.card.html
  brand-motion.card.html
  brand-animations.card.html
  brand-surfaces.card.html
  brand-imagery.card.html
  brand-voice.card.html
components/core/        Reusable React UI primitives
  Button                primary / ghost / ghost-dark / jade
  Tag + TagRow + KindChip
  Avatar + AvatarStack
  Eyebrow + SectionHead
  VisibilityBadge       open / network / private
  Card + CardDivider
  Toast + showToast()
  Skeleton              SkeletonLine / SkeletonCard / SkeletonAvatar
```

---

## What is enforced, and where

| Gate                                | Catches                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm check:tokens`                 | raw hex and hand-written `rgb()`/`rgba()` channel triples in any `.css` under `src/`               |
| `pnpm check:css-scale`              | new literal px `font-size`, px `border-radius`, `box-shadow`, and `z-index` above 3                |
| `pnpm lint:a11y`                    | the jsx-a11y warning tail, held at zero                                                            |
| `local/no-emoji`, `no-glyph-icon`   | a Unicode glyph standing in for an icon                                                            |

All four run inside `scripts/build-gates.mjs`, which `pnpm build` executes before
`vite build`. The two CSS gates are RATCHETS: each holds its counts against a committed
budget file (`scripts/css-scale-budget.json`, `scripts/design-token-budget.json`) and fails
when a count grows. Lower a budget with `--update-budget` after a cleanup; that flag only
ever writes downward, so a rise has to be a hand edit with a written reason.
