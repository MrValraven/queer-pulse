---
name: web-animation-best-practices
description: Use when adding, reviewing, or refactoring ANY motion in QueerPulse — entrance/exit transitions, hover/press micro-interactions, loading skeletons, staggered list reveals, scroll-driven reveals, modal/toast animation, layout transitions. Grounds motion in current web best practice (animate only transform/opacity, ease-out for entrances, 150–400ms, honour prefers-reduced-motion) AND in this repo's tokens + primitives (Reveal, FadeIn, Skeleton, useScrollReveal, useSimulatedLoad). Use BEFORE writing the motion, not only after.
user-invocable: true
---

# Web Animation Best Practices (QueerPulse)

The standard for motion in this repo. It layers the durable, research-backed
rules of good web animation on top of QueerPulse's tokens and primitives.
**Read this before adding motion, not only when reviewing it.** For an
after-the-fact implementation pass on a page, dispatch the `animation-engineer`
agent.

Motion here is **in service of the feeling** the design system asks for — warm,
calm, alive — never decoration for its own sake. Every animation should answer:
*what does this tell the user?* If the answer is "nothing," cut it.

Two companions, don't duplicate them:
- **`react-best-practices` skill** owns React/TSX correctness (hooks, keys, props).
- **`docs/STYLE-RULES.md` / `docs/design-system.md`** own the visual/token rules. This skill enforces the *motion* side of that contract.

## The checklist

Create a todo per section when applying this to real work.

### 1. Purpose first — motion that means something
- **Every animation communicates one of:** *where something came from / went* (entrance, exit, navigation), *what changed* (a value updated, an item was added/removed), *what's possible* (hover/focus affordance), or *that the system is working* (loading). Decorative-only motion is the exception, not the default, and is always the first thing to drop under reduced motion.
- **Don't animate everything at once.** Motion draws the eye — if three things move, the user doesn't know where to look. Animate the thing that changed; keep the rest still.
- **Be consistent.** The same kind of element should enter the same way everywhere. Reuse the primitives (below) rather than inventing per-page motion.

### 2. Performance — animate only cheap properties
- **Animate `transform` and `opacity`. Nothing else, almost ever.** These are composited on the GPU and don't trigger layout or paint. Animating `width`, `height`, `top`/`left`/`right`/`bottom`, `margin`, `padding`, `font-size` forces reflow ("layout thrash") and drops frames. Need a size/position change? Do it with `transform: scale()` / `translate()`, or use the FLIP technique (§7).
- **`will-change` is a scalpel, not a default.** Add it only to an element that is *about* to animate, and prefer letting it live in the animating class so it's scoped to when motion actually runs (our `FadeIn` does this). Slapping `will-change` on many elements wastes memory and backfires.
- **Never drive animation with `setInterval`/`setTimeout` frames or scroll-event listeners.** Use CSS animations/transitions, `IntersectionObserver` (see `useScrollReveal`), or `requestAnimationFrame` if you must do JS animation. When you do read/write the DOM in JS, batch all reads then all writes — never interleave.
- **Prefer CSS over JS** for entrances, hovers, and simple transitions; reach for JS/a library only for orchestration CSS can't express. This repo has **no animation library** — CSS + the primitives are the toolkit.

### 3. Timing & easing
- **Duration: 150–400ms for almost everything.** Small UI (hover, press, toggle, tab swap): `--dur-fast` (150ms) to `--dur-base` (250ms). Larger movements (overlays, page-level entrances, big cards): `--dur-slow` (400ms). The long `--dur-reveal` (900ms) is reserved for the gentle scroll reveal only. Anything over ~500ms feels sluggish for interactive UI.
- **Easing carries the personality. Use the tokens, never `linear`** (except continuous loops like a spinner/shimmer):
  - **Entrances → `--ease-out`** (decelerate in): fast to start, settles softly. This is the default for content arriving.
  - **Exits → `--ease-in`** (accelerate out): eases away, gets out of the way quickly.
  - **`--ease`** (the spring) is the house signature for expressive, alive movement — the default for the scroll `Reveal` and interactive flourishes.
  - **`--ease-std`** for neutral, symmetrical state changes.
- **Distance scales with duration.** Big travel needs more time; a 6px nudge should be quick (~150ms). Entrance offsets stay small — translateY of ~10–22px, not 100px.

### 4. Accessibility — reduced motion is non-negotiable
- **Every animation MUST be safe under `prefers-reduced-motion: reduce`.** ~35% of adults over 40 have some vestibular sensitivity; large/parallax/spinning/zooming motion can cause nausea and vertigo. This supports WCAG 2.3.3.
- The repo has a **global safety net** in `src/styles/tokens/effects.css` that near-zeroes all `animation-duration`/`transition-duration` under reduced motion — but **do not rely on it alone**. For anything beyond a small fade/slide (parallax, big scale, motion-path, looping decorative motion, autoplaying carousels), explicitly set the reduced-motion end state so the element lands *visible and correct*, not mid-animation. Our `Reveal`, `FadeIn`, and `Skeleton` already do this.
- **Reduced motion ≠ no feedback.** Keep the *information* (an item appeared, a value changed) — swap movement for an instant state change or a quick opacity fade. Never leave a reduced-motion user with content stuck invisible because an entrance animation never "played".
- **No autoplaying, flashing, or infinitely looping attention-grabbers.** Nothing flashes more than 3×/sec. Decorative loops (pulse dots, shimmer) must stop under reduced motion.
- Honour reduced motion in JS too via `usePrefersReducedMotion()` — don't start `IntersectionObserver`-driven motion when it's set (see `useScrollReveal`).

### 5. Loading states & skeletons
- **Show a skeleton for any data load the prototype simulates** — feeds, grids, lists, dashboards, search results, profile/detail pages. Use `useSimulatedLoad()` for the delay and the `Skeleton*` primitives for the shapes.
- **The skeleton must mirror the real layout** — same number of rows/cards, same rough sizes and positions. When real content swaps in there should be **no layout shift** (position/size/count must match). A skeleton that doesn't match the result erodes trust.
- **Shimmer, slow and steady, left-to-right.** Subtle wave/shimmer reads as faster than a pulse; slow-and-steady reads as faster than rapid. Keep it quiet — loading motion should reassure, not distract. (Our `qpShimmer` already does this.)
- **Skeletons are for ~0.5–10s waits.** Under ~0.5s, show nothing (a flash is worse than a beat of stillness). Over ~10s, you need real progress feedback — out of scope for this mock.
- **Announce loading to assistive tech** where it matters (`aria-busy`, or a polite live region), and ensure skeleton contrast is sufficient.

### 6. Entrance & stagger (the load-in pattern)
- **When real content replaces a skeleton, animate it in** — don't pop. Wrap rows/cards in `<FadeIn>` (entrance-on-mount fade + small slide-up).
- **Stagger lists for rhythm and hierarchy.** Offsetting items by a small delay (`delay={i * 60}`, ~40–80ms apart) creates a "one after another" cascade that signals the items are related yet distinct. **Cap the cascade** — after ~6–10 items the delay gets annoying; clamp it (e.g. `Math.min(i, 8) * 60`) so later rows don't wait seconds.
- **Entrance offsets are small and downward-resolving** (translateY ~10–22px → 0). Don't slide content across the whole screen.
- Use the scroll-triggered `Reveal` for sections that animate *as the user scrolls to them*; use `FadeIn` for content that arrives *now* (after a load). Don't double-animate (a `FadeIn` inside a `Reveal`).

### 7. Layout & shared-element transitions (FLIP)
- When an element changes size/position as a result of a layout change (reorder, expand, move between containers), animate it with **FLIP** — measure **F**irst and **L**ast positions, **I**nvert with a `transform`, then **P**lay by removing the transform with a transition. This keeps the animation on `transform` (cheap) instead of animating layout properties (expensive). Only reach for this when a real layout transition adds clarity; most of this prototype's needs are covered by entrance/exit + hover.

### 8. Micro-interactions
- **Hover/focus/press feedback** should be quick (`--dur-fast`) and on `transform`/`opacity`/`box-shadow` (shadow is acceptable here). Lift on hover with `translateY(-2px)` + shadow; press with a tiny `scale(.98)`.
- **Focus states must remain visible** — never animate away the focus ring; motion supplements affordance, it doesn't replace it.
- Keep micro-interactions subtle and uniform across the design system; the `Button`, `Card`, and nav already encode the house feel — match it.

## QueerPulse motion toolkit

Reach for these before writing new motion. Don't hand-roll what these already do.

| Need | Use | Where |
| --- | --- | --- |
| Simulate a data load (loading flag + delay) | `useSimulatedLoad(delay = 600)` | `src/shared/hooks` |
| Skeleton placeholder shapes | `SkeletonLine` / `SkeletonAvatar` / `SkeletonCard` | `src/shared/components/ui` |
| Animate real content in on load (mount) | `FadeIn` (`delay` for stagger, `as` polymorphic) | `src/shared/components/ui` |
| Reveal a section as it scrolls into view | `Reveal` / `useScrollReveal()` | `src/shared/components/ui` / `hooks` |
| Respect reduced motion in JS | `usePrefersReducedMotion()` | `src/shared/hooks` |
| Count a number up | `useCountUp()` | `src/shared/hooks` |

**Tokens (never hardcode timings/curves):** easing `--ease`, `--ease-out`, `--ease-in`, `--ease-std`; durations `--dur-fast` (150), `--dur-base` (250), `--dur-slow` (400), `--dur-reveal` (900). Shared keyframes live in `src/styles/tokens/effects.css`: `qpRevealIn`, `qpGridIn`, `qpPulse`, `qpShimmer`, `qpToastIn`/`qpToastOut`, `qpTabIn`. Reuse a keyframe before adding a new one; if you add one, name it `qp*` and put it in `effects.css`.

### The canonical load-in pattern

```tsx
import { useSimulatedLoad } from '../../shared/hooks'
import { FadeIn, SkeletonLine } from '../../shared/components/ui'

function ThingSkeleton() {
  // Mirror the real ThingCard's shape exactly — same sizes, same rhythm.
  return (
    <div className={styles.card}>
      <SkeletonLine width="55%" height={18} />
      <SkeletonLine width="35%" height={13} style={{ marginTop: 10 }} />
      <SkeletonLine width="90%" height={13} style={{ marginTop: 12 }} />
    </div>
  )
}

export function ThingPage() {
  const loading = useSimulatedLoad()

  return (
    <div className={styles.grid}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <ThingSkeleton key={i} />)
        : things.map((t, i) => (
            <FadeIn key={t.id} delay={Math.min(i, 8) * 60}>
              <ThingCard thing={t} />
            </FadeIn>
          ))}
    </div>
  )
}
```

The skeleton count and card shape match the real result → no layout shift; the
stagger is capped → late rows don't lag; reduced motion is handled inside the
primitives → no extra work, and nothing is left invisible.

## Quick self-review

Before calling motion done, confirm:
1. Animating only `transform`/`opacity` (and `box-shadow` for hover)? No layout props?
2. Duration in the 150–400ms band (or a deliberate token), easing from the tokens (not `linear`)?
3. Safe and *visible* under `prefers-reduced-motion`? Information preserved, not just movement?
4. Skeleton mirrors the real layout — no shift on swap? Stagger capped?
5. Does this motion say something, or is it noise? If noise, cut it.

## Sources

Distilled from current web-animation guidance:
- [web.dev — High-performance CSS animations](https://web.dev/articles/animations-guide)
- [Motion Magazine — Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) · [W3C WCAG 2.3.3 — Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
- [NN/g — Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/) · [LogRocket — Skeleton loading screen design](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- [IxDF — Disney's 12 Principles applied to UI](https://www.interaction-design.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design) · [Toptal — Motion Design Principles](https://www.toptal.com/designers/ux/motion-design-principles)
- [CSS-Tricks — Animating Layouts with the FLIP Technique](https://css-tricks.com/animating-layouts-with-the-flip-technique/) · [Aerotwist — FLIP Your Animations](https://aerotwist.com/blog/flip-your-animations/)
