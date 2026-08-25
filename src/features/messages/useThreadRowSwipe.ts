import { useCallback, useRef, useState, type RefObject } from "react";
import { isInteractiveTarget } from "./useMessageGestures";

// ── Thread-row swipe (pin / favorite) ───────────────────────────────────────
// Generalizes `useMessageGestures`'s single-direction swipe-to-reply into a
// TWO-direction gesture for inbox rows: a right-swipe reveals/toggles Pin, a
// left-swipe reveals/toggles Favorite. Same engage/trigger thresholds, same
// touch/pen-only gate (a mouse drag is never a swipe — desktop uses the ⋯
// menu), same "engaged swipe consumes the gesture" contract, same direct-DOM
// transform writes on every `pointermove` (no React state per frame — only
// `swiping`, which flips at most twice per gesture). The one real difference:
// the bubble hook engages toward a single fixed direction; this one engages on
// whichever horizontal direction the drag actually takes, and the SIGN of the
// released offset (not a fixed `replyDirection`) picks which action fires.

/** Horizontal travel before a drag is treated as a swipe (vs. a vertical scroll). */
const SWIPE_ENGAGE_PX = 12;
/** Release at/beyond this offset fires the swiped action; also the drag
 *  distance at which the revealed affordance icon reaches full opacity/scale. */
const SWIPE_TRIGGER_PX = 56;
/** Follow distance is clamped here so the row never slides off. */
const SWIPE_MAX_PX = 72;

interface RowPressState {
  pointerId: number;
  startX: number;
  startY: number;
  /** True once the drag passed `SWIPE_ENGAGE_PX` on the horizontal axis — from
   *  then on the row follows the finger and a release decides fire-or-snap-back. */
  engaged: boolean;
  /** Signed follow distance, clamped to ±`SWIPE_MAX_PX`. Positive = dragging
   *  right (toward Pin), negative = dragging left (toward Favorite). */
  offset: number;
}

export interface UseThreadRowSwipeOptions {
  /** Gestures are live only while this row supports pin/favorite swipes. */
  enabled: boolean;
  /** Toggles Pin — called on release when the offset is positive (right) and
   *  crossed `SWIPE_TRIGGER_PX`. Same mutation the ⋯ menu's "Pin"/"Unpin" item
   *  already calls — the caller wires the same `otherPinnedCount` cap math. */
  onSwipePin: () => void;
  /** Toggles Favorite — called on release when the offset is negative (left)
   *  and crossed `SWIPE_TRIGGER_PX`. Same mutation the ⋯ menu already calls. */
  onSwipeFavorite: () => void;
  /** The row `<button>` node the swipe drags. The hook writes `transform`
   *  directly to this DOM node on every `pointermove` — never via React
   *  state, never via a re-render. */
  rowRef: RefObject<HTMLElement | null>;
  /** The leading (left, Pin) affordance icon. Always mounted (invisible at
   *  rest via the consumer's own baseline inline style) so the hook has a
   *  stable node to write opacity/scale progress to directly. */
  leadingIconRef: RefObject<HTMLSpanElement | null>;
  /** The trailing (right, Favorite) affordance icon — same contract as
   *  `leadingIconRef`, mirrored to the other side. */
  trailingIconRef: RefObject<HTMLSpanElement | null>;
  /** True under `prefers-reduced-motion` — the row itself never receives the
   *  follow transform in that mode (a no-op `translateX(0px)`), though the
   *  revealed affordance icon still cues drag progress either way. */
  reducedMotion: boolean;
}

export interface UseThreadRowSwipeResult {
  handlers: {
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerLeave: (event: React.PointerEvent) => void;
    onPointerCancel: (event: React.PointerEvent) => void;
  };
  /** True while a follow drag is in progress (drives the no-transition
   *  `.threadRowSwiping` class). The only piece of this gesture still backed
   *  by React state — flips at most twice per drag (engage, release). */
  swiping: boolean;
  /** Call from the row's `onClick` BEFORE opening the thread. Returns `true`
   *  (and consumes the flag) exactly when the just-finished pointer sequence
   *  was an engaged swipe — so an engaged swipe never also opens the thread,
   *  without this being React state that would re-render the row. */
  consumeSwipeClick: () => boolean;
}

function writeRowTransform(
  node: HTMLElement | null,
  offsetPx: number,
  reducedMotion: boolean,
): void {
  if (!node) return;
  node.style.transform =
    !reducedMotion && offsetPx !== 0 ? `translateX(${offsetPx}px)` : "";
}

/** Writes each affordance icon's opacity + scale straight to the DOM. Only the
 *  side the drag is currently leaning toward shows progress — the other side
 *  stays at 0 — independent of reduced motion, so the icons still cue an
 *  in-progress swipe even when the row itself doesn't visibly follow. */
function writeAffordanceProgress(
  leadingNode: HTMLSpanElement | null,
  trailingNode: HTMLSpanElement | null,
  offsetPx: number,
): void {
  const progress = Math.min(1, Math.abs(offsetPx) / SWIPE_TRIGGER_PX);
  const leadingProgress = offsetPx > 0 ? progress : 0;
  const trailingProgress = offsetPx < 0 ? progress : 0;
  if (leadingNode) {
    leadingNode.style.opacity = String(leadingProgress);
    leadingNode.style.transform = `scale(${leadingProgress})`;
  }
  if (trailingNode) {
    trailingNode.style.opacity = String(trailingProgress);
    trailingNode.style.transform = `scale(${trailingProgress})`;
  }
}

export function useThreadRowSwipe({
  enabled,
  onSwipePin,
  onSwipeFavorite,
  rowRef,
  leadingIconRef,
  trailingIconRef,
  reducedMotion,
}: UseThreadRowSwipeOptions): UseThreadRowSwipeResult {
  const pressRef = useRef<RowPressState | null>(null);
  const consumeClickRef = useRef(false);
  const [swiping, setSwiping] = useState(false);

  const resetSwipe = useCallback(() => {
    pressRef.current = null;
    setSwiping(false);
    writeRowTransform(rowRef.current, 0, reducedMotion);
    writeAffordanceProgress(leadingIconRef.current, trailingIconRef.current, 0);
  }, [rowRef, leadingIconRef, trailingIconRef, reducedMotion]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      // Touch/pen only (a mouse drag isn't a row swipe — desktop uses the ⋯
      // menu) and never starting on an interactive descendant (the row has
      // none today, but this stays the same defensive guard the bubble
      // gesture uses, and it's what makes "can't start on the ⋯ trigger"
      // true even if the row ever grows another inline control).
      if (
        !enabled ||
        event.pointerType === "mouse" ||
        isInteractiveTarget(event)
      ) {
        pressRef.current = null;
        return;
      }
      pressRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        engaged: false,
        offset: 0,
      };
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - press.startX;
      const deltaY = event.clientY - press.startY;
      if (!press.engaged) {
        // Engage on whichever axis-dominant horizontal intent appears — a
        // vertical drag stays a scroll (the row's `touch-action: pan-y` keeps
        // that native), either horizontal direction can arm.
        if (
          Math.abs(deltaX) > SWIPE_ENGAGE_PX &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          press.engaged = true;
          setSwiping(true);
        } else {
          return;
        }
      }
      const offset = Math.max(-SWIPE_MAX_PX, Math.min(SWIPE_MAX_PX, deltaX));
      press.offset = offset;
      // Direct DOM writes only — no `setState` here, so a swipe never
      // re-renders the row (avatar, badges, indicators) on every pointer frame.
      writeRowTransform(rowRef.current, offset, reducedMotion);
      writeAffordanceProgress(
        leadingIconRef.current,
        trailingIconRef.current,
        offset,
      );
    },
    [rowRef, leadingIconRef, trailingIconRef, reducedMotion],
  );

  const endPress = useCallback(() => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press?.engaged) return;
    setSwiping(false);
    writeRowTransform(rowRef.current, 0, reducedMotion);
    writeAffordanceProgress(leadingIconRef.current, trailingIconRef.current, 0);
    // An engaged swipe consumes the gesture — never also a tap-to-open, even
    // when it landed under the fire threshold (still a clear drag, not a tap).
    consumeClickRef.current = true;
    if (Math.abs(press.offset) >= SWIPE_TRIGGER_PX) {
      if (press.offset > 0) onSwipePin();
      else onSwipeFavorite();
    }
  }, [
    rowRef,
    leadingIconRef,
    trailingIconRef,
    reducedMotion,
    onSwipePin,
    onSwipeFavorite,
  ]);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (pressRef.current?.pointerId !== event.pointerId) return;
      endPress();
    },
    [endPress],
  );

  const onPointerLeave = useCallback(
    (event: React.PointerEvent) => {
      if (pressRef.current?.pointerId !== event.pointerId) return;
      resetSwipe();
    },
    [resetSwipe],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (pressRef.current?.pointerId !== event.pointerId) return;
      resetSwipe();
    },
    [resetSwipe],
  );

  const consumeSwipeClick = useCallback(() => {
    if (!consumeClickRef.current) return false;
    consumeClickRef.current = false;
    return true;
  }, []);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
    },
    swiping,
    consumeSwipeClick,
  };
}
