---
name: illustration
description: Use when creating, reviewing, or refactoring any illustration or decorative SVG art in QueerPulse — auth/onboarding art, empty/error/success-state art, spot illustrations & inline decorative marks, hero/marketing art, and social-share (Open Graph) images. Grounds the work in a verified best-practice base (style-system constraints, WCAG SVG accessibility, inclusive queer representation, NN/g state UX, SVG craft/theming/motion, OG specs) AND in this repo's tokens + primitives. Code-authored inline SVG is the default. Use BEFORE you draw the art, not only after.
user-invocable: true
---

# Illustration (QueerPulse)

The standard for **QueerPulse's illustrations** — how to design and hand-author
**inline SVG art** that feels warm, human, and safe, reads in light and dark, is
accessible, and represents a queer community without tokenism. Illustration here
is **code**: token-driven inline SVG React components, not binary assets.

Good illustration is **in service of the feeling** — it should make a moment
warmer, clearer, or calmer. If a piece of art only makes the screen busier or
competes with the primary action, cut it. The research base for every rule below
is in **`docs/research/illustration-svg-best-practices.md`** (verified vs sourced
claims are marked there).

**Companions — enforce your side, don't duplicate theirs:**

- **`design-best-practices`** owns layout/spacing/hierarchy and UX heuristics; this
  skill owns the _art_ that sits inside that layout.
- **`web-animation-best-practices`** owns motion mechanics (`Reveal`, `FadeIn`,
  easing, reduced-motion). This skill only says _what_ to animate in an
  illustration and to gate it.
- **`queer-community-copywriting`** owns the words paired with the art (captions,
  empty-state copy).
- **`docs/STYLE-RULES.md` / `docs/design-system.md`** own which tokens exist. This
  skill composes with them.

Create a todo per section when applying this to real work.

---

## 1. First, decide: does this need art at all — and what kind?

1. **Would a word or an icon do the job?** A relevant illustration measurably aids
   comprehension/memory (NN/g) — but only when _relevant_. Decorative-only art next
   to text earns nothing and adds load. If an existing `<Button>`, icon
   (`react-icons/Fi`), or `EmptyState` primitive covers it, use that.
2. **Figurative or abstract?** Default to **abstract / non-figurative** —
   geometric shapes, connection/constellation motifs, environments, orbs, the
   QueerPulse pulse motif. Abstract art sidesteps the tokenism trap (you can't
   depict every identity; a partial cast reads as tokenism) while still feeling
   human. Reserve **figurative characters** for when you can afford a genuinely
   broad, non-token cast — and then follow §5.
3. **Delivery = inline SVG** (the QueerPulse default): full token theming,
   `currentColor`, animatable, no asset pipeline. Use `<img src=".svg">` only for
   large static art reused across many pages (it **cannot be themed or animated by
   the page** — style-isolated). See `docs/…§6`.

---

## 2. The QueerPulse illustration vocabulary — pick it once, never exceed it

Consistency across a set comes from **explicit constraints**, not taste (IBM,
Polaris). Before drawing, fix a small vocabulary and reuse it everywhere:

- **Grid:** design on a small integer grid (e.g. a 300×150 or 0–24 user-space box);
  snap points. Keeps the set coherent.
- **Stroke weights:** **≤4 distinct** line weights across one illustration; prefer
  1–2 (e.g. `1.2`–`1.6` in a 300-wide viewBox).
- **Angles & curves:** favour standard angles (15/30/45/60/90°) and circular curves
  (quarter/semi/full circles) — matches the brand's round `--radius-*` language.
- **Palette:** **2–3 brand colors + neutrals**, and **less saturated than the
  surrounding UI** so art never out-shouts a control. Draw from tokens only —
  `--plum`, `--accent` (coral), `--jade`, `--cream`, and their `-rgb` triples for
  translucency. Decorative fields = **low-opacity radial orbs**, never solid blocks
  (house law).
- **Perspective:** **flat 2D.** Depth only via subtle shadow/opacity, never
  literal 3D.
- **Detail floor:** nothing meaningful **below ~4px** in the artboard — it vanishes
  at render size.
- **One idea per illustration.** If it needs a caption to be understood, it's doing
  too much. Negative space is required, not leftover.

Reference example already in the repo: `src/features/auth/CommunityArt.tsx` — an
abstract "constellation of members" built from token fills, ≤2 stroke weights,
`aria-label`, the pulse-ring brand motif. Mirror its shape for new art.

---

## 3. Accessibility — the fork you must get right

**Every illustration is either decorative or meaningful. Decide, then:**

- **Decorative** (the common case — it repeats or reinforces adjacent text):
  **hide it.** Inline: `aria-hidden="true"`. Via `<img>`: `alt="" aria-hidden="true"`.
  Otherwise some screen readers announce it as "group"/"image" noise.
- **Meaningful** (the art _is_ the message — e.g. a standalone success graphic with
  no text): give it a **non-empty accessible name** — `role="img"` +
  `aria-label="…"` (or a `<title>` child). **SVG `<text>` does NOT count** toward
  the accessible name; you must still label it.

**Contrast:**

- **Meaningful** graphics/icons needed to understand content: **≥3:1** vs adjacent
  colors (WCAG 1.4.11). On gradients/orbs, measure the **least-contrasting** area.
- **Decorative** art is **exempt** from contrast — but must be hidden (above).
- **Text on art: ≥4.5:1** (≥3:1 large). Muted text on the plum panel stays
  readable — dim toward the background (`rgba(var(--cream-rgb), .8)`→`.5`), never to
  unreadable grey.
- **Never color alone** — error/success art pairs color with **icon + text**
  (jade success icon + serif title; coral for errors).

---

## 4. Per-context playbook

**Auth / onboarding / welcome** — warmth and belonging, low friction. Abstract
connection/constellation motifs on a **plum panel** (cream text, coral `<em>`
caption). One calm focal point. See the sign-in `artTile` pattern. Don't animate
more than a single gentle brand pulse.

**Empty states** — follow NN/g's three guidelines: **communicate status**
(_why_ it's empty), **provide a learning cue**, **offer a direct path** (a primary
`<Button>`). Use the existing **`EmptyState`** primitive; add a small abstract
illustration only if it clarifies. Never a totally blank state — that reads as
broken.

**Error states** — noticeable, **redundant** signals: color **+ icon + text**.
Keep art restrained. **Novelty/humor is only for rare catastrophic failures**
(whole-system down), never routine validation errors.

**Success / confirmation** — the **plum-panel success pattern** (house law):
plum bg, cream serif title with a coral `<em>`, **jade success icon**,
`ghost-dark` buttons. Use the **`SuccessPanel`** primitive. Peak-End rule — this is
what the flow is remembered by; make the art land.

**Spot illustrations & inline marks** — tiny, from the same vocabulary; decorative
→ `aria-hidden`. They accent a section head or feature; they never carry meaning
alone and never out-saturate the UI around them.

**Hero / marketing** — larger abstract compositions, still flat, still token-built,
still one idea. May layer low-opacity orbs for depth.

**Social-share / Open Graph images** — **1200×630 (1.91:1)**, `twitter:card =
summary_large_image`. Set `og:title`, `og:type`, `og:image`, `og:url`, plus
`og:image:width`/`height` (so it renders on first share) and **`og:image:alt`**.
Keep text **large with safe margins** — it must survive thumbnail scale. Prefer
**templated generation** (HTML/SVG → PNG, e.g. Satori/Vercel OG) for per-page
variants. `ogp.me` itself doesn't mandate dimensions — 1200×630 is the platform
convention. See `docs/…§9`.

---

## 5. Inclusive & queer-representative illustration (highest stakes)

If you go **figurative**, this is non-negotiable — QueerPulse is a queer community:

- **No stereotype shorthand.** A tie ≠ "manager"; a single heavy ethnicity marker
  is the fast track to caricature (Atlassian). Use **subtle** markers.
- **Vary the whole cast** — skin tones, hair, hairstyles, clothing, body types,
  gender presentations. **Omitting skin tone defaults to whiteness** — an active
  failure, not a neutral default.
- **Represent disability** with concrete cues (glasses, hearing aids, mobility
  aids) where a cast is shown.
- **Don't checkbox-diversify** — a token-per-slot cast is its own failure. If you
  can't do it broadly and specifically, go **abstract** (§1.2).
- **Counter the clichés** queer imagery over-indexes on: protest, rainbow parties,
  partnered romance. Show **ordinary, multifaceted, non-partnered** life too.
- **No rainbow-washing / flag clichés** as a substitute for genuine representation.

When in doubt for QueerPulse, **abstract wins** — it's warm, universal, and can't
tokenize.

---

## 6. Theming — one illustration, both modes

- Build fills/strokes from **`var(--token)`** and **`currentColor`** — **never
  baked hex**. One inline SVG then recolors with the theme; no light/dark duplicates.
- Use `-rgb` triples for translucency: `fill="rgba(var(--accent-rgb), 0.35)"`.
- Verify **both** `:root` (light) and `[data-theme="dark"]` — QueerPulse redefines
  `--cream`, `--ink`, `--jade-ink` in dark. Cream art on the plum panel reads in
  both because plum is dark in both; check art that sits on `--cream`/`--paper`.
- Remember: **`<img>`-embedded SVG can't see the page's custom properties** — if it
  must theme, it must be inline.

```tsx
// Decorative, token-built, theme-aware, hidden from AT:
<svg viewBox="0 0 300 150" aria-hidden className={styles.art}>
  <circle cx={150} cy={75} r={22} fill="var(--accent)" />
  <circle cx={150} cy={75} r={29} fill="none"
          stroke="rgba(var(--accent-rgb), 0.35)" strokeWidth={1.4} />
</svg>

// Meaningful (art IS the message) — must be labelled:
<svg viewBox="0 0 64 64" role="img" aria-label="Your request is confirmed">
  {/* jade check motif */}
</svg>
```

---

## 7. Motion (see `web-animation-best-practices` for mechanics)

- **Animate only `transform` and `opacity`** — compositor-only, 60fps. Never
  animate geometry (`r`, `x/y`, path `d`), `fill`, or filters (layout/paint jank).
- **CSS animation over SMIL** (`<animate>` is effectively deprecated). Reserve the
  brand pulse and gentle entrances; illustrations should feel calm, not busy.
- **Always gate decorative motion** behind `prefers-reduced-motion`, and prefer
  CSS-module-local keyframes (global `@keyframes` don't reach a CSS module — see the
  repo's keyframe gotcha). **Replace, don't just delete** under reduce (swap a
  scaling pulse for an opacity dissolve).

---

## 8. SVG craft & performance

- Keep a **`viewBox`**; **omit `width`/`height`** (or `width:100%; height:auto`) so
  CSS scales it; reserve space with `aspect-ratio` to avoid layout shift.
  `preserveAspectRatio` defaults to `xMidYMid meet` (fit + center) — fine for most.
- If you paste exported/optimized SVG, run **SVGO** but **keep `viewBox`** and any
  **IDs referenced** by `<use>`, gradients, `aria-labelledby`, or animation
  (disable `removeViewBox`/`cleanupIds`).
- Prefer **small hand-authored** SVG (a handful of shapes). If a piece is large and
  static and reused everywhere, it's a candidate for an external `<img>` asset
  instead of inline.
- Data belongs in a colocated `*.data.ts` when it's a real dataset; a short inline
  array of shape coords (like `CommunityArt`) stays in the component. Keep each
  component **<200 lines** (repo rule).

---

## Quick self-review

Before calling illustration work done:

1. **Purpose** — does the art earn its place (clarifies/warms), or just decorate?
2. **Vocabulary** — one grid, ≤4 stroke weights, 2–3 tokens + neutrals, flat, one
   idea, ≥4px detail, less saturated than the UI?
3. **A11y** — decorative → `aria-hidden`; meaningful → `role="img"`+`aria-label`;
   meaningful graphics ≥3:1; text on art ≥4.5:1; never color alone?
4. **Representation** — abstract by default; if figurative, broad non-token cast, no
   stereotype shorthand, no rainbow-washing?
5. **Theming** — tokens/`currentColor` only, no baked hex, checked in light **and**
   dark?
6. **Motion** — transform/opacity only, gated behind reduced-motion, calm?
7. **State fit** — empty = status+cue+path; success = plum panel + jade icon; OG =
   1200×630 + alt + legible at thumbnail?
8. **Does it make the moment warmer/clearer/calmer — or just busier?** If busier,
   cut it.

## Sources

Full cited research (verified vs sourced, with URLs) in
**`docs/research/illustration-svg-best-practices.md`**. Primary sources include IBM
Design Language, Shopify Polaris, Atlassian's inclusive-illustration retrospective,
W3C WCAG 2.1/2.2 (1.1.1, 1.4.1, 1.4.3, 1.4.11, 2.3.3, ACT 7d6734, C39), WebAIM, MDN
(viewBox/preserveAspectRatio/prefers-reduced-motion), svgo.dev, ogp.me, Meta sharing
docs, and NN/g (empty states, error messages, memorable imagery).
