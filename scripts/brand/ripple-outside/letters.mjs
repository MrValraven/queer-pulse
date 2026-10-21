/**
 * The pieces every P on the outside variant draws with: the big monoline P
 * whose bowl holds the mark, and the small Q that sits in that bowl.
 *
 * Letter coordinates as in logo-geometry.mjs: the P's bowl centre is the
 * origin and y runs down. Angles are in degrees, clockwise on screen from
 * three o'clock.
 */
import { circle } from "../logo-geometry.mjs";
import {
  layOver,
  pointOnCircle,
  wholeRipple,
} from "../ripple-variants/ripples.mjs";
import { evenWidth } from "../thread-variants/profiles.mjs";
import { strandFrom } from "../thread-variants/strands.mjs";

const RADIANS_PER_DEGREE = Math.PI / 180;
/** How far apart the points of a drawn arc or line sit. */
const PATH_STEP = 3;

/**
 * Which tone each letter paints. The big P is ink, so it reads as the
 * letter that frames the mark on either ground, and the small Q at its
 * heart is the coral pulse.
 */
export const TONES = { letterP: "ink", letterQ: "accent" };

/* -------------------------------------------------------------------------- */
/* Points and paths (copied from ripples.mjs, which keeps them private)       */
/* -------------------------------------------------------------------------- */

/** Points along an arc, about PATH_STEP apart, both ends included. */
export function arcPoints(centre, radius, fromDegrees, toDegrees) {
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
export function linePoints(from, to) {
  const count = Math.max(
    1,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / PATH_STEP),
  );
  return Array.from({ length: count }, (_, pointIndex) => ({
    x: from.x + ((to.x - from.x) * (pointIndex + 1)) / count,
    y: from.y + ((to.y - from.y) * (pointIndex + 1)) / count,
  }));
}

export function polyline(points, strokeWidth, tone) {
  return { kind: "polyline", points, strokeWidth, tone };
}

/** Turns a point about the origin, counterclockwise on screen. */
function turnAboutOrigin({ x, y }, degrees) {
  const angle = degrees * RADIANS_PER_DEGREE;
  return {
    x: x * Math.cos(angle) + y * Math.sin(angle),
    y: -x * Math.sin(angle) + y * Math.cos(angle),
  };
}

/* -------------------------------------------------------------------------- */
/* The big P                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The big monoline P. Its bowl is a ring of `bowlRadius` round the origin,
 * its corners on the stem's side rounded by `cornerRadius`: at the bowl's
 * own radius the bowl is a whole circle and the stem runs down its left
 * side as a tangent, the geometric P of Futura. The stem rises to
 * `stemTop` (a depth below the bowl's centre, so negative is above it) and
 * falls to `stemFoot`. `tiltDegrees` leans the whole letter back round the
 * bowl's centre, so the foot swings to the lower right.
 *
 * Returns the stem and bowl as separate shapes (the bowl alone is what a
 * line lying over it cuts a gap in), the bowl's closed strand and half
 * width.
 */
export function bigP({
  bowlRadius,
  cornerRadius = bowlRadius,
  halfWidth,
  stemTop,
  stemFoot,
  tiltDegrees = 0,
}) {
  const turn = (point) => turnAboutOrigin(point, tiltDegrees);
  const stemX = -bowlRadius;
  const cornerX = stemX + cornerRadius;
  // Clockwise from the top of the stem's side: the top corner, the top run,
  // the round right side, the bottom run, the bottom corner, and back up the
  // stem's side to close.
  const bowlFrame = [
    ...arcPoints(
      { x: cornerX, y: -bowlRadius + cornerRadius },
      cornerRadius,
      180,
      270,
    ),
    ...linePoints({ x: cornerX, y: -bowlRadius }, { x: 0, y: -bowlRadius }),
    ...arcPoints({ x: 0, y: 0 }, bowlRadius, -90, 90).slice(1),
    ...linePoints({ x: 0, y: bowlRadius }, { x: cornerX, y: bowlRadius }),
    ...arcPoints(
      { x: cornerX, y: bowlRadius - cornerRadius },
      cornerRadius,
      90,
      180,
    ).slice(1),
    ...linePoints(
      { x: stemX, y: bowlRadius - cornerRadius },
      { x: stemX, y: -bowlRadius + cornerRadius },
    ).slice(0, -1),
  ];
  const bowlPoints = bowlFrame.map(turn);
  const stemPoints = [
    { x: stemX, y: stemTop },
    ...linePoints({ x: stemX, y: stemTop }, { x: stemX, y: stemFoot }),
  ].map(turn);
  const tone = TONES.letterP;
  const bowl = polyline([...bowlPoints, bowlPoints[0]], halfWidth * 2, tone);
  const stem = polyline(stemPoints, halfWidth * 2, tone);
  return {
    bowl,
    stem,
    shapes: [bowl, stem],
    strand: strandFrom(bowlPoints, { isClosed: true }),
    halfWidthAt: evenWidth(halfWidth),
    halfWidth,
  };
}

/* -------------------------------------------------------------------------- */
/* The small Q                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The small Q in the P's bowl: a ring of `radius` round `centre` (or a
 * solid dot when `isSolid`, for the smallest sizes) and a straight tail
 * along `tailAngle`. The tail starts `tailFrom` from the centre (inside the
 * ring's counter, as a Q's tail does, or at the centre of a dot) and ends
 * `tailTo` from it. Where it lies across its own ring, the ring loses a
 * `gap` round it, so the tail reads as on top in mono too.
 *
 * Returns the shapes and, for lying over other lines and following with a
 * bead, the tail's strand, half width, tip and direction (the same fields a
 * Ripple P carries, so layOver and tipBead take it as it is).
 */
export function innerQ({
  centre = { x: 0, y: 0 },
  radius,
  strokeWidth,
  isSolid = false,
  tailAngle,
  tailFrom,
  tailTo,
  tailHalfWidth,
  gap = 0,
}) {
  const tone = TONES.letterQ;
  const tailStart = pointOnCircle(centre, tailFrom, tailAngle);
  const tip = pointOnCircle(centre, tailTo, tailAngle);
  const tailPoints = [tailStart, ...linePoints(tailStart, tip)];
  const tail = polyline(tailPoints, tailHalfWidth * 2, tone);
  const angle = tailAngle * RADIANS_PER_DEGREE;
  const letterQ = {
    tail,
    strand: strandFrom(tailPoints),
    halfWidth: tailHalfWidth,
    tip,
    direction: { x: Math.cos(angle), y: Math.sin(angle) },
  };
  if (isSolid) {
    const body = circle(centre, radius, tone);
    return { ...letterQ, body, shapes: [body, tail] };
  }
  const ringWater = wholeRipple(centre, radius, strokeWidth);
  const [body] = ringWater.shapes;
  body.tone = tone;
  if (gap > 0) layOver(letterQ, [ringWater], { gap });
  return { ...letterQ, body, shapes: [body, tail] };
}
