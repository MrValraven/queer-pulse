import { useCallback, useState } from "react";

/** The narrowest a `featured` poster reads well: below it the ribbon, date
 *  chip, kind tag and "See it" pill run into each other. */
const MIN_POSTER_WIDTH_PX = 240;
const GRID_COLUMNS = 3;
/** `--gap-grid`'s value, used only when the token cannot be read. */
const FALLBACK_GRID_GAP_PX = 22;

/** The grid gap in px, read from the `--gap-grid` token on `node`. */
function gridGapOf(node: HTMLElement): number {
  const tokenValue = Number.parseFloat(
    getComputedStyle(node).getPropertyValue("--gap-grid"),
  );
  return Number.isFinite(tokenValue) ? tokenValue : FALLBACK_GRID_GAP_PX;
}

/**
 * Whether the Events section's own column is wide enough for three posters
 * of at least 240px each. The answer follows the column's own width: the
 * desktop page keeps its sections sidebar down to 861px, where three
 * columns would squeeze each poster to 150px.
 *
 * Returns a callback ref for the measured element and the answer. It starts
 * false (the sideways rail), which never collides. The first measure runs
 * as the ref attaches, inside React's commit, so its update lands before the
 * browser paints: a wide column shows the grid on its first frame, with no
 * rail flashing first. A ResizeObserver keeps it current after that.
 */
export function usePosterGridFit(): [
  measureRef: (node: HTMLElement | null) => (() => void) | undefined,
  isGridFit: boolean,
] {
  const [isGridFit, setIsGridFit] = useState(false);
  const measureRef = useCallback((node: HTMLElement | null) => {
    if (!node) return undefined;
    const measure = () => {
      const gap = gridGapOf(node);
      const minWidth =
        GRID_COLUMNS * MIN_POSTER_WIDTH_PX + (GRID_COLUMNS - 1) * gap;
      setIsGridFit(node.clientWidth >= minWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [measureRef, isGridFit];
}
