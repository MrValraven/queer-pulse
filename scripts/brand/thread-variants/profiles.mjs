/**
 * Width profiles: how wide a line is along its length, as half widths in
 * letter units. Each profile is a function of distance along a strand.
 */
import { stressAt } from "../logo-geometry.mjs";
import { smoothStep } from "./strands.mjs";

/** The same half width all along. */
export function evenWidth(halfWidth) {
  return () => halfWidth;
}

/** A bowl that swells with the serif's stress: `thick` at the heavy lower
 *  left and upper right, `thin` where it turns at top and bottom. */
export function stressedBowlWidth({ thick, thin }) {
  return (point) => thin + (thick - thin) * stressAt(point);
}

/** A tail that enters at `start`, swells to `peak` at `peakAt` (a fraction
 *  of its length) and eases back to `end` at its tip. */
export function swellingTailWidth({ start, peak, end, peakAt, length }) {
  return (distance) => {
    const fraction = distance / length;
    if (fraction <= peakAt) {
      return start + (peak - start) * smoothStep(fraction / peakAt);
    }
    return peak + (end - peak) * smoothStep((fraction - peakAt) / (1 - peakAt));
  };
}
