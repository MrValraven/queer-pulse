import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useVouchSimulation, type NodePos } from "./useVouchSimulation";
import type { TrustGraph, VouchEdge } from "./trustGraph/trustGraphModel";
import {
  useCanvasInteractionHandlers,
  type HandlerContext,
  type TipState,
  type Transform,
} from "./vouchCanvas.helpers";

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
 * Owns everything imperative about the canvas: the force simulation, painting
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
  // Thin handler objects that delegate to the module-scope functions in
  // vouchCanvas.helpers.ts; `handlerContext` is only ever passed from inside
  // these event callbacks, so no ref is touched during render. Recreated each
  // render, as before.
  const { nodeHandlers, edgeHandlers, svgHandlers } =
    useCanvasInteractionHandlers(handlerContext);

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
