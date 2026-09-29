import type { PathCommand } from "../primitives";

/**
 * The point and curve maths every sticker template draws from, ported from
 * the two throwaway art-reference generators so every template shares one
 * tested implementation of the shared trigonometry.
 */

export type Point = readonly [number, number];

/** A gently bulging line from the start point to the end point: a straight
 *  interpolation with a sine bump of `bulge` added at its peak (the
 *  midpoint), tapering to zero at both ends. Used for a pour's arc, a
 *  motion-line curve, and similar single-bulge strokes. */
export function arc(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  bulge: number,
  steps = 16,
): Point[] {
  const points: Point[] = [];
  for (let stepIndex = 0; stepIndex <= steps; stepIndex += 1) {
    const progress = stepIndex / steps;
    points.push([
      startX + (endX - startX) * progress,
      startY +
        (endY - startY) * progress +
        Math.sin(Math.PI * progress) * bulge,
    ]);
  }
  return points;
}

/** A quadratic Bézier curve from `start` to `end`, bending toward
 *  `control`. */
export function quadraticBezier(
  start: Point,
  control: Point,
  end: Point,
  steps = 16,
): Point[] {
  const points: Point[] = [];
  for (let stepIndex = 0; stepIndex <= steps; stepIndex += 1) {
    const progress = stepIndex / steps;
    const oneMinusProgress = 1 - progress;
    points.push([
      oneMinusProgress ** 2 * start[0] +
        2 * oneMinusProgress * progress * control[0] +
        progress * progress * end[0],
      oneMinusProgress ** 2 * start[1] +
        2 * oneMinusProgress * progress * control[1] +
        progress * progress * end[1],
    ]);
  }
  return points;
}

/** Points sampled evenly around an ellipse's perimeter, from `fromAngle` to
 *  `toAngle` radians (a full turn by default). */
export function ellipsePoints(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  fromAngle = 0,
  toAngle = Math.PI * 2,
  steps = 44,
): Point[] {
  const points: Point[] = [];
  for (let stepIndex = 0; stepIndex <= steps; stepIndex += 1) {
    const angle = fromAngle + ((toAngle - fromAngle) * stepIndex) / steps;
    points.push([
      centerX + Math.cos(angle) * radiusX,
      centerY + Math.sin(angle) * radiusY,
    ]);
  }
  return points;
}

/** Four-point sparkle, 8 vertices, first point straight up. */
export function fourPointStar(
  centerX: number,
  centerY: number,
  radius: number,
  innerRatio = 0.34,
): Point[] {
  return starPoints(centerX, centerY, radius, innerRatio, 4, 0);
}

/** Impact burst: `spikes` points, rotated by `spin` radians. */
export function burst(
  centerX: number,
  centerY: number,
  radius: number,
  innerRatio = 0.55,
  spikes = 8,
  spin = 0.2,
): Point[] {
  return starPoints(centerX, centerY, radius, innerRatio, spikes, spin);
}

/** Shared star-polygon sampler behind `fourPointStar` and `burst`: `spikeCount`
 *  outer points alternating with `spikeCount` inner points at `innerRatio` of
 *  the radius, the first vertex straight up before `spin` is applied. */
function starPoints(
  centerX: number,
  centerY: number,
  radius: number,
  innerRatio: number,
  spikeCount: number,
  spin: number,
): Point[] {
  const points: Point[] = [];
  const vertexCount = spikeCount * 2;
  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
    const angle =
      (vertexIndex / vertexCount) * Math.PI * 2 - Math.PI / 2 + spin;
    const vertexRadius = vertexIndex % 2 ? radius * innerRatio : radius;
    points.push([
      centerX + Math.cos(angle) * vertexRadius,
      centerY + Math.sin(angle) * vertexRadius,
    ]);
  }
  return points;
}

/** The classic parametric heart (16 sin^3 t, 13 cos t - 5 cos 2t - 2 cos 3t -
 *  cos 4t), scaled and centred on (centerX, centerY). */
export function heartPoints(
  centerX: number,
  centerY: number,
  scale: number,
  steps = 64,
): Point[] {
  const points: Point[] = [];
  for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
    const progress = (stepIndex / steps) * Math.PI * 2;
    points.push([
      centerX + 16 * Math.sin(progress) ** 3 * scale,
      centerY -
        (13 * Math.cos(progress) -
          5 * Math.cos(2 * progress) -
          2 * Math.cos(3 * progress) -
          Math.cos(4 * progress)) *
          scale,
    ]);
  }
  return points;
}

/** Rotates every point by `degrees` about (originX, originY). */
export function rotatePoints(
  points: readonly Point[],
  degrees: number,
  originX: number,
  originY: number,
): Point[] {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return points.map(([x, y]) => [
    originX + (x - originX) * cosine - (y - originY) * sine,
    originY + (x - originX) * sine + (y - originY) * cosine,
  ]);
}

/** `moveTo` for the first point, `lineTo` for the rest, and `close` when
 *  `isClosed`. Returns `[]` for an empty list. */
export function toPathCommands(
  points: readonly Point[],
  isClosed: boolean,
): PathCommand[] {
  if (points.length === 0) return [];
  const commands: PathCommand[] = points.map((point, pointIndex) =>
    pointIndex === 0
      ? { type: "moveTo", x: point[0], y: point[1] }
      : { type: "lineTo", x: point[0], y: point[1] },
  );
  if (isClosed) commands.push({ type: "close" });
  return commands;
}
