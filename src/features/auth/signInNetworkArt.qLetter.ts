import type { GlyphPoint, GlyphTrace } from "./signInNetworkArt.glyph";

/** Turns the traced "Q" into the letter's people: evenly spaced points along
 *  each contour, in "bowl units" (the bowl's outer half-height is 1 and the
 *  counter's centre is the origin), each tagged as bowl or tail and given
 *  its place in pen order: counter-clockwise round the bowl from the top,
 *  then out along the tail. Without a trace it builds a geometric Q. */

export interface LetterPoint {
  u: number;
  v: number;
  isTail: boolean;
  /** 0 to 1: when the pen reaches this point while writing the letter. */
  penOrder: number;
}

export interface LetterModel {
  points: LetterPoint[];
  /** Neighbours along each contour, as point indexes, in contour order.
   *  Where two contours meet in a hairline they share a person. */
  links: [number, number][];
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function boundsOf(contour: readonly GlyphPoint[]): Bounds {
  const xs = contour.map((point) => point.positionX);
  const ys = contour.map((point) => point.positionY);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function isInside(inner: Bounds, outer: Bounds): boolean {
  return (
    inner.minX > outer.minX &&
    inner.maxX < outer.maxX &&
    inner.minY > outer.minY &&
    inner.maxY < outer.maxY
  );
}

function perimeter(contour: readonly GlyphPoint[]): number {
  let length = 0;
  contour.forEach((point, pointIndex) => {
    const next = contour[(pointIndex + 1) % contour.length] ?? point;
    length += Math.hypot(
      next.positionX - point.positionX,
      next.positionY - point.positionY,
    );
  });
  return length;
}

/** Evenly spaced points along a closed contour. */
function resample(
  contour: readonly GlyphPoint[],
  spacing: number,
): GlyphPoint[] {
  const count = Math.max(4, Math.round(perimeter(contour) / spacing));
  const step = perimeter(contour) / count;
  const result: GlyphPoint[] = [];
  let carried = 0;
  contour.forEach((point, pointIndex) => {
    const next = contour[(pointIndex + 1) % contour.length] ?? point;
    const segment = Math.hypot(
      next.positionX - point.positionX,
      next.positionY - point.positionY,
    );
    while (carried <= segment && result.length < count) {
      const along = segment ? carried / segment : 0;
      result.push({
        positionX: point.positionX + (next.positionX - point.positionX) * along,
        positionY: point.positionY + (next.positionY - point.positionY) * along,
      });
      carried += step;
    }
    carried -= segment;
  });
  return result;
}

function ellipse(
  radiusX: number,
  radiusY: number,
  count: number,
): GlyphPoint[] {
  return Array.from({ length: count }, (_, pointIndex) => {
    const angle = (pointIndex / count) * Math.PI * 2;
    return {
      positionX: Math.cos(angle) * radiusX,
      positionY: Math.sin(angle) * radiusY,
    };
  });
}

/** The geometric stand-in: an oval bowl with its counter, and a tail
 *  crossing the lower right. Already in bowl units. */
function fallbackContours(): { contours: GlyphPoint[][]; bowlRadiusX: number } {
  const tail: GlyphPoint[] = [
    { positionX: 0.22, positionY: 0.5 },
    { positionX: 0.34, positionY: 0.42 },
    { positionX: 1.12, positionY: 1.3 },
    { positionX: 0.98, positionY: 1.38 },
  ];
  return {
    contours: [ellipse(0.96, 1, 96), ellipse(0.7, 0.76, 96), tail],
    bowlRadiusX: 0.96,
  };
}

/** Normalises traced contours so the counter's centre is the origin and the
 *  bowl's outer half-height is 1. */
function normaliseTrace(
  trace: GlyphTrace,
): { contours: GlyphPoint[][]; bowlRadiusX: number } | null {
  const bounds = trace.contours.map(boundsOf);
  let counterIndex = -1;
  let outerIndex = -1;
  bounds.forEach((candidate, candidateIndex) => {
    const containerIndex = bounds.findIndex(
      (other, otherIndex) =>
        otherIndex !== candidateIndex && isInside(candidate, other),
    );
    if (containerIndex >= 0 && counterIndex < 0) {
      counterIndex = candidateIndex;
      outerIndex = containerIndex;
    }
  });
  const counter = bounds[counterIndex];
  const outer = bounds[outerIndex];
  if (!counter || !outer) return null;
  const centerX = (counter.minX + counter.maxX) / 2;
  const centerY = (counter.minY + counter.maxY) / 2;
  const bowlRadiusY =
    (counter.maxY - counter.minY) / 2 + (counter.minY - outer.minY);
  const bowlRadiusX =
    (counter.maxX - counter.minX) / 2 + (counter.minX - outer.minX);
  return {
    bowlRadiusX: bowlRadiusX / bowlRadiusY,
    contours: trace.contours.map((contour) =>
      contour.map((point) => ({
        positionX: (point.positionX - centerX) / bowlRadiusY,
        positionY: (point.positionY - centerY) / bowlRadiusY,
      })),
    ),
  };
}

const modelCache = new Map<string, LetterModel>();

function toLetterPoint(point: GlyphPoint, tailReachX: number): LetterPoint {
  const reach = Math.hypot(
    point.positionX / tailReachX,
    point.positionY / 1.08,
  );
  const isTail = reach > 1;
  const angle = Math.atan2(point.positionY, point.positionX);
  const fromTop =
    (((-Math.PI / 2 - angle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return {
    u: point.positionX,
    v: point.positionY,
    isTail,
    penOrder: isTail
      ? 0.86 + 0.14 * Math.min(1, (reach - 1) / 0.6)
      : (fromTop / (Math.PI * 2)) * 0.84,
  };
}

export function buildLetterModel(
  trace: GlyphTrace | null,
  targetCount: number,
): LetterModel {
  const cacheKey = `${trace ? "glyph" : "fallback"}:${targetCount}`;
  const cached = modelCache.get(cacheKey);
  if (cached) return cached;
  const normalised = (trace && normaliseTrace(trace)) ?? fallbackContours();
  const total = normalised.contours.reduce(
    (sum, contour) => sum + perimeter(contour),
    0,
  );
  const spacing = total / targetCount;
  const tailReachX = normalised.bowlRadiusX * 1.08;
  const points: LetterPoint[] = [];
  const links: [number, number][] = [];
  const hasLink = (first: number, second: number) =>
    links.some(
      ([from, to]) =>
        (from === first && to === second) || (from === second && to === first),
    );
  for (const contour of normalised.contours) {
    const indexes = resample(contour, spacing).map((point) => {
      // Where two contours run close (a hairline), they share one person.
      const sharedIndex = points.findIndex(
        (other) =>
          Math.hypot(other.u - point.positionX, other.v - point.positionY) <
          spacing * 0.42,
      );
      if (sharedIndex >= 0) return sharedIndex;
      points.push(toLetterPoint(point, tailReachX));
      return points.length - 1;
    });
    indexes.forEach((index, position) => {
      const next = indexes[(position + 1) % indexes.length] ?? index;
      if (next !== index && !hasLink(index, next)) links.push([index, next]);
    });
  }
  const model: LetterModel = {
    points,
    links,
    minU: Math.min(...points.map((point) => point.u)),
    maxU: Math.max(...points.map((point) => point.u)),
    minV: Math.min(...points.map((point) => point.v)),
    maxV: Math.max(...points.map((point) => point.v)),
  };
  modelCache.set(cacheKey, model);
  return model;
}
