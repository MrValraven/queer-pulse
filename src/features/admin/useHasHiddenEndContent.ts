import { useEffect, useState, type RefObject } from "react";

/**
 * Reports whether a sideways scroller has content hidden past its end edge,
 * so the caller can fade that edge as a scroll cue (a `data-fade-end`
 * attribute paired with a `mask-image` gradient in CSS).
 *
 * The observer watches the scroller and each of its direct children: a
 * count or language change resizes a child without resizing the scroller.
 * It reports once on observe, which covers the first paint, and scrolling
 * to the end clears the flag.
 */
export function useHasHiddenEndContent(
  scrollerRef: RefObject<HTMLElement | null>,
): boolean {
  const [hasHiddenEndContent, setHasHiddenEndContent] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measureHiddenEndContent = () => {
      const hiddenWidth =
        scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
      setHasHiddenEndContent(hiddenWidth > 1);
    };
    const resizeObserver = new ResizeObserver(measureHiddenEndContent);
    resizeObserver.observe(scroller);
    for (const child of Array.from(scroller.children)) {
      resizeObserver.observe(child);
    }
    scroller.addEventListener("scroll", measureHiddenEndContent, {
      passive: true,
    });
    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", measureHiddenEndContent);
    };
  }, [scrollerRef]);

  return hasHiddenEndContent;
}
