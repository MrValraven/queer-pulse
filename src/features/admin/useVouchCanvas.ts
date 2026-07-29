import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useVouchSimulation, type NodePos } from "./useVouchSimulation";
import type { TipData } from "./VouchGraphTooltip";
import {
  monthDate,
  relationshipLabel,
  type TrustGraph,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";

/** Endpoints trimmed to each circle's edge so a line never crosses the discs. */
function trimEdge(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rA: number,
  rB: number,
): [number, number, number, number] {
  const dx = bx - ax,
    dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  if (len <= rA + rB + 1) return [ax, ay, bx, by];
  const ux = dx / len,
    uy = dy / len;
  return [ax + ux * rA, ay + uy * rA, bx - ux * rB, by - uy * rB];
}

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

function nodeTip(id: string, fmt: Formatters, graph: TrustGraph): TipData {
  const p = graph.peopleById[id]!;
  const vin = graph.edges.filter((e) => e.to === id && !e.withdrawn).length;
  const vout = graph.edges.filter((e) => e.from === id && !e.withdrawn).length;
  return {
    kind: "node",
    name: p.name,
    pronoun: p.pronoun,
    role: p.role ?? "",
    vouchesIn: vin,
    vouchesOut: vout,
    joined: fmt.date(monthDate(p.joined), MONTH_YEAR),
  };
}

function edgeTip(
  e: VouchEdge,
  fmt: Formatters,
  mutualLabel: string,
  graph: TrustGraph,
  t: (key: string) => string,
): TipData {
  const label = `${graph.peopleById[e.from]!.initials} → ${graph.peopleById[e.to]!.initials}${e.mutual ? ` · ${mutualLabel}` : ""}`;
  return {
    kind: "edge",
    label,
    relationship: relationshipLabel(t, e.relationship) ?? undefined,
    reason: e.reason ?? undefined,
    date: fmt.date(monthDate(e.date), MONTH_YEAR),
    withdrawn: e.withdrawn,
  };
}

type TipState = { data: TipData; x: number; y: number } | null;
type Transform = { x: number; y: number; k: number };

/** Imperative painters/handlers extracted from the hook keep it under the line
 * budget; each closes over the same refs/state the hook owns, passed as deps. */
interface PaintDeps {
  viewportRef: RefObject<SVGGElement | null>;
  nodeRefs: RefObject<Map<string, SVGGElement>>;
  edgeRefs: RefObject<Map<string, SVGPathElement>>;
  tfRef: RefObject<Transform>;
  visIds: string[];
  visEdges: VouchEdge[];
  getPos: (id: string) => NodePos | undefined;
  graph: TrustGraph;
  focus: string;
}

/** Writes every node/edge transform + the viewport transform onto the DOM. */
function paintCanvas({
  viewportRef,
  nodeRefs,
  edgeRefs,
  tfRef,
  visIds,
  visEdges,
  getPos,
  graph,
  focus,
}: PaintDeps): void {
  const vp = viewportRef.current;
  if (vp) {
    const { x, y, k } = tfRef.current;
    vp.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
  }
  for (const id of visIds) {
    const g = nodeRefs.current.get(id);
    const p = getPos(id);
    if (g && p) g.setAttribute("transform", `translate(${p.x} ${p.y})`);
  }
  for (const e of visEdges) {
    const path = edgeRefs.current.get(e.id);
    const a = getPos(e.from);
    const b = getPos(e.to);
    if (path && a && b) {
      const [x1, y1, x2, y2] = trimEdge(
        a.x,
        a.y,
        b.x,
        b.y,
        graph.nodeRadius(e.from, focus),
        graph.nodeRadius(e.to, focus),
      );
      // gentle quadratic curve; reciprocal edges bow to opposite sides
      const dx = x2 - x1,
        dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.min(34, len * 0.13) * (e.from < e.to ? 1 : -1);
      const cx = (x1 + x2) / 2 + (-dy / len) * bow;
      const cy = (y1 + y2) / 2 + (dx / len) * bow;
      path.setAttribute("d", `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`);
    }
  }
}

/** Transform that frames all visible nodes with padding, clamped to a zoom band. */
function computeFitTransform(
  rect: DOMRect,
  visIds: string[],
  getPos: (id: string) => NodePos | undefined,
): Transform {
  let minx = Infinity,
    miny = Infinity,
    maxx = -Infinity,
    maxy = -Infinity,
    any = false;
  for (const id of visIds) {
    const p = getPos(id);
    if (!p) continue;
    any = true;
    minx = Math.min(minx, p.x);
    maxx = Math.max(maxx, p.x);
    miny = Math.min(miny, p.y);
    maxy = Math.max(maxy, p.y);
  }
  if (!any || rect.width === 0) {
    return { x: rect.width / 2, y: rect.height / 2, k: 1 };
  }
  const pad = 80;
  const k = Math.max(
    Math.min(
      rect.width / (maxx - minx + pad * 2),
      rect.height / (maxy - miny + pad * 2),
      1.35,
    ),
    0.4,
  );
  const cxp = (minx + maxx) / 2,
    cyp = (miny + maxy) / 2;
  return { k, x: rect.width / 2 - cxp * k, y: rect.height / 2 - cyp * k };
}

/** Zoom by `factor` about a client point, keeping that point stationary. */
function applyZoomAt(
  clientX: number,
  clientY: number,
  factor: number,
  svgRef: RefObject<SVGSVGElement | null>,
  tfRef: RefObject<Transform>,
  paint: () => void,
): void {
  const svg = svgRef.current;
  if (!svg) return;
  const r = svg.getBoundingClientRect();
  const x = clientX - r.left,
    y = clientY - r.top;
  const v = tfRef.current;
  const nk = Math.max(0.35, Math.min(2.6, v.k * factor));
  v.x = x - (x - v.x) * (nk / v.k);
  v.y = y - (y - v.y) * (nk / v.k);
  v.k = nk;
  paint();
}

/** Everything the pointer handlers close over — the hook's own refs and state. */
interface HandlerContext {
  focus: string;
  graph: TrustGraph;
  fmt: Formatters;
  mutualLabel: string;
  t: (key: string) => string;
  dragRef: RefObject<{
    id: string;
    moved: boolean;
    sx: number;
    sy: number;
  } | null>;
  panRef: RefObject<{ px: number; py: number; moved: boolean } | null>;
  pinnedRef: RefObject<Set<string>>;
  svgRef: RefObject<SVGSVGElement | null>;
  tfRef: RefObject<Transform>;
  setPinCount: Dispatch<SetStateAction<number>>;
  setHoverId: Dispatch<SetStateAction<string | null>>;
  setTip: Dispatch<SetStateAction<TipState>>;
  toLocal: (clientX: number, clientY: number) => { x: number; y: number };
  tipXY: (clientX: number, clientY: number) => { x: number; y: number };
  setPos: (id: string, x: number, y: number) => void;
  paint: () => void;
  onNodeLeave: () => void;
  onSelect: (id: string | null) => void;
  onPickPath: (id: string) => void;
  onRecenter: (id: string) => void;
}

/*
 * The pointer-handler logic lives in these module-scope functions rather than
 * inline in the hook (which would push it over the line budget). They are plain
 * functions, not components/hooks, so they may read `ctx.<ref>.current` freely;
 * the hook only ever calls them from *inside* its event callbacks — never during
 * render — so no ref is read while React is rendering.
 */

/** Begin a node drag: record the start point and capture the pointer. */
function onNodePointerDown(
  e: ReactPointerEvent<SVGGElement>,
  id: string,
  ctx: HandlerContext,
) {
  e.stopPropagation();
  ctx.dragRef.current = { id, moved: false, sx: e.clientX, sy: e.clientY };
  e.currentTarget.setPointerCapture(e.pointerId);
  ctx.setTip(null);
}

/** Drag a node (pinning it once it moves) or reposition the hover tip. */
function onNodePointerMove(
  e: ReactPointerEvent<SVGGElement>,
  id: string,
  ctx: HandlerContext,
) {
  const { dragRef, focus, pinnedRef, setPinCount, toLocal, setPos, paint } = ctx;
  const d = dragRef.current;
  if (d && d.id === id) {
    if (
      !d.moved &&
      Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3
    ) {
      d.moved = true;
      if (id !== focus && !pinnedRef.current.has(id)) {
        pinnedRef.current.add(id); // dropped where the user leaves it
        setPinCount(pinnedRef.current.size);
      }
    }
    const loc = toLocal(e.clientX, e.clientY);
    setPos(id, loc.x, loc.y);
    paint();
  } else if (!dragRef.current) {
    const xy = ctx.tipXY(e.clientX, e.clientY);
    ctx.setTip((t) => (t ? { ...t, ...xy } : t));
  }
}

/** End a node drag: a clean (unmoved) release counts as select / pick-path. */
function onNodePointerUp(
  e: ReactPointerEvent<SVGGElement>,
  id: string,
  ctx: HandlerContext,
) {
  const { dragRef, onPickPath, onSelect } = ctx;
  const d = dragRef.current;
  dragRef.current = null;
  try {
    e.currentTarget.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
  if (d && !d.moved) {
    if (e.shiftKey) onPickPath(id);
    else onSelect(id);
  }
}

/** Show a node's tooltip on hover (unless a drag is in progress). */
function onNodePointerEnter(
  e: ReactPointerEvent<SVGGElement>,
  id: string,
  ctx: HandlerContext,
) {
  const { dragRef, setHoverId, setTip, fmt, graph, tipXY } = ctx;
  if (dragRef.current) return;
  setHoverId(id);
  setTip({ data: nodeTip(id, fmt, graph), ...tipXY(e.clientX, e.clientY) });
}

/** Show an edge's tooltip on hover when it carries a reason/relationship. */
function onEdgePointerEnter(
  e: ReactPointerEvent<SVGPathElement>,
  edge: VouchEdge,
  ctx: HandlerContext,
) {
  const { dragRef, setTip, fmt, mutualLabel, graph, t, tipXY } = ctx;
  if (dragRef.current || (!edge.reason && !edge.relationship)) return;
  setTip({
    data: edgeTip(edge, fmt, mutualLabel, graph, t),
    ...tipXY(e.clientX, e.clientY),
  });
}

/** Begin panning the stage. */
function onStagePointerDown(
  e: ReactPointerEvent<SVGSVGElement>,
  ctx: HandlerContext,
) {
  ctx.panRef.current = { px: e.clientX, py: e.clientY, moved: false };
  ctx.svgRef.current?.setPointerCapture(e.pointerId);
}

/** Pan the viewport as the pointer drags across the stage. */
function onStagePointerMove(
  e: ReactPointerEvent<SVGSVGElement>,
  ctx: HandlerContext,
) {
  const { panRef, tfRef, paint } = ctx;
  const pan = panRef.current;
  if (!pan) return;
  if (Math.abs(e.clientX - pan.px) + Math.abs(e.clientY - pan.py) > 2)
    pan.moved = true;
  tfRef.current.x += e.clientX - pan.px;
  tfRef.current.y += e.clientY - pan.py;
  pan.px = e.clientX;
  pan.py = e.clientY;
  paint();
}

/** End panning; a click on empty space (no pan) clears the selection. */
function onStagePointerUp(
  e: ReactPointerEvent<SVGSVGElement>,
  ctx: HandlerContext,
) {
  const { panRef, svgRef, onSelect } = ctx;
  const pan = panRef.current;
  panRef.current = null;
  try {
    svgRef.current?.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
  if (pan && !pan.moved) onSelect(null); // click on empty space clears the pin
}

interface Args {
  visIds: string[];
  visEdges: VouchEdge[];
  focus: string;
  /** tighter community clustering in Scenes mode */
  cluster?: boolean;
  graph: TrustGraph;
  stageRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  viewportRef: RefObject<SVGGElement | null>;
  onSelect: (id: string | null) => void;
  onRecenter: (id: string) => void;
  onPickPath: (id: string) => void;
}

/**
 * Owns everything imperative about the canvas — the force simulation, painting
 * node/edge positions, pan/zoom, node dragging (with manual pins), hover
 * tooltips, and reset. Keeps the presentational component to plain JSX.
 */
export function useVouchCanvas({
  visIds,
  visEdges,
  focus,
  cluster = false,
  graph,
  stageRef,
  svgRef,
  viewportRef,
  onSelect,
  onRecenter,
  onPickPath,
}: Args) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const mutualLabel = t("admin:vouchGraph.inspector.mutualTag");
  const reduced = usePrefersReducedMotion();
  const { getPos, setPos, clearPositions, run, stop } =
    useVouchSimulation(reduced);

  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const tfRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{
    id: string;
    moved: boolean;
    sx: number;
    sy: number;
  } | null>(null);
  const panRef = useRef<{ px: number; py: number; moved: boolean } | null>(
    null,
  );
  const pinnedRef = useRef<Set<string>>(new Set());

  const [tip, setTip] = useState<TipState>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinCount, setPinCount] = useState(0);

  const registerNode = useCallback((id: string, el: SVGGElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);
  const registerEdge = useCallback((id: string, el: SVGPathElement | null) => {
    if (el) edgeRefs.current.set(id, el);
    else edgeRefs.current.delete(id);
  }, []);

  const paint = useCallback(() => {
    paintCanvas({
      viewportRef,
      nodeRefs,
      edgeRefs,
      tfRef,
      visIds,
      visEdges,
      getPos,
      graph,
      focus,
    });
  }, [visIds, visEdges, getPos, viewportRef, focus, graph]);

  const fit = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    tfRef.current = computeFitTransform(
      svg.getBoundingClientRect(),
      visIds,
      getPos,
    );
    paint();
  }, [visIds, getPos, paint, svgRef]);

  const restart = useCallback(() => {
    run({
      visIds,
      edges: visEdges,
      focusId: focus,
      graph,
      clusterStrength: cluster ? 0.03 : 0.014,
      pinned: pinnedRef.current,
      paint,
      onSettled: fit,
    });
  }, [run, visIds, visEdges, focus, graph, cluster, paint, fit]);

  useEffect(() => {
    restart();
    return stop;
  }, [restart, stop]);

  const reset = useCallback(() => {
    pinnedRef.current.clear();
    setPinCount(0);
    clearPositions();
    restart();
  }, [clearPositions, restart]);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, f: number) =>
      applyZoomAt(clientX, clientY, f, svgRef, tfRef, paint),
    [paint, svgRef],
  );

  // native non-passive wheel listener so zoom can preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      zoomAt(ev.clientX, ev.clientY, ev.deltaY < 0 ? 1.12 : 0.9);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [zoomAt, svgRef]);

  const zoomCenter = useCallback(
    (f: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, f);
    },
    [zoomAt, svgRef],
  );

  const toLocal = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const v = tfRef.current;
    return {
      x: (clientX - r.left - v.x) / v.k,
      y: (clientY - r.top - v.y) / v.k,
    };
  };
  const tipXY = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    let x = clientX - r.left + 14;
    const y = clientY - r.top + 14;
    if (x + 240 > r.width) x = clientX - r.left - 254;
    return { x, y };
  };
  const onNodeLeave = useCallback(() => {
    setHoverId(null);
    if (!dragRef.current) setTip(null);
  }, []);

  const handlerContext: HandlerContext = {
    focus,
    graph,
    fmt,
    mutualLabel,
    t,
    dragRef,
    panRef,
    pinnedRef,
    svgRef,
    tfRef,
    setPinCount,
    setHoverId,
    setTip,
    toLocal,
    tipXY,
    setPos,
    paint,
    onNodeLeave,
    onSelect,
    onPickPath,
    onRecenter,
  };
  // Thin handler objects that delegate to the module-scope functions above;
  // `handlerContext` is only ever passed from inside these event callbacks, so
  // no ref is touched during render. Recreated each render, as before.
  const nodeHandlers = (id: string) => ({
    onPointerDown: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerDown(e, id, handlerContext),
    onPointerMove: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerMove(e, id, handlerContext),
    onPointerUp: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerUp(e, id, handlerContext),
    onPointerEnter: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerEnter(e, id, handlerContext),
    onPointerLeave: onNodeLeave,
    onDoubleClick: (e: ReactMouseEvent<SVGGElement>) => {
      e.preventDefault();
      onRecenter(id);
    },
  });
  const edgeHandlers = (edge: VouchEdge) => ({
    onPointerEnter: (e: ReactPointerEvent<SVGPathElement>) =>
      onEdgePointerEnter(e, edge, handlerContext),
    onPointerLeave: onNodeLeave,
  });
  const svgHandlers = {
    onPointerDown: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerDown(e, handlerContext),
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerMove(e, handlerContext),
    onPointerUp: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerUp(e, handlerContext),
  };

  return {
    registerNode,
    registerEdge,
    tip,
    hoverId,
    hasPins: pinCount > 0,
    nodeHandlers,
    edgeHandlers,
    svgHandlers,
    zoomCenter,
    fit,
    reset,
  };
}
