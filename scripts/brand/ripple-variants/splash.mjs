/** ripple-splash: the drop lands off centre and the ripples travel out as
 *  a wave front, crowded on the P's side, open on the far side. */
import { CONCENTRIC_SMALL, buildConcentric } from "./drop.mjs";

/** Where the P lands: up and to the left of the Q's centre. */
const LANDING = { x: -46, y: -42 };

/** A ripple whose centre has moved `shift` of the way from the landing
 *  point to the Q's centre (0 is centred on the landing point). */
function travelledRipple(shift, radius, strokeWidth) {
  return {
    centre: { x: LANDING.x * (1 - shift), y: LANDING.y * (1 - shift) },
    radius,
    strokeWidth,
  };
}

export const SPLASH_DEFAULTS = {
  ring: { radius: 300, strokeWidth: 60 },
  ripples: [travelledRipple(0, 122, 16), travelledRipple(0.45, 196, 16)],
  letterP: {
    landing: LANDING,
    tiltDegrees: 40,
    bowlWidth: 96,
    bowlHeight: 104,
    halfWidth: 24,
    cornerRadius: 14,
  },
  tailLength: 64,
  gap: 16,
  bead: null,
  stub: null,
};

/** The small cut lands the P off centre too, so the splash still shows. */
export const SPLASH_SMALL = {
  ...CONCENTRIC_SMALL,
  ring: { radius: 290, strokeWidth: 96 },
  letterP: { ...CONCENTRIC_SMALL.letterP, landing: { x: -18, y: -16 } },
};

export const splash = {
  id: "ripple-splash",
  centring: "enclosing",
  build: () => buildConcentric(SPLASH_DEFAULTS),
  buildSmall: () => buildConcentric(SPLASH_SMALL),
};
