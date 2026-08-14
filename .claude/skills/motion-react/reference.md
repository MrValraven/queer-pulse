# Motion for React — API reference

Grounded in Motion v11 (`"motion/react"`). **In this repo every example uses `m`,
not `motion`** (LazyMotion `strict`). Elsewhere the symbol is `motion`; the props
are identical. Verify anything version-sensitive against https://motion.dev/docs.

---

## 1. The component (`m` / `motion`)

There is an `m` for every HTML/SVG element: `m.div`, `m.button`, `m.ul`, `m.circle`.
Use them like normal elements plus animation props.

```tsx
import { m } from "motion/react";

<m.div
  initial={{ opacity: 0, y: 8 }}   // state before mount (skip with initial={false})
  animate={{ opacity: 1, y: 0 }}   // target on mount + whenever it changes
  exit={{ opacity: 0, y: 8 }}      // on unmount — needs AnimatePresence
  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
/>
```

Wrap a custom component with `motion.create(Component)` (component must forward its
`ref`). Under `strict`, prefer composing `m.*` inside your component instead.

### Variants (named, reusable states, propagate to children)

```tsx
const list = { show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

<m.ul variants={list} initial="hidden" animate="show">
  {rows.map((r) => <m.li key={r.id} variants={item} />)}
</m.ul>
```

A parent's `animate="show"` cascades the variant name to children — children don't
repeat `animate`. Pass dynamic data with `custom={i}` and a function variant
`variants={{ show: (i) => ({ opacity: 1, transition: { delay: i * 0.05 } }) }}`.

---

## 2. Transitions

```tsx
transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
transition={{ type: "spring", bounce: 0.25, visualDuration: 0.4 }} // perceptual
transition={{ duration: 0.25, ease: [0.22, 0.68, 0.16, 1] }}       // tween
```

- **spring** options: `stiffness`, `damping`, `mass`, `bounce` (0–1), `visualDuration`,
  `velocity`, `restSpeed`, `restDelta`. Great for drag/layout.
- **tween** options: `duration`, `ease` (name like `"easeOut"` or cubic-bezier array),
  `times`. Named eases: `linear`, `easeIn/Out/InOut`, `circIn/Out/InOut`, `backIn/Out/InOut`, `anticipate`.
- **orchestration**: `delay`, `repeat` (`Infinity`), `repeatType` (`loop|reverse|mirror`),
  `repeatDelay`, `when` (`beforeChildren|afterChildren`), `delayChildren`, `staggerChildren`.
- **per-property**: `transition={{ default: { type: "spring" }, opacity: { ease: "linear" } }}`.

v12 adds the `stagger()` helper (`delayChildren: stagger(0.1, { from: "last" })`); on
v11 use `staggerChildren` + `delayChildren` numbers.

---

## 3. Gestures

```tsx
<m.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  whileFocus={{ boxShadow: "0 0 0 3px var(--accent)" }}
/>
```

`whileInView={{ opacity: 1 }}` with `viewport={{ once: true, amount: 0.3 }}` fires when
scrolled into view. (For plain scroll reveals the repo prefers `useScrollReveal` — see
web-animation-best-practices.) `whileDrag` styles the element mid-drag.

---

## 4. Drag

```tsx
import { m, useDragControls, type PanInfo } from "motion/react";
const controls = useDragControls();

<m.div
  drag="y"                 // "x" | "y" | true (both)
  dragListener={false}     // don't arm from the element itself...
  dragControls={controls}  // ...arm manually from a handle
  dragConstraints={containerRef} // ref OR {top,left,right,bottom}
  dragElastic={0}          // 0 = hard stop at constraints
  dragMomentum={false}     // no inertial fling
  whileDrag={{ scale: 1.02 }}
  onDragStart={() => {}}
  onDrag={(_e, info: PanInfo) => { /* info.point / info.offset / info.velocity */ }}
  onDragEnd={(_e, info) => {}}
>
  <span onPointerDown={(e) => controls.start(e)} style={{ touchAction: "none" }}>handle</span>
</m.div>
```

`PanInfo`: `point` (pointer viewport coords — matches `getBoundingClientRect`), `offset`
(since drag start), `velocity` (px/s), `delta`. `dragSnapToOrigin` springs back on release.

**No `Reorder` in this repo** (LazyMotion-incompatible). And don't use this `drag`
gesture to reorder a *list* — it floats the row and fights `layout`, leaving residual
overlap. Reorder with pointer-capture slot-swap + `m` `layout` (see the SKILL recipe and
`useRowDragReorder.ts`). Use `drag` for free gestures (swipe-to-dismiss, sheets).

---

## 5. Layout animation (FLIP)

```tsx
<m.div layout />                       // animate any layout change via transform
<m.div layout="position" />            // position only (images/text that change aspect)
<m.div layout="size" />                // size only
```

- **Shared element**: same `layoutId` on two elements → the new one animates from the
  old one's box (crossfades if both are present). Combine with `AnimatePresence`.
- **`LayoutGroup`**: sync layout across siblings that don't re-render together (e.g. an
  accordion list).
- **`layoutScroll`** on a scrollable ancestor so Motion accounts for scroll offset;
  **`layoutRoot`** for `position: fixed` subtrees.
- **Distortion fixes**: set `borderRadius`/`boxShadow` via the `style` prop (Motion
  auto-corrects scale distortion); add `layout` to children for scale correction; use
  `layout="position"` for aspect-ratio changes. Inline elements can't transform — don't
  use `display: inline`. SVG layout isn't supported. Reserve `scrollbar-gutter: stable`.
- Scope timing: `transition={{ layout: { duration: 0.25, ease: [...] } }}`.

---

## 6. AnimatePresence (enter/exit)

```tsx
<AnimatePresence mode="popLayout" initial={false}>
  {items.map((it) => (
    <m.li key={it.id} exit={{ opacity: 0, x: -8 }} layout>
      {it.label}
    </m.li>
  ))}
</AnimatePresence>
```

Rules that make exit actually run:
- **Stable, unique `key`** on each direct child (never the array index).
- Put `AnimatePresence` *around* the conditional, don't conditionally render the
  `AnimatePresence` itself.
- `mode`: `"sync"` (default), `"wait"` (one at a time — exit fully before enter), or
  `"popLayout"` (exiting element removed from layout flow so siblings reflow immediately;
  the exiting child must forward its ref; parent usually `position: relative`).
- `initial={false}` skips the entry animation for already-present children on first paint.
- `onExitComplete`, `custom` (+ `usePresenceData`) for dynamic exits.
- Manual control: `const [isPresent, safeToRemove] = usePresence()`; `useIsPresent()` for a boolean.

---

## 7. Motion values (animate without React re-renders)

```tsx
import { useMotionValue, useTransform, useSpring, useScroll, useVelocity } from "motion/react";

const x = useMotionValue(0);
const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
<m.div style={{ x, opacity }} />       // motion values in `style` update off the React tree
```

Scroll-linked:

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
<m.div style={{ y: reducedMotion ? 0 : y }} />  // gate parallax on reducedMotion
```

`useMotionValueEvent(mv, "change", cb)` to react to changes. Motion values belong in
`style`, not `animate`.

---

## 8. Imperative — `useAnimate`

```tsx
const [scope, animate] = useAnimate();
// in an effect or handler; selectors are scoped to `scope`:
animate(scope.current, { opacity: 1 }, { duration: 0.3 });
animate("li", { x: 0 }, { delay: 0.05 });
// sequence / timeline (array form):
await animate([
  [".title", { opacity: 1 }, { duration: 0.2 }],
  [".row", { x: 0 }, { delay: 0.05, at: "-0.1" }], // `at` = relative/absolute time
]);
```

Attach `ref={scope}` to the boundary element. Animations auto-clean on unmount. Use it
for event-driven or sequenced motion that declarative `animate` can't express.
`import { useAnimate } from "motion/react-mini"` for a smaller build if you don't need
the full feature set.

---

## 9. Config & bundle

- **`MotionConfig`**: `transition` default for the subtree, `reducedMotion="user|always|never"`.
  (This repo instead exposes `useMotionPrefs()` — prefer it; see SKILL.)
- **`LazyMotion`**: `features={domAnimation}` (animations + gesture animations) or
  `features={domMax}` (adds **drag + layout/projection**). Children must use `m`, not
  `motion`. `strict` throws on `motion.*`. **This repo already mounts
  `<LazyMotion features={domMax} strict>` app-wide — don't add another; just use `m`.**
- `domMax` is a strict superset of `domAnimation`: it already includes drag, layout,
  gestures, and animations. If you think you need a feature it lacks, you probably don't.

---

## 10. Version notes

- Package is `motion` (v11+); import from `"motion/react"`. The old package was
  `framer-motion` (docs still say "Framer Motion") — same API surface.
- v12: `stagger()` in `delayChildren`, and some `AnimatePresence`/`usePresenceData`
  ergonomics. This repo is on v11 (`^11.15.0`) — prefer v11-safe forms
  (`staggerChildren`) and confirm anything newer against the installed version.
