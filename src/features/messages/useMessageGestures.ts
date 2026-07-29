import { useCallback, useRef, useState } from "react";
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
// Motion obeys the repo rules: the follow is transform-only. `swipeOffset` is
// always tracked (even under reduced motion) so the reply-hint icon can still
// cue progress; it's the CONSUMER's job to skip applying it as a bubble
// transform under reduced motion (see MessageRun.tsx) — the gesture and its
// icon feedback stay usable either way, just without the bubble following.

/** Horizontal travel before a drag is treated as a swipe (vs. a vertical scroll). */
const SWIPE_ENGAGE_PX = 12;
/** Release at/after this offset fires the reply. */
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
}

export interface UseMessageGesturesResult {
  handlers: UseLongPressHandlers;
  /** Signed px to translate the bubble by while following the finger toward
   *  `replyDirection` (positive = right, negative = left; 0 when idle). Always
   *  tracked — including under reduced motion, so the reply-hint icon can
   *  still cue progress — it's up to the consumer whether to also apply it as
   *  a bubble transform. */
  swipeOffset: number;
  /** True while a follow drag is in progress (drives the no-transition class). */
  swiping: boolean;
}

/** True when the pointer landed on an interactive descendant (a reaction chip,
 *  the reply-quote, an action button, the edit field) rather than the bubble
 *  surface — those own their own behaviour, so gestures must ignore them. */
function isInteractiveTarget(event: React.PointerEvent): boolean {
  const target = event.target as HTMLElement | null;
  return !!target?.closest("button, a, textarea, input, select");
}

export function useMessageGestures({
  enabled,
  onOpenActions,
  onReply,
  onQuickReact,
  replyDirection,
}: UseMessageGesturesOptions): UseMessageGesturesResult {
  const longPress = useLongPress(onOpenActions, { enabled });
  const pressRef = useRef<PressState | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const resetSwipe = useCallback(() => {
    pressRef.current = null;
    setSwiping(false);
    setSwipeOffset(0);
  }, []);

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
      // Always track progress — even under reduced motion — so the reply-hint
      // icon can still cue how close a release is to arming; the consumer
      // decides whether to also render it as a bubble transform.
      setSwipeOffset(offset);
    },
    [longPress, onReply, replyDirection],
  );

  const endPress = useCallback(
    (event: React.PointerEvent) => {
      const press = pressRef.current;
      pressRef.current = null;
      if (press?.engaged) {
        // Snap back (CSS transition) and fire reply if we crossed the threshold.
        setSwiping(false);
        setSwipeOffset(0);
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
    [onQuickReact, onReply],
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
    swipeOffset,
    swiping,
  };
}
