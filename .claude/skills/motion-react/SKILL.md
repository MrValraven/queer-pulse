---
name: motion-react
description: Use when reaching for the `motion` package (a.k.a. Framer Motion, `motion/react`) in QueerPulse — drag/gesture interactions, drag-to-reorder lists, shared-element/layout (FLIP) animations, AnimatePresence enter/exit, spring physics, scroll-linked motion, motion values, imperative useAnimate sequences. This app runs `<LazyMotion features={domMax} strict>`, so `motion.*` is forbidden and `Reorder` is broken — this skill covers the `m`-component-safe way to build all of it, plus the repo's reduced-motion, token, and a11y contract. NOT for CSS-first micro-interactions/reveals (that is web-animation-best-practices).
user-invocable: true
---

# Motion for React (QueerPulse)

How to use the **`motion` package** (v11, imported from `"motion/react"`) correctly
in this repo. Motion is the JS-driven layer for the things CSS can't do well:
**drag, gestures, layout/FLIP animation, presence (enter/exit), spring physics,
and scroll-linked motion.** For entrances, hovers, skeletons, and scroll reveals,
CSS + the repo primitives come first — that is the `web-animation-best-practices`
skill's job. Reach for `motion` when the interaction is _interactive or physical_,
not decorative.

## The one rule that breaks everything if you miss it

This app wraps everything in `<LazyMotion features={domMax} strict>`
([MotionProvider.tsx](../../../src/app/providers/MotionProvider.tsx)). That has **two hard
consequences**:

1. **Import `m`, never `motion`.** `strict` THROWS on any `motion.div`/`motion.*`.
   Write `<m.div>`, `<m.button>`, etc. All the animation/gesture/layout/drag
   features you need are already loaded by `domMax` — you never call `<motion.*>`.
2. **`Reorder` (`Reorder.Group`/`Reorder.Item`) is BANNED here.** It is
   [incompatible with LazyMotion](https://github.com/framer/motion/issues/2232): it
   pulls the full feature set into the main bundle and renders `motion.*`
   internally, so under `strict` it throws at runtime. It is **not** "a separate
   export that's exempt" — that is the single most common wrong belief about this
   codebase. Build reordering from `m` + `drag` + `layout` instead (recipe below).

## Reduced motion — use the repo's flag, not motion's

```tsx
import { useMotionPrefs } from "../../app/providers/MotionProvider";
const { reducedMotion } = useMotionPrefs();
```

**Never** use motion's own `useReducedMotion()` — it reads a module-cached value
once and ignores the in-app "Reduce motion" toggle. `useMotionPrefs()` tracks the
OS setting AND the toggle and re-renders on change. Gate the _decoration_, keep the
_function_: a 1:1 finger-driven drag stays (it's a control); only its glide/lift
animation is suppressed (`transition={{ duration: 0 }}`, drop `whileDrag` scale).

## Tokens, not magic numbers

Motion takes JS numbers/arrays, so mirror `styles/tokens/effects.css`:

| Token                                      | JS value                          |
| ------------------------------------------ | --------------------------------- |
| `--ease` (primary)                         | `[0.22, 0.68, 0.16, 1]`           |
| `--ease-out`                               | `[0.16, 1, 0.3, 1]`               |
| `--dur-fast` / `--dur-base` / `--dur-slow` | `0.15` / `0.25` / `0.4` (seconds) |

Entrances ease-out, 150–400ms. Springs are fine for drag/layout; avoid `linear`
except continuous loops.

## Quick reference

| Need                            | Use                                                      | Notes                                         |
| ------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| Animate an element              | `<m.div animate={{...}} initial exit transition>`        | `m` only                                      |
| Reusable states                 | `variants` + `animate="name"`                            | propagate to `m` children                     |
| Hover/press/focus/in-view       | `whileHover` / `whileTap` / `whileFocus` / `whileInView` | gesture props                                 |
| Enter/exit on mount/unmount     | `<AnimatePresence>` around conditional                   | stable `key`, `exit` prop                     |
| Move/resize reflow (FLIP)       | `layout` prop on `m.*`                                   | animates via transform                        |
| Shared element across views     | `layoutId="x"` on both                                   | crossfades/morphs                             |
| Drag                            | `drag` / `drag="x"                                       | "y"`+`dragControls`                           | handle-only via `dragListener={false}` |
| **Drag-to-reorder**             | pointer-capture slot-swap + `m` `layout`                 | NOT motion `drag`, NOT `Reorder` — see recipe |
| Track a value without re-render | `useMotionValue` / `useTransform` / `useSpring`          | for `style`, not `animate`                    |
| Scroll-linked                   | `useScroll` + `useTransform`                             | gate parallax on `reducedMotion`              |
| Imperative / sequences          | `const [scope, animate] = useAnimate()`                  | for effects/handlers                          |

Full API with code examples: [reference.md](reference.md).

## Canonical recipe: drag-to-reorder under `strict`

Live implementation: [useRowDragReorder.ts](../../../src/features/subprofiles/useRowDragReorder.ts)

- [EditorItemRow.tsx](../../../src/features/subprofiles/EditorItemRow.tsx). The shape:

* Each row is an `m.div` with **`layout`** — Motion glides every row into its new
  slot on ANY reorder (a drag swap OR a keyboard-button move).
  `transition={{ layout: reducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22,0.68,0.16,1] } }}`.
* **Drive the drag with pointer events, NOT motion's `drag` gesture.** A small
  hook arms on the grip's `onPointerDown`, then compares the pointer against
  sibling midpoints and does a **single neighbour swap** (jitter-free). The row
  is only ever at a discrete slot: the array reorders, `layout` glides.
  `touch-action: none` on the grip so touch drags instead of scrolling.
* **Bind the move/up lifecycle to `window`, not the grip.** Motion's per-frame
  `layout` re-projection during a drag **drops the grip's pointer capture**, so
  a `pointerup` on the grip is missed and the drag gets STUCK (row keeps
  following the cursor after release). Listening on `window` for
  `pointermove`/`pointerup`/`pointercancel` catches the release wherever it
  lands; add a `event.buttons === 0` guard on move as a second belt.
* **Why not motion's own `drag` for reordering:** `drag` floats the row at an
  arbitrary offset that fights `layout`; combined with mid-drag array reordering
  it can leave a **residual transform, so rows overlay/overlap** even at rest.
  `Reorder` handles that reconciliation internally — but it's banned here. A
  discrete pointer-capture slot-swap sidesteps the whole class of bug. (Use
  motion's `drag` for free-floating gestures like swipe-to-dismiss, not for
  list reordering.)
* **Every row needs `position: relative` (never `static`)**, with the dragged
  row on a higher `z-index`, so its lift/shadow paints above the gliding
  neighbours — Motion's `layout` transform spawns a stacking context a `static`
  row loses the z-fight against.
* **Keep an explicit keyboard path** (up/down arrow buttons): pointer drag is
  not keyboard-accessible and the a11y build gate blocks unlabeled/inaccessible
  controls. The grip stays `aria-hidden`; the buttons carry the i18n `aria-label`.

## Repo conventions (non-negotiable)

- **Grip/handles are react-icons, never glyphs** (`icons-not-glyphs`): `FiMoreVertical`, `MdDragIndicator`.
- **i18n** every label (`ns:`-prefixed key, single-brace interp, EN + PT), no em dashes.
- **Dual-mode**: persisting a new order must branch demo vs live and PATCH the API in live mode.
- **Bundle**: don't add `motion.*` or `Reorder`; they defeat `LazyMotion`. Need a feature `domMax` lacks? Reconsider — it's a superset of drag+layout+gestures+animations.
- **Update the Changelog** (data + EN & PT) for user-facing motion changes.

## Common mistakes

| Belief / move                                                               | Reality                                                                                                                                                           |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "`Reorder.Group`/`Reorder.Item` is a separate export, exempt from `strict`" | FALSE. It renders `motion.*`, breaks LazyMotion, throws under `strict`. Use `m`+`drag`+`layout`.                                                                  |
| `import { motion } from "motion/react"` then `<motion.div>`                 | Throws under `strict`. Use `m`.                                                                                                                                   |
| `useReducedMotion()` from motion                                            | Stale + ignores the in-app toggle. Use `useMotionPrefs()`.                                                                                                        |
| Drag the whole row (no `dragListener={false}`)                              | Every button/tap inside the row starts a drag. Arm from the grip via `dragControls`.                                                                              |
| Drop the arrow buttons once drag works                                      | Motion drag is not keyboard-accessible; the a11y gate fails the build. Keep them.                                                                                 |
| Hardcoded `duration: 0.3`, `ease: "easeOut"`                                | Mirror the tokens (`0.25`, `[0.22,0.68,0.16,1]`).                                                                                                                 |
| Animating `width`/`height`/`top`/`left`                                     | Use `layout` (transform-based) or `transform`.                                                                                                                    |
| Index as React `key` in a reordering/presence list                          | Exit + layout break. Use a stable id.                                                                                                                             |
| Using motion's `drag` gesture to reorder a list                             | `drag` floats the row and fights `layout`, leaving a residual transform → rows overlay/overlap even at rest. Use pointer-event slot-swap + `layout` (see recipe). |
| Drag gets stuck / row keeps following cursor after release                  | The grip's `pointerup` was missed — motion `layout` re-projection dropped its pointer capture. Bind move/up to `window`, not the grip.                            |
| Drag-reorder rows overlap/overlay                                           | Also give every row `position: relative` (not `static`) + lift the dragged one's `z-index`.                                                                       |

## Red flags — stop

- You typed `motion.` anywhere → change to `m.`
- You reached for `Reorder` → it's banned here; build from `m`+`drag`+`layout`
- You called motion's `useReducedMotion` → use `useMotionPrefs`
- A drag interaction has no keyboard equivalent → add arrow-key/button path
- A duration or easing is a literal not traceable to a token → fix it
