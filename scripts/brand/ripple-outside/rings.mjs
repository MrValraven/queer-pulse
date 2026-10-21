/** ripple-outside-rings: the P's bowl is the outermost ripple, thinner
 *  ripples spread inward from it, and the Q ring sits at their centre. */
import { layOver, wholeRipple } from "../ripple-variants/ripples.mjs";
import { BIG_P, NEST_SMALL, buildNest } from "./nest.mjs";
import { bigP, innerQ } from "./letters.mjs";

const CENTRE = { x: 0, y: 0 };

export const RINGS_DEFAULTS = {
  letterP: BIG_P,
  // The bowl's inner edge is 170 from the centre. The ripples split the
  // ground between it and the Q into nearly even bands, and grow heavier
  // toward the P they spread from.
  ripples: [
    { radius: 138, strokeWidth: 16 },
    { radius: 100, strokeWidth: 12 },
  ],
  // The tail stays inside the first ripple: a tail long enough to cross
  // both would end hard against the bowl.
  letterQ: {
    radius: 52,
    strokeWidth: 22,
    tailAngle: 45,
    tailFrom: 32,
    tailTo: 72,
    tailHalfWidth: 11,
    gap: 11,
  },
  gap: 11,
};

/** The P, whole ripples round its bowl's centre, and the Q in the middle,
 *  each ripple parted where the Q's tail would lie across it. */
export function buildRings({
  letterP: letterOptions,
  ripples,
  letterQ: letterQOptions,
  gap,
}) {
  const letterP = bigP(letterOptions);
  const waters = ripples.map((ripple) =>
    wholeRipple(CENTRE, ripple.radius, ripple.strokeWidth),
  );
  const letterQ = innerQ(letterQOptions);
  layOver(letterQ, waters, { gap });
  return [
    ...letterP.shapes,
    ...waters.flatMap((water) => water.shapes),
    ...letterQ.shapes,
  ];
}

export const rings = {
  id: "ripple-outside-rings",
  centring: "bounds",
  build: () => buildRings(RINGS_DEFAULTS),
  buildSmall: () => buildNest(NEST_SMALL),
};
