/** ripple-outside-tail: the Q's tail breaks out through the P's bowl and a
 *  coral bead falls after it. */
import { layOver, tipBead } from "../ripple-variants/ripples.mjs";
import { BIG_P, SMALL_P } from "./nest.mjs";
import { bigP, innerQ } from "./letters.mjs";

export const TAIL_DEFAULTS = {
  letterP: BIG_P,
  // At 45 degrees the tail leaves the bowl where an R's leg would; at 28 it
  // leaves through the round side and reads as a tail breaking out.
  letterQ: {
    radius: 84,
    strokeWidth: 30,
    tailAngle: 28,
    tailFrom: 52,
    tailTo: 284,
    tailHalfWidth: 15,
    gap: 14,
  },
  /** The gap the tail parts in the P's bowl. */
  gap: 16,
  bead: { gap: 18, radius: 26 },
};

/** The P with the Q in its bowl, the Q's tail lying over the bowl on its
 *  way out, and the bead (when given) following its tip. */
export function buildTail({
  letterP: letterOptions,
  letterQ: letterQOptions,
  gap,
  gapColorways,
  bead,
}) {
  const letterP = bigP(letterOptions);
  const letterQ = innerQ(letterQOptions);
  const bowlWater = {
    shapes: [letterP.bowl],
    strand: letterP.strand,
    halfWidthAt: letterP.halfWidthAt,
  };
  layOver(letterQ, [bowlWater], { gap, colorways: gapColorways });
  return [
    ...letterP.shapes,
    ...letterQ.shapes,
    ...(bead ? [tipBead(letterQ, bead)] : []),
  ];
}

/**
 * The small cut keeps the break: the coral dot's tail runs out through the
 * bowl. In colour the coral lies on top of the bowl with no gap (a 64 unit
 * gap bites most of the way round so small a bowl), and in mono the bowl
 * keeps that gap, since one colour cannot part them. The bead goes.
 */
export const TAIL_SMALL = {
  letterP: SMALL_P,
  letterQ: {
    radius: 56,
    isSolid: true,
    tailAngle: 28,
    tailFrom: 0,
    tailTo: 300,
    tailHalfWidth: 35,
  },
  gap: 70,
  gapColorways: ["mono"],
  bead: null,
};

export const tail = {
  id: "ripple-outside-tail",
  centring: "bounds",
  build: () => buildTail(TAIL_DEFAULTS),
  buildSmall: () => buildTail(TAIL_SMALL),
};
