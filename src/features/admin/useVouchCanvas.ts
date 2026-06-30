import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useVouchSimulation } from "./useVouchSimulation";
import type { TipData } from "./VouchGraphTooltip";
import {
  EDGES,
  fmtMonth,
  nodeRadius,
  personById,
  type VouchEdge,
} from "./adminVouchGraph.data";

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

function nodeTip(id: string): TipData {
  const p = personById[id]!;
  const vin = EDGES.filter((e) => e.to === id && !e.withdrawn).length;
  const vout = EDGES.filter((e) => e.from === id && !e.withdrawn).length;
  return {
    kind: "node",
    name: p.name,
    pronoun: p.pronoun,
    role: p.role,
    vouchesIn: vin,
    vouchesOut: vout,
    joined: fmtMonth(p.joined),
  };
}

function edgeTip(e: VouchEdge): TipData {
  const label = `${personById[e.from]!.initials} → ${personById[e.to]!.initials}${e.mutual ? " · mutual" : ""}`;
  return {
    kind: "edge",
    label,
    tag: e.tag,
    reason: e.reason,
    date: fmtMonth(e.date),
    withdrawn: e.withdrawn,
  };
}

interface Args {
  visIds: string[];
  visEdges: VouchEdge[];
  focus: string;
  /** tighter community clustering in Scenes mode */
  cluster?: boolean;
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
  stageRef,
  svgRef,
  viewportRef,
  onSelect,
  onRecenter,
  onPickPath,
}: Args) {
  const reduced = usePrefersReducedMotion();
  const { getPos, setPos, clearPositions, run, stop } =
    useVouchSimulation(reduced);

  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const tfRef = useRef({ x: 0, y: 0, k: 1 });
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

  const [tip, setTip] = useState<{
    data: TipData;
    x: number;
    y: number;
  } | null>(null);
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
          nodeRadius(e.from, focus),
          nodeRadius(e.to, focus),
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
  }, [visIds, visEdges, getPos, viewportRef, focus]);

  const fit = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
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
    if (!any || r.width === 0) {
      tfRef.current = { x: r.width / 2, y: r.height / 2, k: 1 };
      paint();
      return;
    }
    const pad = 80;
    const k = Math.max(
      Math.min(
        r.width / (maxx - minx + pad * 2),
        r.height / (maxy - miny + pad * 2),
        1.35,
      ),
      0.4,
    );
    const cxp = (minx + maxx) / 2,
      cyp = (miny + maxy) / 2;
    tfRef.current = { k, x: r.width / 2 - cxp * k, y: r.height / 2 - cyp * k };
    paint();
  }, [visIds, getPos, paint, svgRef]);

  const restart = useCallback(() => {
    run({
      visIds,
      edges: visEdges,
      focusId: focus,
      clusterStrength: cluster ? 0.03 : 0.014,
      pinned: pinnedRef.current,
      paint,
      onSettled: fit,
    });
  }, [run, visIds, visEdges, focus, cluster, paint, fit]);

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
    (clientX: number, clientY: number, f: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const x = clientX - r.left,
        y = clientY - r.top;
      const v = tfRef.current;
      const nk = Math.max(0.35, Math.min(2.6, v.k * f));
      v.x = x - (x - v.x) * (nk / v.k);
      v.y = y - (y - v.y) * (nk / v.k);
      v.k = nk;
      paint();
    },
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

  const nodeHandlers = (id: string) => ({
    onPointerDown: (e: ReactPointerEvent<SVGGElement>) => {
      e.stopPropagation();
      dragRef.current = { id, moved: false, sx: e.clientX, sy: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      setTip(null);
    },
    onPointerMove: (e: ReactPointerEvent<SVGGElement>) => {
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
        const xy = tipXY(e.clientX, e.clientY);
        setTip((t) => (t ? { ...t, ...xy } : t));
      }
    },
    onPointerUp: (e: ReactPointerEvent<SVGGElement>) => {
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
    },
    onPointerEnter: (e: ReactPointerEvent<SVGGElement>) => {
      if (dragRef.current) return;
      setHoverId(id);
      setTip({ data: nodeTip(id), ...tipXY(e.clientX, e.clientY) });
    },
    onPointerLeave: onNodeLeave,
    onDoubleClick: (e: ReactMouseEvent<SVGGElement>) => {
      e.preventDefault();
      onRecenter(id);
    },
  });

  const edgeHandlers = (edge: VouchEdge) => ({
    onPointerEnter: (e: ReactPointerEvent<SVGPathElement>) => {
      if (dragRef.current || (!edge.reason && !edge.tag)) return;
      setTip({ data: edgeTip(edge), ...tipXY(e.clientX, e.clientY) });
    },
    onPointerLeave: onNodeLeave,
  });

  const svgHandlers = {
    onPointerDown: (e: ReactPointerEvent<SVGSVGElement>) => {
      panRef.current = { px: e.clientX, py: e.clientY, moved: false };
      svgRef.current?.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) => {
      const pan = panRef.current;
      if (!pan) return;
      if (Math.abs(e.clientX - pan.px) + Math.abs(e.clientY - pan.py) > 2)
        pan.moved = true;
      tfRef.current.x += e.clientX - pan.px;
      tfRef.current.y += e.clientY - pan.py;
      pan.px = e.clientX;
      pan.py = e.clientY;
      paint();
    },
    onPointerUp: (e: ReactPointerEvent<SVGSVGElement>) => {
      const pan = panRef.current;
      panRef.current = null;
      try {
        svgRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (pan && !pan.moved) onSelect(null); // click on empty space clears the pin
    },
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
