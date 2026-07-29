import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export interface UseIncrementalListOptions {
  /** Rows rendered before the reader scrolls at all. */
  initial?: number;
  /** Rows added each time the sentinel scrolls into range. */
  step?: number;
}

export interface IncrementalList<Item> {
  /** The capped slice to render right now. */
  visible: Item[];
  /** Attach to an empty spacer AFTER the list; when it nears the viewport the
   *  next batch reveals. Only render the spacer while `hasMore` is true. */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** True while a capped slice is still hiding later rows. */
  hasMore: boolean;
}

/**
 * Progressive windowing without a virtualization dependency: render a capped
 * initial slice of `items` and grow it one `step` at a time as an
 * IntersectionObserver sentinel approaches the viewport, so a long live list
 * mounts far fewer DOM nodes at once while every row stays reachable by
 * scrolling. The cap resets to `initial` whenever the source list identity
 * changes (a fresh filter / search / sort result), so the reader always
 * restarts at the top of the new set.
 *
 * Mirrors `useScrollReveal`'s reduced-motion contract: under reduced motion the
 * whole list renders at once and no sentinel is observed, so nothing appears in
 * response to scrolling.
 */
export function useIncrementalList<Item>(
  items: Item[],
  { initial = 24, step = 24 }: UseIncrementalListOptions = {},
): IncrementalList<Item> {
  const prefersReduced = usePrefersReducedMotion();
  const [visibleCount, setVisibleCount] = useState(initial);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // A new filtered/sorted result is a different array identity — restart the
  // window at the top so the reader is never dropped part-way through a fresh
  // set (and stale-high caps don't defeat the windowing on the next result).
  useEffect(() => {
    // Resets the reveal window when the source list identity changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(initial);
  }, [items, initial]);

  const hasMore = !prefersReduced && visibleCount < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + step);
        }
      },
      // Reveal the next batch before the sentinel is actually on screen, so the
      // rows are already present as the reader arrives instead of popping in.
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // `visibleCount` is a dependency so the observer re-arms after each batch:
    // if the (generously margined) sentinel is still in range, it fires again
    // and fills up to a batch past the viewport, then naturally stops.
  }, [hasMore, step, visibleCount]);

  const visible = prefersReduced ? items : items.slice(0, visibleCount);

  return { visible, sentinelRef, hasMore };
}
