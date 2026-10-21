/** ripple-outside-nest: a big upright P, and a whole small Q resting in its
 *  bowl like the hearth in the Thread concepts. */
import { bigP, innerQ } from "./letters.mjs";

/** The big P every full cut shares. */
export const BIG_P = {
  bowlRadius: 200,
  cornerRadius: 100,
  halfWidth: 30,
  stemTop: 0,
  stemFoot: 410,
};

export const NEST_DEFAULTS = {
  letterP: BIG_P,
  // The Q's tail stops 33 short of the bowl's inner edge, so the two never
  // seem to touch.
  letterQ: {
    radius: 84,
    strokeWidth: 30,
    tailAngle: 45,
    tailFrom: 56,
    tailTo: 122,
    tailHalfWidth: 15,
    gap: 12,
  },
};

/** The P with the Q in its bowl, nothing between them. */
export function buildNest({ letterP: letterOptions, letterQ: letterQOptions }) {
  const letterP = bigP(letterOptions);
  const letterQ = innerQ(letterQOptions);
  return [...letterP.shapes, ...letterQ.shapes];
}

/** The small P every small cut shares: heavier, with a shorter stem so the
 *  bowl stays large in the crop. */
export const SMALL_P = {
  bowlRadius: 200,
  cornerRadius: 100,
  halfWidth: 44,
  stemTop: 0,
  stemFoot: 380,
};

/**
 * At 24px a ring Q with a 64 unit counter and a 64 unit stroke leaves no
 * room for a tail inside the bowl, so the small Q is a coral dot with a
 * short tail. It sits up and to the left of the bowl's centre, where the
 * bowl's rounded corner gives it room, so the tail can show past the dot.
 */
export const NEST_SMALL = {
  letterP: SMALL_P,
  letterQ: {
    centre: { x: -24, y: -24 },
    radius: 60,
    isSolid: true,
    tailAngle: 45,
    tailFrom: 0,
    tailTo: 90,
    tailHalfWidth: 34,
  },
};

export const nest = {
  id: "ripple-outside-nest",
  centring: "bounds",
  build: () => buildNest(NEST_DEFAULTS),
  buildSmall: () => buildNest(NEST_SMALL),
};
