# Gestures & touch

Building touch interaction on the mobile web (PWA + mobile site). Each rule is
one line, then a short _why_.

**In QueerPulse:** reuse `useSwipe()` (`src/shared/hooks/`) for horizontal
swipes — it's Pointer Events, ignores mouse pointers, requires a threshold, and
only fires when the drag is more horizontal than vertical, so vertical scroll is
never hijacked. `usePrefersReducedMotion()` and `useMediaQuery()` exist too. The
messaging long-press overlay and swipe-to-reply already live under
`messaging-craft` — this reference is the general vocabulary.

## Touch target sizing & spacing

Three numbers, three purposes — don't conflate them.

- **Apple HIG: at least 44×44 pt.** _A design-time comfort floor for the whole control, tapped accurately with a finger._
- **Material: at least 48×48 dp, ~8 dp apart.** _Cross-platform comfort floor; 48 dp ≈ a finger pad. A 24 dp icon gets padded out to 48._
- **WCAG 2.5.8 (AA): at least 24×24 CSS px, or undersized with spacing.** _An accessibility minimum, not a comfort target: a sub-24px control passes only if a 24px circle centred on it touches no other target's circle._
- **WCAG 2.5.5 (AAA): at least 44×44 CSS px.** _The stricter tier; matches Apple's number._
- **Ship to 44–48px; treat 24 as the never-cross line.** _44/48 are what feel good; 24 is the floor below which even careful users mis-tap._
- **Hit area ≥ visual size.** _A 24px glyph can wear invisible padding out to a 44px target — enlarge the touch region, not the ink._

```css
.icon-button {
  min-inline-size: 44px;
  min-block-size: 44px;
  display: inline-grid;
  place-items: center;
}
```

## `touch-action`: declaring gesture intent

- **Put `touch-action: manipulation` on tappable controls.** _It drops double-tap-to-zoom, which removes the legacy ~300ms tap delay on click._
- **Constrain a custom gesture surface with the axis you _don't_ own.** _A horizontal swipe-to-reveal row uses `touch-action: pan-y` so vertical page scroll stays native while you handle horizontal._
- **Reserve `touch-action: none` for surfaces you fully drive** (canvas, map, drag handle). _It also blocks pinch-zoom — an accessibility harm — so never blanket it on scrollable content._
- **Set it before the gesture starts.** _Changing `touch-action` after a gesture begins has no effect on that gesture._

```css
.swipe-row {
  touch-action: pan-y;
} /* app owns horizontal, browser owns vertical */
.drag-handle {
  touch-action: none;
}
```

## Pointer Events over Touch Events

- **Handle input with Pointer Events, not Touch Events.** _One model for mouse, pen, and touch; `PointerEvent` extends `MouseEvent`, so one code path covers all — this is what `useSwipe` does._
- **Use `pointerdown`/`pointermove`/`pointerup`; branch on `event.pointerType`** (`"mouse" | "pen" | "touch"`) _only when a device genuinely needs different treatment._
- **Call `setPointerCapture(event.pointerId)` on drag start.** _Retargets later moves to your element even when the finger slides outside it; capture auto-releases on `pointerup`/`pointercancel`._
- **Don't mix pointer logic with `click`, and never run both.** _Browsers still emit compatibility mouse/click events after touch; debounce or cancel so an action doesn't fire twice._
- **Always handle `pointercancel`.** _The system can steal a gesture (incoming call, scroll takeover); reset drag state or it hangs — `useSwipe` drops its start point on cancel for exactly this._

```js
function onPointerDown(pointerEvent) {
  const dragHandle = pointerEvent.currentTarget;
  dragHandle.setPointerCapture(pointerEvent.pointerId);
  dragHandle.addEventListener("pointermove", onPointerMove);
}
```

## Core gesture patterns & their contracts

- **Tap** — primary action. _Give `:active`/pressed feedback within ~100ms; never require a hover state first._
- **Long-press (~500ms)** — reveal secondary/context actions. _Poorly discoverable, so it must *accelerate* something also reachable by a visible control; confirm engagement with a haptic tick or a visual grow. Releasing before threshold cancels._
- **Swipe** — reveal row actions, navigate, or dismiss. _Show an affordance (peek the action, a handle); pair `touch-action: pan-y` so vertical scroll survives; under-threshold springs back._
- **Drag & reorder** — direct manipulation. _Needs a grab handle, a lifted/elevated visual, and `setPointerCapture`; a drop outside a valid zone returns the item home._
- **Pull-to-refresh** — refresh a feed. _Only arm when the scroll container is at the top; apply rubber-band resistance and a distance threshold before committing; show a spinner past threshold; release-before-threshold snaps back with no fetch._
- **Universal rule: every gesture has a non-gesture equivalent.** _Gestures are hidden; a visible button, menu item, or link must reach the same outcome._

## Momentum & scroll

- **Add `overscroll-behavior: contain` to modals, drawers, bottom sheets, and inner scrollers.** _Stops scroll chaining into the page behind, and on the y-axis disables the browser's pull-to-refresh._
- **Keep `-webkit-overflow-scrolling: touch` where it already exists** for legacy iOS momentum; _harmless where scrolling is already native._
- **Don't hijack native scroll** with custom wheel/inertia math. _You'll fight the compositor and lose 60fps; let the browser scroll and only own discrete gestures._

```css
.bottom-sheet-scroll {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
```

## Hover, pointer precision & press feedback

- **Gate hover-only affordances behind `@media (hover: hover) and (pointer: fine)`.** _`hover: none` means the primary input can't hover at all; touch users never see it, so anything hidden there is unreachable._
- **Ship the tap-reachable version first, enhance for mouse.** _Base styles work everywhere; the media query only *adds* mouse polish._
- **Deliver pressed feedback within ~100ms** via `:active` or a `pointerdown` class. _The user must know the tap landed._

```css
.card-action {
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  .card:not(:hover) .card-action {
    opacity: 0;
  }
}
```

## Avoiding accidental taps

- **Space competing targets (~8dp+).** _Targets must be big enough *and* spaced enough to prevent fat-finger errors._
- **No destructive action without confirm or undo.** _Touch mis-fires are common; an irreversible one-tap delete is a trap (Peak-End: a lost message defines the memory)._
- **Debounce double-fire.** _Compatibility events plus fast repeat taps can run a handler twice; lock during the async action._
- **On long-press targets, suppress text selection and the iOS callout.**

```css
.long-press-target {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

## Haptics

- **Use `navigator.vibrate(...)` as progressive enhancement only** — it does nothing where unsupported. _Fine for confirming a long-press or reorder commit on Android/Chrome._
- **Don't depend on it — iOS Safari doesn't support the Vibration API** (as of mid-2026; Firefox also lacks it). _Any haptic must be optional garnish; feature-detect: `if ("vibrate" in navigator) navigator.vibrate(10);`_

## Sources

- [touch-action — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — values, tap-delay removal
- [Pointer events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) — unified input, setPointerCapture
- [overscroll-behavior — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) — contain, scroll chaining, pull-to-refresh
- [@media hover — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover) — hover/pointer gating
- [Vibration API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) — navigator.vibrate, limited availability
- [navigator.vibrate — Can I use](https://caniuse.com/mdn-api_navigator_vibrate) — iOS Safari unsupported
- [Understanding SC 2.5.8: Target Size (Minimum) — W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24 CSS px + spacing
- [Understanding SC 2.5.5: Target Size (Enhanced) — W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) — 44 CSS px AAA
- [Getting the Hit Target Size Right — Apple Design Tips](https://developer.apple.com/design/tips/) — 44×44 pt hit target
- [Accessible tap targets — web.dev](https://web.dev/articles/accessible-tap-targets) — 48dp min, 8px spacing
- [Touch Targets on Touchscreens — NN/g](https://www.nngroup.com/articles/touch-target-size/) — ~1cm minimum, spacing research
