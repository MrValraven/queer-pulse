import { useEffect, useState } from "react";

/**
 * Fills a progress bar from 0 → `pct` shortly after mount, so the CSS width
 * transition animates in rather than snapping to its final value.
 */
export function useAnimatedFill(pct: number): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setWidth(pct), 350);
    return () => window.clearTimeout(id);
  }, [pct]);
  return width;
}
