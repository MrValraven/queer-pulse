import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMotionValue } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useVerticalSwipe } from "../../../../shared/hooks/useVerticalSwipe";
import {
  AXIS_LOCK_PX,
  isPastThreshold,
  RUBBER_BAND_SHARE,
  SKIP_DISTANCE_PX,
  skipDirectionOf,
  slideSkip,
  springHome,
  useSwipeSkipFlag,
  type CoverSkipDirection,
} from "./useNowPlayingCoverSwipe";

/** Upward travel past which a press counts as a drag and its click is dropped. */
const DRAG_CLICK_SLOP_PX = 10;
/** A click this soon after a drag's release ends that drag; later ones pass. */
const DRAG_CLICK_WINDOW_MS = 500;

export interface MiniCardSkip {
  canSkip: (direction: CoverSkipDirection) => boolean;
  onSkip: (direction: CoverSkipDirection) => void;
}

interface SidewaysGesture {
  startX: number;
  startY: number;
  startTime: number;
  axis: "x" | "y" | null;
}

/**
 * The card's swipes: up opens Now playing, sideways skips (DES-25) with a
 * spring back when the pull falls short. useVerticalSwipe captures the
 * pointer on the card, which retargets the release and its click to the
 * card, so a tap on a button would land nowhere. The press hands the
 * capture on to the pressed button; move and up events still bubble to the
 * card, so a swipe started anywhere still works. Once a press moves 8px it
 * picks an axis, and a sideways pull stops the vertical one. A pointer
 * click within DRAG_CLICK_WINDOW_MS of a drag's release ends that drag and
 * is dropped; keyboard clicks (detail 0) and any later click always pass,
 * so a click that arrives with no pointerdown (some assistive tech) is
 * never lost. `offsetX` moves the card's cover and titles with the finger;
 * `isSwipeSkip` holds while a landed skip slides the next track in.
 */
export function useMiniCardSwipe(onSwipe: () => void, skip?: MiniCardSkip) {
  const { reducedMotion } = useMotionPrefs();
  const offsetX = useMotionValue(0);
  const hasDraggedRef = useRef(false);
  const dragEndedAtRef = useRef<number | null>(null);
  const sidewaysRef = useRef<SidewaysGesture | null>(null);
  const { isSwipeSkip, runSwipeSkip } = useSwipeSkipFlag();
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

  /** Ends a sideways pull: skip when it went far or fast enough. */
  function endSideways(
    gesture: SidewaysGesture,
    event: ReactPointerEvent<HTMLElement>,
  ) {
    if (!skip) return;
    const deltaX = event.clientX - gesture.startX;
    const direction = skipDirectionOf(event.currentTarget, deltaX);
    const isSkip =
      skip.canSkip(direction) &&
      isPastThreshold(
        Math.abs(deltaX),
        event.timeStamp - gesture.startTime,
        SKIP_DISTANCE_PX,
      );
    if (!isSkip) {
      springHome(offsetX, reducedMotion);
      return;
    }
    const width = event.currentTarget.offsetWidth;
    runSwipeSkip(
      (markSkipped) =>
        slideSkip(offsetX, {
          width,
          sign: Math.sign(deltaX),
          isReduced: reducedMotion,
          onSkip: () => {
            markSkipped();
            skip.onSkip(direction);
          },
        }),
      reducedMotion,
    );
  }

  const handlers = {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      // A second finger mid-drag ends the drag and returns the card home.
      if (event.isPrimary === false) {
        if (sidewaysRef.current?.axis === "x")
          springHome(offsetX, reducedMotion);
        sidewaysRef.current = null;
        swipe.onPointerCancel();
        return;
      }
      hasDraggedRef.current = false;
      dragEndedAtRef.current = null;
      sidewaysRef.current =
        skip && event.pointerType !== "mouse"
          ? {
              startX: event.clientX,
              startY: event.clientY,
              startTime: event.timeStamp,
              axis: null,
            }
          : null;
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
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const gesture = sidewaysRef.current;
      if (gesture && skip) {
        const deltaX = event.clientX - gesture.startX;
        const deltaY = event.clientY - gesture.startY;
        if (
          gesture.axis === null &&
          Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= AXIS_LOCK_PX
        ) {
          gesture.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
          if (gesture.axis === "x") {
            swipe.onPointerCancel();
            hasDraggedRef.current = true;
          }
        }
        if (gesture.axis === "x") {
          const direction = skipDirectionOf(event.currentTarget, deltaX);
          offsetX.set(
            skip.canSkip(direction) ? deltaX : deltaX * RUBBER_BAND_SHARE,
          );
          return;
        }
      }
      swipe.onPointerMove(event);
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      const gesture = sidewaysRef.current;
      sidewaysRef.current = null;
      if (gesture?.axis === "x") endSideways(gesture, event);
      else swipe.onPointerUp(event);
      if (hasDraggedRef.current) dragEndedAtRef.current = event.timeStamp;
      hasDraggedRef.current = false;
    },
    onPointerCancel() {
      const gesture = sidewaysRef.current;
      sidewaysRef.current = null;
      if (gesture?.axis === "x") springHome(offsetX, reducedMotion);
      swipe.onPointerCancel();
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
  return { handlers, offsetX, isSwipeSkip };
}
