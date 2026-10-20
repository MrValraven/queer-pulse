import type {
  Dispatch,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from "react";
import type { Formatters } from "../../shared/i18n/format";
import type { TipData, TipHintKind, TipState } from "./VouchGraphTooltip";
import {
  monthDate,
  relationshipLabel,
  type TrustGraph,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";
import {
  findSecondHopParent,
  groupEgoRelations,
} from "./trustGraph/egoRelation";
import type { TrustPath } from "./trustGraph/trustPath";
import type { LayoutEdge } from "./useVouchSimulation";
import { computeRingTargets, type RingSlot } from "./vouchRingLayout";
import type { Transform } from "./vouchCanvasPaint";
import type { InviteBubble, VouchLayoutKind } from "./vouchGraph.types";

/** Extracted from `useVouchCanvas` to keep the hook under the line budget:
 * tooltip content builders, the layout and label models the canvas feeds the
 * simulation and the painter, the centre-pan animation, and the pointer /
 * keyboard / stage interaction handlers the hook wires up each render. */

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

/** Collapsed invite bubble disc radius, in graph units. */
export const BUBBLE_RADIUS = 18;
/** An expanded bubble shrinks to a small "Hide invited" handle. */
export const BUBBLE_EXPANDED_SCALE = 0.6;
/** Frames a centre request eases over (C1 / B3 pans). */
export const CENTER_PAN_FRAMES = 18;
const TIP_WIDTH_PX = 240;
const TIP_OFFSET_PX = 14;
const ORIGIN = { x: 0, y: 0 };

export type { TipState, Transform };

/** Synthetic id of the edge linking an invite bubble to its parent. */
export function bubbleEdgeId(parentId: string): string {
  return `bubble-edge:${parentId}`;
}

export function nodeTip(
  id: string,
  fmt: Formatters,
  graph: TrustGraph,
  hintKind: TipHintKind,
): TipData {
  const person = graph.peopleById[id]!;
  return {
    kind: "node",
    name: person.name,
    pronoun: person.pronoun,
    role: person.role ?? "",
    vouchesIn: person.activeInboundCount,
    vouchesOut: person.activeOutboundCount,
    joined: fmt.date(monthDate(person.joined), MONTH_YEAR),
    hintKind,
  };
}

export function edgeTip(
  edge: VouchEdge,
  fmt: Formatters,
  mutualLabel: string,
  graph: TrustGraph,
  t: (key: string) => string,
): TipData {
  // Reads as words: this label is a plain string painted into the canvas
  // tooltip, so there is no element to hang an icon on, and a literal U+2192
  // would be announced as "rightwards arrow" (FE-ADM-23).
  const connector = t("admin:vouchGraph.pathSeparator");
  const label = `${graph.peopleById[edge.from]!.initials} ${connector} ${graph.peopleById[edge.to]!.initials}${edge.mutual ? ` · ${mutualLabel}` : ""}`;
  return {
    kind: "edge",
    label,
    edgeKind: edge.kind,
    relationship: relationshipLabel(t, edge.relationship) ?? undefined,
    reason: edge.reason ?? undefined,
    date: fmt.date(monthDate(edge.date), MONTH_YEAR),
    withdrawn: edge.withdrawn,
  };
}

/** Everything the simulation and the painter need about the laid-out set:
 *  people plus invite bubbles, the edges between them, and per-id lookups. */
export interface CanvasLayoutModel {
  /** Visible people followed by bubble ids. */
  nodeIds: string[];
  edges: LayoutEdge[];
  /** Rings layout only: target per non-focus id. */
  ringTargets: Map<string, { x: number; y: number }> | null;
  bubbleById: ReadonlyMap<string, InviteBubble>;
  radiusFor: (id: string) => number;
  weightFor: (id: string) => number;
  nameFor: (id: string) => string;
  sceneAnchorFor: (id: string) => { x: number; y: number };
}

interface CanvasLayoutInput {
  graph: TrustGraph;
  focus: string;
  layoutKind: VouchLayoutKind;
  visIds: string[];
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  /** Label text a bubble is culled and announced with. */
  bubbleLabelFor: (bubble: InviteBubble) => string;
}

export function buildCanvasLayoutModel({
  graph,
  focus,
  layoutKind,
  visIds,
  visEdges,
  bubbles,
  bubbleLabelFor,
}: CanvasLayoutInput): CanvasLayoutModel {
  const peopleIds = visIds.filter((id) => !!graph.peopleById[id]);
  const peopleIdSet = new Set(peopleIds);
  const bubbleById = new Map<string, InviteBubble>();
  for (const bubble of bubbles) {
    if (peopleIdSet.has(bubble.parentId)) bubbleById.set(bubble.id, bubble);
  }
  const nodeIds = [...peopleIds, ...bubbleById.keys()];

  const edges: LayoutEdge[] = visEdges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    isMutual: !!edge.mutual,
  }));
  const weightById = new Map<string, number>();
  for (const edge of visEdges) {
    const weight = graph.edgeWeight(edge);
    weightById.set(edge.from, (weightById.get(edge.from) ?? 0) + weight);
    weightById.set(edge.to, (weightById.get(edge.to) ?? 0) + weight);
  }
  for (const bubble of bubbleById.values()) {
    edges.push({
      id: bubbleEdgeId(bubble.parentId),
      from: bubble.parentId,
      to: bubble.id,
      isMutual: false,
    });
  }

  const personName = (id: string) => graph.peopleById[id]?.name ?? id;
  const radiusFor = (id: string) => {
    const bubble = bubbleById.get(id);
    if (!bubble) return graph.nodeRadius(id, focus);
    return bubble.isExpanded
      ? BUBBLE_RADIUS * BUBBLE_EXPANDED_SCALE
      : BUBBLE_RADIUS;
  };
  const nameFor = (id: string) => {
    const bubble = bubbleById.get(id);
    return bubble ? bubbleLabelFor(bubble) : personName(id);
  };
  const sceneAnchorFor = (id: string) => {
    const ownerId = bubbleById.get(id)?.parentId ?? id;
    const sceneId = graph.peopleById[ownerId]?.sceneId ?? "";
    return graph.sceneAnchor[sceneId] ?? ORIGIN;
  };

  return {
    nodeIds,
    edges,
    ringTargets:
      layoutKind === "rings"
        ? buildRingTargets(graph, focus, nodeIds, visEdges, bubbleById)
        : null,
    bubbleById,
    radiusFor,
    weightFor: (id) => weightById.get(id) ?? 0,
    nameFor,
    sceneAnchorFor,
  };
}

/** C1: ring slots from the ego relations, a `bubble` slot for bubble ids;
 *  second-hop members hang off their alphabetically first direct neighbour. */
function buildRingTargets(
  graph: TrustGraph,
  focus: string,
  nodeIds: string[],
  visEdges: VouchEdge[],
  bubbleById: ReadonlyMap<string, InviteBubble>,
): Map<string, { x: number; y: number }> {
  const relations = groupEgoRelations(graph, focus, nodeIds, visEdges);
  const personName = (id: string) => graph.peopleById[id]?.name ?? id;
  const slotFor = (id: string): RingSlot =>
    bubbleById.has(id) ? "bubble" : (relations.get(id) ?? "secondHop");
  const parentFor = (id: string): string | null => {
    const bubble = bubbleById.get(id);
    if (bubble) return bubble.parentId;
    if (relations.get(id) !== "secondHop") return null;
    return findSecondHopParent(focus, id, visEdges, relations, personName);
  };
  const ringNameFor = (id: string) =>
    personName(bubbleById.get(id)?.parentId ?? id);
  return computeRingTargets({
    focusId: focus,
    nodeIds: nodeIds.filter((id) => id !== focus),
    slotFor,
    parentFor,
    nameFor: ringNameFor,
  });
}

interface LabelPinInput {
  focus: string;
  selectedId: string | null;
  pathEndpointIds: string[];
  path: TrustPath | null;
  hoveredId: string | null;
  searchMatchIds: ReadonlySet<string>;
  bubbleIds: Iterable<string>;
  layoutIdSet: ReadonlySet<string>;
}

/** A1 pinned label candidates, in priority order: focus, selected, path
 *  endpoints, path nodes, hovered, search matches, then bubble handles. The
 *  first two slots are always focus and selected (focus again when nothing is
 *  selected), which the culler never drops. */
export function buildLabelPinnedIds({
  focus,
  selectedId,
  pathEndpointIds,
  path,
  hoveredId,
  searchMatchIds,
  bubbleIds,
  layoutIdSet,
}: LabelPinInput): string[] {
  const head = [focus, selectedId ?? focus];
  const seen = new Set(head);
  const tail: string[] = [];
  const add = (id: string | null) => {
    if (!id || seen.has(id) || !layoutIdSet.has(id)) return;
    seen.add(id);
    tail.push(id);
  };
  pathEndpointIds.forEach(add);
  path?.nodeIds.forEach(add);
  add(hoveredId);
  searchMatchIds.forEach(add);
  for (const bubbleId of bubbleIds) add(bubbleId);
  return [...head, ...tail];
}

export interface HullScene {
  sceneId: string;
  color: string;
  memberIds: string[];
}

/** C5: primary scenes with 3+ visible members. */
export function buildHullScenes(
  graph: TrustGraph,
  visIds: string[],
): HullScene[] {
  const membersBySceneId = new Map<string, string[]>();
  for (const id of visIds) {
    const sceneId = graph.peopleById[id]?.sceneId;
    if (!sceneId) continue;
    const members = membersBySceneId.get(sceneId) ?? [];
    members.push(id);
    membersBySceneId.set(sceneId, members);
  }
  const hullScenes: HullScene[] = [];
  for (const scene of graph.scenes) {
    const memberIds = membersBySceneId.get(scene.id);
    if (memberIds && memberIds.length >= 3) {
      hullScenes.push({ sceneId: scene.id, color: scene.color, memberIds });
    }
  }
  return hullScenes;
}

type StageSize = { width: number; height: number };

/** Tooltip anchor beside a node, from its graph position and the viewport
 *  transform; flips to the left when it would leave the stage. */
export function tipPositionForNode(
  stageSize: StageSize,
  transform: Transform,
  position: { x: number; y: number },
  radius: number,
): { x: number; y: number } {
  const screenX = position.x * transform.k + transform.x;
  const screenY = position.y * transform.k + transform.y;
  const reach = radius * transform.k + TIP_OFFSET_PX;
  const x =
    screenX + reach + TIP_WIDTH_PX > stageSize.width
      ? Math.max(0, screenX - reach - TIP_WIDTH_PX)
      : screenX + reach;
  return { x, y: Math.max(0, screenY - TIP_OFFSET_PX) };
}

/** Tooltip anchor beside the pointer, relative to the stage. */
export function tipPositionFromClient(
  stageRect: DOMRect,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  let x = clientX - stageRect.left + TIP_OFFSET_PX;
  const y = clientY - stageRect.top + TIP_OFFSET_PX;
  if (x + TIP_WIDTH_PX > stageRect.width) {
    x = clientX - stageRect.left - TIP_WIDTH_PX - TIP_OFFSET_PX;
  }
  return { x, y };
}

interface CenterPanInput {
  transformRef: { current: Transform };
  frameHandleRef: { current: number | null };
  stageSize: StageSize;
  position: { x: number; y: number };
  isReducedMotion: boolean;
  paint: () => void;
}

/** Pans (zoom unchanged) so `position` sits at the stage centre, easing over
 *  CENTER_PAN_FRAMES frames; one jump under reduced motion. */
export function startCenterPan({
  transformRef,
  frameHandleRef,
  stageSize,
  position,
  isReducedMotion,
  paint,
}: CenterPanInput): void {
  if (frameHandleRef.current !== null) {
    cancelAnimationFrame(frameHandleRef.current);
    frameHandleRef.current = null;
  }
  const transform = transformRef.current;
  const goalX = stageSize.width / 2 - position.x * transform.k;
  const goalY = stageSize.height / 2 - position.y * transform.k;
  if (isReducedMotion) {
    transform.x = goalX;
    transform.y = goalY;
    paint();
    return;
  }
  const startX = transform.x;
  const startY = transform.y;
  let frame = 0;
  const step = () => {
    frame += 1;
    const progress = frame / CENTER_PAN_FRAMES;
    const eased = 1 - Math.pow(1 - progress, 3);
    transformRef.current.x = startX + (goalX - startX) * eased;
    transformRef.current.y = startY + (goalY - startY) * eased;
    paint();
    frameHandleRef.current =
      frame < CENTER_PAN_FRAMES ? requestAnimationFrame(step) : null;
  };
  frameHandleRef.current = requestAnimationFrame(step);
}

/** Everything the interaction handlers close over: the hook's refs and state. */
export interface HandlerContext {
  focus: string;
  graph: TrustGraph;
  fmt: Formatters;
  mutualLabel: string;
  t: (key: string) => string;
  dragRef: RefObject<{
    id: string;
    hasMoved: boolean;
    startX: number;
    startY: number;
  } | null>;
  panRef: RefObject<{
    lastX: number;
    lastY: number;
    hasMoved: boolean;
  } | null>;
  pinnedRef: RefObject<Set<string>>;
  svgRef: RefObject<SVGSVGElement | null>;
  transformRef: RefObject<Transform>;
  setPinCount: Dispatch<SetStateAction<number>>;
  setTip: Dispatch<SetStateAction<TipState>>;
  toLocal: (clientX: number, clientY: number) => { x: number; y: number };
  tipXY: (clientX: number, clientY: number) => { x: number; y: number };
  setPos: (id: string, x: number, y: number) => void;
  paint: () => void;
  /** Wheel, pan and zoom buttons stop the automatic refit. */
  markViewAdjusted: () => void;
  /** Keyboard focus: the tooltip anchored at the node's screen position. */
  showKeyboardTip: (id: string) => void;
  /** The tooltip on screen: blur reads its owner and hint kind. */
  tip: TipState;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onPickPath: (id: string) => void;
  onRecenter: (id: string) => void;
  onHoverChange: (id: string | null) => void;
}

/*
 * The handler logic lives in these module-scope functions so the hook stays
 * under the line budget. They are plain functions, so they may read
 * `context.<ref>.current` freely. The hook calls them only from inside its
 * event callbacks, so every ref read happens after React has rendered.
 */

/** Begin a node drag: record the start point and capture the pointer. */
function onNodePointerDown(
  event: ReactPointerEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  event.stopPropagation();
  context.dragRef.current = {
    id,
    hasMoved: false,
    startX: event.clientX,
    startY: event.clientY,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  context.setTip(null);
}

/** Drag a node (pinning it once it moves) or reposition the hover tip. */
function onNodePointerMove(
  event: ReactPointerEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  const { dragRef, focus, pinnedRef, setPinCount, toLocal, setPos, paint } =
    context;
  const drag = dragRef.current;
  if (drag && drag.id === id) {
    const travel =
      Math.abs(event.clientX - drag.startX) +
      Math.abs(event.clientY - drag.startY);
    if (!drag.hasMoved && travel > 3) {
      drag.hasMoved = true;
      if (id !== focus && !pinnedRef.current.has(id)) {
        pinnedRef.current.add(id); // dropped where the user leaves it
        setPinCount(pinnedRef.current.size);
      }
    }
    const local = toLocal(event.clientX, event.clientY);
    setPos(id, local.x, local.y);
    paint();
  } else if (!dragRef.current) {
    const anchor = context.tipXY(event.clientX, event.clientY);
    context.setTip((current) =>
      current ? { ...current, ...anchor } : current,
    );
  }
}

/** End a node drag: a clean (unmoved) release counts as select / pick-path. */
function onNodePointerUp(
  event: ReactPointerEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  const { dragRef, onPickPath, onSelect } = context;
  const drag = dragRef.current;
  dragRef.current = null;
  try {
    event.currentTarget.releasePointerCapture(event.pointerId);
  } catch {
    /* ignore */
  }
  if (drag && !drag.hasMoved) {
    if (event.shiftKey) onPickPath(id);
    else onSelect(id);
  }
}

/** Hover a node: set the shared hover and show its tooltip (unless dragging). */
function onNodePointerEnter(
  event: ReactPointerEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  const { dragRef, onHoverChange, setTip, fmt, graph, tipXY } = context;
  if (dragRef.current) return;
  onHoverChange(id);
  setTip({
    data: nodeTip(id, fmt, graph, "pointer"),
    ...tipXY(event.clientX, event.clientY),
    ownerIds: [id],
  });
}

function onNodePointerLeave(context: HandlerContext) {
  context.onHoverChange(null);
  if (!context.dragRef.current) context.setTip(null);
}

/** E2: Enter / Space select, Shift+Enter picks a path end, W walks. */
function onNodeKeyDown(
  event: ReactKeyboardEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  const hasCommandModifier = event.metaKey || event.ctrlKey || event.altKey;
  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault();
    context.onPickPath(id);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    context.onSelect(id);
  } else if ((event.key === "w" || event.key === "W") && !hasCommandModifier) {
    event.preventDefault();
    context.onRecenter(id);
  }
}

/** Keyboard focus shows the anchored tooltip and sets hover. A pointer click
 *  also focuses the node; that path keeps the pointer tooltip. */
function onNodeFocus(
  event: ReactFocusEvent<SVGGElement>,
  id: string,
  context: HandlerContext,
) {
  let isKeyboardFocus = true;
  try {
    isKeyboardFocus = event.currentTarget.matches(":focus-visible");
  } catch {
    /* selector unsupported: treat as keyboard focus */
  }
  if (!isKeyboardFocus || context.dragRef.current) return;
  context.showKeyboardTip(id);
  context.onHoverChange(id);
}

/** Blur closes the tooltip keyboard focus opened for this node, and clears
 *  the hover it set; a pointer hover on another node stays. Ownership lives
 *  in the tip itself, so only a keyboard tip still owned by this node closes:
 *  a pointer or edge tip that replaced it stays put. */
function onNodeBlur(id: string, context: HandlerContext) {
  const { tip } = context;
  const isOwnKeyboardTip =
    tip?.data.kind === "node" &&
    tip.data.hintKind === "keyboard" &&
    tip.ownerIds[0] === id;
  if (isOwnKeyboardTip) context.setTip(null);
  if (isOwnKeyboardTip || context.hoveredId === id) {
    context.onHoverChange(null);
  }
}

/** Show an edge's tooltip on hover when it carries a reason/relationship. */
function onEdgePointerEnter(
  event: ReactPointerEvent<SVGPathElement>,
  edge: VouchEdge,
  context: HandlerContext,
) {
  const { dragRef, setTip, fmt, mutualLabel, graph, t, tipXY } = context;
  if (dragRef.current || (!edge.reason && !edge.relationship)) return;
  setTip({
    data: edgeTip(edge, fmt, mutualLabel, graph, t),
    ...tipXY(event.clientX, event.clientY),
    ownerIds: [edge.from, edge.to],
  });
}

/** Begin panning the stage. */
function onStagePointerDown(
  event: ReactPointerEvent<SVGSVGElement>,
  context: HandlerContext,
) {
  context.panRef.current = {
    lastX: event.clientX,
    lastY: event.clientY,
    hasMoved: false,
  };
  context.svgRef.current?.setPointerCapture(event.pointerId);
}

/** Pan the viewport as the pointer drags across the stage. */
function onStagePointerMove(
  event: ReactPointerEvent<SVGSVGElement>,
  context: HandlerContext,
) {
  const { panRef, transformRef, paint, markViewAdjusted } = context;
  const pan = panRef.current;
  if (!pan) return;
  const travel =
    Math.abs(event.clientX - pan.lastX) + Math.abs(event.clientY - pan.lastY);
  if (travel > 2 && !pan.hasMoved) {
    pan.hasMoved = true;
    markViewAdjusted();
  }
  transformRef.current.x += event.clientX - pan.lastX;
  transformRef.current.y += event.clientY - pan.lastY;
  pan.lastX = event.clientX;
  pan.lastY = event.clientY;
  paint();
}

/** End panning; a click on empty space (no pan) clears the selection. */
function onStagePointerUp(
  event: ReactPointerEvent<SVGSVGElement>,
  context: HandlerContext,
) {
  const { panRef, svgRef, onSelect } = context;
  const pan = panRef.current;
  panRef.current = null;
  try {
    svgRef.current?.releasePointerCapture(event.pointerId);
  } catch {
    /* ignore */
  }
  if (pan && !pan.hasMoved) onSelect(null); // click on empty space clears the pin
}

/** Assembles the node/edge/stage event-handler objects the SVG markup spreads
 * onto its elements, all delegating to the module-scope handlers above. Named
 * with a `use` prefix (though it calls no hooks itself) so the react-hooks
 * ref-safety analysis treats it as a hook boundary: it is only ever called
 * unconditionally from inside `useVouchCanvas`, and the refs it receives are
 * only ever dereferenced later, inside the deferred closures it returns. */
export function useCanvasInteractionHandlers(context: HandlerContext) {
  const nodeHandlers = (id: string) => ({
    onPointerDown: (event: ReactPointerEvent<SVGGElement>) =>
      onNodePointerDown(event, id, context),
    onPointerMove: (event: ReactPointerEvent<SVGGElement>) =>
      onNodePointerMove(event, id, context),
    onPointerUp: (event: ReactPointerEvent<SVGGElement>) =>
      onNodePointerUp(event, id, context),
    onPointerEnter: (event: ReactPointerEvent<SVGGElement>) =>
      onNodePointerEnter(event, id, context),
    onPointerLeave: () => onNodePointerLeave(context),
    onDoubleClick: (event: ReactMouseEvent<SVGGElement>) => {
      event.preventDefault();
      context.onRecenter(id);
    },
    onKeyDown: (event: ReactKeyboardEvent<SVGGElement>) =>
      onNodeKeyDown(event, id, context),
    onFocus: (event: ReactFocusEvent<SVGGElement>) =>
      onNodeFocus(event, id, context),
    onBlur: () => onNodeBlur(id, context),
  });
  const edgeHandlers = (edge: VouchEdge) => ({
    onPointerEnter: (event: ReactPointerEvent<SVGPathElement>) =>
      onEdgePointerEnter(event, edge, context),
    onPointerLeave: () => {
      if (!context.dragRef.current) context.setTip(null);
    },
  });
  const svgHandlers = {
    onPointerDown: (event: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerDown(event, context),
    onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerMove(event, context),
    onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) =>
      onStagePointerUp(event, context),
  };
  return { nodeHandlers, edgeHandlers, svgHandlers };
}

export type NodeHandlers = ReturnType<
  ReturnType<typeof useCanvasInteractionHandlers>["nodeHandlers"]
>;
export type EdgeHandlers = ReturnType<
  ReturnType<typeof useCanvasInteractionHandlers>["edgeHandlers"]
>;
