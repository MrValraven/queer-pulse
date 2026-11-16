import { useEffect, useRef, useState, type RefObject } from "react";

/** Share of an edge item that must show for its side to count as reached. */
const WHOLE_RATIO = 0.98;

export interface StripEdgeFade<T extends HTMLElement> {
  stripRef: RefObject<T | null>;
  /** Spread on the strip: marks each side that still hides items, which the
   *  kit CSS turns into an edge fade. A strip that fits shows no fade. */
  edgeProps: {
    "data-fade-start"?: true;
    "data-fade-end"?: true;
  };
}

/**
 * A one-line strip that scrolls sideways (tab strip, segmented control). An
 * IntersectionObserver on the first and last child, with the strip as its
 * root, says which side hides more, so the fade shows only there. No scroll
 * listener runs. `itemsKey` re-arms it when the items change. When
 * `selectedSelector` is given, the matching child is scrolled into view, so a
 * choice far along the strip stays in sight.
 */
export function useStripEdgeFade<T extends HTMLElement>(
  itemsKey: string,
  selectedSelector?: string,
): StripEdgeFade<T> {
  const stripRef = useRef<T>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    const strip = stripRef.current;
    const first = strip?.firstElementChild;
    const last = strip?.lastElementChild;
    if (!strip || !first || !last) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const isWhole = entry.intersectionRatio >= WHOLE_RATIO;
          if (entry.target === first) setIsAtStart(isWhole);
          if (entry.target === last) setIsAtEnd(isWhole);
        }
      },
      { root: strip, threshold: [0, WHOLE_RATIO, 1] },
    );
    observer.observe(first);
    if (last !== first) observer.observe(last);
    return () => observer.disconnect();
  }, [itemsKey]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !selectedSelector) return;
    const selected = strip.querySelector(selectedSelector);
    if (!(selected instanceof HTMLElement)) return;
    if (strip.scrollWidth <= strip.clientWidth) return;
    const stripBox = strip.getBoundingClientRect();
    const selectedBox = selected.getBoundingClientRect();
    const isInView =
      selectedBox.left >= stripBox.left && selectedBox.right <= stripBox.right;
    if (isInView) return;
    // Moves the strip only: the offset is set on the strip itself, so the
    // page never scrolls vertically to reach it.
    strip.scrollLeft += selectedBox.left - stripBox.left;
  }, [itemsKey, selectedSelector]);

  return {
    stripRef,
    edgeProps: {
      ...(isAtStart ? {} : { "data-fade-start": true as const }),
      ...(isAtEnd ? {} : { "data-fade-end": true as const }),
    },
  };
}
