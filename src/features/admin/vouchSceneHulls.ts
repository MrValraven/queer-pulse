/** Scene hull geometry (spec C5): a convex hull (Andrew's monotone chain)
 *  grown outward by a padding with rounded joins, as an SVG path. */

export const HULL_PADDING_PX = 28;

type Point = { x: number; y: number };

function cross(origin: Point, first: Point, second: Point): number {
  return (
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x)
  );
}

/** Convex hull vertices with a positive signed area (shoelace formula),
 *  collinear points dropped. Returns one or two points for degenerate input. */
export function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort(
    (first, second) => first.x - second.x || first.y - second.y,
  );
  if (sorted.length < 3) return sorted;
  const lower: Point[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Point[] = [];
  for (let pointIndex = sorted.length - 1; pointIndex >= 0; pointIndex--) {
    const point = sorted[pointIndex]!;
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  const hull = lower.concat(upper);
  // every point identical: the chains collapse to a single vertex
  if (
    hull.length === 2 &&
    hull[0]!.x === hull[1]!.x &&
    hull[0]!.y === hull[1]!.y
  ) {
    return [hull[0]!];
  }
  return hull;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatPoint(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`;
}

/** Outward unit normal of the edge from `start` to `end`, for a hull with a
 *  positive signed area. */
function outwardNormal(start: Point, end: Point): Point {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  return { x: deltaY / length, y: -deltaX / length };
}

function offsetPoint(point: Point, normal: Point, padding: number): Point {
  return { x: point.x + normal.x * padding, y: point.y + normal.y * padding };
}

/** Closed SVG path around the padded hull of `points`; null under 3 points. */
export function sceneHullPath(
  points: { x: number; y: number }[],
  padding: number,
): string | null {
  if (points.length < 3) return null;
  const hull = convexHull(points);
  const radius = round(Math.max(padding, 0.1));
  if (hull.length === 1) {
    const center = hull[0]!;
    const top = { x: center.x, y: center.y - radius };
    const bottom = { x: center.x, y: center.y + radius };
    return `M${formatPoint(top)}A${radius} ${radius} 0 1 1 ${formatPoint(bottom)}A${radius} ${radius} 0 1 1 ${formatPoint(top)}Z`;
  }
  const normals = hull.map((vertex, vertexIndex) =>
    outwardNormal(vertex, hull[(vertexIndex + 1) % hull.length]!),
  );
  const segments: string[] = [
    `M${formatPoint(offsetPoint(hull[0]!, normals[0]!, padding))}`,
  ];
  hull.forEach((_vertex, vertexIndex) => {
    const nextIndex = (vertexIndex + 1) % hull.length;
    const nextVertex = hull[nextIndex]!;
    const edgeEnd = offsetPoint(nextVertex, normals[vertexIndex]!, padding);
    const arcEnd = offsetPoint(nextVertex, normals[nextIndex]!, padding);
    segments.push(`L${formatPoint(edgeEnd)}`);
    segments.push(`A${radius} ${radius} 0 0 1 ${formatPoint(arcEnd)}`);
  });
  segments.push("Z");
  return segments.join("");
}
