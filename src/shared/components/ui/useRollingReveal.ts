import { useEffect, useState } from "react";

/** A figure RollingNumber can show: the display string and the raw number. */
export interface RollingFigure {
  value: string;
  numericValue: number;
}

interface RollingRevealOptions extends RollingFigure {
  revealFrom?: RollingFigure;
  isRevealed: boolean;
  isReducedMotion: boolean;
}

/**
 * The figure RollingNumber should draw while a reveal is pending. Holds
 * `revealFrom` until `isRevealed` is true, then waits one animation frame (so
 * the start figure has painted) and hands over the live figure, which the
 * odometer rolls to. The reveal happens once: after it, the live figure is
 * returned on every render. Skipped under reduced motion or without
 * `revealFrom`. While pending, a live number equal to the start number is
 * drawn as itself, so a value that still matches at reveal time has nothing
 * to roll; one that moves away (data arriving off screen) goes back to the
 * start figure and rolls in once revealed.
 */
export function useRollingReveal({
  value,
  numericValue,
  revealFrom,
  isRevealed,
  isReducedMotion,
}: RollingRevealOptions): RollingFigure {
  const [hasRevealed, setHasRevealed] = useState(
    () => revealFrom === undefined || isReducedMotion,
  );

  // Reduced motion switched on mid-wait: finish the reveal at once.
  if (!hasRevealed && isReducedMotion) setHasRevealed(true);

  useEffect(() => {
    if (hasRevealed || !isRevealed) return;
    const frame = requestAnimationFrame(() => setHasRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [hasRevealed, isRevealed]);

  if (
    hasRevealed ||
    revealFrom === undefined ||
    revealFrom.numericValue === numericValue
  ) {
    return { value, numericValue };
  }
  return revealFrom;
}
