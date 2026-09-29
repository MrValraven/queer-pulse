import { useEffect, useRef, useState, type RefObject } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** Below this, a residual sub-pixel scroll position no longer counts as
 *  "more content this way": it stops the edge fade and buttons flickering
 *  at rest. */
const SCROLL_EDGE_TOLERANCE_PX = 2;

export interface UseBoardEdgeScrollResult {
  scrollerRef: RefObject<HTMLDivElement | null>;
  /** Whether there is a column further toward the start / end than what is
   *  currently visible. */
  hasMoreStart: boolean;
  hasMoreEnd: boolean;
  /** Scrolls one screenful toward the given edge. */
  scrollToward: (direction: "start" | "end") => void;
}

/**
 * Tracks whether the board's horizontal scroller has more columns past
 * either edge, so `PiecesBoard` can show an edge fade and scroll buttons
 * only when they would do something (five-plus columns hide
 * off-canvas with no cue at all). Recomputed on scroll and on resize of the
 * scroller's own box: the viewport narrowing or widening, or the rail beside
 * it appearing or disappearing at a breakpoint. `ResizeObserver` watches
 * that box alone, so a change in the number of columns on its own (today,
 * `DeskWorkArea` always passes the constant `DEMO_STAGES`, so this never
 * happens in practice) needs a scroll or a box resize alongside it to be
 * picked up.
 */
export function useBoardEdgeScroll(): UseBoardEdgeScrollResult {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPrefs();
  const [hasMoreStart, setHasMoreStart] = useState(false);
  const [hasMoreEnd, setHasMoreEnd] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    function update() {
      const { scrollLeft, scrollWidth, clientWidth } =
        scroller as HTMLDivElement;
      setHasMoreStart(scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
      setHasMoreEnd(
        scrollLeft + clientWidth < scrollWidth - SCROLL_EDGE_TOLERANCE_PX,
      );
    }
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollToward(direction: "start" | "end") {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // 90% of the visible width: close to a full screenful without hiding
    // which column was at the edge a moment ago.
    const step = scroller.clientWidth * 0.9;
    scroller.scrollBy({
      left: direction === "start" ? -step : step,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return { scrollerRef, hasMoreStart, hasMoreEnd, scrollToward };
}
