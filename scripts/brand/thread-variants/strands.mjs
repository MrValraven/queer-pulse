/**
 * Strands: the Q's centre lines as dense, measured polylines, and what the
 * thread variants build from them. A line whose width changes along its
 * length is drawn as a filled outline (two offset edges joined by caps); an
 * over strand cuts a gap out of the strand beneath it with a cutout region;
 * a bead cuts a ring out of the line it sits on the same way.
 *
 * Everything here is in letter coordinates: the bowl's centre is the origin
 * and y runs down, as in logo-geometry.mjs.
 */
import {
  bowlLine,
  bowlPointAt,
  distanceBetween,
  measuredPolyline,
  pointAtDistance,
  tailLine,
} from "../logo-geometry.mjs";

/** How far apart the points of an outline's edges sit. */
const EDGE_STEP = 9;
/** How many points round a half circle cap. */
const CAP_POINTS = 10;

/* -------------------------------------------------------------------------- */
/* Strands                                                                    */
/* -------------------------------------------------------------------------- */

/** A centre line that knows its length, its points by distance and its
 *  direction. `isClosed` strands join their last point to their first. */
export function strandFrom(points, { isClosed = false } = {}) {
  const polyline = measuredPolyline(points);
  const pointAt = (distance) =>
    pointAtDistance(
      polyline,
      isClosed ? wrapDistance(distance, polyline.total) : distance,
    );
  const tangentAt = (distance) => {
    const reach = 1.5;
    const before = isClosed || distance - reach >= 0 ? distance - reach : 0;
    const after =
      isClosed || distance + reach <= polyline.total
        ? distance + reach
        : polyline.total;
    const from = pointAt(before);
    const to = pointAt(after);
    const length = distanceBetween(from, to) || 1;
    return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  };
  /** Left of the direction of travel (on screen, with y running down). */
  const normalAt = (distance) => {
    const tangent = tangentAt(distance);
    return { x: tangent.y, y: -tangent.x };
  };
  return { ...polyline, isClosed, pointAt, tangentAt, normalAt };
}

function wrapDistance(distance, total) {
  return ((distance % total) + total) % total;
}

/** The traced bowl as a closed strand, starting at parameter 0. */
export const bowlStrand = strandFrom(bowlLine.points.slice(0, -1), {
  isClosed: true,
});

/** The traced tail, from inside the counter out to its upturned tip. */
export const tailStrand = strandFrom(tailLine.points);

/**
 * The bowl as an open loop of thread that laps itself: it starts at one
 * point of the traced ellipse, runs once round and carries on for `lap`
 * radians along its own start, ending at `endParameter` (the bowl's angle
 * parameter, clockwise on screen from three o'clock). Both runs follow the
 * ellipse, so nothing leaves the letter's outline.
 */
export function lappedBowlStrand({ endParameter, lap, samples = 1600 }) {
  const span = Math.PI * 2 + lap;
  const startParameter = endParameter - span;
  return strandFrom(
    Array.from({ length: samples + 1 }, (_, sampleIndex) =>
      bowlPointAt(startParameter + (span * sampleIndex) / samples),
    ),
  );
}

/** A strand made from a stretch of another one. */
export function strandBetween(strand, fromDistance, toDistance, step = 1) {
  const count = Math.max(2, Math.ceil((toDistance - fromDistance) / step));
  return strandFrom(
    Array.from({ length: count + 1 }, (_, sampleIndex) =>
      strand.pointAt(
        fromDistance + ((toDistance - fromDistance) * sampleIndex) / count,
      ),
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* Where strands cross                                                        */
/* -------------------------------------------------------------------------- */

function segmentCrossing(firstStart, firstEnd, secondStart, secondEnd) {
  const firstX = firstEnd.x - firstStart.x;
  const firstY = firstEnd.y - firstStart.y;
  const secondX = secondEnd.x - secondStart.x;
  const secondY = secondEnd.y - secondStart.y;
  const denominator = firstX * secondY - firstY * secondX;
  if (Math.abs(denominator) < 1e-9) return null;
  const startX = secondStart.x - firstStart.x;
  const startY = secondStart.y - firstStart.y;
  const alongFirst = (startX * secondY - startY * secondX) / denominator;
  const alongSecond = (startX * firstY - startY * firstX) / denominator;
  if (alongFirst < 0 || alongFirst > 1 || alongSecond < 0 || alongSecond > 1) {
    return null;
  }
  return { alongFirst, alongSecond };
}

/**
 * Every point where two strands cross, with its distance along each. Pass the
 * same strand twice for where it crosses itself (neighbouring stretches are
 * skipped, so a bend is never counted).
 */
export function crossingsOf(firstStrand, secondStrand) {
  const isSelf = firstStrand === secondStrand;
  const found = [];
  const { points: firstPoints, lengths: firstLengths } = firstStrand;
  const { points: secondPoints, lengths: secondLengths } = secondStrand;
  for (let firstIndex = 0; firstIndex < firstPoints.length - 1; firstIndex++) {
    const secondFrom = isSelf ? firstIndex + 2 : 0;
    for (
      let secondIndex = secondFrom;
      secondIndex < secondPoints.length - 1;
      secondIndex++
    ) {
      if (
        isSelf &&
        secondLengths[secondIndex] - firstLengths[firstIndex + 1] < 40
      ) {
        continue;
      }
      const hit = segmentCrossing(
        firstPoints[firstIndex],
        firstPoints[firstIndex + 1],
        secondPoints[secondIndex],
        secondPoints[secondIndex + 1],
      );
      if (!hit) continue;
      const firstDistance =
        firstLengths[firstIndex] +
        hit.alongFirst *
          (firstLengths[firstIndex + 1] - firstLengths[firstIndex]);
      const secondDistance =
        secondLengths[secondIndex] +
        hit.alongSecond *
          (secondLengths[secondIndex + 1] - secondLengths[secondIndex]);
      found.push({
        point: firstStrand.pointAt(firstDistance),
        firstDistance,
        secondDistance,
      });
    }
  }
  return found;
}

/* -------------------------------------------------------------------------- */
/* Outlines                                                                   */
/* -------------------------------------------------------------------------- */

function offsetPoint(point, normal, amount) {
  return { x: point.x + normal.x * amount, y: point.y + normal.y * amount };
}

/** Distances from `from` to `to`, about EDGE_STEP apart, ends included. */
function stations(from, to, step = EDGE_STEP) {
  const count = Math.max(2, Math.ceil((to - from) / step));
  return Array.from(
    { length: count + 1 },
    (_, stationIndex) => from + ((to - from) * stationIndex) / count,
  );
}

/** A half circle cap from one edge to the other round the end of a line. */
function roundCap(centre, direction, radius, fromNormal) {
  return Array.from({ length: CAP_POINTS - 1 }, (_, capIndex) => {
    const angle = (Math.PI * (capIndex + 1)) / CAP_POINTS;
    const along = Math.sin(angle);
    const across = Math.cos(angle);
    return {
      x: centre.x + (fromNormal.x * across + direction.x * along) * radius,
      y: centre.y + (fromNormal.y * across + direction.y * along) * radius,
    };
  });
}

/**
 * The filled outline of a stretch of strand whose half width at each
 * distance is `halfWidthAt(distance)`. Caps are "round" or "flat" (a square
 * cut across the line, corners kept sharp). A closed strand drawn whole
 * returns two contours, outer and inner, wound opposite ways so the inner
 * one is a hole.
 */
export function outlineContours(
  strand,
  {
    halfWidthAt,
    from = 0,
    to = strand.total,
    startCap = "round",
    endCap = "round",
    step = EDGE_STEP,
  },
) {
  const distances = stations(from, to, step);
  const left = distances.map((distance) =>
    offsetPoint(
      strand.pointAt(distance),
      strand.normalAt(distance),
      halfWidthAt(distance),
    ),
  );
  const right = distances.map((distance) =>
    offsetPoint(
      strand.pointAt(distance),
      strand.normalAt(distance),
      -halfWidthAt(distance),
    ),
  );
  const isWholeLoop = strand.isClosed && to - from >= strand.total - 0.01;
  if (isWholeLoop) {
    return [left.slice(0, -1), right.slice(0, -1).reverse()];
  }
  const endCapPoints =
    endCap === "round"
      ? roundCap(
          strand.pointAt(to),
          strand.tangentAt(to),
          halfWidthAt(to),
          strand.normalAt(to),
        )
      : [];
  const startTangent = strand.tangentAt(from);
  const startCapPoints =
    startCap === "round"
      ? roundCap(
          strand.pointAt(from),
          { x: -startTangent.x, y: -startTangent.y },
          halfWidthAt(from),
          {
            x: -strand.normalAt(from).x,
            y: -strand.normalAt(from).y,
          },
        )
      : [];
  if (endCap === "flat") {
    left[left.length - 1].isCorner = true;
    right[right.length - 1].isCorner = true;
  }
  if (startCap === "flat") {
    left[0].isCorner = true;
    right[0].isCorner = true;
  }
  return [[...left, ...endCapPoints, ...right.reverse(), ...startCapPoints]];
}

/** A stretch of strand as an outline shape. */
export function outlineShape(strand, options, tone, extra = {}) {
  return {
    kind: "outline",
    contours: outlineContours(strand, options),
    tone,
    ...extra,
  };
}

/**
 * The gap an over strand cuts in the strand beneath it: the over strand's
 * own stretch round `distance`, widened by `gap` on both sides, as a cutout
 * region. `reach` is how far along the over strand the region runs ahead;
 * `reachBack` how far it runs back (the same unless given). Where the over
 * strand ends inside that stretch, the region rounds off round its end, so
 * the gap follows the end's round cap.
 */
export function gapCutout(
  overStrand,
  distance,
  { halfWidthAt, gap, reach, reachBack = reach },
) {
  const from = distance - reachBack;
  const to = distance + reach;
  const [points] = outlineContours(overStrand, {
    halfWidthAt: (along) => halfWidthAt(along) + gap,
    from: Math.max(0, from),
    to: Math.min(overStrand.total, to),
    startCap: from <= 0 ? "round" : "flat",
    endCap: to >= overStrand.total ? "round" : "flat",
    step: 4,
  });
  return { kind: "polygon", points };
}

/**
 * How far along the over strand a crossing's gap must run to part the whole
 * width of the under strand, and no further (a longer gap would bite into
 * the under strand wherever it runs close by).
 */
export function gapReach({
  overStrand,
  overDistance,
  underStrand,
  underDistance,
  overHalfWidth,
  underHalfWidth,
  gap,
}) {
  const overTangent = overStrand.tangentAt(overDistance);
  const underTangent = underStrand.tangentAt(underDistance);
  const cosine = Math.abs(
    overTangent.x * underTangent.x + overTangent.y * underTangent.y,
  );
  const sine = Math.sqrt(Math.max(1e-6, 1 - cosine * cosine));
  return underHalfWidth / sine + ((overHalfWidth + gap) * cosine) / sine + 16;
}

/** A round cutout (a bead's knockout ring, or a hole). */
export function circleCutout(centre, radius) {
  return { kind: "circle", x: centre.x, y: centre.y, radius };
}

/* -------------------------------------------------------------------------- */
/* Widths                                                                     */
/* -------------------------------------------------------------------------- */

/** Eases 0 to 1 with no kink at either end. */
export function smoothStep(value) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}
