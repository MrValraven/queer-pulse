import {
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { animate, useMotionValue } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { createVerticalSwipeTracker } from "../../../../shared/hooks/verticalSwipeTracker";
import { STUDIO_SPRING } from "../../studioMotion";

/** A pull down this far on the grabber closes the sheet; a shorter one
 *  needs a flick. */
const SHEET_CLOSE_DISTANCE_PX = 80;

/**
 * The phone sheet's grabber: the sheet follows a pull down on it, closes
 * past 80px or on a flick, and springs back when the pull falls short
 * (snaps back under reduced motion). The pull is written as the panel's
 * `translate`, apart from the transform its entrance and exit animate, so a
 * closing sheet carries on down from where the finger left it. A reopen
 * clears that leftover pull, since a quick one brings back the same panel
 * mid exit. Spread the handlers on the grabber, which has
 * `touch-action: none`.
 */
export function useStudioSheetDrag(
  panelRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  const { reducedMotion } = useMotionPrefs();
  const dragY = useMotionValue(0);
  const trackerRef = useRef(
    createVerticalSwipeTracker({
      direction: "down",
      distanceThreshold: SHEET_CLOSE_DISTANCE_PX,
    }),
  );
  const baseRef = useRef(0);
  /** Set while the pull resets for the next open, so the closing sheet
   *  keeps where the finger left it. */
  const isResettingRef = useRef(false);
  const latestRef = useRef({ onClose, reducedMotion });
  useLayoutEffect(() => {
    latestRef.current = { onClose, reducedMotion };
  });
  useLayoutEffect(
    () =>
      dragY.on("change", (offset) => {
        const panel = panelRef.current;
        if (panel && !isResettingRef.current)
          panel.style.translate = offset === 0 ? "" : `0 ${offset}px`;
      }),
    [dragY, panelRef],
  );
  useLayoutEffect(() => {
    if (isOpen && panelRef.current) panelRef.current.style.translate = "";
  }, [isOpen, panelRef]);

  const springBack = () => {
    if (latestRef.current.reducedMotion) dragY.set(0);
    else void animate(dragY, 0, STUDIO_SPRING);
  };

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      dragY.stop();
      baseRef.current = dragY.get();
      trackerRef.current.start(event.clientY, event.timeStamp);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional: jsdom and some webviews lack it.
      }
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      if (!trackerRef.current.isActive()) return;
      dragY.set(baseRef.current + trackerRef.current.move(event.clientY));
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      if (!trackerRef.current.isActive()) return;
      if (!trackerRef.current.end(event.clientY, event.timeStamp)) {
        springBack();
        return;
      }
      isResettingRef.current = true;
      dragY.jump(0);
      isResettingRef.current = false;
      latestRef.current.onClose();
    },
    onPointerCancel() {
      if (!trackerRef.current.isActive()) return;
      trackerRef.current.cancel();
      springBack();
    },
  };
}
