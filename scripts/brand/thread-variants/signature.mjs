/** thread-signature: Swell's line, with the tail laid over the bowl, and
 *  the trio's three people threaded on it. */
import { SWELL_DEFAULTS, SWELL_SMALL, buildSwell } from "./swell.mjs";

export const SIGNATURE_DEFAULTS = {
  ...SWELL_DEFAULTS,
  tailGap: 15,
  beadGap: 10,
  beads: [
    { at: "tip", radius: 56, tone: "accent" },
    { at: 4.45, radius: 38, tone: "jade" },
    { after: 88, kind: "ring", radius: 38, wall: 14, tone: "ink" },
  ],
};

export const signature = {
  id: "thread-signature",
  centring: "enclosing",
  build: () => buildSwell(SIGNATURE_DEFAULTS),
  // At 24px the gap and the two smaller people would close up, so the
  // small cut is Swell's: the line, the hearth and the coral tip.
  buildSmall: () => buildSwell(SWELL_SMALL),
};
