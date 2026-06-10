# QueerPulse Design System

A queer professional network rooted in Lisbon. QueerPulse connects LGBTQ+ professionals, creatives, activists and community members — for work, community, culture and mutual support.

**Source:** Built from the `QueerPulse homepage` project (~140 HTML pages + shared JS/CSS). No external Figma or codebase attached.

---

## Products & surfaces

| Surface | Description |
|---|---|
| **Homepage** | Marketing/landing — hero, manifesto, member discovery grid, gatherings, stories |
| **Member platform** | Feed, profiles, connect, messages, communities, dating |
| **Magazine** | Monthly editorial — features, essays, interviews, reviews |
| **Resources** | Health, legal, safety, trans hub, harm reduction, library |
| **Gatherings** | Event listings, RSVP, host tools, recap |
| **Jobs & economy** | Job board, barter exchange, micro-grants, skills |
| **Governance** | Transparency reports, moderation, finances |
| **Settings** | Accessibility, notifications, privacy, security, data export |

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
- `border-radius: 22px` (--radius-card)
- `background: var(--paper)`, `border: 1px solid rgba(45,27,61,.09)`
- Resting shadow: `0 1px 2px rgba(45,27,61,.04)`
- Hover: `translateY(-4px)` + `0 22px 44px -26px rgba(45,27,61,.4)`

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

### Corner radii (full scale)
`7px` tag → `10px` badge → `14px` badge-lg → `16px` panel-sm → `20px` panel → `22px` card → `999px` pill → `50%` avatar

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

No icon font or icon library. Icons are inline SVG (stroke, not fill), `stroke-width: 2.2`, `stroke-linecap: round`, monochrome — use `currentColor`. Standard viewBox `0 0 24 24`. Common patterns:

- Search: `<circle cx="11" cy="11" r="7"/> <path d="m21 21-4.35-4.35"/>`
- Check: `<polyline points="20 6 9 17 4 12"/>`
- Hamburger: three `<line>` horizontals
- Chevron: `▾` unicode (nav) or SVG polyline

---

## File index

```
styles.css              Root entry point — import this in consumers
tokens/
  colors.css            Brand palette + ink scale + dark mode
  typography.css        Font families, fluid type scale, line heights
  spacing.css           Radii, gaps, section rhythm, nav dims
  effects.css           Easing, durations, shadows, keyframes
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
