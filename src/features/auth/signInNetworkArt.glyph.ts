/** Traces the outline of the brand serif's "Q" so the network can be built
 *  on the real letter. The glyph is drawn once, large, on an offscreen
 *  canvas; a marching-squares pass turns its alpha mask into closed contours
 *  (the outer edge with the tail, and the counter), which are cached. */

export interface GlyphPoint {
  positionX: number;
  positionY: number;
}

/** Contours in mask pixels, longest first, plus the mask size. */
export interface GlyphTrace {
  contours: GlyphPoint[][];
  size: number;
}

const MASK_SIZE = 240;
const WORDMARK_WEIGHT = 600;
const THRESHOLD = 0.5;

let cachedTrace: { family: string; trace: GlyphTrace | null } | null = null;

/** Resolves true once the face is ready, or false after `timeoutMs` so a
 *  slow font never blocks the art. */
export function loadGlyphFont(
  family: string,
  timeoutMs: number,
): Promise<boolean> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return Promise.resolve(false);
  }
  let timeoutHandle = 0;
  const timeout = new Promise<boolean>((resolve) => {
    timeoutHandle = window.setTimeout(() => resolve(false), timeoutMs);
  });
  const loading = document.fonts
    .load(`${WORDMARK_WEIGHT} 100px ${family}`, "Q")
    .then((faces) => faces.length > 0)
    .catch(() => false);
  return Promise.race([loading, timeout]).finally(() =>
    window.clearTimeout(timeoutHandle),
  );
}

function drawMask(family: string): Float32Array | null {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_SIZE;
  canvas.height = MASK_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const probeSize = 100;
  context.font = `${WORDMARK_WEIGHT} ${probeSize}px ${family}`;
  const probe = context.measureText("Q");
  const probeWidth = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
  const probeHeight =
    probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent;
  if (!probeWidth || !probeHeight) return null;
  const fontSize =
    (probeSize * MASK_SIZE * 0.8) / Math.max(probeWidth, probeHeight);
  context.font = `${WORDMARK_WEIGHT} ${fontSize}px ${family}`;
  const metrics = context.measureText("Q");
  context.fillStyle = "white";
  context.fillText(
    "Q",
    MASK_SIZE / 2 -
      (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2,
    MASK_SIZE / 2 +
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2,
  );
  const pixels = context.getImageData(0, 0, MASK_SIZE, MASK_SIZE).data;
  const mask = new Float32Array(MASK_SIZE * MASK_SIZE);
  for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex += 1) {
    mask[pixelIndex] = (pixels[pixelIndex * 4 + 3] ?? 0) / 255;
  }
  return mask;
}

/** Which cell edges each marching-squares case joins. Edges: 0 top,
 *  1 right, 2 bottom, 3 left. Saddles (5, 10) pick one resolution. */
const CASE_SEGMENTS: readonly (readonly [number, number])[][] = [
  [],
  [[3, 2]],
  [[2, 1]],
  [[3, 1]],
  [[0, 1]],
  [
    [3, 0],
    [2, 1],
  ],
  [[0, 2]],
  [[3, 0]],
  [[3, 0]],
  [[0, 2]],
  [
    [0, 1],
    [3, 2],
  ],
  [[0, 1]],
  [[3, 1]],
  [[2, 1]],
  [[3, 2]],
  [],
];

function traceContours(mask: Float32Array): GlyphPoint[][] {
  const size = MASK_SIZE;
  const valueAt = (column: number, row: number) =>
    mask[row * size + column] ?? 0;
  const horizontalKey = (column: number, row: number) => row * size + column;
  const verticalKey = (column: number, row: number) =>
    size * size + row * size + column;
  const points = new Map<number, GlyphPoint>();
  const links = new Map<number, number[]>();
  const edgePoint = (
    key: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => {
    if (points.has(key)) return;
    const fromValue = valueAt(fromX, fromY);
    const toValue = valueAt(toX, toY);
    const along = (THRESHOLD - fromValue) / (toValue - fromValue || 1);
    points.set(key, {
      positionX: fromX + (toX - fromX) * along,
      positionY: fromY + (toY - fromY) * along,
    });
  };
  const link = (first: number, second: number) => {
    links.set(first, [...(links.get(first) ?? []), second]);
    links.set(second, [...(links.get(second) ?? []), first]);
  };
  for (let row = 0; row < size - 1; row += 1) {
    for (let column = 0; column < size - 1; column += 1) {
      const caseIndex =
        (valueAt(column, row) >= THRESHOLD ? 8 : 0) +
        (valueAt(column + 1, row) >= THRESHOLD ? 4 : 0) +
        (valueAt(column + 1, row + 1) >= THRESHOLD ? 2 : 0) +
        (valueAt(column, row + 1) >= THRESHOLD ? 1 : 0);
      const segments = CASE_SEGMENTS[caseIndex] ?? [];
      if (segments.length === 0) continue;
      const edgeKeys = [
        horizontalKey(column, row),
        verticalKey(column + 1, row),
        horizontalKey(column, row + 1),
        verticalKey(column, row),
      ];
      edgePoint(edgeKeys[0] ?? 0, column, row, column + 1, row);
      edgePoint(edgeKeys[1] ?? 0, column + 1, row, column + 1, row + 1);
      edgePoint(edgeKeys[2] ?? 0, column, row + 1, column + 1, row + 1);
      edgePoint(edgeKeys[3] ?? 0, column, row, column, row + 1);
      for (const [firstEdge, secondEdge] of segments) {
        link(edgeKeys[firstEdge] ?? 0, edgeKeys[secondEdge] ?? 0);
      }
    }
  }
  const visited = new Set<number>();
  const contours: GlyphPoint[][] = [];
  for (const startKey of links.keys()) {
    if (visited.has(startKey)) continue;
    const contour: GlyphPoint[] = [];
    let previousKey = -1;
    let currentKey: number | undefined = startKey;
    while (currentKey !== undefined && !visited.has(currentKey)) {
      visited.add(currentKey);
      const point = points.get(currentKey);
      if (point) contour.push(point);
      const neighbours: number[] = links.get(currentKey) ?? [];
      const nextKey: number | undefined = neighbours.find(
        (candidate) => candidate !== previousKey && !visited.has(candidate),
      );
      previousKey = currentKey;
      currentKey = nextKey;
    }
    if (contour.length >= 24) contours.push(contour);
  }
  return contours.sort((first, second) => second.length - first.length);
}

/** The traced letter for this font family, computed once and cached. */
export function traceGlyph(family: string): GlyphTrace | null {
  if (cachedTrace?.family === family) return cachedTrace.trace;
  const mask = drawMask(family);
  const trace = mask
    ? { contours: traceContours(mask), size: MASK_SIZE }
    : null;
  cachedTrace = {
    family,
    trace: trace && trace.contours.length >= 2 ? trace : null,
  };
  return cachedTrace.trace;
}
