import { useEffect, useState, type RefObject } from "react";

/**
 * True once `targetRef`'s element has scrolled out of `rootRef`'s scrolling
 * box. The reader's top bar reads it to fade the poem title in when the h2
 * leaves the view. `resetKey` re-observes after the target remounts (a new
 * poem renders a new h2). Without IntersectionObserver it stays false, so the
 * h2 alone names the poem.
 */
export function useIsScrolledOutOfView(
  targetRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
  resetKey: string,
): boolean {
  const [isOutOfView, setIsOutOfView] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    const root = rootRef.current;
    if (!target || !root || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsOutOfView(!entry.isIntersecting);
      },
      { root, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, rootRef, resetKey]);

  return isOutOfView;
}
