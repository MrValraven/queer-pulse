/** ripple-fused-ring: two rings round one centre, the inner one the P's
 *  bowl, the outer one the Q, the P's stem running out as the Q's tail. */
import { buildFusedRings } from "./fused.mjs";

export const FUSED_RING_DEFAULTS = {
  ring: { radius: 300, strokeWidth: 60 },
  ripples: [],
  letterP: { bowlRadius: 90, halfWidth: 28, stemRise: 122 },
  /** Where the stem's centre line crosses the Q ring's centre line. */
  exitDegrees: 62,
  /** How far the stem's tip runs past the Q ring's outer edge. */
  tailLength: 62,
  gap: 16,
};

/** The small cut: heavier, and solid where the stem leaves the ring. */
export const FUSED_RING_SMALL = {
  ring: { radius: 300, strokeWidth: 92 },
  ripples: [],
  letterP: { bowlRadius: 96, halfWidth: 40, stemRise: 106 },
  exitDegrees: 62,
  tailLength: 72,
  gap: 0,
};

export const fusedRing = {
  id: "ripple-fused-ring",
  centring: "enclosing",
  build: () => buildFusedRings(FUSED_RING_DEFAULTS),
  buildSmall: () => buildFusedRings(FUSED_RING_SMALL),
};
