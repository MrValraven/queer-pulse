/** thread-swell: the line swells and thins with the serif's stress. */
import { HEARTH_CENTRE, circle } from "../logo-geometry.mjs";
import { placeBeads, threadBeads } from "./beads.mjs";
import { stressedBowlWidth, swellingTailWidth } from "./profiles.mjs";
import {
  bowlStrand,
  crossingsOf,
  gapCutout,
  gapReach,
  outlineShape,
  strandBetween,
  tailStrand,
} from "./strands.mjs";

export const SWELL_DEFAULTS = {
  bowl: { thick: 55, thin: 22 },
  tail: { start: 22, peak: 46, end: 22, peakAt: 0.62 },
  tailFrom: 18,
  beadGap: 11,
  beads: [
    { at: "tip", radius: 50, tone: "accent" },
    { at: 4.45, radius: 44, tone: "ink" },
  ],
  hearthRadius: 64,
  /** The ground left either side of the tail where it lies over the bowl;
   *  0 lets the two run together, as the serif's own Q does. */
  tailGap: 0,
};

export function buildSwell(options = SWELL_DEFAULTS) {
  const bowlWidth = stressedBowlWidth(options.bowl);
  const tail = strandBetween(tailStrand, options.tailFrom, tailStrand.total);
  const tailWidth = swellingTailWidth({ ...options.tail, length: tail.total });
  const bowlWidthAt = (distance) =>
    bowlWidth(bowlStrand.pointAt(distance), distance, bowlStrand);
  const bowl = outlineShape(bowlStrand, { halfWidthAt: bowlWidthAt }, "ink");
  if (options.tailGap > 0) {
    const [crossing] = crossingsOf(tail, bowlStrand);
    const reach = gapReach({
      overStrand: tail,
      overDistance: crossing.firstDistance,
      underStrand: bowlStrand,
      underDistance: crossing.secondDistance,
      overHalfWidth: tailWidth(crossing.firstDistance),
      underHalfWidth: bowlWidthAt(crossing.secondDistance),
      gap: options.tailGap,
    });
    // Back toward the counter the gap may run long; ahead it stops short
    // of the tail's sweep, which hugs the bowl.
    bowl.cutouts = [
      gapCutout(tail, crossing.firstDistance, {
        halfWidthAt: tailWidth,
        gap: options.tailGap,
        reach,
        reachBack: reach * 2,
      }),
    ];
  }
  const lineShapes = [
    bowl,
    outlineShape(tail, { halfWidthAt: tailWidth }, "ink"),
  ];
  const beads = placeBeads(options.beads, tail);
  return [
    ...lineShapes,
    ...threadBeads(lineShapes, beads, options.beadGap),
    circle(HEARTH_CENTRE, options.hearthRadius, "hearth"),
  ];
}

/** The small cut: contrast eased, the hearth and the coral tip only. */
export const SWELL_SMALL = {
  ...SWELL_DEFAULTS,
  bowl: { thick: 64, thin: 42 },
  tail: { start: 40, peak: 58, end: 40, peakAt: 0.6 },
  tailFrom: 70,
  beadGap: 0,
  beads: [{ at: "tip", radius: 84, tone: "accent" }],
  hearthRadius: 62,
};

export const swell = {
  id: "thread-swell",
  centring: "enclosing",
  build: () => buildSwell(),
  buildSmall: () => buildSwell(SWELL_SMALL),
};
