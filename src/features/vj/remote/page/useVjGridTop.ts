/**
 * Measures where the clip grid starts on the page and writes it to the grid
 * band as `--vj-grid-top`, so VjRemoteLayout.module.css can cap the tile
 * height at a third of the room left above the phone dock (the installed
 * app's safe areas take 69px of the fold budget). The measured edge is the
 * grid's own top inside the band (`[data-vj-remote-grid]`), so the failed
 * clips line that folds open above it counts; a band with no grid in it
 * measures its own top. The value is the distance from the top of the
 * document, so scrolling never changes it. The bands above (the sticky
 * header and the strips) and the band itself are watched: a change in their
 * height, the summary line folding open or closed, or a window resize
 * measures again. No React state: the write lands on the band's style, where
 * `--vj-tile-fit-block` reads it.
 */
import { useCallback, useEffect, useState } from "react";

export const VJ_GRID_TOP_PROPERTY = "--vj-grid-top";

/** Marks the clip grid's root inside the band (set by VjRemoteGrid). */
export const VJ_GRID_ROOT_SELECTOR = "[data-vj-remote-grid]";

/** An element's top edge in document coordinates, in whole pixels. */
export function vjDocumentTopOf(element: HTMLElement): number {
  return Math.round(element.getBoundingClientRect().top + window.scrollY);
}

/** The grid's top inside the band, or the band's own top before the grid mounts. */
export function vjGridTopOf(band: HTMLElement): number {
  const gridRoot = band.querySelector<HTMLElement>(VJ_GRID_ROOT_SELECTOR);
  return vjDocumentTopOf(gridRoot ?? band);
}

export function useVjGridTop(): (element: HTMLElement | null) => void {
  const [band, setBand] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (band === null) return undefined;
    const measure = () => {
      const gridTop = `${vjGridTopOf(band)}px`;
      // The tiles resize after a write and the band reports it back; an
      // unchanged top skips the write, so that echo settles at once.
      if (band.style.getPropertyValue(VJ_GRID_TOP_PROPERTY) === gridTop) return;
      band.style.setProperty(VJ_GRID_TOP_PROPERTY, gridTop);
    };
    measure();
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    // The band grows and shrinks with the summary line's fold above the grid.
    observer?.observe(band);
    let sibling = band.previousElementSibling;
    while (sibling !== null) {
      observer?.observe(sibling);
      sibling = sibling.previousElementSibling;
    }
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
      band.style.removeProperty(VJ_GRID_TOP_PROPERTY);
    };
  }, [band]);
  return useCallback((next: HTMLElement | null) => setBand(next), []);
}
