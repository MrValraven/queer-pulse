import type { QuarterTurn } from "../model/pdfEditModel";

/**
 * The angle a thumbnail turns to next. The shown angle keeps counting past a
 * full turn, so going from 270 to 0 animates a quarter turn forward. A half
 * turn goes clockwise.
 */
export function nextVisualRotation(
  previousDegrees: number,
  target: QuarterTurn,
): number {
  const shownTurn = ((previousDegrees % 360) + 360) % 360;
  let delta = ((target - shownTurn + 540) % 360) - 180;
  if (delta === -180) delta = 180;
  return previousDegrees + delta;
}
