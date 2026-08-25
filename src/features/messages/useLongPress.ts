import { useCallback, useEffect, useRef } from "react";
import { hapticTap } from "../../shared/lib/haptics";

/** Set on the pressed element for the whole duration of a touch long-press
 *  hold (see `onPointerDown`/`clear` below) — a plain DOM attribute, not React
 *  state, so a hold never re-renders the bubble subtree. Consumers cue the
 *  hold visually off this attribute (e.g. `.bubbleWrap[data-long-press-active
 *  ="true"]` in MessagesPage.module.css). */
const PRESS_ACTIVE_ATTRIBUTE = "data-long-press-active";

export interface LongPressOrigin {
  /** Bounding rect of the pressed element, so the overlay can anchor itself. */
  rect: DOMRect;
  /** Which input opened the menu. A touch long-press wants the full-screen
   *  lifted-bubble overlay; a desktop right-click wants a compact context menu
   *  at the cursor — the consumer branches on this. */
  source: "touch" | "pointer";
  /** Cursor position (viewport coords) for a right-click, so the context menu
   *  can anchor at the pointer. Absent for touch long-press. */
  point?: { x: number; y: number };
}

export interface UseLongPressHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerLeave: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

/**
 * Fires `onTrigger` on a touch long-press (~450ms, cancelled by movement or an
 * early release) or a desktop right-click. Returns handlers to spread on the
 * target element. `enabled: false` makes every handler a no-op (used to skip
 * optimistic messages that have no server id yet).
 */
export function useLongPress(
  onTrigger: (origin: LongPressOrigin) => void,
  options?: { enabled?: boolean; delayMs?: number; moveTolerancePx?: number },
): UseLongPressHandlers {
  const enabled = options?.enabled ?? true;
  const delayMs = options?.delayMs ?? 450;
  const moveTolerancePx = options?.moveTolerancePx ?? 10;

  const timerRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  /** The element currently mid-hold, so `clear()` can drop its pressed
   *  attribute regardless of which handler (release, cancel, move-past-
   *  tolerance, leave) ends the hold. */
  const pressedElementRef = useRef<Element | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPointRef.current = null;
    pressedElementRef.current?.removeAttribute(PRESS_ACTIVE_ATTRIBUTE);
    pressedElementRef.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const fire = useCallback(
    (
      element: Element,
      source: "touch" | "pointer",
      point?: { x: number; y: number },
    ) => onTrigger({ rect: element.getBoundingClientRect(), source, point }),
    [onTrigger],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled || event.pointerType === "mouse") return;
      const element = event.currentTarget;
      startPointRef.current = { x: event.clientX, y: event.clientY };
      // Cue the hold immediately — a scale/elevation grow on the pressed
      // bubble (see the CSS attribute selector) — rather than nothing
      // visible until the overlay pops ~450ms later, which read as dead/
      // laggy.
      pressedElementRef.current = element;
      element.setAttribute(PRESS_ACTIVE_ATTRIBUTE, "true");
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        element.removeAttribute(PRESS_ACTIVE_ATTRIBUTE);
        pressedElementRef.current = null;
        // A haptic tick confirming the hold engaged — no-op where the Vibration
        // API is unsupported (notably iOS Safari).
        hapticTap();
        fire(element, "touch");
      }, delayMs);
    },
    [enabled, delayMs, fire],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const start = startPointRef.current;
      if (!start) return;
      const movedTooFar =
        Math.abs(event.clientX - start.x) > moveTolerancePx ||
        Math.abs(event.clientY - start.y) > moveTolerancePx;
      if (movedTooFar) clear();
    },
    [moveTolerancePx, clear],
  );

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled) return;
      event.preventDefault();
      fire(event.currentTarget, "pointer", {
        x: event.clientX,
        y: event.clientY,
      });
    },
    [enabled, fire],
  );

  return {
    onPointerDown,
    onPointerUp: clear,
    onPointerMove,
    onPointerLeave: clear,
    // The message list is scrollable; the browser cancels an in-progress
    // pointer once a scroll gesture takes over, so this must clear the timer
    // the same as a release — otherwise the overlay can pop mid-scroll.
    onPointerCancel: clear,
    onContextMenu,
  };
}
