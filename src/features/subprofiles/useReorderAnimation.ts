import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * FLIP animation for a keyed list that reorders in place. Give every direct
 * child of `containerRef` a stable `data-flip-key`; whenever `orderKey` changes
 * (a drag swap OR an up/down button press — both just reshuffle the array),
 * this measures each row's previous vs. new box and plays the delta out as a
 * transform transition, so rows glide past each other instead of snapping.
 *
 * FLIP = First/Last/Invert/Play: we already hold each row's First box from the
 * prior render; after the DOM repaints in the new order we read its Last box,
 * Invert by jumping it back to First with no transition, then Play forward on
 * the next frame. New rows (no prior box) and removed rows just appear/vanish.
 * No-ops under `prefers-reduced-motion: reduce`.
 */
export function useReorderAnimation<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  orderKey: string,
) {
  const previousRects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rows = Array.from(container.children) as HTMLElement[];
    const nextRects = new Map<string, DOMRect>();
    for (const row of rows) {
      const key = row.dataset.flipKey;
      if (key) nextRects.set(key, row.getBoundingClientRect());
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!reduceMotion) {
      for (const row of rows) {
        const key = row.dataset.flipKey;
        if (!key) continue;
        const first = previousRects.current.get(key);
        const last = nextRects.get(key);
        if (!first || !last) continue;
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        if (deltaX === 0 && deltaY === 0) continue;

        // Invert: snap back to the old spot with no transition...
        row.style.transition = "none";
        row.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        // ...then Play forward to the natural position on the next frame.
        requestAnimationFrame(() => {
          row.style.transition = "transform var(--dur-base) var(--ease)";
          row.style.transform = "";
        });
      }
    }

    previousRects.current = nextRects;
  }, [containerRef, orderKey]);
}
