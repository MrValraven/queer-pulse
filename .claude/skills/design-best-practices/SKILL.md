---
name: design-best-practices
description: Use when changing how any QueerPulse UI looks or feels — styling elements, composing a layout, setting spacing/type/hierarchy, making something responsive, or improving the user experience of a page, card, modal, form, or flow. Grounds visual + UX decisions in current best practice (spacing scale, hierarchy through contrast, content-driven responsive, Nielsen/Laws-of-UX heuristics, modern CSS craft) AND in this repo's tokens + primitives. Use BEFORE you style, not only after.
user-invocable: true
---

# Design Best Practices (QueerPulse)

The standard for **how QueerPulse looks and feels** — the visual and UX *judgment*
layer. It sits on top of the token rules and tells you how to use them well:
layout, spacing, hierarchy, responsive behaviour, UX heuristics, and CSS craft.
**Read this before you change a style, a layout, or a flow — not only when
reviewing it.** For an after-the-fact audit of a page or diff, dispatch the
`design-reviewer` agent.

Good design here is **in service of the feeling** the brand asks for — warm, calm,
human, safe. Every choice should answer: *does this make the thing clearer, calmer,
or easier?* If it only makes it busier, cut it.

Four companions — enforce your side, don't duplicate theirs:
- **`docs/STYLE-RULES.md` / `docs/design-system.md`** own *which* tokens exist (colours, fonts, radii, the plum-panel/success patterns). This skill governs how you *compose* with them. When a specific colour/font/radius question comes up, the docs win.
- **`react-best-practices` skill** owns TSX/code correctness (`<Button>`, `linkToPath`, hooks, keys, props).
- **`web-animation-best-practices` skill** owns motion (transitions, skeletons, reveals, micro-interactions).
- **`queer-community-copywriting` skill** owns the words.

## The checklist

Create a todo per section when applying this to real work.

### 1. Layout & spacing
- **Spacing comes from one scale, never arbitrary px.** Use the spacing/gap tokens (`src/styles/tokens/spacing.css`); compose with `clamp()`/`calc()` from tokens rather than hardcoding `13px`. *One source of truth; consistent rhythm; global retuning stays trivial.*
- **Space between groups > space within a group.** Tighten inner spacing, loosen outer spacing so proximity alone signals "these belong together" — before any border or box. Keep a label closer to its own field than to the next field. *Proximity is the cheapest, clearest grouping tool (Gestalt).*
- **Group with whitespace, not boxes/lines, wherever you can.** Reach for a bordered card only when grouping needs a surface. *Less visual clutter; lower cognitive load.*
- **Flexbox for one-dimensional content flows** (button rows, tag rows, toolbars); **Grid for two-dimensional structure** (page/card layouts). *Each tool fits its axis; mismatches breed hacks.*
- **Space siblings with `gap`, not margins on children.** Reserve margins for distancing a component from things *outside* it; never bake outer margins into a reusable component. *No margin-collapse surprises, no last-child resets; components stay portable.*
- **Let content size things — avoid fixed heights, and fixed widths where you can.** Use `min-height`/`max-width` as guardrails, `min()`/`max()`/`clamp()` for fluid sizing. *Fixed dimensions break auto-fit and spawn magic numbers/overflow.*
- **Constrain text measure to ~60–75ch** via `max-width` in `ch`, and cap reading-column width on wide viewports. Pair with body `line-height ≥ 1.5`. *Past ~75 characters the eye loses the next line's start.*
- **Set `min-width: 0` on a flex/grid child that must shrink or truncate.** *The default `min-width: auto` lets long content blow out the track and force horizontal scroll.*

### 2. Visual hierarchy & type
- **Build hierarchy from size + weight + colour + space *together*, not size alone.** Several gentle signals read more clearly than one loud jump. *Avoids cartoonish size leaps; more refined emphasis.*
- **De-emphasize with lighter colour or smaller size — not lighter font-weight.** Use ~2–3 text tiers (primary ink, `--ink-60`, `--ink-40`). On the plum panel, dim by moving text toward the background (`rgba(247,243,238,.8)` → `.5`), not toward grey. *Sub-400 weights get illegible; colour/size lowers emphasis while staying readable.*
- **One clear focal point per view** (the primary action or headline), then a deliberate 2nd and 3rd tier. Front-load what matters for F/Z scanning; lead with the conclusion. *Users scan, not read; guide "where do I look first / next."*
- **Emphasize sparingly — if everything is bold, nothing is.** Match the house emphasis rule: display emphasis is a Fraunces italic `<em>` in coral, never bold. *Overusing emphasis destroys the contrast that creates focus.*
- **Keep the type system small:** Fraunces (display) + DM Sans (UI/body), ~2 weights each, ~3–5 distinct sizes from the existing scale. Reuse the same style for the same role everywhere. *Fewer variables → coherent system, meaningful contrast.*
- **More space above a heading than below it.** *Space above attracts the eye; tight space below binds the heading to its content.*
- **Honour semantic heading order (h1→h2→h3); restyle, don't reorder.** Don't pick a heading level for its size. *Screen-reader navigation depends on order, not appearance.*

### 3. Responsive & adaptive
- **Mobile-first: base styles target small screens, layer up with `min-width`.** *Additions are cheaper and safer than overrides.*
- **Put breakpoints where the *content* breaks — never device sizes (no "iPad" 768/1024 targets).** *Device dimensions churn; content-driven breakpoints stay valid.*
- **Container queries for reusable components, media queries for page-level layout.** A card should adapt to the space it's dropped into, not the viewport. *Makes components truly drop-in.*
- **Fluid type and space with `clamp(min, vw-preferred, max)` instead of stepping at breakpoints.** *One rule scales smoothly with a safe floor and ceiling.*
- **Reflow without breakpoints where possible:** `grid-template-columns: repeat(auto-fit, minmax(min, 1fr))` and `flex-wrap: wrap`. *Items reflow to fit intrinsically; fewer breakpoints to maintain.*
- **No fixed `px` widths on layout containers** — use `%`, `fr`, `minmax()`, `min()/max()`, `max-width: 100%`. Audit for horizontal overflow (wide tables, `<pre>`, long URLs, embeds). *Fixed widths and overflow force page-wide horizontal scroll on mobile.*
- **Full-height sections use `svh`/`dvh`, never `100vh`.** Prefer `svh` for stable layout. *`100vh` overflows under mobile browser chrome.*
- **Interactive targets ≥ ~44×44px with ~8px between them; primary mobile actions in the thumb zone; nothing hover-only.** Gate hover behind `@media (hover: hover) and (pointer: fine)`. *Fingertips are ~1cm; touch devices have no hover.*
- **Responsive images: `srcset` + `sizes` (or `<picture>` for art direction); reserve space with `aspect-ratio` + `img { max-width: 100%; height: auto }`.** *Right resolution per device; no layout shift (CLS).* (In this prototype, image slots are tinted placeholders — apply the sizing discipline to those.)

### 4. UX heuristics & interaction
- **Acknowledge every action within ~400ms** — press state, loading, then animated success/error. Never leave a click silent. *Visibility of system status; the Doherty threshold keeps users in flow.*
- **Meaningful confirmations use the plum-panel success pattern, not a bare toast.** *Peak-End rule: strong endings define how the flow is remembered.* (See STYLE-RULES "Emphasis & success".)
- **Prevent errors before they happen** — sensible defaults, constraints, and a confirm step on destructive actions. **Always offer an escape hatch** (cancel / undo / back / close). *Prevention is cheaper than recovery; control reduces fear of committing.*
- **Make clickable things look clickable** with hover + `:focus-visible` + pressed states; never disguise a control as plain text or a primary action as a bare `<button>`. Use `<Button>` / real semantic controls. *Signifiers tell users what's actionable before they try.*
- **One primary action per screen; subordinate the rest.** Show only what's needed now; defer advanced/rare options behind progressive disclosure (≤3 levels). Favour recognition over recall. *Fewer choices → faster decisions (Hick's Law), lower memory load (Miller).*
- **Forms:** visible label *above* every field (never placeholder-as-label); validate inline on blur, re-check on submit; error message beside the field with colour **+ icon + text**; mark required consistently and ask for only what you need. *Persistent labels and timely, located errors minimise friction.*
- **Follow established web conventions; don't reinvent standard patterns.** *Jakob's Law: users expect your app to work like the ones they already use.*

### 5. CSS craft (implementation quality)
- **Tokens are the single source of truth — never hardcode a hex, px font-size, or spacing magic number.** Derive variants with `color-mix()`/relative colour from base tokens instead of hand-picking new hexes. *One change propagates; states stay in sync; theming works.*
- **Logical properties over physical** — `margin-inline`, `padding-block`, `inset`, `border-inline-start`. *Adapts to RTL/i18n (the app is bilingual EN/PT) and writing modes for free.*
- **Keep selectors flat and low-specificity; no `!important`, no deep descendant chains.** Lean on CSS-Module scoping; don't let tag selectors leak. *Predictable cascade; overrides stay easy.*
- **State via attributes where it exists** — style `[aria-expanded]`, `[data-state]` rather than toggling extra classes. *One source of truth across markup, CSS, and a11y.*
- **`:focus-visible` for focus rings — never remove an outline without an equivalent replacement.** Style `:hover` only inside `@media (hover: hover)`. *Keyboard users must see focus; touch devices have no hover.*
- **Animate only `transform`/`opacity`** (shadow OK for hover); reserve image/media space with `aspect-ratio`. *Compositor-only properties stay at 60fps; the rest force layout/paint.* (Motion detail → `web-animation-best-practices`.)

### 6. Accessibility (cross-cutting — non-negotiable)
- **Meet WCAG AA contrast: ≥4.5:1 body text, ≥3:1 large text (≥24px, or ≥18.66px bold) and UI/icons.** Muted/secondary text still must clear 4.5:1 — de-emphasis stops at unreadable. *Low-vision and colour-blind legibility.*
- **Never convey meaning by colour alone** — pair with text, icon, weight, or underline. *Colour-blind and grayscale users miss colour-only signals.*
- **Everything keyboard-operable with a visible focus indicator**; semantic HTML first, ARIA only to fill genuine gaps (name/role/value). *Native semantics beat ARIA; "no ARIA is better than bad ARIA".*
- **Size text in `rem` and respect user zoom/font-size**; base ~16px/1rem. *Honours user acuity settings.*
- **Respect `prefers-reduced-motion` and `prefers-color-scheme`** via tokens, not duplicated palettes. *They're user-environment signals the UI must answer.*

## QueerPulse design toolkit

Reach for what exists before inventing. Tokens live in `src/styles/tokens/` and load via `src/styles/index.css`.

| Need | Use | Where |
| --- | --- | --- |
| Colour / ink tiers / dark mode | `--plum --accent --accent-ink --cream --paper --jade --ink --ink-60 --ink-40` | `tokens/colors.css` |
| Type families & fluid scale | Fraunces (display) / DM Sans (UI); scale + line-heights | `tokens/typography.css` |
| Spacing, gaps, section rhythm, radii | spacing/gap tokens; radii `7→10→14→16→20→22→999→50%` (`--radius-card` = 22) | `tokens/spacing.css` |
| Easing, durations, shadows, keyframes | `--ease`, `--dur-*`, shadow + `qp*` keyframes | `tokens/effects.css` |
| Buttons / cards / tags / avatars / badges | design-system primitives (barrel) | `src/shared/components/ui` |
| Page frame | `PageShell` (marketing) / `AppShell` (logged-in) | `src/shared/components/layout` |
| Motion primitives | `Reveal`, `FadeIn`, `Skeleton*`, scroll/reduced-motion hooks | `src/shared/components/ui` + `hooks` |

**Patterns that are house law (see STYLE-RULES):** page/section background is `--cream`, never pure white; `--paper` only for small/medium cards with `1px solid rgba(45,27,61,.09)`; success/confirmation = the **plum panel** (plum bg, cream text, serif title with coral `<em>`, jade icon, `ghost-dark` buttons), never a big empty white card; decorative colour = low-opacity radial orbs, never solid blocks.

## Quick self-review

Before calling a design change done, confirm:
1. **Spacing** from the scale (no magic numbers); inner < outer; `gap` not child margins?
2. **Hierarchy** — one clear focal point; emphasis via size/weight/colour/space, used sparingly; ≤3–5 sizes?
3. **Responsive** — mobile-first, content-driven breakpoints, no fixed-px widths, no horizontal overflow, targets ≥44px?
4. **UX** — every action acknowledged; one primary action; labels above fields; escape hatch; nothing hover-only?
5. **CSS** — tokens only, low specificity/no `!important`, logical properties, `:focus-visible` preserved?
6. **A11y** — AA contrast (incl. muted text), colour never the sole signal, keyboard + visible focus, `rem` text?
7. **Does this make it clearer/calmer/easier — or just busier?** If busier, cut it.

## Sources

Distilled from current UI/UX/CSS guidance (verified resolving at time of writing):

**Layout & spacing** · [Every Layout — Axioms](https://every-layout.dev/rudiments/axioms/) · [web.dev — min/max/clamp](https://web.dev/articles/min-max-clamp) · [Ahmad Shadeed — Intrinsic sizing](https://ishadeed.com/article/intrinsic-sizing-in-css/) · [NN/g — Proximity](https://www.nngroup.com/articles/gestalt-proximity/) · [Baymard — Line length & readability](https://baymard.com/blog/line-length-readability) · [Figma — Space, grids & layouts](https://www.designsystems.com/space-grids-and-layouts/) · [CSS-Tricks — Magic numbers](https://css-tricks.com/magic-numbers-in-css/)

**Hierarchy & type** · [NN/g — Text-scanning patterns](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/) · [Smashing — Typographic hierarchies](https://www.smashingmagazine.com/2022/10/typographic-hierarchies/) · [Pimp My Type — Hierarchy](https://pimpmytype.com/hierarchy/) · [Refactoring UI](https://www.refactoringui.com/) · [web.dev — Typography](https://web.dev/learn/design/typography/) · [Josh Comeau — px vs rem & accessibility](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/)

**Responsive** · [web.dev — Container queries now](https://web.dev/blog/how-to-use-container-queries-now) · [web.dev — Viewport units (svh/dvh)](https://web.dev/blog/viewport-units) · [Smashing — Utopia fluid type & space](https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/) · [Adactio — Intrinsic layouts](https://adactio.com/journal/14889) · [NN/g — Touch target size](https://www.nngroup.com/articles/touch-target-size/) · [MDN — Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)

**UX heuristics** · [NN/g — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) · [Laws of UX](https://lawsofux.com/) · [NN/g — Error & form guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/) · [NN/g — Clickable elements](https://www.nngroup.com/articles/clickable-elements/) · [NN/g — Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) · [GOV.UK Design System](https://design-system.service.gov.uk/) · [LukeW — Inline validation](https://www.lukew.com/ff/entry.asp?1502)

**CSS craft & a11y** · [Stephanie Eckles — Modern CSS](https://moderncss.dev/) · [Andy Bell — CUBE CSS](https://bell.bz/cube-css/) · [web.dev — High-performance animations](https://web.dev/articles/animations-guide) · [Josh Comeau — Colour formats](https://www.joshwcomeau.com/css/color-formats/) · [CSS-Tricks — Cascade layers](https://css-tricks.com/css-cascade-layers/) · [W3C — WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) · [web.dev — Learn Accessibility](https://web.dev/learn/accessibility/) · [W3C — ARIA: Read me first](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)
