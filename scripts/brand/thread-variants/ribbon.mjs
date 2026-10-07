/** thread-ribbon: the line as a flat ribbon. The tail lies over the bowl
 *  and, near its tip, folds over to show its back. */
import { HEARTH_CENTRE, circle } from "../logo-geometry.mjs";
import { placeBeads, threadBeads } from "./beads.mjs";
import { evenWidth } from "./profiles.mjs";
import {
  bowlStrand,
  crossingsOf,
  gapCutout,
  gapReach,
  outlineContours,
  outlineShape,
  strandBetween,
  tailStrand,
} from "./strands.mjs";

export const RIBBON_DEFAULTS = {
  halfWidth: 42,
  gap: 17,
  tailFrom: 22,
  /** Where the tail folds, past the crossing (along the tail). */
  foldAfterCrossing: 84,
  /** How far the fold edge leans: its two ends sit this far either side
   *  of the fold, along the tail, so the crease runs on a diagonal. */
  foldLean: 30,
  beadGap: 11,
  beads: [
    { at: "tip", radius: 48, tone: "accent" },
    { at: 5.75, radius: 46, tone: "ink" },
    { at: 2.6, radius: 46, tone: "ink" },
  ],
  hearthRadius: 64,
};

/** A point on a strand's edge: `side` 1 is the left edge, -1 the right,
 *  and `beyond` pushes it that much further out. */
function edgePoint(strand, distance, halfWidth, side, beyond = 0) {
  const centre = strand.pointAt(distance);
  const normal = strand.normalAt(distance);
  const reach = side * (halfWidth + beyond);
  return { x: centre.x + normal.x * reach, y: centre.y + normal.y * reach };
}

/** The back of the ribbon past the fold: the tail's outline from a
 *  diagonal crease to its tip. */
function foldedBack(tail, halfWidth, foldAt, foldLean) {
  const [outline] = outlineContours(tail, {
    halfWidthAt: evenWidth(halfWidth),
    from: foldAt - foldLean,
    startCap: "flat",
  });
  // The outline runs up the left edge, round the tip and back down the
  // right edge. Trim the right edge back to the crease's other end, so the
  // flat start becomes the diagonal from one end of the crease to the other.
  const creaseEnd = edgePoint(tail, foldAt + foldLean, halfWidth, -1);
  const rightStart = outline.findIndex(
    (point, pointIndex) =>
      pointIndex > outline.length / 2 &&
      Math.hypot(point.x - creaseEnd.x, point.y - creaseEnd.y) < 6,
  );
  const trimmed = outline.slice(0, rightStart);
  trimmed[0] = { ...trimmed[0], isCorner: true };
  return [...trimmed, { ...creaseEnd, isCorner: true }];
}

/** A band of ground along the crease, wide `gap`, reaching past both edges. */
function creaseCut(tail, halfWidth, foldAt, foldLean, gap) {
  const margin = 12;
  return {
    kind: "polygon",
    points: [
      edgePoint(tail, foldAt - foldLean - gap / 2, halfWidth, 1, margin),
      edgePoint(tail, foldAt - foldLean + gap / 2, halfWidth, 1, margin),
      edgePoint(tail, foldAt + foldLean + gap / 2, halfWidth, -1, margin),
      edgePoint(tail, foldAt + foldLean - gap / 2, halfWidth, -1, margin),
    ].map((point) => ({ ...point, isCorner: true })),
    colorways: ["mono"],
  };
}

export function buildRibbon(options = RIBBON_DEFAULTS) {
  const { halfWidth, gap } = options;
  const width = evenWidth(halfWidth);
  const tail = strandBetween(tailStrand, options.tailFrom, tailStrand.total);
  const [crossing] = crossingsOf(tail, bowlStrand);
  const bowlCutouts = [];
  const tailCutouts = [];
  const shapes = [];
  if (gap > 0) {
    const reach = gapReach({
      overStrand: tail,
      overDistance: crossing.firstDistance,
      underStrand: bowlStrand,
      underDistance: crossing.secondDistance,
      overHalfWidth: halfWidth,
      underHalfWidth: halfWidth,
      gap,
    });
    bowlCutouts.push(
      gapCutout(tail, crossing.firstDistance, {
        halfWidthAt: width,
        gap,
        reach,
        reachBack: reach * 2,
      }),
    );
  }
  const bowl = outlineShape(bowlStrand, { halfWidthAt: width }, "ink", {
    cutouts: bowlCutouts,
  });
  const tailFace = outlineShape(tail, { halfWidthAt: width }, "ink", {
    cutouts: tailCutouts,
  });
  shapes.push(bowl, tailFace);
  if (options.foldAfterCrossing !== null) {
    const foldAt = crossing.firstDistance + options.foldAfterCrossing;
    const back = {
      kind: "outline",
      contours: [foldedBack(tail, halfWidth, foldAt, options.foldLean)],
      tone: "shade",
      cutouts: [],
    };
    // In mono the back is the ink too, so one clean cut along the crease
    // parts it from the face.
    if (gap > 0) {
      const cut = creaseCut(tail, halfWidth, foldAt, options.foldLean, gap);
      tailFace.cutouts.push(cut);
      back.cutouts.push(cut);
    }
    shapes.push(back);
  }
  const beads = placeBeads(options.beads, tail);
  return [
    ...shapes,
    ...threadBeads(shapes, beads, options.beadGap),
    circle(HEARTH_CENTRE, options.hearthRadius, "hearth"),
  ];
}

export const ribbon = {
  id: "thread-ribbon",
  centring: "enclosing",
  build: () => buildRibbon(),
  buildSmall: () =>
    buildRibbon({
      ...RIBBON_DEFAULTS,
      halfWidth: 60,
      gap: 0,
      tailFrom: 74,
      foldAfterCrossing: null,
      beadGap: 0,
      beads: [{ at: "tip", radius: 84, tone: "accent" }],
      hearthRadius: 62,
    }),
};
