import { useCallback, useRef } from "react";

export interface UseSwipeHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum horizontal travel (px) to count as a swipe. */
  thresholdPx?: number;
}

/**
 * Fires `onSwipeLeft` / `onSwipeRight` on a horizontal touch drag. Returns
 * handlers to spread on the target element. Touch-only: mouse pointers are
 * ignored so desktop clicks and hover behaviour are untouched. A gesture only
 * counts when it travels past `thresholdPx` horizontally AND is more horizontal
 * than vertical, so vertical page scrolling is never hijacked.
 */
export function useSwipe(options: UseSwipeOptions): UseSwipeHandlers {
  const { onSwipeLeft, onSwipeRight, thresholdPx = 40 } = options;
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    startPointRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = startPointRef.current;
      startPointRef.current = null;
      if (!start || event.pointerType === "mouse") return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (
        Math.abs(deltaX) < thresholdPx ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }
      if (deltaX < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight, thresholdPx],
  );

  // The card can sit inside a scroll; the browser cancels an in-progress
  // pointer once a scroll gesture takes over, so drop the start point rather
  // than fire a stale swipe.
  const onPointerCancel = useCallback(() => {
    startPointRef.current = null;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}
