import { useLayoutEffect, useRef, useState } from "react";
import { animate, type MotionValue } from "motion/react";
import { STUDIO_SPRING } from "../../studioMotion";

/** The space between the leaving block and the next one while they slide. */
const SKIP_PAGE_GAP_PX = 16;
/** The slide that carries the next track in. An ease-out, so it leaves the
 *  release at full speed and nothing holds under the lifted finger. */
const SKIP_SLIDE = { duration: 0.24, ease: [0, 0, 0.2, 1] } as const;

export interface SwipeSkipTrail<T> {
  /** The track the swipe left. */
  item: T;
  /** Where its block sits from the moving surface, in px. */
  shift: number;
}

/**
 * A landed sideways skip, drawn as a pager. The track changes at the
 * release; the leaving track stays drawn beside the next one (`trail`) and
 * both slide on together until the next one rests at 0. The swap and the
 * start of the slide land in the same frame, so no frame shows an empty
 * surface. When the skip changes nothing (Previous restarts the track), the
 * pull springs home. Under reduced motion the track changes in place.
 * `isSwipeSkip` holds from the release until the slide ends: the swaps read
 * it to show the next cover and titles whole at once.
 */
export function useSwipeSkipPager<T>(
  offsetX: MotionValue<number>,
  item: T,
  itemKey: string,
) {
  const [isSwipeSkip, setIsSwipeSkip] = useState(false);
  const [trail, setTrail] = useState<SwipeSkipTrail<T> | null>(null);
  const itemRef = useRef(item);
  const pendingRef = useRef<SwipeSkipTrail<T> | null>(null);
  /** Bumped by every skip and interruption, so a stale slide ends quietly. */
  const runRef = useRef(0);
  useLayoutEffect(() => {
    itemRef.current = item;
  });

  // The next track has committed: before the browser paints it, draw the
  // leaving one where the surface was and move the surface a page back, so
  // the eye sees both side by side, then slide them on together.
  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const run = runRef.current;
    setTrail(pending);
    offsetX.jump(offsetX.get() - pending.shift);
    void animate(offsetX, 0, SKIP_SLIDE).then(() => {
      if (runRef.current !== run) return;
      setTrail(null);
      setIsSwipeSkip(false);
    });
  }, [itemKey, offsetX]);

  /** A new press during a slide: the next track settles in place at once,
   *  so the finger starts from rest. */
  const interrupt = () => {
    runRef.current += 1;
    pendingRef.current = null;
    offsetX.stop();
    if (offsetX.get() !== 0) offsetX.jump(0);
    setTrail(null);
    setIsSwipeSkip(false);
  };

  const runSkip = (options: {
    /** The surface's width: the slide moves one page of it. */
    width: number;
    /** The pull's sign: the leaving track goes that way. */
    sign: number;
    isReduced: boolean;
    onSkip: () => void;
  }) => {
    const { width, sign, isReduced, onSkip } = options;
    runRef.current += 1;
    if (isReduced) {
      offsetX.set(0);
      onSkip();
      return;
    }
    const run = runRef.current;
    pendingRef.current = {
      item: itemRef.current,
      shift: sign * (width + SKIP_PAGE_GAP_PX),
    };
    setIsSwipeSkip(true);
    onSkip();
    // A skip commits before the next frame (a discrete input flushes at
    // once), so a frame with nothing committed means it changed nothing.
    requestAnimationFrame(() => {
      if (runRef.current !== run || pendingRef.current === null) return;
      pendingRef.current = null;
      setIsSwipeSkip(false);
      void animate(offsetX, 0, STUDIO_SPRING);
    });
  };

  return { isSwipeSkip, trail, runSkip, interrupt };
}
