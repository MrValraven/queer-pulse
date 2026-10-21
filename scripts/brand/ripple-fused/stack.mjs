/** ripple-fused-stack: three rings round one centre, the P's bowl, one
 *  ripple and the Q, the stem lying over the outer two. */
import { buildFusedRings } from "./fused.mjs";
import { FUSED_RING_SMALL } from "./ring.mjs";

export const FUSED_STACK_DEFAULTS = {
  ring: { radius: 300, strokeWidth: 60 },
  ripples: [{ radius: 204, strokeWidth: 20 }],
  letterP: { bowlRadius: 84, halfWidth: 26, stemRise: 108 },
  exitDegrees: 62,
  tailLength: 62,
  gap: 16,
};

export const fusedStack = {
  id: "ripple-fused-stack",
  centring: "enclosing",
  build: () => buildFusedRings(FUSED_STACK_DEFAULTS),
  // At 24px the middle ripple cannot keep 64 units clear on both sides,
  // so the small cut is Ring's.
  buildSmall: () => buildFusedRings(FUSED_RING_SMALL),
};
