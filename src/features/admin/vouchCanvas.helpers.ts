import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from "react";
import type { Formatters } from "../../shared/i18n/format";
import type { TipData } from "./VouchGraphTooltip";
import {
  monthDate,
  relationshipLabel,
  type TrustGraph,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";

/** Extracted from `useVouchCanvas` to keep the hook under the line budget:
 * tooltip content builders, the pan/zoom transform type, and the pointer /
 * stage interaction handlers the hook wires up each render. */

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

export type TipState = { data: TipData; x: number; y: number } | null;
export type Transform = { x: number; y: number; k: number };

export function nodeTip(
  id: string,
  fmt: Formatters,
  graph: TrustGraph,
): TipData {
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

export function edgeTip(
  e: VouchEdge,
  fmt: Formatters,
  mutualLabel: string,
  graph: TrustGraph,
  t: (key: string) => string,
): TipData {
  // Reads as words rather than an arrow glyph: this label is a plain string
  // painted into the canvas tooltip, so there is no element to hang an icon on
  // and a literal U+2192 would be announced as "rightwards arrow" (FE-ADM-23).
  const connector = t("admin:vouchGraph.pathSeparator");
  const label = `${graph.peopleById[e.from]!.initials} ${connector} ${graph.peopleById[e.to]!.initials}${e.mutual ? ` · ${mutualLabel}` : ""}`;
  return {
    kind: "edge",
    label,
    edgeKind: e.kind,
    relationship: relationshipLabel(t, e.relationship) ?? undefined,
    reason: e.reason ?? undefined,
    date: fmt.date(monthDate(e.date), MONTH_YEAR),
    withdrawn: e.withdrawn,
  };
}

/** Everything the pointer handlers close over: the hook's own refs and state. */
export interface HandlerContext {
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
 * the hook only ever calls them from *inside* its event callbacks, never during
 * render, so no ref is read while React is rendering.
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
  const { dragRef, focus, pinnedRef, setPinCount, toLocal, setPos, paint } =
    ctx;
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

/** Assembles the node/edge/stage event-handler objects the SVG markup spreads
 * onto its elements, all delegating to the module-scope handlers above. Named
 * with a `use` prefix (though it calls no hooks itself) so the react-hooks
 * ref-safety analysis treats it as a hook boundary: it is only ever called
 * unconditionally from inside `useVouchCanvas`, and the refs it receives are
 * only ever dereferenced later, inside the deferred closures it returns. */
export function useCanvasInteractionHandlers(ctx: HandlerContext) {
  const nodeHandlers = (id: string) => ({
    onPointerDown: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerDown(e, id, ctx),
    onPointerMove: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerMove(e, id, ctx),
    onPointerUp: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerUp(e, id, ctx),
    onPointerEnter: (e: ReactPointerEvent<SVGGElement>) =>
      onNodePointerEnter(e, id, ctx),
    onPointerLeave: ctx.onNodeLeave,
    onDoubleClick: (e: ReactMouseEvent<SVGGElement>) => {
      e.preventDefault();
      ctx.onRecenter(id);
    },
    // Keyboard parity for the focusable node: Enter/Space activate the node the
    // same way a pointer double-click does (recenter, which also selects it and
    // guards private members with a toast).
    onKeyDown: (e: ReactKeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ctx.onRecenter(id);
      }
    },
  });
  const edgeHandlers = (edge: VouchEdge) => ({
    onPointerEnter: (e: ReactPointerEvent<SVGPathElement>) =>
      onEdgePointerEnter(e, edge, ctx),
    onPointerLeave: ctx.onNodeLeave,
  });
  const svgHandlers = {
    onPointerDown: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerDown(e, ctx),
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerMove(e, ctx),
    onPointerUp: (e: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerUp(e, ctx),
  };
  return { nodeHandlers, edgeHandlers, svgHandlers };
}
