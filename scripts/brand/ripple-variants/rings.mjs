/** ripple-rings: whole concentric ripples, weight falling off inward, round
 *  a plain tail. The nearest kin of today's pulse-dots mark. */
import { CONCENTRIC_SMALL, DROP_DEFAULTS, buildConcentric } from "./drop.mjs";

export const RINGS_DEFAULTS = {
  ...DROP_DEFAULTS,
  ripples: [
    { radius: 150, strokeWidth: 16 },
    { radius: 214, strokeWidth: 28 },
  ],
  tailLength: 66,
  bead: null,
  stub: null,
};

export const rings = {
  id: "ripple-rings",
  centring: "enclosing",
  build: () => buildConcentric(RINGS_DEFAULTS),
  buildSmall: () => buildConcentric(CONCENTRIC_SMALL),
};
