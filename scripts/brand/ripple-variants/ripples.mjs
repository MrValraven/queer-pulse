/**
 * The pieces every Ripple variant draws with: the tilted monoline P that
 * breaks the surface, the rings that spread from where it lands, and the gap
 * the P cuts in every ring it lies across, so it reads as lying on top in
 * mono too, where colour cannot part them.
 *
 * Letter coordinates as in logo-geometry.mjs: the Q ring's centre is the
 * origin and y runs down. Angles are in degrees, clockwise on screen from
 * three o'clock.
 */
import { bowlLine, circle, ring } from "../logo-geometry.mjs";
import { evenWidth } from "../thread-variants/profiles.mjs";
import {
  crossingsOf,
  gapCutout,
  gapReach,
  outlineShape,
  strandFrom,
} from "../thread-variants/strands.mjs";

const RADIANS_PER_DEGREE = Math.PI / 180;
/** How far apart the points of a drawn arc or P path sit. */
const PATH_STEP = 3;

/* -------------------------------------------------------------------------- */
/* Points and paths                                                           */
/* -------------------------------------------------------------------------- */

export function pointOnCircle(centre, radius, angleDegrees) {
  const angle = angleDegrees * RADIANS_PER_DEGREE;
  return {
    x: centre.x + radius * Math.cos(angle),
    y: centre.y + radius * Math.sin(angle),
  };
}

/** Points along an arc, about PATH_STEP apart, both ends included. */
function arcPoints(centre, radius, fromDegrees, toDegrees) {
  const sweep = toDegrees - fromDegrees;
  const count = Math.max(
    2,
    Math.ceil((Math.abs(sweep) * RADIANS_PER_DEGREE * radius) / PATH_STEP),
  );
  return Array.from({ length: count + 1 }, (_, pointIndex) =>
    pointOnCircle(centre, radius, fromDegrees + (sweep * pointIndex) / count),
  );
}

/** Points along a straight line, about PATH_STEP apart, `from` left out
 *  (so runs of lines and arcs join without doubled points). */
function linePoints(from, to) {
  const count = Math.max(
    1,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / PATH_STEP),
  );
  return Array.from({ length: count }, (_, pointIndex) => ({
    x: from.x + ((to.x - from.x) * (pointIndex + 1)) / count,
    y: from.y + ((to.y - from.y) * (pointIndex + 1)) / count,
  }));
}

function polyline(points, strokeWidth, tone) {
  return { kind: "polyline", points, strokeWidth, tone };
}

/* -------------------------------------------------------------------------- */
/* Water: the Q ring and the ripples                                          */
/* -------------------------------------------------------------------------- */

/**
 * A water line is what the P can lie across: `shapes` are what gets drawn
 * (one ring, or the arcs of a broken one) and `strand` is its whole centre
 * line, closed, for finding where the P crosses it.
 */
export function wholeRipple(centre, radius, strokeWidth) {
  return {
    shapes: [ring(centre, radius, strokeWidth, "ink")],
    strand: strandFrom(arcPoints(centre, radius, 0, 360).slice(0, -1), {
      isClosed: true,
    }),
    halfWidthAt: evenWidth(strokeWidth / 2),
  };
}

/**
 * A ripple broken into arcs with round caps. Each break is `{ at, gap }`:
 * the angle of its middle and how much ground shows between the two caps,
 * in letter units (the caps' reach is added, so `gap` is what the eye sees).
 */
export function brokenRipple(centre, radius, strokeWidth, breaks) {
  const sorted = [...breaks].sort((first, second) => first.at - second.at);
  const halfSpanOf = ({ gap }) =>
    (gap + strokeWidth) / 2 / radius / RADIANS_PER_DEGREE;
  const arcs = sorted.map((current, breakIndex) => {
    const next = sorted[(breakIndex + 1) % sorted.length];
    const nextAt = breakIndex + 1 < sorted.length ? next.at : next.at + 360;
    return polyline(
      arcPoints(
        centre,
        radius,
        current.at + halfSpanOf(current),
        nextAt - halfSpanOf(next),
      ),
      strokeWidth,
      "ink",
    );
  });
  return { ...wholeRipple(centre, radius, strokeWidth), shapes: arcs };
}

/**
 * A copy of the traced Fraunces bowl scaled about its centre, drawn with an
 * even width (the serif's ripples), or with `halfWidthAt` when given (the
 * serif's own stressed bowl, at scale 1).
 */
export function bowlRipple(scale, { strokeWidth, halfWidthAt } = {}) {
  const strand = strandFrom(
    bowlLine.points
      .slice(0, -1)
      .map((point) => ({ x: point.x * scale, y: point.y * scale })),
    { isClosed: true },
  );
  const widthAt = halfWidthAt
    ? (distance) => halfWidthAt(strand.pointAt(distance))
    : evenWidth(strokeWidth / 2);
  return {
    shapes: [outlineShape(strand, { halfWidthAt: widthAt }, "ink")],
    strand,
    halfWidthAt: widthAt,
  };
}

/* -------------------------------------------------------------------------- */
/* The P                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The tilted monoline P. Drawn upright first, in its own frame: the stem on
 * x = 0 running down from its top at y = 0, the bowl a D to its right,
 * `bowlWidth` wide and `bowlHeight` tall (centre line to centre line), the
 * corner where stem meets bowl top rounded by `cornerRadius`. It is then
 * turned by `tiltDegrees` (the stem's foot swings to the lower right, the
 * bowl rises up and to the right of the stem's top) and moved so its
 * `anchor` (the middle of the bowl by default) lands on `landing`.
 *
 * The stem runs down until its end is `exitRadius` from `exitCentre`: past
 * the Q ring, where it becomes the Q's tail. A variant whose ring is no
 * circle passes `footDepthFor` instead, which gets the P's frame helpers
 * and returns how far below the stem's top its end sits.
 */
export function tiltedP({
  landing,
  tiltDegrees,
  bowlWidth,
  bowlHeight,
  halfWidth,
  cornerRadius,
  anchor = { x: bowlWidth / 2, y: bowlHeight / 2 },
  exitCentre = { x: 0, y: 0 },
  exitRadius,
  footDepthFor,
}) {
  const tilt = tiltDegrees * RADIANS_PER_DEGREE;
  const turn = ({ x, y }) => ({
    x: x * Math.cos(tilt) + y * Math.sin(tilt),
    y: -x * Math.sin(tilt) + y * Math.cos(tilt),
  });
  const turnedAnchor = turn(anchor);
  const toWorld = (point) => {
    const turned = turn(point);
    return {
      x: landing.x + turned.x - turnedAnchor.x,
      y: landing.y + turned.y - turnedAnchor.y,
    };
  };
  const direction = turn({ x: 0, y: 1 });

  /** How far down the line x = `offset` (in the P's frame) a point sits
   *  `radius` from `centre`, on the far side (the foot's side). */
  const depthAtRadius = (offset, centre, radius) => {
    const start = toWorld({ x: offset, y: 0 });
    const fromCentre = { x: start.x - centre.x, y: start.y - centre.y };
    const along = fromCentre.x * direction.x + fromCentre.y * direction.y;
    const squared = fromCentre.x ** 2 + fromCentre.y ** 2 - radius ** 2;
    return -along + Math.sqrt(along * along - squared);
  };

  /** A world point back in the P's upright frame. */
  const toFrame = (point) => {
    const shifted = {
      x: point.x - landing.x + turnedAnchor.x,
      y: point.y - landing.y + turnedAnchor.y,
    };
    return {
      x: shifted.x * Math.cos(tilt) - shifted.y * Math.sin(tilt),
      y: shifted.x * Math.sin(tilt) + shifted.y * Math.cos(tilt),
    };
  };

  const footDepth = footDepthFor
    ? footDepthFor({ toWorld, depthAtRadius })
    : depthAtRadius(0, exitCentre, exitRadius);
  const bowlRadius = bowlHeight / 2;
  const bowlTurnX = bowlWidth - bowlRadius;
  const framePoints = [
    { x: 0, y: footDepth },
    ...linePoints({ x: 0, y: footDepth }, { x: 0, y: cornerRadius }),
    ...arcPoints(
      { x: cornerRadius, y: cornerRadius },
      cornerRadius,
      180,
      270,
    ).slice(1),
    ...linePoints({ x: cornerRadius, y: 0 }, { x: bowlTurnX, y: 0 }),
    ...arcPoints({ x: bowlTurnX, y: bowlRadius }, bowlRadius, -90, 90).slice(1),
    ...linePoints({ x: bowlTurnX, y: bowlHeight }, { x: 0, y: bowlHeight }),
  ];
  const points = framePoints.map(toWorld);
  return {
    shapes: [polyline(points, halfWidth * 2, "accent")],
    strand: strandFrom(points),
    halfWidth,
    direction,
    tip: toWorld({ x: 0, y: footDepth }),
    toWorld,
    toFrame,
    depthAtRadius,
  };
}

/** The coral bead that follows the stem's tip after `gap`, like the dot of
 *  an exclamation mark. */
export function tipBead(letterP, { gap, radius }) {
  const reach = letterP.halfWidth + gap + radius;
  return circle(
    {
      x: letterP.tip.x + letterP.direction.x * reach,
      y: letterP.tip.y + letterP.direction.y * reach,
    },
    radius,
    "accent",
  );
}

/**
 * A short ink stub on the Q ring beside the stem, parallel to it on the
 * bowl's side: the Q's own tail, stepping out with the P. It runs from the
 * ring's centre line out to `outerRadius` from `centre`.
 */
export function tailStub(
  letterP,
  { centre, fromRadius, outerRadius, gap, halfWidth },
) {
  const offset = letterP.halfWidth + gap + halfWidth;
  const from = letterP.toWorld({
    x: offset,
    y: letterP.depthAtRadius(offset, centre, fromRadius),
  });
  const to = letterP.toWorld({
    x: offset,
    y: letterP.depthAtRadius(offset, centre, outerRadius),
  });
  return polyline([from, to], halfWidth * 2, "ink");
}

/* -------------------------------------------------------------------------- */
/* Lying over                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Cuts a gap round the P out of every water line it crosses: the P's own
 * outline round each crossing, grown by `gap`. `colorways` limits the cut
 * to some colourways (a small cut may keep it in mono only).
 */
export function layOver(letterP, waters, { gap, colorways } = {}) {
  for (const water of waters) {
    for (const crossing of crossingsOf(letterP.strand, water.strand)) {
      const reach = gapReach({
        overStrand: letterP.strand,
        overDistance: crossing.firstDistance,
        underStrand: water.strand,
        underDistance: crossing.secondDistance,
        overHalfWidth: letterP.halfWidth,
        underHalfWidth: water.halfWidthAt(crossing.secondDistance),
        gap,
      });
      const cutout = gapCutout(letterP.strand, crossing.firstDistance, {
        halfWidthAt: () => letterP.halfWidth,
        gap,
        reach,
      });
      if (colorways) cutout.colorways = colorways;
      for (const shape of water.shapes) {
        shape.cutouts = [...(shape.cutouts ?? []), cutout];
      }
    }
  }
}
