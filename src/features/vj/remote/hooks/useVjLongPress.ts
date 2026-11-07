/**
 * A long press without sends, for clip tiles (the preview peek): held still
 * for `delayMs` it starts, and the lift, a cancel or the pointer leaving ends
 * it. Movement past `moveTolerancePx` before the delay cancels the hold. The
 * click the browser fires after a long press must not send, so the tile asks
 * `consumeClick()` first: it answers true exactly once after a long press.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DOMAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";

export const VJ_LONG_PRESS_DELAY_MS = 450;
export const VJ_LONG_PRESS_MOVE_TOLERANCE_PX = 10;

export interface UseVjLongPressOptions {
  delayMs?: number;
  moveTolerancePx?: number;
  isEnabled: boolean;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

export type VjLongPressHandlers = Pick<
  DOMAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerMove"
  | "onPointerLeave"
>;

interface VjActiveLongPress {
  pointerId: number;
  startX: number;
  startY: number;
  timerId: ReturnType<typeof setTimeout> | null;
  hasStarted: boolean;
}

export function useVjLongPress(options: UseVjLongPressOptions): {
  handlers: VjLongPressHandlers;
  isLongPressing: boolean;
  /** True once, right after a long press: the click that follows must not send. */
  consumeClick: () => boolean;
} {
  const latestRef = useRef(options);
  useEffect(() => {
    latestRef.current = options;
  });
  const activeRef = useRef<VjActiveLongPress | null>(null);
  const shouldSwallowClickRef = useRef(false);
  const [isLongPressing, setIsLongPressing] = useState(false);

  useEffect(
    () => () => {
      const active = activeRef.current;
      if (active?.timerId != null) clearTimeout(active.timerId);
      activeRef.current = null;
    },
    [],
  );

  const handlers = useMemo<VjLongPressHandlers>(() => {
    const end = (event: ReactPointerEvent<HTMLElement>) => {
      const active = activeRef.current;
      if (active === null || active.pointerId !== event.pointerId) return;
      if (active.timerId !== null) clearTimeout(active.timerId);
      activeRef.current = null;
      if (!active.hasStarted) return;
      setIsLongPressing(false);
      latestRef.current.onLongPressEnd();
    };

    return {
      onPointerDown: (event) => {
        shouldSwallowClickRef.current = false;
        if (!latestRef.current.isEnabled || activeRef.current !== null) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const active: VjActiveLongPress = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          timerId: null,
          hasStarted: false,
        };
        active.timerId = setTimeout(() => {
          active.timerId = null;
          if (activeRef.current !== active) return;
          if (!latestRef.current.isEnabled) {
            activeRef.current = null;
            return;
          }
          active.hasStarted = true;
          shouldSwallowClickRef.current = true;
          setIsLongPressing(true);
          latestRef.current.onLongPressStart();
        }, latestRef.current.delayMs ?? VJ_LONG_PRESS_DELAY_MS);
        activeRef.current = active;
      },
      onPointerMove: (event) => {
        const active = activeRef.current;
        if (active === null || active.pointerId !== event.pointerId) return;
        if (active.hasStarted || active.timerId === null) return;
        const tolerancePx =
          latestRef.current.moveTolerancePx ?? VJ_LONG_PRESS_MOVE_TOLERANCE_PX;
        const travelPx = Math.hypot(
          event.clientX - active.startX,
          event.clientY - active.startY,
        );
        if (travelPx <= tolerancePx) return;
        clearTimeout(active.timerId);
        activeRef.current = null;
      },
      onPointerUp: end,
      onPointerCancel: end,
      onPointerLeave: end,
    };
  }, []);

  const consumeClick = useCallback(() => {
    if (!shouldSwallowClickRef.current) return false;
    shouldSwallowClickRef.current = false;
    return true;
  }, []);

  return { handlers, isLongPressing, consumeClick };
}
