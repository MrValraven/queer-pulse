import { useCallback, useRef, useState, type RefObject } from "react";
import {
  useLongPress,
  type LongPressOrigin,
  type UseLongPressHandlers,
} from "./useLongPress";

// ── Bubble gestures ──────────────────────────────────────────────────────────
// Composes the existing long-press/right-click overlay trigger with two touch
// gestures, WITHOUT forking either the reply path or the reaction path:
//   #7 swipe-to-reply — a short drag TOWARD `replyDirection` on a bubble arms
//      a reply to it (calls the SAME `onReply` the overlay's Reply item
//      calls). Received (left-aligned) bubbles swipe right; sent (own,
//      right-aligned) bubbles swipe left — WhatsApp/Telegram/Signal-style,
//      always dragging away from where the bubble sits.
//   #8 double-tap / double-click — toggles the default ❤️ reaction (calls the
//      SAME `onQuickReact` → reaction toggle the picker/chips use).
// Disambiguation: a long-press is a stationary hold (movement cancels it and the
// swipe engages instead); a double-tap is two quick stationary taps (a swipe is
// a drag). All three read from one shared pointer press, so they never fight.
//
// Motion obeys the repo rules: the follow is transform-only. During an active
// drag, the follow-distance is written STRAIGHT TO THE DOM (via `bubbleRef`
// and `hintRef`, both owned by the consumer/hook — see below) on every
// `pointermove`, bypassing React state entirely. That keeps a swipe from
// re-rendering the bubble subtree (and its mentions/links/reactions) on every
// pointer frame — only `swiping` is still React state, and it only flips
// twice per gesture (engage-start, release), not once per frame.

/** Horizontal travel before a drag is treated as a swipe (vs. a vertical scroll). */
const SWIPE_ENGAGE_PX = 12;
/** Release at/after this offset fires the reply; also the drag distance at
 *  which the reply-hint icon reaches full opacity/scale. */
const SWIPE_TRIGGER_PX = 56;
/** Follow distance is clamped here so the bubble never slides off. */
const SWIPE_MAX_PX = 72;
/** Max gap between the two taps of a double-tap. */
const DOUBLE_TAP_MS = 300;
/** Max movement (either axis) still counted as a tap / as "the same spot". */
const TAP_SLOP_PX = 24;
/** A press held longer than this was a long-press, never a tap. */
const LONG_PRESS_GUARD_MS = 400;

interface PressState {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  pointerType: string;
  /** True once a drag toward `replyDirection` passed `SWIPE_ENGAGE_PX` — from
   *  then on the bubble follows the finger and a release decides
   *  reply-or-snap-back. */
  engaged: boolean;
  offset: number;
}

export interface UseMessageGesturesOptions {
  /** Gestures are live only for a message with a server id that isn't deleted. */
  enabled: boolean;
  /** Opens the long-press/right-click action overlay (unchanged path). */
  onOpenActions: (origin: LongPressOrigin) => void;
  /** Arms a reply to this message. Undefined → swipe-to-reply disabled (e.g. an
   *  optimistic message with no server id yet). */
  onReply?: () => void;
  /** Toggles the default reaction. Undefined → double-tap disabled. */
  onQuickReact?: () => void;
  /** Which way a drag must travel to arm the reply — "right" for received
   *  (left-aligned) bubbles, "left" for sent (own, right-aligned) bubbles. The
   *  opposite horizontal drag is ignored (left as native scroll/no-op). */
  replyDirection: "left" | "right";
  /** The bubble-wrap node the swipe drags. The hook writes `transform`
   *  directly to this DOM node on every `pointermove` (never via React state,
   *  never via a re-render) — owned by the consumer, which already keeps this
   *  ref for other purposes (positioning the action overlay). */
  bubbleRef: RefObject<HTMLElement | null>;
  /** The reply-hint icon node. Always mounted (invisible at rest via the
   *  consumer's own baseline inline style) so the hook has a stable node to
   *  write opacity/scale progress to directly, the same way it writes the
   *  bubble's transform — no per-frame React state either. Owned by the
   *  consumer (not returned from this hook) so this hook's return value never
   *  itself contains a ref — bundling a ref alongside `swiping`/`handlers` in
   *  one returned object would make EVERY property on that object look like a
   *  ref access to `react-hooks/refs` wherever the consumer reads it. */
  hintRef: RefObject<HTMLSpanElement | null>;
  /** True under `prefers-reduced-motion` — the bubble itself never receives the
   *  follow transform in that mode (the hook still writes `translateX(0px)`,
   *  i.e. a no-op), though the reply-hint icon still cues drag progress either
   *  way so the gesture stays legible without the bubble visibly moving. */
  reducedMotion: boolean;
}

export interface UseMessageGesturesResult {
  handlers: UseLongPressHandlers;
  /** True while a follow drag is in progress (drives the no-transition
   *  `.bubbleWrapSwiping` class). The only piece of this gesture still backed
   *  by React state — it flips at most twice per drag (engage, release), so a
   *  re-render here is cheap and unavoidable (it toggles a class the CSS
   *  transition needs off during the follow). */
  swiping: boolean;
}

/** True when the pointer landed on an interactive descendant (a reaction chip,
 *  the reply-quote, an action button, the edit field) rather than the bubble
 *  surface — those own their own behaviour, so gestures must ignore them.
 *  Exported so `useThreadRowSwipe` (the inbox row's pin/favorite swipe) reuses
 *  the same guard instead of forking it. */
export function isInteractiveTarget(event: React.PointerEvent): boolean {
  const target = event.target as HTMLElement | null;
  return !!target?.closest("button, a, textarea, input, select");
}

/** Writes the bubble's follow-transform straight to the DOM. `offsetPx === 0`
 *  (idle/reset) clears the inline style entirely rather than writing
 *  `translateX(0px)`, so the CSS `.bubbleWrap` rule (and its snap-back
 *  transition) is what's visibly in control at rest. Under reduced motion the
 *  bubble never receives a non-zero transform — only the hint icon moves. */
function writeBubbleTransform(
  node: HTMLElement | null,
  offsetPx: number,
  reducedMotion: boolean,
): void {
  if (!node) return;
  node.style.transform = !reducedMotion && offsetPx !== 0 ? `translateX(${offsetPx}px)` : "";
}

/** Writes the reply-hint icon's opacity + scale straight to the DOM, tracking
 *  drag progress toward `SWIPE_TRIGGER_PX` — independent of reduced motion, so
 *  the icon still cues an in-progress swipe even when the bubble itself
 *  doesn't visibly follow the finger. */
function writeHintProgress(node: HTMLSpanElement | null, offsetPx: number): void {
  if (!node) return;
  const progress = Math.min(1, Math.abs(offsetPx) / SWIPE_TRIGGER_PX);
  node.style.opacity = String(progress);
  node.style.transform = `scale(${progress})`;
}

export function useMessageGestures({
  enabled,
  onOpenActions,
  onReply,
  onQuickReact,
  replyDirection,
  bubbleRef,
  hintRef,
  reducedMotion,
}: UseMessageGesturesOptions): UseMessageGesturesResult {
  // `moveTolerancePx` matched to `SWIPE_ENGAGE_PX`: a drag between the two
  // hooks' defaults (10 vs 12) cancelled the long-press without yet crossing
  // the swipe's own engage threshold — a dead band where a real drag did
  // nothing at all. Aligning them means the same movement that cancels the
  // hold is exactly what arms the swipe.
  const longPress = useLongPress(onOpenActions, {
    enabled,
    moveTolerancePx: SWIPE_ENGAGE_PX,
  });
  const pressRef = useRef<PressState | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState(false);

  const resetSwipe = useCallback(() => {
    pressRef.current = null;
    setSwiping(false);
    writeBubbleTransform(bubbleRef.current, 0, reducedMotion);
    writeHintProgress(hintRef.current, 0);
  }, [bubbleRef, hintRef, reducedMotion]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      longPress.onPointerDown(event);
      if (!enabled || isInteractiveTarget(event)) {
        pressRef.current = null;
        return;
      }
      pressRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: Date.now(),
        pointerType: event.pointerType,
        engaged: false,
        offset: 0,
      };
    },
    [longPress, enabled],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      longPress.onPointerMove(event);
      const press = pressRef.current;
      // Swipe follows touch/pen only (a mouse drag isn't a reply gesture) and
      // needs a reply handler to arm.
      if (
        !press ||
        press.pointerId !== event.pointerId ||
        press.pointerType === "mouse" ||
        !onReply
      ) {
        return;
      }
      const deltaX = event.clientX - press.startX;
      const deltaY = event.clientY - press.startY;
      // +1 for a rightward-arming bubble (received), -1 for leftward (sent) —
      // `travel` is positive once the drag has moved toward the reply side.
      const sign = replyDirection === "right" ? 1 : -1;
      const travel = sign * deltaX;
      if (!press.engaged) {
        // Engage only on clear intent TOWARD `replyDirection` — a vertical
        // drag stays a scroll (the wrap's `touch-action: pan-y` keeps that
        // native), and a drag the wrong way is ignored entirely.
        if (travel > SWIPE_ENGAGE_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
          press.engaged = true;
          setSwiping(true);
        } else {
          return;
        }
      }
      const magnitude = Math.max(0, Math.min(SWIPE_MAX_PX, travel));
      const offset = sign * magnitude; // signed: negative for a left-swiping bubble
      press.offset = offset;
      // Direct DOM writes only — no `setState` here. This is the ONE line that
      // used to re-render the whole bubble subtree every pointer frame.
      writeBubbleTransform(bubbleRef.current, offset, reducedMotion);
      writeHintProgress(hintRef.current, offset);
    },
    [longPress, onReply, replyDirection, bubbleRef, hintRef, reducedMotion],
  );

  const endPress = useCallback(
    (event: React.PointerEvent) => {
      const press = pressRef.current;
      pressRef.current = null;
      if (press?.engaged) {
        // Snap back (CSS transition, re-enabled the instant `swiping` flips
        // false) and fire reply if we crossed the threshold.
        setSwiping(false);
        writeBubbleTransform(bubbleRef.current, 0, reducedMotion);
        writeHintProgress(hintRef.current, 0);
        if (Math.abs(press.offset) >= SWIPE_TRIGGER_PX) onReply?.();
        return; // an engaged swipe consumes the gesture — never also a tap
      }
      // Tap / double-tap path (touch double-tap AND mouse double-click).
      if (!press || !onQuickReact || event.button !== 0) return;
      if (Date.now() - press.startTime > LONG_PRESS_GUARD_MS) return; // long-press
      if (
        Math.abs(event.clientX - press.startX) > TAP_SLOP_PX ||
        Math.abs(event.clientY - press.startY) > TAP_SLOP_PX
      ) {
        return; // moved too far to be a tap
      }
      const now = Date.now();
      const last = lastTapRef.current;
      if (
        last &&
        now - last.time < DOUBLE_TAP_MS &&
        Math.abs(event.clientX - last.x) < TAP_SLOP_PX &&
        Math.abs(event.clientY - last.y) < TAP_SLOP_PX
      ) {
        lastTapRef.current = null;
        onQuickReact();
      } else {
        lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
      }
    },
    [onQuickReact, onReply, bubbleRef, hintRef, reducedMotion],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      longPress.onPointerUp(event);
      endPress(event);
    },
    [longPress, endPress],
  );

  const onPointerLeave = useCallback(
    (event: React.PointerEvent) => {
      longPress.onPointerLeave(event);
      resetSwipe();
    },
    [longPress, resetSwipe],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      longPress.onPointerCancel(event);
      resetSwipe();
    },
    [longPress, resetSwipe],
  );

  return {
    handlers: {
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onPointerLeave,
      onPointerCancel,
      onContextMenu: longPress.onContextMenu,
    },
    swiping,
  };
}
