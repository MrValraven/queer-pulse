import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useVerticalSwipe } from "../../../../shared/hooks/useVerticalSwipe";

/** Upward travel past which a press counts as a drag and its click is dropped. */
const DRAG_CLICK_SLOP_PX = 10;
/** A click this soon after a drag's release ends that drag; later ones pass. */
const DRAG_CLICK_WINDOW_MS = 500;

/**
 * The card's swipe up. useVerticalSwipe captures the pointer on the card,
 * which retargets the release and its click to the card, so a tap on a
 * button would land nowhere. The press hands the capture on to the pressed
 * button; move and up events still bubble to the card, so a swipe started
 * anywhere still opens Now playing. A pointer click within
 * DRAG_CLICK_WINDOW_MS of a drag's release ends that drag and is dropped;
 * keyboard clicks (detail 0) and any later click always pass, so a click
 * that arrives with no pointerdown (some assistive tech) is never lost.
 */
export function useMiniCardSwipe(onSwipe: () => void) {
  const hasDraggedRef = useRef(false);
  const dragEndedAtRef = useRef<number | null>(null);
  const swipe = useVerticalSwipe({
    direction: "up",
    onSwipe: () => {
      hasDraggedRef.current = true;
      onSwipe();
    },
    onDrag: (offset) => {
      if (offset > DRAG_CLICK_SLOP_PX) hasDraggedRef.current = true;
    },
  });
  return {
    ...swipe,
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      hasDraggedRef.current = false;
      dragEndedAtRef.current = null;
      swipe.onPointerDown(event);
      // The hook ignores mouse presses, so a mouse keeps its own capture.
      if (event.pointerType === "mouse") return;
      const button = (event.target as Element).closest("button");
      if (!button) return;
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // jsdom or unsupported: the click still reaches the button.
      }
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      swipe.onPointerUp(event);
      if (hasDraggedRef.current) dragEndedAtRef.current = event.timeStamp;
      hasDraggedRef.current = false;
    },
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      const dragEndedAt = dragEndedAtRef.current;
      dragEndedAtRef.current = null;
      const isDragEnd =
        dragEndedAt !== null &&
        event.timeStamp - dragEndedAt <= DRAG_CLICK_WINDOW_MS;
      if (!isDragEnd || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
