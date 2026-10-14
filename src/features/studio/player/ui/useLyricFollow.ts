import type { KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";

const FOLLOW_PAUSE_MS = 4000;
const SCROLL_KEYS = new Set([
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
  " ",
]);

/** Where the line should land, measured from the list's top edge. A list
 *  that scrolls with the page can sit partly under the sticky topbar or the
 *  player bar, so it centres on the part of the box that shows: the viewport
 *  less the page's scroll padding, which the Studio shell keeps equal to
 *  the topbar and the player and tab bars. With nothing of the box showing,
 *  it centres on the whole box. */
function followCentreOf(list: HTMLElement, isInPageFlow: boolean): number {
  const wholeBoxCentre = list.clientHeight / 2;
  if (!isInPageFlow) return wholeBoxCentre;
  const pageStyle = window.getComputedStyle(document.documentElement);
  const viewTop = parseFloat(pageStyle.scrollPaddingTop) || 0;
  const viewBottom =
    window.innerHeight - (parseFloat(pageStyle.scrollPaddingBottom) || 0);
  const listTop = list.getBoundingClientRect().top + list.clientTop;
  const shownTop = Math.max(listTop, viewTop);
  const shownBottom = Math.min(listTop + list.clientHeight, viewBottom);
  if (shownBottom <= shownTop) return wholeBoxCentre;
  return (shownTop + shownBottom) / 2 - listTop;
}

/** Keeps the line at `activeIndex` centred in the list's own scroll box,
 *  and steps aside for 4 seconds whenever the person scrolls themselves.
 *  `isInPageFlow` is for a list that scrolls with the page, as on the track
 *  page: it centres the line in the part of the box that is on screen. */
export function useLyricFollow(
  activeIndex: number | null,
  { isInPageFlow = false }: { isInPageFlow?: boolean } = {},
) {
  const { reducedMotion } = useMotionPrefs();
  const listRef = useRef<HTMLOListElement>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const resumeTimerRef = useRef<number | null>(null);
  const isMovingFocusRef = useRef(false);

  const clearTimer = () => {
    if (resumeTimerRef.current !== null)
      window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
  };

  const scrollToActive = useCallback(() => {
    const list = listRef.current;
    if (!list || activeIndex === null) return;
    const line = list.querySelector<HTMLElement>(
      `[data-line-index="${activeIndex}"]`,
    );
    if (!line) return;
    const top = Math.max(
      0,
      line.offsetTop -
        followCentreOf(list, isInPageFlow) +
        line.offsetHeight / 2,
    );
    try {
      list.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    } catch {
      list.scrollTop = top;
    }
  }, [activeIndex, isInPageFlow, reducedMotion]);

  useEffect(() => {
    if (isFollowing) scrollToActive();
  }, [isFollowing, scrollToActive]);

  useEffect(() => clearTimer, []);

  const pauseFollowing = useCallback(() => {
    clearTimer();
    setIsFollowing(false);
    resumeTimerRef.current = window.setTimeout(
      () => setIsFollowing(true),
      FOLLOW_PAUSE_MS,
    );
  }, []);

  const resumeFollowing = useCallback(() => {
    clearTimer();
    setIsFollowing(true);
    scrollToActive();
  }, [scrollToActive]);

  /** Resumes and puts focus on the current line, so a pressed "Back to
   *  current line" does not drop focus to the page when it unmounts. */
  const resumeAndFocusActive = useCallback(() => {
    resumeFollowing();
    const line = listRef.current?.querySelector<HTMLElement>(
      `[data-line-index="${activeIndex}"] button`,
    );
    if (!line) return;
    isMovingFocusRef.current = true;
    line.focus({ preventScroll: true });
    isMovingFocusRef.current = false;
  }, [activeIndex, resumeFollowing]);

  const onFocus = useCallback(() => {
    if (!isMovingFocusRef.current) pauseFollowing();
  }, [pauseFollowing]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLOListElement>) => {
      // A press on a line is a seek; a press elsewhere is the scrollbar.
      if (!(event.target as HTMLElement).closest("button")) pauseFollowing();
    },
    [pauseFollowing],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLOListElement>) => {
      if (SCROLL_KEYS.has(event.key)) pauseFollowing();
    },
    [pauseFollowing],
  );

  return {
    listRef,
    resumeAndFocusActive,
    isFollowing,
    resumeFollowing,
    /** Spread on the scroll box: these are the person's own scrolling. */
    userScrollHandlers: {
      onWheel: pauseFollowing,
      onTouchMove: pauseFollowing,
      onFocus,
      onPointerDown,
      onKeyDown,
    },
  };
}
