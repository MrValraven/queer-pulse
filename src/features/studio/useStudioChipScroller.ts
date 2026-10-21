import { useEffect, useRef, useState, type RefObject } from "react";

/** Share of an edge chip that must show for its side to count as reached. */
const WHOLE_RATIO = 0.98;

export interface StudioChipScroller {
  listRef: RefObject<HTMLUListElement | null>;
  /** Spread on the list: marks each side that still hides chips, which the
   *  CSS turns into an edge fade. */
  edgeProps: {
    "data-fade-start"?: true;
    "data-fade-end"?: true;
  };
}

/**
 * A one-line chip row that scrolls sideways: an IntersectionObserver on the
 * first and last chip (the list as its root) says which side hides more,
 * so the fade shows only there. No scroll listener runs. It re-arms when
 * the chips change (`chipKeys`, which should name the current chip too).
 * The current chip is scrolled into view, so a filter picked far along the
 * row stays in sight.
 */
export function useStudioChipScroller(chipKeys: string): StudioChipScroller {
  const listRef = useRef<HTMLUListElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    const list = listRef.current;
    const first = list?.firstElementChild;
    const last = list?.lastElementChild;
    if (!list || !first || !last) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const isWhole = entry.intersectionRatio >= WHOLE_RATIO;
          if (entry.target === first) setIsAtStart(isWhole);
          if (entry.target === last) setIsAtEnd(isWhole);
        }
      },
      { root: list, threshold: [0, WHOLE_RATIO, 1] },
    );
    observer.observe(first);
    if (last !== first) observer.observe(last);
    return () => observer.disconnect();
  }, [chipKeys]);

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector('[aria-current="page"]');
    if (!list || !(current instanceof HTMLElement)) return;
    // Only a row that scrolls moves; a wrapped row (fine pointers) never
    // does. Writing direction and the list's scroll-padding set the stop.
    if (list.scrollWidth <= list.clientWidth) return;
    const listBox = list.getBoundingClientRect();
    const chipBox = current.getBoundingClientRect();
    if (chipBox.left >= listBox.left && chipBox.right <= listBox.right) return;
    current.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [chipKeys]);

  return {
    listRef,
    edgeProps: {
      ...(isAtStart ? {} : { "data-fade-start": true as const }),
      ...(isAtEnd ? {} : { "data-fade-end": true as const }),
    },
  };
}
