/**
 * Measures where the clip grid starts on the page and writes it to the grid
 * band as `--vj-grid-top`, so VjRemoteLayout.module.css can cap the tile
 * height at a third of the room left above the phone dock (the installed
 * app's safe areas take 69px of the fold budget). The value is the band's
 * distance from the top of the document, so scrolling never changes it; the
 * bands above it (the sticky header and the strips) are watched, and any
 * change in their height or in the window's size measures again. No React
 * state: the write lands on the element's style.
 */
import { useCallback, useEffect, useState } from "react";

export const VJ_GRID_TOP_PROPERTY = "--vj-grid-top";

/** The band's top edge in document coordinates, in whole pixels. */
export function vjDocumentTopOf(element: HTMLElement): number {
  return Math.round(element.getBoundingClientRect().top + window.scrollY);
}

export function useVjGridTop(): (element: HTMLElement | null) => void {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (element === null) return undefined;
    const measure = () => {
      element.style.setProperty(
        VJ_GRID_TOP_PROPERTY,
        `${vjDocumentTopOf(element)}px`,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    let sibling = element.previousElementSibling;
    while (sibling !== null) {
      observer?.observe(sibling);
      sibling = sibling.previousElementSibling;
    }
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
      element.style.removeProperty(VJ_GRID_TOP_PROPERTY);
    };
  }, [element]);
  return useCallback((next: HTMLElement | null) => setElement(next), []);
}
