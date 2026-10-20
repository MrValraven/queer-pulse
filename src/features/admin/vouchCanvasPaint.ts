import type { NodePos } from "./useVouchSimulation";
import { selectVisibleLabels } from "./vouchLabelCulling";
import { HULL_PADDING_PX, sceneHullPath } from "./vouchSceneHulls";

export type Transform = { x: number; y: number; k: number };

export const FIT_PADDING_PX = 48;
export const FIT_MIN_ZOOM = 0.25;
export const FIT_MAX_ZOOM = 2.4;
/** A graph under this many nodes fits at FIT_MAX_ZOOM_SMALL_GRAPH at most, so
 *  a lone member never fills the stage as one giant disc. */
export const SMALL_GRAPH_NODE_COUNT = 3;
export const FIT_MAX_ZOOM_SMALL_GRAPH = 1.2;
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3.2;
/** Room under each node for its name label when fitting the view. */
export const LABEL_ALLOWANCE_PX = 22;
/** Node names draw at this size in graph units (VouchGraphNode, bubbles)
 *  and counter-scale so they never read smaller than LABEL_MIN_SCREEN_PX. */
export const LABEL_FONT_UNITS = 12;
export const LABEL_MIN_SCREEN_PX = 11;
/** Line box of a name label as a multiple of its font size, for the fit's
 *  label room once labels counter-scale. */
const LABEL_LINE_HEIGHT = 1.25;
/** Touch hit circles span 44px on screen at every zoom: the painter writes
 *  their radius in graph units (22px / zoom), so the first view can fit the
 *  whole graph and every node stays a 44px target. */
export const TOUCH_TARGET_PX = 44;

/** Stage edges the fit keeps nodes away from, in screen pixels. */
export interface FitInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_FIT_INSETS: FitInsets = {
  top: FIT_PADDING_PX,
  right: FIT_PADDING_PX,
  bottom: FIT_PADDING_PX,
  left: FIT_PADDING_PX,
};

export interface FitOptions {
  insets: FitInsets;
  minZoom: number;
  maxZoom: number;
  /** Centred on any axis the graph overflows at `minZoom` (the focus). */
  anchor?: { x: number; y: number };
}

/** Fit options for the current stage. Every pointer fits the whole set down
 *  to FIT_MIN_ZOOM (touch hit circles stay 44px on screen at any zoom), and
 *  small sets stop short of a giant disc. */
export function fitOptionsFor({
  insets,
  nodeCount,
  anchor,
}: {
  insets: FitInsets;
  nodeCount: number;
  anchor?: { x: number; y: number };
}): FitOptions {
  return {
    insets,
    minZoom: FIT_MIN_ZOOM,
    maxZoom:
      nodeCount < SMALL_GRAPH_NODE_COUNT
        ? FIT_MAX_ZOOM_SMALL_GRAPH
        : FIT_MAX_ZOOM,
    anchor,
  };
}

const DEFAULT_FIT_OPTIONS: FitOptions = {
  insets: DEFAULT_FIT_INSETS,
  minZoom: FIT_MIN_ZOOM,
  maxZoom: FIT_MAX_ZOOM,
};

export interface PaintEdge {
  id: string;
  from: string;
  to: string;
}

export interface PaintScene {
  sceneId: string;
  memberIds: string[];
}

export interface PaintInput {
  viewport: SVGGElement | null;
  nodeElements: ReadonlyMap<string, SVGGElement>;
  edgeElements: ReadonlyMap<string, SVGPathElement>;
  hullElements: ReadonlyMap<string, SVGPathElement>;
  transform: Transform;
  nodeIds: string[];
  edges: PaintEdge[];
  scenes: PaintScene[];
  getPos: (id: string) => NodePos | undefined;
  radiusFor: (id: string) => number;
  /** Edges on the highlighted trust path: they bend around other nodes. */
  pathEdgeIds: ReadonlySet<string>;
  labels: {
    pinnedIds: string[];
    weightFor: (id: string) => number;
    nameFor: (id: string) => string;
    isCompactViewport: boolean;
    stageSize: { width: number; height: number };
  };
}

/** Endpoints trimmed to each circle's edge so a line never crosses the discs. */
export function trimEdge(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startRadius: number,
  endRadius: number,
): [number, number, number, number] {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const length = Math.hypot(deltaX, deltaY) || 1;
  if (length <= startRadius + endRadius + 1) {
    return [startX, startY, endX, endY];
  }
  const unitX = deltaX / length;
  const unitY = deltaY / length;
  return [
    startX + unitX * startRadius,
    startY + unitY * startRadius,
    endX - unitX * endRadius,
    endY - unitY * endRadius,
  ];
}

/** A disc a path edge keeps clear of, in graph units. */
interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

/** A path edge bows at most this share of its length (the curve's peak sits
 *  at half the bow), so a curve that steps around a node still reads as one
 *  direct tie. */
const PATH_BOW_MAX_SHARE = 0.7;
/** Bow sizes tried between the gentle default and the maximum. */
const PATH_BOW_STEPS = 5;
/** Room a path edge keeps from the edge of a disc it passes, in graph units. */
const PATH_NODE_CLEARANCE = 10;
const PATH_CURVE_SAMPLES = 12;

interface EdgeGeometry {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  /** Unit perpendicular of the canonical direction. */
  normalX: number;
  normalY: number;
}

function controlPointFor(geometry: EdgeGeometry, bow: number) {
  return {
    x: (geometry.startX + geometry.endX) / 2 + geometry.normalX * bow,
    y: (geometry.startY + geometry.endY) / 2 + geometry.normalY * bow,
  };
}

/** The smallest distance from the curve to any obstacle's rim. */
function curveClearance(
  geometry: EdgeGeometry,
  bow: number,
  obstacles: readonly Obstacle[],
): number {
  const control = controlPointFor(geometry, bow);
  let clearance = Infinity;
  for (let sample = 1; sample < PATH_CURVE_SAMPLES; sample += 1) {
    const progress = sample / PATH_CURVE_SAMPLES;
    const startWeight = (1 - progress) * (1 - progress);
    const controlWeight = 2 * (1 - progress) * progress;
    const endWeight = progress * progress;
    const pointX =
      startWeight * geometry.startX +
      controlWeight * control.x +
      endWeight * geometry.endX;
    const pointY =
      startWeight * geometry.startY +
      controlWeight * control.y +
      endWeight * geometry.endY;
    for (const obstacle of obstacles) {
      const distance =
        Math.hypot(pointX - obstacle.x, pointY - obstacle.y) - obstacle.radius;
      if (distance < clearance) clearance = distance;
    }
  }
  return clearance;
}

/** E1: a path edge keeps clear of the nodes between its endpoints, so a
 *  one-step path never reads as running through a third member. Tries bows
 *  from the gentle default up to PATH_BOW_MAX_SHARE of the length, on the
 *  default side first, and keeps the first that clears every node (or the
 *  clearest one). */
function routedPathBow(
  geometry: EdgeGeometry,
  defaultBow: number,
  obstacles: readonly Obstacle[],
): number {
  if (obstacles.length === 0) return defaultBow;
  const length = Math.hypot(
    geometry.endX - geometry.startX,
    geometry.endY - geometry.startY,
  );
  const defaultMagnitude = Math.abs(defaultBow);
  const maxMagnitude = Math.max(length * PATH_BOW_MAX_SHARE, defaultMagnitude);
  const defaultSign = defaultBow < 0 ? -1 : 1;
  let bestBow = defaultBow;
  let bestClearance = -Infinity;
  for (let step = 0; step <= PATH_BOW_STEPS; step += 1) {
    const magnitude =
      defaultMagnitude +
      ((maxMagnitude - defaultMagnitude) * step) / PATH_BOW_STEPS;
    for (const sign of [defaultSign, -defaultSign]) {
      const bow = magnitude * sign;
      const clearance = curveClearance(geometry, bow, obstacles);
      if (clearance >= PATH_NODE_CLEARANCE) return bow;
      if (clearance > bestClearance) {
        bestClearance = clearance;
        bestBow = bow;
      }
    }
  }
  return bestBow;
}

/** Discs near a path edge's chord, other than its own endpoints. */
function pathObstaclesFor(
  input: PaintInput,
  edge: PaintEdge,
  start: NodePos,
  end: NodePos,
): Obstacle[] {
  const reach =
    (Math.hypot(end.x - start.x, end.y - start.y) * PATH_BOW_MAX_SHARE) / 2 +
    PATH_NODE_CLEARANCE;
  const minX = Math.min(start.x, end.x) - reach;
  const maxX = Math.max(start.x, end.x) + reach;
  const minY = Math.min(start.y, end.y) - reach;
  const maxY = Math.max(start.y, end.y) + reach;
  const obstacles: Obstacle[] = [];
  for (const id of input.nodeIds) {
    if (id === edge.from || id === edge.to) continue;
    const position = input.getPos(id);
    if (!position) continue;
    const radius = input.radiusFor(id);
    if (
      position.x + radius < minX ||
      position.x - radius > maxX ||
      position.y + radius < minY ||
      position.y - radius > maxY
    ) {
      continue;
    }
    obstacles.push({ x: position.x, y: position.y, radius });
  }
  return obstacles;
}

function edgePathFor(
  start: NodePos,
  end: NodePos,
  startRadius: number,
  endRadius: number,
  isCanonicalOrder: boolean,
  obstacles: readonly Obstacle[] | null,
): string {
  const [startX, startY, endX, endY] = trimEdge(
    start.x,
    start.y,
    end.x,
    end.y,
    startRadius,
    endRadius,
  );
  // gentle quadratic curve; reciprocal edges bow to opposite sides. The
  // perpendicular comes from the canonical (smaller id to larger id)
  // direction so A to B and B to A share it, and the sign splits them.
  const directionSign = isCanonicalOrder ? 1 : -1;
  const canonicalDeltaX = (endX - startX) * directionSign;
  const canonicalDeltaY = (endY - startY) * directionSign;
  const length = Math.hypot(canonicalDeltaX, canonicalDeltaY) || 1;
  const geometry: EdgeGeometry = {
    startX,
    startY,
    endX,
    endY,
    normalX: -canonicalDeltaY / length,
    normalY: canonicalDeltaX / length,
  };
  const defaultBow = Math.min(34, length * 0.13) * directionSign;
  const bow = obstacles
    ? routedPathBow(geometry, defaultBow, obstacles)
    : defaultBow;
  const control = controlPointFor(geometry, bow);
  return `M${startX} ${startY}Q${control.x} ${control.y} ${endX} ${endY}`;
}

function paintHulls(input: PaintInput): void {
  for (const scene of input.scenes) {
    const hullElement = input.hullElements.get(scene.sceneId);
    if (!hullElement) continue;
    const points: { x: number; y: number }[] = [];
    for (const memberId of scene.memberIds) {
      const position = input.getPos(memberId);
      if (position) points.push(position);
    }
    hullElement.setAttribute("d", sceneHullPath(points, HULL_PADDING_PX) ?? "");
  }
}

function paintLabels(input: PaintInput): void {
  const { transform, labels } = input;
  const visibleLabelIds = selectVisibleLabels({
    nodeIds: input.nodeIds,
    pinnedIds: labels.pinnedIds,
    weightFor: labels.weightFor,
    nameFor: labels.nameFor,
    screenPositionFor: (id) => {
      const position = input.getPos(id);
      if (!position) return null;
      return {
        x: position.x * transform.k + transform.x,
        y: position.y * transform.k + transform.y,
      };
    },
    radiusFor: input.radiusFor,
    // Labels counter-scale below this zoom, so they are culled at the size
    // they actually draw.
    zoom: Math.max(transform.k, LABEL_MIN_SCREEN_PX / LABEL_FONT_UNITS),
    stageSize: labels.stageSize,
    isCompactViewport: labels.isCompactViewport,
  });
  for (const id of input.nodeIds) {
    const nodeElement = input.nodeElements.get(id);
    if (!nodeElement) continue;
    const labelState = visibleLabelIds.has(id) ? "on" : "off";
    // skip unchanged writes so a steady frame causes no style recalculation
    if (nodeElement.getAttribute("data-label") !== labelState) {
      nodeElement.setAttribute("data-label", labelState);
    }
  }
}

const paintedZoomByViewport = new WeakMap<SVGGElement, number>();

/** How much a name label grows so it never reads under LABEL_MIN_SCREEN_PX. */
function labelScaleAt(zoom: number): number {
  return Math.max(1, LABEL_MIN_SCREEN_PX / (LABEL_FONT_UNITS * zoom));
}

/** Zoom-dependent CSS variables on the viewport, written only when the zoom
 *  changes: `--vg-label-scale` keeps names at 11px or more on screen and
 *  `--vg-hit-min` is the touch hit radius in graph units. */
function paintZoomVariables(viewport: SVGGElement, zoom: number): void {
  if (paintedZoomByViewport.get(viewport) === zoom) return;
  paintedZoomByViewport.set(viewport, zoom);
  const labelScale = labelScaleAt(zoom);
  // Screen-constant: 22px / zoom spans 44px on screen at every zoom.
  const hitRadius = TOUCH_TARGET_PX / 2 / zoom;
  viewport.style.setProperty("--vg-label-scale", labelScale.toFixed(3));
  viewport.style.setProperty("--vg-hit-min", hitRadius.toFixed(2));
}

/** Writes the viewport transform, node transforms, edge and hull paths, and
 *  each node's `data-label` state onto the DOM. Linear in nodes, edges and
 *  scene members, plus the label sort. */
export function paintCanvas(input: PaintInput): void {
  const { transform } = input;
  if (input.viewport) {
    input.viewport.setAttribute(
      "transform",
      `translate(${transform.x} ${transform.y}) scale(${transform.k})`,
    );
    paintZoomVariables(input.viewport, transform.k);
  }
  for (const id of input.nodeIds) {
    const nodeElement = input.nodeElements.get(id);
    const position = input.getPos(id);
    if (nodeElement && position) {
      nodeElement.setAttribute(
        "transform",
        `translate(${position.x} ${position.y})`,
      );
    }
  }
  for (const edge of input.edges) {
    const edgeElement = input.edgeElements.get(edge.id);
    const start = input.getPos(edge.from);
    const end = input.getPos(edge.to);
    if (!edgeElement || !start || !end) continue;
    const obstacles = input.pathEdgeIds.has(edge.id)
      ? pathObstaclesFor(input, edge, start, end)
      : null;
    edgeElement.setAttribute(
      "d",
      edgePathFor(
        start,
        end,
        input.radiusFor(edge.from),
        input.radiusFor(edge.to),
        edge.from < edge.to,
        obstacles,
      ),
    );
  }
  paintHulls(input);
  paintLabels(input);
}

interface FitBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Every node's disc plus `labelAllowance` graph units under it, or null
 *  when nothing is placed yet. */
function fitBoundsFor(
  nodeIds: string[],
  getPos: (id: string) => NodePos | undefined,
  radiusFor: (id: string) => number,
  labelAllowance: number,
): FitBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasPosition = false;
  for (const id of nodeIds) {
    const position = getPos(id);
    if (!position) continue;
    hasPosition = true;
    const radius = radiusFor(id);
    minX = Math.min(minX, position.x - radius);
    maxX = Math.max(maxX, position.x + radius);
    minY = Math.min(minY, position.y - radius);
    maxY = Math.max(maxY, position.y + radius + labelAllowance);
  }
  return hasPosition ? { minX, minY, maxX, maxY } : null;
}

function fitZoomFor(
  bounds: FitBounds,
  available: { width: number; height: number },
  options: FitOptions,
): number {
  return Math.max(
    options.minZoom,
    Math.min(
      available.width / Math.max(bounds.maxX - bounds.minX, 1),
      available.height / Math.max(bounds.maxY - bounds.minY, 1),
      options.maxZoom,
    ),
  );
}

/** Transform that frames every node (its radius plus the label room under
 *  it) inside the stage minus `options.insets`, clamped to the options' zoom
 *  band. Labels counter-scale when zoomed out, so the label room grows with
 *  them in a second pass. An axis that still overflows at the minimum zoom
 *  centres on the anchor; every other axis centres the set in the fit box. */
export function computeFitTransform(
  stageSize: { width: number; height: number },
  nodeIds: string[],
  getPos: (id: string) => NodePos | undefined,
  radiusFor: (id: string) => number,
  options: FitOptions = DEFAULT_FIT_OPTIONS,
): Transform {
  const firstBounds = fitBoundsFor(
    nodeIds,
    getPos,
    radiusFor,
    LABEL_ALLOWANCE_PX,
  );
  if (!firstBounds || stageSize.width <= 0 || stageSize.height <= 0) {
    return { x: stageSize.width / 2, y: stageSize.height / 2, k: 1 };
  }
  // A stage too small for its reserved overlays falls back to plain padding.
  const requested = options.insets;
  const isBoxEmpty =
    stageSize.width - requested.left - requested.right < 1 ||
    stageSize.height - requested.top - requested.bottom < 1;
  const insets = isBoxEmpty ? DEFAULT_FIT_INSETS : requested;
  const availableWidth = Math.max(
    stageSize.width - insets.left - insets.right,
    1,
  );
  const availableHeight = Math.max(
    stageSize.height - insets.top - insets.bottom,
    1,
  );
  const available = { width: availableWidth, height: availableHeight };
  const firstZoom = fitZoomFor(firstBounds, available, options);
  const labelGrowth = labelScaleAt(firstZoom) - 1;
  const grownLabelAllowance =
    LABEL_ALLOWANCE_PX + LABEL_FONT_UNITS * LABEL_LINE_HEIGHT * labelGrowth;
  const { minX, minY, maxX, maxY } =
    labelGrowth > 0
      ? (fitBoundsFor(nodeIds, getPos, radiusFor, grownLabelAllowance) ??
        firstBounds)
      : firstBounds;
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const zoom = fitZoomFor({ minX, minY, maxX, maxY }, available, options);
  const { anchor } = options;
  const centerX =
    anchor && boundsWidth * zoom > availableWidth + 1
      ? anchor.x
      : (minX + maxX) / 2;
  const centerY =
    anchor && boundsHeight * zoom > availableHeight + 1
      ? anchor.y
      : (minY + maxY) / 2;
  return {
    k: zoom,
    x: insets.left + availableWidth / 2 - centerX * zoom,
    y: insets.top + availableHeight / 2 - centerY * zoom,
  };
}

/** Zoom by `factor` about a client point, keeping that point stationary.
 *  Manual zoom clamps to [ZOOM_MIN, ZOOM_MAX]. */
export function applyZoomAt(
  clientX: number,
  clientY: number,
  factor: number,
  svg: SVGSVGElement | null,
  transformRef: { current: Transform },
  paint: () => void,
): void {
  if (!svg) return;
  const svgRect = svg.getBoundingClientRect();
  const pointX = clientX - svgRect.left;
  const pointY = clientY - svgRect.top;
  const current = transformRef.current;
  const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, current.k * factor));
  transformRef.current = {
    x: pointX - (pointX - current.x) * (nextZoom / current.k),
    y: pointY - (pointY - current.y) * (nextZoom / current.k),
    k: nextZoom,
  };
  paint();
}
