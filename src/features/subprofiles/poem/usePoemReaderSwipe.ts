import { useEffect, useRef, type RefObject } from "react";

/** How far a finger must travel sideways before the swipe counts. */
const SWIPE_DISTANCE_PX = 56;
/** The sideways travel must beat the vertical travel by this factor, so a
 *  slightly diagonal scroll through the poem never turns the page. */
const HORIZONTAL_DOMINANCE = 1.5;

/**
 * Horizontal swipe between poems on the reader's scrolling surface. Touch
 * only, and it never calls `preventDefault`: the surface declares
 * `touch-action: pan-y pinch-zoom`, so the browser keeps vertical scrolling
 * and pinch-zoom, and when it takes a gesture over for scrolling it fires
 * `pointercancel`, which drops the swipe. A swipe left moves to the next poem
 * (`onMove(1)`), a swipe right to the previous one (`onMove(-1)`). The
 * Previous/Next buttons and the arrow keys reach the same outcome.
 */
export function usePoemReaderSwipe(
  surfaceRef: RefObject<HTMLElement | null>,
  onMove: (delta: number) => void,
): void {
  const onMoveRef = useRef(onMove);
  useEffect(() => {
    onMoveRef.current = onMove;
  });

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    let gestureStart: { x: number; y: number; pointerId: number } | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      // A second finger means a pinch: forget the swipe entirely.
      if (event.pointerType !== "touch" || !event.isPrimary) {
        gestureStart = null;
        return;
      }
      gestureStart = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      };
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (!gestureStart || event.pointerId !== gestureStart.pointerId) return;
      const horizontalTravel = event.clientX - gestureStart.x;
      const verticalTravel = event.clientY - gestureStart.y;
      gestureStart = null;
      const isFarEnough = Math.abs(horizontalTravel) >= SWIPE_DISTANCE_PX;
      const isSideways =
        Math.abs(horizontalTravel) >
        Math.abs(verticalTravel) * HORIZONTAL_DOMINANCE;
      if (!isFarEnough || !isSideways) return;
      onMoveRef.current(horizontalTravel < 0 ? 1 : -1);
    };
    const handlePointerCancel = () => {
      gestureStart = null;
    };

    surface.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    surface.addEventListener("pointerup", handlePointerUp, { passive: true });
    surface.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      surface.removeEventListener("pointerdown", handlePointerDown);
      surface.removeEventListener("pointerup", handlePointerUp);
      surface.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [surfaceRef]);
}
