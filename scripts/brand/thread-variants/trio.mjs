/** thread-trio: an even line and three distinct people. */
import { HEARTH_CENTRE, circle } from "../logo-geometry.mjs";
import { placeBeads, threadBeads } from "./beads.mjs";
import { evenWidth } from "./profiles.mjs";
import {
  bowlStrand,
  outlineShape,
  strandBetween,
  tailStrand,
} from "./strands.mjs";

export const TRIO_DEFAULTS = {
  halfWidth: 39,
  tailFrom: 26,
  beadGap: 10,
  beads: [
    { at: "tip", radius: 58, tone: "accent" },
    { at: 3.45, radius: 45, tone: "jade" },
    { after: -101, kind: "ring", radius: 45, wall: 17, tone: "ink" },
  ],
  hearthRadius: 64,
};

export function buildTrio(options = TRIO_DEFAULTS) {
  const width = evenWidth(options.halfWidth);
  const tail = strandBetween(tailStrand, options.tailFrom, tailStrand.total);
  const lineShapes = [
    outlineShape(bowlStrand, { halfWidthAt: width }, "ink"),
    outlineShape(tail, { halfWidthAt: width }, "ink"),
  ];
  const beads = placeBeads(options.beads, tail);
  return [
    ...lineShapes,
    ...threadBeads(lineShapes, beads, options.beadGap),
    circle(HEARTH_CENTRE, options.hearthRadius, "hearth"),
  ];
}

export const trio = {
  id: "thread-trio",
  centring: "enclosing",
  build: () => buildTrio(),
  buildSmall: () =>
    buildTrio({
      ...TRIO_DEFAULTS,
      halfWidth: 58,
      tailFrom: 80,
      beadGap: 0,
      beads: [{ at: "tip", radius: 84, tone: "accent" }],
      hearthRadius: 62,
    }),
};
