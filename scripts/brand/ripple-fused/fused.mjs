/**
 * The fused P: a P whose bowl is a closed ring round the Q's own centre, so
 * the bowl is the Q's first ripple. The stem runs along the bowl's stem
 * side (its centre line touches the bowl's centre line there, the way a
 * geometric p's stem meets its round bowl) and on out through the Q ring
 * as the Q's tail.
 *
 * Letter coordinates as in logo-geometry.mjs: the Q's centre is the origin
 * and y runs down. Angles are in degrees, clockwise on screen from three
 * o'clock.
 */
import { ring } from "../logo-geometry.mjs";
import { layOver, wholeRipple } from "../ripple-variants/ripples.mjs";
import { strandFrom } from "../thread-variants/strands.mjs";

const RADIANS_PER_DEGREE = Math.PI / 180;
const CENTRE = { x: 0, y: 0 };

/**
 * The stem's tilt (how far its foot swings to the lower right of straight
 * down) that makes its centre line cross a circle of `radius` at
 * `exitDegrees`, when the line runs `bowlRadius` from the centre.
 */
export function tiltForExit({ radius, bowlRadius, exitDegrees }) {
  const along = Math.sqrt(radius * radius - bowlRadius * bowlRadius);
  const lean = Math.atan2(bowlRadius, along) / RADIANS_PER_DEGREE;
  return 90 - exitDegrees + lean;
}

/** Turns a point of the P's upright frame by `tiltDegrees` about the
 *  centre (the stem's foot swings to the lower right). */
export function turnBy(tiltDegrees) {
  const tilt = tiltDegrees * RADIANS_PER_DEGREE;
  return ({ x, y }) => ({
    x: x * Math.cos(tilt) + y * Math.sin(tilt),
    y: -x * Math.sin(tilt) + y * Math.cos(tilt),
  });
}

/**
 * The fused P in world coordinates. Upright, its bowl is the circle of
 * `bowlRadius` round the origin and its stem is the line x = -bowlRadius,
 * from `stemRise` above the bowl's middle down to `footRadius` from the
 * centre. Returns its shapes and the stem as a strand (the only part that
 * crosses anything).
 */
export function fusedP({
  bowlRadius,
  halfWidth,
  tiltDegrees,
  stemRise,
  footRadius,
}) {
  const turn = turnBy(tiltDegrees);
  const footDepth = Math.sqrt(footRadius ** 2 - bowlRadius ** 2);
  const top = turn({ x: -bowlRadius, y: -stemRise });
  const foot = turn({ x: -bowlRadius, y: footDepth });
  const stemPoints = [foot, top];
  return {
    shapes: [
      ring(CENTRE, bowlRadius, halfWidth * 2, "accent"),
      {
        kind: "polyline",
        points: stemPoints,
        strokeWidth: halfWidth * 2,
        tone: "accent",
      },
    ],
    strand: strandFrom(densePoints(foot, top)),
    halfWidth,
  };
}

/** Points along a straight line about 3 units apart, both ends included. */
function densePoints(from, to) {
  const count = Math.max(
    2,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 3),
  );
  return Array.from({ length: count + 1 }, (_, pointIndex) => ({
    x: from.x + ((to.x - from.x) * pointIndex) / count,
    y: from.y + ((to.y - from.y) * pointIndex) / count,
  }));
}

/**
 * Ring and Stack: the fused P inside the Q ring, with optional ripples
 * between them, all round one centre. The stem lies over every ring it
 * crosses with a gap round it.
 */
export function buildFusedRings(options) {
  const { ring: outerRing, letterP: letterOptions } = options;
  const ringOuter = outerRing.radius + outerRing.strokeWidth / 2;
  const waters = [
    wholeRipple(CENTRE, outerRing.radius, outerRing.strokeWidth),
    ...options.ripples.map((ripple) =>
      wholeRipple(CENTRE, ripple.radius, ripple.strokeWidth),
    ),
  ];
  const tiltDegrees = tiltForExit({
    radius: outerRing.radius,
    bowlRadius: letterOptions.bowlRadius,
    exitDegrees: options.exitDegrees,
  });
  const letterP = fusedP({
    ...letterOptions,
    tiltDegrees,
    footRadius: ringOuter + options.tailLength,
  });
  if (options.gap > 0) layOver(letterP, waters, { gap: options.gap });
  return [...waters.flatMap((water) => water.shapes), ...letterP.shapes];
}
