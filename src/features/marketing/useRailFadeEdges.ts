import { useCallback, useEffect, useRef, useState } from "react";

/** Which ends of a horizontal rail have more cards past them. */
export type RailFadeEdges = "none" | "start" | "end" | "both";

/** One pixel of slack, so a rail scrolled to a fractional end reads as at
 *  the end. */
const EDGE_SLACK_PX = 1;

function fadeEdgesOf(rail: HTMLElement): RailFadeEdges {
  const hasMoreBefore = rail.scrollLeft > EDGE_SLACK_PX;
  const hasMoreAfter =
    rail.scrollLeft + rail.clientWidth < rail.scrollWidth - EDGE_SLACK_PX;
  if (hasMoreBefore && hasMoreAfter) return "both";
  if (hasMoreBefore) return "start";
  if (hasMoreAfter) return "end";
  return "none";
}

/**
 * Tracks which ends of a scrolling rail hide more cards, so the stylesheet
 * can fade only those edges. A rail scrolled to its start keeps a hard left
 * edge, and one that fits keeps both, so a focused card's ring is never
 * faded at a resting end. Measures on scroll, on resize and whenever the
 * number of items changes. The callback ref attaches and detaches the
 * listeners, so a rail that mounts later (inside a Collapse) is tracked too.
 */
export function useRailFadeEdges(itemCount: number) {
  const [fadeEdges, setFadeEdges] = useState<RailFadeEdges>("none");
  const railNodeRef = useRef<HTMLElement | null>(null);

  const railRef = useCallback((rail: HTMLElement | null) => {
    railNodeRef.current = rail;
    if (!rail) return;
    const measure = () => setFadeEdges(fadeEdgesOf(rail));
    measure();
    rail.addEventListener("scroll", measure, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    resizeObserver?.observe(rail);
    return () => {
      railNodeRef.current = null;
      rail.removeEventListener("scroll", measure);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const rail = railNodeRef.current;
    if (rail) setFadeEdges(fadeEdgesOf(rail));
  }, [itemCount]);

  return { railRef, fadeEdges };
}
