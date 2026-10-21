import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  SWIPE_DISTANCE_THRESHOLD,
  SWIPE_VELOCITY_THRESHOLD,
} from "../../../../shared/hooks/verticalSwipeTracker";
import { STUDIO_EXIT, STUDIO_SPRING } from "../../studioMotion";

/** Travel before the gesture picks an axis; under it a touch is a tap. */
export const AXIS_LOCK_PX = 8;
/** A sideways pull this far skips; a shorter one needs a flick. */
export const SKIP_DISTANCE_PX = 72;
const MINIMUM_FLICK_PX = 24;
/** A pull with nothing to skip to follows the finger at this share. */
export const RUBBER_BAND_SHARE = 0.35;
/** Where the next cover starts its spring in, as a share of the width. */
const ENTRY_OFFSET_SHARE = 0.25;

export type CoverSkipDirection = "next" | "previous";

interface CoverSwipeOptions {
  isEnabled: boolean;
  /** The sheet scroller: a pull down closes only from its top. */
  sheetRef: RefObject<HTMLElement | null>;
  /** The frame that follows a pull down, as the head's swipe moves it. */
  frameRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  canSkip: (direction: CoverSkipDirection) => boolean;
  onSkip: (direction: CoverSkipDirection) => void;
}

interface Gesture {
  startX: number;
  startY: number;
  startTime: number;
  axis: "x" | "y" | "none" | null;
  isSheetAtTop: boolean;
}

function writeFrameOffset(frame: HTMLElement | null, offset: number) {
  if (!frame) return;
  frame.style.transition = offset === 0 ? "" : "none";
  frame.style.transform = offset === 0 ? "" : `translateY(${offset}px)`;
}

export function isPastThreshold(
  distance: number,
  elapsedMs: number,
  limit: number,
) {
  const velocity = distance / Math.max(1, elapsedMs);
  return (
    distance >= limit ||
    (distance >= MINIMUM_FLICK_PX && velocity >= SWIPE_VELOCITY_THRESHOLD)
  );
}

/** Which way a sideways pull goes: towards the reading start is Next. */
export function skipDirectionOf(
  element: Element,
  deltaX: number,
): CoverSkipDirection {
  const isRightToLeft = window.getComputedStyle(element).direction === "rtl";
  const isTowardsStart = isRightToLeft ? deltaX > 0 : deltaX < 0;
  return isTowardsStart ? "next" : "previous";
}

/** Springs a pulled surface back to rest; under reduced motion it snaps. */
export function springHome(offsetX: MotionValue<number>, isReduced: boolean) {
  if (isReduced) offsetX.set(0);
  else void animate(offsetX, 0, STUDIO_SPRING);
}

/** A skip that landed: the surface slides out the way it was pulled, the
 *  track changes, and the next one springs in from the other side. Under
 *  reduced motion the track changes in place. Resolves once the next one
 *  has settled. */
export async function slideSkip(
  offsetX: MotionValue<number>,
  options: {
    width: number;
    sign: number;
    isReduced: boolean;
    onSkip: () => void;
  },
) {
  const { width, sign, isReduced, onSkip } = options;
  if (isReduced) {
    offsetX.set(0);
    onSkip();
    return;
  }
  await animate(offsetX, sign * width, STUDIO_EXIT);
  onSkip();
  // jump, so the spring in starts at rest: a set would hand it the
  // velocity of the jump across the card and fling the next one away.
  offsetX.jump(-sign * width * ENTRY_OFFSET_SHARE);
  await animate(offsetX, 0, STUDIO_SPRING);
}

/** True from the moment a swipe lands a skip until the next track has
 *  sprung into place. The swaps read it to show the next cover and titles
 *  whole at once, so the slide carries them in and the surface never shows
 *  blank while a fade catches up. */
export function useSwipeSkipFlag() {
  const [isSwipeSkip, setIsSwipeSkip] = useState(false);
  return {
    isSwipeSkip,
    /** Wraps a skip's slide: the flag holds for its whole run. */
    runSwipeSkip: (
      slide: (markSkipped: () => void) => Promise<void>,
      isReduced: boolean,
    ) => {
      // Under reduced motion the swap is already instant.
      if (isReduced) {
        void slide(() => undefined);
        return;
      }
      void slide(() => setIsSwipeSkip(true)).finally(() =>
        setIsSwipeSkip(false),
      );
    },
  };
}

/**
 * The cover's gestures on a phone: pull it down from the top of the sheet
 * to close Now playing, or sideways to skip, with a spring back when the
 * pull falls short. Native touch listeners, so a vertical drag upward is
 * left to the browser and the sheet keeps its own momentum scroll; only a
 * sideways pull, or a pull down at the top, takes the gesture. The buttons
 * stay the way to do the same from a keyboard or a screen reader.
 */
export function useNowPlayingCoverSwipe(options: CoverSwipeOptions) {
  const { reducedMotion } = useMotionPrefs();
  const coverRef = useRef<HTMLDivElement>(null);
  const offsetX = useMotionValue(0);
  const { isSwipeSkip, runSwipeSkip } = useSwipeSkipFlag();
  const latestRef = useRef({ ...options, reducedMotion, runSwipeSkip });
  useLayoutEffect(() => {
    latestRef.current = { ...options, reducedMotion, runSwipeSkip };
  });
  const isEnabled = options.isEnabled;

  useEffect(() => {
    const cover = coverRef.current;
    if (!cover || !isEnabled) return;
    let gesture: Gesture | null = null;

    const directionOf = (deltaX: number) => skipDirectionOf(cover, deltaX);
    const returnHome = () =>
      springHome(offsetX, latestRef.current.reducedMotion);

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) {
        // A second finger mid-drag ends the drag and returns the cover and
        // the frame home.
        const active = gesture;
        gesture = null;
        if (active?.axis === "y")
          writeFrameOffset(latestRef.current.frameRef.current, 0);
        if (active?.axis === "x") returnHome();
        return;
      }
      gesture = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: event.timeStamp,
        axis: null,
        isSheetAtTop: (latestRef.current.sheetRef.current?.scrollTop ?? 0) <= 0,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!gesture || !touch || gesture.axis === "none") return;
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;
      if (gesture.axis === null) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_PX) return;
        const isSideways = Math.abs(deltaX) > Math.abs(deltaY);
        if (isSideways) gesture.axis = "x";
        else gesture.axis = deltaY > 0 && gesture.isSheetAtTop ? "y" : "none";
        if (gesture.axis === "none") return;
      }
      if (event.cancelable) event.preventDefault();
      if (gesture.axis === "y") {
        writeFrameOffset(
          latestRef.current.frameRef.current,
          Math.max(0, deltaY),
        );
        return;
      }
      const canSkip = latestRef.current.canSkip(directionOf(deltaX));
      offsetX.set(canSkip ? deltaX : deltaX * RUBBER_BAND_SHARE);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const ended = gesture;
      gesture = null;
      const touch = event.changedTouches[0];
      if (!ended || !touch || ended.axis === null || ended.axis === "none")
        return;
      const elapsedMs = event.timeStamp - ended.startTime;
      const latest = latestRef.current;
      if (ended.axis === "y") {
        const distance = Math.max(0, touch.clientY - ended.startY);
        if (isPastThreshold(distance, elapsedMs, SWIPE_DISTANCE_THRESHOLD))
          latest.onClose();
        else writeFrameOffset(latest.frameRef.current, 0);
        return;
      }
      const deltaX = touch.clientX - ended.startX;
      const direction = directionOf(deltaX);
      const isSkip =
        latest.canSkip(direction) &&
        isPastThreshold(Math.abs(deltaX), elapsedMs, SKIP_DISTANCE_PX);
      if (isSkip)
        latest.runSwipeSkip(
          (markSkipped) =>
            slideSkip(offsetX, {
              width: cover.offsetWidth,
              sign: Math.sign(deltaX),
              isReduced: latest.reducedMotion,
              onSkip: () => {
                markSkipped();
                latest.onSkip(direction);
              },
            }),
          latest.reducedMotion,
        );
      else returnHome();
    };

    const onTouchCancel = () => {
      const cancelled = gesture;
      gesture = null;
      if (cancelled?.axis === "y")
        writeFrameOffset(latestRef.current.frameRef.current, 0);
      if (cancelled?.axis === "x") returnHome();
    };

    cover.addEventListener("touchstart", onTouchStart, { passive: true });
    cover.addEventListener("touchmove", onTouchMove, { passive: false });
    cover.addEventListener("touchend", onTouchEnd);
    cover.addEventListener("touchcancel", onTouchCancel);
    return () => {
      cover.removeEventListener("touchstart", onTouchStart);
      cover.removeEventListener("touchmove", onTouchMove);
      cover.removeEventListener("touchend", onTouchEnd);
      cover.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [isEnabled, offsetX]);

  return { coverRef, offsetX, isSwipeSkip };
}
