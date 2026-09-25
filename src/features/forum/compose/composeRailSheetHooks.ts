import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate, type MotionValue } from "motion/react";
import { COMPOSE_EASE } from "./composeMotion";

// ── Behaviour the rail's bottom sheet owns beyond `useDismiss` ──────────────

/**
 * Marks every Escape as handled while the sheet is mounted. `useDismiss`
 * closes the sheet on Escape but leaves the event untouched, and the page's
 * own shortcut listener reads Escape as "leave the composer". Claiming it in
 * the capture phase runs before any bubbling listener on the document, so one
 * press closes the sheet and nothing else, even while the sheet slides away.
 */
export function useClaimEscape() {
  useEffect(() => {
    const claimEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    document.addEventListener("keydown", claimEscape, true);
    return () => document.removeEventListener("keydown", claimEscape, true);
  }, []);
}

/** Past this much downward travel the sheet closes; anything shorter springs
 *  back. Matches the shared `ModalSheet`, so every sheet in the app dismisses
 *  at the same distance. */
const DRAG_TO_DISMISS_PX = 120;

/**
 * Drag-to-dismiss for the grabber. Touch only: a mouse has the Close button
 * and the scrim, and a pointer-agnostic version would fight text selection.
 * The offset is written straight to a motion value so the drag never goes
 * through a React render.
 */
export function useSheetDrag(
  sheetOffsetY: MotionValue<number>,
  onClose: () => void,
  reducedMotion: boolean,
) {
  const dragStartYRef = useRef<number | null>(null);

  const settleBack = () =>
    animate(sheetOffsetY, 0, {
      duration: reducedMotion ? 0 : 0.25,
      ease: COMPOSE_EASE,
    });

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStartYRef.current === null) return;
    sheetOffsetY.set(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStartYRef.current === null) return;
    const travelled = event.clientY - dragStartYRef.current;
    dragStartYRef.current = null;
    if (travelled > DRAG_TO_DISMISS_PX) {
      onClose();
      return;
    }
    settleBack();
  };

  // The system can steal a gesture (a notification, a call), so a cancel puts
  // the sheet back where it rests and never leaves it half-dragged.
  const onPointerCancel = () => {
    dragStartYRef.current = null;
    settleBack();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel,
  };
}
