import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { FiMaximize, FiRotateCcw, FiMinus, FiPlus } from "react-icons/fi";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import {
  TONE,
  type TrustGraph,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";
import type { TrustPath } from "./trustGraph/trustPath";
import { useVouchCanvas } from "./useVouchCanvas";
import { VouchGraphBubbleNode } from "./VouchGraphBubbleNode";
import { VouchGraphCanvasHint } from "./VouchGraphCanvasHint";
import { VouchGraphNode } from "./VouchGraphNode";
import { VouchGraphSceneHulls } from "./VouchGraphSceneHulls";
import { VouchGraphTooltip } from "./VouchGraphTooltip";
import {
  bubbleEdgeId,
  type EdgeHandlers,
  type NodeHandlers,
} from "./vouchCanvas.helpers";
import type {
  CenterRequest,
  InviteBubble,
  VouchLayoutKind,
  VouchMode,
} from "./vouchGraph.types";
import styles from "./vouchGraphCanvas.module.css";

/** Matches the `.leaving` transition length (var(--dur-base)). */
const NODE_EXIT_MS = 250;

function classNames(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

interface OrderedEntry<T> {
  key: string;
  item: T;
  isLeaving: boolean;
}

interface OrderedState<T> {
  items: T[];
  leaving: T[];
  /** Keys in first-rendered order; an existing key never changes place. */
  order: string[];
}

const personKey = (id: string) => id;
const bubbleKey = (bubble: InviteBubble) => bubble.id;

/** Current items plus the ones that just left, kept for `exitMs` so they can
 *  fade out, all in one stable first-rendered order. New keys append, so
 *  React never moves an existing element (a move drops its computed style
 *  and replays its entrance). `items` must keep its identity between renders
 *  when nothing changed, and `keyOf` must be stable. */
function useOrderedWithLeaving<T>(
  items: T[],
  keyOf: (item: T) => string,
  exitMs: number,
): OrderedEntry<T>[] {
  const [state, setState] = useState<OrderedState<T>>(() => ({
    items,
    leaving: [],
    order: items.map(keyOf),
  }));
  let current = state;
  if (state.items !== items) {
    const currentKeys = new Set(items.map(keyOf));
    const stillLeaving = state.leaving.filter(
      (item) => !currentKeys.has(keyOf(item)),
    );
    const stillLeavingKeys = new Set(stillLeaving.map(keyOf));
    const leftNow =
      exitMs > 0
        ? state.items.filter(
            (item) =>
              !currentKeys.has(keyOf(item)) &&
              !stillLeavingKeys.has(keyOf(item)),
          )
        : [];
    const isLeavingUnchanged =
      leftNow.length === 0 && stillLeaving.length === state.leaving.length;
    const leaving = isLeavingUnchanged
      ? state.leaving
      : [...stillLeaving, ...leftNow];
    const liveKeys = new Set([...currentKeys, ...leaving.map(keyOf)]);
    const keptOrder = state.order.filter((key) => liveKeys.has(key));
    const keptKeys = new Set(keptOrder);
    const addedKeys = items.map(keyOf).filter((key) => !keptKeys.has(key));
    current = { items, leaving, order: [...keptOrder, ...addedKeys] };
    setState(current);
  }

  useEffect(() => {
    if (state.leaving.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      setState((previous) => {
        const itemKeys = new Set(previous.items.map(keyOf));
        return {
          items: previous.items,
          leaving: [],
          order: previous.order.filter((key) => itemKeys.has(key)),
        };
      });
    }, exitMs);
    return () => window.clearTimeout(timeoutId);
  }, [state.leaving, exitMs, keyOf]);

  const entryByKey = new Map<string, OrderedEntry<T>>();
  for (const item of current.leaving) {
    const key = keyOf(item);
    entryByKey.set(key, { key, item, isLeaving: true });
  }
  for (const item of current.items) {
    const key = keyOf(item);
    entryByKey.set(key, { key, item, isLeaving: false });
  }
  return current.order.flatMap((key) => entryByKey.get(key) ?? []);
}

/** Shared SVG defs: the withdrawn hatch and the photo clip circles. The
 *  hatch draws on --line-rgb, which flips to light channels on dark. */
function VouchGraphCanvasDefs() {
  return (
    <defs>
      <pattern
        id="vgHatch"
        width={8}
        height={8}
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        <rect width={8} height={8} fill="rgba(var(--line-rgb), .06)" />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={8}
          stroke="rgba(var(--line-rgb), .18)"
          strokeWidth={4}
        />
      </pattern>
      <clipPath id="vgClip30">
        <circle r={30} />
      </clipPath>
      <clipPath id="vgClip20">
        <circle r={20} />
      </clipPath>
      <clipPath id="vgClip15">
        <circle r={15} />
      </clipPath>
    </defs>
  );
}

/** C3 guide circles behind the rings layout. They keep the last radii while
 *  they fade out, so leaving the rings layout fades them away smoothly. */
function VouchGraphRingGuides({
  radii,
  isVisible,
}: {
  radii: number[];
  isVisible: boolean;
}) {
  const [shownRadii, setShownRadii] = useState(radii);
  if (radii.length > 0 && radii !== shownRadii) setShownRadii(radii);
  return (
    <g
      className={classNames(
        styles.ringGuides,
        isVisible && styles.ringGuidesVisible,
      )}
      aria-hidden
    >
      {shownRadii.map((radius) => (
        <circle key={radius} className={styles.ringGuide} r={radius} />
      ))}
    </g>
  );
}

interface EmphasisContext {
  focus: string;
  layoutKind: VouchLayoutKind;
  selectedId: string | null;
  hoveredId: string | null;
}

/** C3 spokes fade in rings layout; otherwise hover / selection emphasis.
 *  A selected or hovered member keeps its spoke at full strength; the focus
 *  itself exempts nothing, so spokes fade on open. */
function emphasisClassFor(
  fromId: string,
  toId: string,
  { focus, layoutKind, selectedId, hoveredId }: EmphasisContext,
): string | undefined {
  const touches = (id: string | null) => !!id && (fromId === id || toId === id);
  const isExemptBy = (id: string | null) => id !== focus && touches(id);
  const isSpoke =
    layoutKind === "rings" &&
    touches(focus) &&
    !isExemptBy(selectedId) &&
    !isExemptBy(hoveredId);
  if (isSpoke) return styles.edgeSpoke;
  const activeId = hoveredId ?? selectedId;
  if (activeId) return touches(activeId) ? styles.edgeHi : styles.edgeDim;
  return touches(focus) ? styles.edgeFocus : undefined;
}

interface EdgesLayerProps extends EmphasisContext {
  graph: TrustGraph;
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  pathEdgeIds: ReadonlySet<string>;
  /** Members of the highlighted ring (B3), or null. */
  ringMemberIds: ReadonlySet<string> | null;
  registerEdge: (id: string, element: SVGPathElement | null) => void;
  edgeHandlers: (edge: VouchEdge) => EdgeHandlers;
}

function VouchGraphCanvasEdges({
  graph,
  visEdges,
  bubbles,
  pathEdgeIds,
  ringMemberIds,
  registerEdge,
  edgeHandlers,
  ...emphasis
}: EdgesLayerProps) {
  return (
    <g>
      {visEdges.map((edge) => {
        const baseWidth = edge.withdrawn
          ? 1
          : 0.8 + graph.edgeWeight(edge) * 2.2;
        const isOnPath = pathEdgeIds.has(edge.id);
        const isRingLoop =
          !edge.withdrawn &&
          !!ringMemberIds?.has(edge.from) &&
          ringMemberIds.has(edge.to);
        const strokeWidth =
          baseWidth + (edge.mutual ? 1 : 0) + (isRingLoop ? 1 : 0);
        return (
          <path
            key={edge.id}
            ref={(element) => registerEdge(edge.id, element)}
            fill="none"
            className={classNames(
              styles.edge,
              edge.kind === "invite" && styles.invite,
              edge.mutual && styles.mutual,
              edge.withdrawn && styles.withdrawn,
              isOnPath && styles.onpath,
              !isOnPath && isRingLoop && styles.ringLoop,
              !isOnPath &&
                !isRingLoop &&
                emphasisClassFor(edge.from, edge.to, emphasis),
            )}
            strokeWidth={strokeWidth}
            {...edgeHandlers(edge)}
          />
        );
      })}
      {bubbles.map((bubble) => (
        <path
          key={bubbleEdgeId(bubble.parentId)}
          ref={(element) =>
            registerEdge(bubbleEdgeId(bubble.parentId), element)
          }
          fill="none"
          className={classNames(
            styles.edge,
            styles.invite,
            styles.bubbleEdge,
            emphasisClassFor(bubble.parentId, bubble.id, emphasis),
          )}
          strokeWidth={1.4}
        />
      ))}
    </g>
  );
}

interface NodesLayerProps {
  graph: TrustGraph;
  visIds: string[];
  bubbles: InviteBubble[];
  focus: string;
  mode: VouchMode;
  selectedId: string | null;
  hoveredId: string | null;
  pathNodeIds: ReadonlySet<string>;
  searchMatchIds: ReadonlySet<string>;
  isSearchActive: boolean;
  registerNode: (id: string, element: SVGGElement | null) => void;
  nodeHandlers: (id: string) => NodeHandlers;
  onToggleBubble: (parentId: string) => void;
}

function VouchGraphCanvasNodes({
  graph,
  visIds,
  bubbles,
  focus,
  mode,
  selectedId,
  hoveredId,
  pathNodeIds,
  searchMatchIds,
  isSearchActive,
  registerNode,
  nodeHandlers,
  onToggleBubble,
}: NodesLayerProps) {
  const isReducedMotion = usePrefersReducedMotion();
  const exitMs = isReducedMotion ? 0 : NODE_EXIT_MS;
  const peopleIds = useMemo(
    () => visIds.filter((id) => !!graph.peopleById[id]),
    [visIds, graph],
  );
  const personEntries = useOrderedWithLeaving(peopleIds, personKey, exitMs);
  const bubbleEntries = useOrderedWithLeaving(bubbles, bubbleKey, exitMs);
  // hover, or a pinned selection, focuses the view on that member's ego-network
  const activeId = hoveredId ?? selectedId;
  const activeNeighbourIds = useMemo(
    () =>
      activeId && graph.peopleById[activeId]
        ? new Set<string>([activeId, ...graph.neighbors(activeId, true)])
        : null,
    [graph, activeId],
  );
  const isSafety = mode === "safety";

  const personClassName = (id: string) => {
    const person = graph.peopleById[id]!;
    // ADM-23: ring membership is real cycle detection, kept apart from
    // `standing === "flagged"`. Ring nodes keep their red halo; the amber
    // isolated halo is skipped so it never hides the ring signal.
    const isInRing = !!person.ringId || !!person.inRing;
    const isIsolated = isSafety && !isInRing && graph.isIsolated(id);
    const isSearchMatch = searchMatchIds.has(id);
    return classNames(
      styles.node,
      id === selectedId && styles.selected,
      id === hoveredId && styles.hovered,
      isSafety && isInRing && styles.ring,
      isIsolated && styles.isolated,
      isSafety &&
        !isInRing &&
        !isIsolated &&
        !!person.reports &&
        styles.reported,
      pathNodeIds.has(id) && styles.pathnode,
      isSearchActive && !isSearchMatch && styles.searchDim,
      isSearchActive && isSearchMatch && styles.searchHit,
      !!activeNeighbourIds && !activeNeighbourIds.has(id) && styles.dim,
    );
  };

  const renderPerson = (id: string, isLeaving: boolean) => {
    const person = graph.peopleById[id];
    if (!person) return null;
    const ink = TONE[person.tone];
    const sceneColor =
      mode === "clusters"
        ? graph.scenes.find((scene) => scene.id === person.sceneId)?.color
        : undefined;
    return (
      <VouchGraphNode
        key={id}
        person={person}
        radius={graph.nodeRadius(id, focus)}
        isFocus={id === focus}
        fill={sceneColor ?? ink.fill}
        stroke={ink.stroke}
        photo={person.avatarUrl ?? undefined}
        className={
          isLeaving
            ? classNames(styles.node, styles.leaving)
            : personClassName(id)
        }
        isSelected={id === selectedId}
        nodeRef={(element) => registerNode(id, element)}
        handlers={isLeaving ? undefined : nodeHandlers(id)}
      />
    );
  };

  const renderBubble = (bubble: InviteBubble, isLeaving: boolean) => (
    <VouchGraphBubbleNode
      key={bubble.id}
      bubble={bubble}
      parentName={graph.peopleById[bubble.parentId]?.name ?? ""}
      className={classNames(
        styles.node,
        styles.bubble,
        bubble.isExpanded && styles.bubbleExpanded,
        isLeaving && styles.leaving,
        !isLeaving &&
          !!activeNeighbourIds &&
          !activeNeighbourIds.has(bubble.parentId) &&
          styles.dim,
      )}
      nodeRef={(element) => registerNode(bubble.id, element)}
      onToggle={isLeaving ? undefined : onToggleBubble}
    />
  );

  // Each layer renders in its stable first-rendered order: an id moving to
  // leaving keeps its element in place and fades from its painted position.
  return (
    <g>
      <g>
        {personEntries.map((entry) =>
          renderPerson(entry.item, entry.isLeaving),
        )}
      </g>
      <g>
        {bubbleEntries.map((entry) =>
          renderBubble(entry.item, entry.isLeaving),
        )}
      </g>
    </g>
  );
}

export interface VouchGraphCanvasProps {
  visIds: string[];
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  focus: string;
  mode: VouchMode;
  layoutKind: VouchLayoutKind;
  selectedId: string | null;
  hoveredId: string | null;
  path: TrustPath | null;
  pathEndpointIds: string[];
  searchMatchIds: ReadonlySet<string>;
  isSearchActive: boolean;
  highlightedRingId: string | null;
  centerRequest: CenterRequest | null;
  isCompactViewport: boolean;
  isFilteredEmpty: boolean;
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: (id: string | null) => void;
  onRecenter: (id: string) => void;
  onPickPath: (id: string) => void;
  onToggleBubble: (parentId: string) => void;
  onHoverChange: (id: string | null) => void;
  onClearFilters: () => void;
  children?: ReactNode;
}

interface ZoomControlsProps {
  hasPins: boolean;
  onZoom: (factor: number) => void;
  onFit: () => void;
  onReset: () => void;
}

function VouchGraphZoomControls({
  hasPins,
  onZoom,
  onFit,
  onReset,
}: ZoomControlsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.zoom} data-fit-reserve="controls">
      <button
        type="button"
        onClick={() => onZoom(1.25)}
        aria-label={t("admin:vouchGraph.canvas.zoomIn")}
      >
        <FiPlus aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onZoom(0.8)}
        aria-label={t("admin:vouchGraph.canvas.zoomOut")}
      >
        <FiMinus aria-hidden />
      </button>
      <button
        type="button"
        onClick={onFit}
        aria-label={t("admin:vouchGraph.canvas.fitToView")}
      >
        <FiMaximize aria-hidden />
      </button>
      <button
        type="button"
        onClick={onReset}
        className={hasPins ? styles.zoomActive : undefined}
        aria-label={t("admin:vouchGraph.canvas.resetLayout")}
        title={t("admin:vouchGraph.canvas.resetLayout")}
      >
        <FiRotateCcw aria-hidden />
      </button>
    </div>
  );
}

/** The network canvas: scene hulls, edges, nodes and invite bubbles, the
 *  tooltip, zoom controls, the gesture hints and the filtered-empty note. */
export function VouchGraphCanvas({
  visIds,
  visEdges,
  bubbles,
  focus,
  mode,
  layoutKind,
  selectedId,
  hoveredId,
  path,
  pathEndpointIds,
  searchMatchIds,
  isSearchActive,
  highlightedRingId,
  centerRequest,
  isCompactViewport,
  isFilteredEmpty,
  svgRef,
  onSelect,
  onRecenter,
  onPickPath,
  onToggleBubble,
  onHoverChange,
  onClearFilters,
  children,
}: VouchGraphCanvasProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const canvas = useVouchCanvas({
    visIds,
    visEdges,
    bubbles,
    focus,
    mode,
    layoutKind,
    selectedId,
    hoveredId,
    path,
    pathEndpointIds,
    searchMatchIds,
    centerRequest,
    isCompactViewport,
    graph,
    stageRef,
    svgRef,
    viewportRef,
    onSelect,
    onRecenter,
    onPickPath,
    onHoverChange,
  });
  const pathEdgeIds = useMemo(() => new Set(path?.edgeIds ?? []), [path]);
  const pathNodeIds = useMemo(
    () => new Set([...(path?.nodeIds ?? []), ...pathEndpointIds]),
    [path, pathEndpointIds],
  );
  const ringMemberIds = useMemo(() => {
    const ring = highlightedRingId
      ? graph.ringById(highlightedRingId)
      : undefined;
    return ring ? new Set(ring.memberIds) : null;
  }, [graph, highlightedRingId]);
  const focusName = graph.peopleById[focus]?.name ?? focus;

  return (
    <div className={styles.stage} ref={stageRef}>
      <svg
        ref={svgRef}
        className={styles.canvas}
        role="group"
        aria-label={t("admin:vouchGraph.canvas.svgLabel", { name: focusName })}
        aria-describedby="vouch-graph-summary"
        {...canvas.svgHandlers}
      >
        <VouchGraphCanvasDefs />
        <g ref={viewportRef}>
          <VouchGraphRingGuides
            radii={canvas.ringGuides}
            isVisible={layoutKind === "rings" && canvas.ringGuides.length > 0}
          />
          <VouchGraphSceneHulls
            hullScenes={canvas.hullScenes}
            isVisible={mode === "clusters"}
            registerHull={canvas.registerHull}
          />
          <VouchGraphCanvasEdges
            graph={graph}
            visEdges={visEdges}
            bubbles={bubbles}
            focus={focus}
            layoutKind={layoutKind}
            selectedId={selectedId}
            hoveredId={hoveredId}
            pathEdgeIds={pathEdgeIds}
            ringMemberIds={ringMemberIds}
            registerEdge={canvas.registerEdge}
            edgeHandlers={canvas.edgeHandlers}
          />
          <VouchGraphCanvasNodes
            graph={graph}
            visIds={visIds}
            bubbles={bubbles}
            focus={focus}
            mode={mode}
            selectedId={selectedId}
            hoveredId={hoveredId}
            pathNodeIds={pathNodeIds}
            searchMatchIds={searchMatchIds}
            isSearchActive={isSearchActive}
            registerNode={canvas.registerNode}
            nodeHandlers={canvas.nodeHandlers}
            onToggleBubble={onToggleBubble}
          />
        </g>
      </svg>

      <VouchGraphTooltip tip={canvas.tip} />
      {children}

      <div className={styles.emptyNoteWrap}>
        <Collapse isOpen={isFilteredEmpty}>
          <div className={styles.emptyNote}>
            <p>{t("admin:vouchGraph.filters.emptyResult")}</p>
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              {t("admin:vouchGraph.filters.clearCta")}
            </Button>
          </div>
        </Collapse>
      </div>

      <VouchGraphZoomControls
        hasPins={canvas.hasPins}
        onZoom={canvas.zoomCenter}
        onFit={canvas.fit}
        onReset={canvas.reset}
      />
      <VouchGraphCanvasHint mode={mode} nodeCount={visIds.length} />
    </div>
  );
}
