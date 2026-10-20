import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useVouchSimulation, type NodePos } from "./useVouchSimulation";
import type { TrustGraph, VouchEdge } from "./trustGraph/trustGraphModel";
import type { TrustPath } from "./trustGraph/trustPath";
import type {
  CenterRequest,
  InviteBubble,
  VouchLayoutKind,
  VouchMode,
} from "./vouchGraph.types";
import {
  buildCanvasLayoutModel,
  buildHullScenes,
  buildLabelPinnedIds,
  nodeTip,
  tipPositionForNode,
  tipPositionFromClient,
  useCanvasInteractionHandlers,
  type HandlerContext,
  type TipState,
} from "./vouchCanvas.helpers";
import type { Transform } from "./vouchCanvasPaint";
import { ringGuideRadii } from "./vouchRingLayout";
import { useCanvasViewport, type PaintState } from "./useVouchCanvasViewport";

interface Args {
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
  centerRequest: CenterRequest | null;
  isCompactViewport: boolean;
  graph: TrustGraph;
  stageRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  viewportRef: RefObject<SVGGElement | null>;
  onSelect: (id: string | null) => void;
  onRecenter: (id: string) => void;
  onPickPath: (id: string) => void;
  onHoverChange: (id: string | null) => void;
}

type DragState = NonNullable<HandlerContext["dragRef"]["current"]>;
type PanState = NonNullable<HandlerContext["panRef"]["current"]>;

/** Keeps the previous value while its content key is unchanged, so a parent
 *  that rebuilds an equal array does not restart the layout. */
function useStableByKey<T>(value: T, key: string): T {
  const [stable, setStable] = useState({ key, value });
  if (stable.key !== key) {
    setStable({ key, value });
    return value;
  }
  return stable.value;
}

interface CanvasModelInput {
  graph: TrustGraph;
  focus: string;
  layoutKind: VouchLayoutKind;
  visIds: string[];
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  selectedId: string | null;
  hoveredId: string | null;
  path: TrustPath | null;
  pathEndpointIds: string[];
  searchMatchIds: ReadonlySet<string>;
  onHoverChange: (id: string | null) => void;
}

/** The derived layout set, hull groups and pinned label candidates. Clears
 *  the shared hover when the hovered node leaves the laid-out set. */
function useCanvasModel({
  graph,
  focus,
  layoutKind,
  visIds,
  visEdges,
  bubbles,
  selectedId,
  hoveredId,
  path,
  pathEndpointIds,
  searchMatchIds,
  onHoverChange,
}: CanvasModelInput) {
  const { t } = useTranslation();
  const stableVisIds = useStableByKey(visIds, visIds.join("\n"));
  const stableVisEdges = useStableByKey(
    visEdges,
    visEdges
      .map(
        (edge) =>
          `${edge.id}:${edge.withdrawn ? 1 : 0}${edge.mutual ? 1 : 0}${edge.kind ?? ""}`,
      )
      .join("\n"),
  );
  const stableBubbles = useStableByKey(
    bubbles,
    bubbles
      .map(
        (bubble) =>
          `${bubble.id}:${bubble.isExpanded ? 1 : 0}:${bubble.leafIds.length}`,
      )
      .join("\n"),
  );

  const bubbleLabelFor = useCallback(
    (bubble: InviteBubble) =>
      bubble.isExpanded
        ? t("admin:vouchGraph.canvas.bubbleCollapseLabel")
        : t("admin:vouchGraph.canvas.bubbleLabel", {
            count: bubble.leafIds.length,
          }),
    [t],
  );
  const layout = useMemo(
    () =>
      buildCanvasLayoutModel({
        graph,
        focus,
        layoutKind,
        visIds: stableVisIds,
        visEdges: stableVisEdges,
        bubbles: stableBubbles,
        bubbleLabelFor,
      }),
    [
      graph,
      focus,
      layoutKind,
      stableVisIds,
      stableVisEdges,
      stableBubbles,
      bubbleLabelFor,
    ],
  );
  const hullScenes = useMemo(
    () => buildHullScenes(graph, stableVisIds),
    [graph, stableVisIds],
  );
  const layoutIdSet = useMemo(() => new Set(layout.nodeIds), [layout]);
  const pinnedIds = buildLabelPinnedIds({
    focus,
    selectedId,
    pathEndpointIds,
    path,
    hoveredId,
    searchMatchIds,
    bubbleIds: layout.bubbleById.keys(),
    layoutIdSet,
  });

  // Only a node that was laid out and then left clears the hover, so an
  // inspector row can still hover a member outside the view.
  const previousLayoutIdSetRef = useRef(layoutIdSet);
  useEffect(() => {
    const previousLayoutIdSet = previousLayoutIdSetRef.current;
    previousLayoutIdSetRef.current = layoutIdSet;
    if (
      hoveredId &&
      previousLayoutIdSet.has(hoveredId) &&
      !layoutIdSet.has(hoveredId)
    ) {
      onHoverChange(null);
    }
  }, [layoutIdSet, hoveredId, onHoverChange]);

  return {
    layout,
    layoutIdSet,
    hullScenes,
    pinnedIds,
    pinnedKey: pinnedIds.join("\n"),
  };
}

interface CanvasTipInput {
  layoutIdSet: ReadonlySet<string>;
  graph: TrustGraph;
  getPos: (id: string) => NodePos | undefined;
  stageSizeRef: RefObject<{ width: number; height: number }>;
  transformRef: RefObject<Transform>;
  paintStateRef: RefObject<PaintState>;
}

/** Tooltip state. A tip whose node or edge leaves the laid-out set is
 *  dropped during render; each tip carries its owner ids and hint kind. */
function useCanvasTip({
  layoutIdSet,
  graph,
  getPos,
  stageSizeRef,
  transformRef,
  paintStateRef,
}: CanvasTipInput) {
  const fmt = useFormat();
  const [tip, setTip] = useState<TipState>(null);
  const [tipLayoutIdSet, setTipLayoutIdSet] = useState(layoutIdSet);
  if (tipLayoutIdSet !== layoutIdSet) {
    setTipLayoutIdSet(layoutIdSet);
    if (tip && !tip.ownerIds.every((ownerId) => layoutIdSet.has(ownerId))) {
      setTip(null);
    }
  }
  const showKeyboardTip = (id: string) => {
    const position = getPos(id);
    if (!position || !graph.peopleById[id]) return;
    setTip({
      data: nodeTip(id, fmt, graph, "keyboard"),
      ...tipPositionForNode(
        stageSizeRef.current,
        transformRef.current,
        position,
        paintStateRef.current.layout.radiusFor(id),
      ),
      ownerIds: [id],
    });
  };
  return { tip, setTip, showKeyboardTip };
}

/** E1: the trust path's edges (painted around other nodes) and the phone
 *  compare's fit target. `fitTargetKey` changes when a phone compare starts,
 *  changes or ends; the viewport then refits every visible id (both
 *  endpoints among them) below the measured path bar and above the sheet,
 *  so nothing sits under the bar. */
function usePathFit({
  path,
  pathEndpointIds,
  layoutIdSet,
  isCompactViewport,
}: {
  path: TrustPath | null;
  pathEndpointIds: string[];
  layoutIdSet: ReadonlySet<string>;
  isCompactViewport: boolean;
}) {
  const pathEdgeIds = useMemo(
    () => new Set<string>(path?.edgeIds ?? []),
    [path],
  );
  const laidOutPathIds =
    isCompactViewport && pathEndpointIds.length >= 2
      ? [...new Set([...pathEndpointIds, ...(path?.nodeIds ?? [])])].filter(
          (id) => layoutIdSet.has(id),
        )
      : [];
  // One laid-out id alone is no compare.
  const fitTargetKey =
    laidOutPathIds.length >= 2 ? laidOutPathIds.join("\n") : "";
  return { pathEdgeIds, fitTargetKey };
}

/** The painted elements by id: nodes and bubbles, edges, scene hulls. */
function useElementRegistry() {
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const hullRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const [elementRefs] = useState(() => ({
    nodes: nodeRefs,
    edges: edgeRefs,
    hulls: hullRefs,
  }));
  const registerNode = useCallback(
    (id: string, element: SVGGElement | null) => {
      if (element) nodeRefs.current.set(id, element);
      else nodeRefs.current.delete(id);
    },
    [],
  );
  const registerEdge = useCallback(
    (id: string, element: SVGPathElement | null) => {
      if (element) edgeRefs.current.set(id, element);
      else edgeRefs.current.delete(id);
    },
    [],
  );
  const registerHull = useCallback(
    (sceneId: string, element: SVGPathElement | null) => {
      if (element) hullRefs.current.set(sceneId, element);
      else hullRefs.current.delete(sceneId);
    },
    [],
  );
  return { elementRefs, registerNode, registerEdge, registerHull };
}

interface LayoutRunInput {
  run: ReturnType<typeof useVouchSimulation>["run"];
  stop: () => void;
  clearPositions: () => void;
  layout: PaintState["layout"];
  focus: string;
  mode: VouchMode;
  layoutKind: VouchLayoutKind;
  pinnedRef: RefObject<Set<string>>;
  setPinCount: (count: number) => void;
  viewport: ReturnType<typeof useCanvasViewport>;
}

/** Runs the layout whenever its inputs change, painting every tick and
 *  refitting on settle; returns Reset, which drops manual pins and reruns. */
function useLayoutRun({
  run,
  stop,
  clearPositions,
  layout,
  focus,
  mode,
  layoutKind,
  pinnedRef,
  setPinCount,
  viewport,
}: LayoutRunInput) {
  const { paint, refitUnlessAdjusted, hasUserAdjustedViewRef } = viewport;
  const clusterStrength = mode === "clusters" ? 0.03 : 0.014;
  const restart = useCallback(() => {
    run({
      nodeIds: layout.nodeIds,
      edges: layout.edges,
      focusId: focus,
      layoutKind,
      ringTargets: layout.ringTargets,
      sceneAnchorFor: layout.sceneAnchorFor,
      clusterStrength,
      pinned: pinnedRef.current,
      paint,
      onSettled: refitUnlessAdjusted,
    });
  }, [
    run,
    layout,
    focus,
    layoutKind,
    clusterStrength,
    paint,
    refitUnlessAdjusted,
    pinnedRef,
  ]);

  useLayoutEffect(() => {
    restart();
    return stop;
  }, [restart, stop]);

  return useCallback(() => {
    pinnedRef.current.clear();
    setPinCount(0);
    hasUserAdjustedViewRef.current = false;
    clearPositions();
    restart();
  }, [clearPositions, restart, hasUserAdjustedViewRef, pinnedRef, setPinCount]);
}

/**
 * Owns everything imperative about the canvas: the layout run, painting
 * positions and label culling, pan/zoom, fit on settle and on resize, centre
 * requests, node dragging (with manual pins), tooltips and reset. Keeps the
 * presentational components to plain JSX.
 */
export function useVouchCanvas({
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
}: Args) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const mutualLabel = t("admin:vouchGraph.inspector.mutualTag");
  const isReducedMotion = usePrefersReducedMotion();
  const { getPos, setPos, clearPositions, run, stop } =
    useVouchSimulation(isReducedMotion);
  const { layout, layoutIdSet, hullScenes, pinnedIds, pinnedKey } =
    useCanvasModel({
      graph,
      focus,
      layoutKind,
      visIds,
      visEdges,
      bubbles,
      selectedId,
      hoveredId,
      path,
      pathEndpointIds,
      searchMatchIds,
      onHoverChange,
    });

  const { elementRefs, registerNode, registerEdge, registerHull } =
    useElementRegistry();
  const dragRef = useRef<DragState | null>(null);
  const panRef = useRef<PanState | null>(null);
  const pinnedRef = useRef<Set<string>>(new Set());
  const { pathEdgeIds, fitTargetKey } = usePathFit({
    path,
    pathEndpointIds,
    layoutIdSet,
    isCompactViewport,
  });
  const paintStateRef = useRef<PaintState>({
    layout,
    pinnedIds,
    scenes: [],
    isCompactViewport,
    pathEdgeIds,
  });

  const [pinCount, setPinCount] = useState(0);

  // Declared first: every layout effect below paints from this state.
  useLayoutEffect(() => {
    paintStateRef.current = {
      layout,
      pinnedIds,
      scenes: mode === "clusters" ? hullScenes : [],
      isCompactViewport,
      pathEdgeIds,
    };
  });

  const viewport = useCanvasViewport({
    focus,
    layout,
    centerRequest,
    isReducedMotion,
    isCompactViewport,
    isPathBarShown: pathEndpointIds.length > 0,
    fitTargetKey,
    getPos,
    stageRef,
    svgRef,
    viewportRef,
    paintStateRef,
    pinnedRef,
    elementRefs,
  });
  const { paint, transformRef, stageSizeRef } = viewport;
  const { tip, setTip, showKeyboardTip } = useCanvasTip({
    layoutIdSet,
    graph,
    getPos,
    stageSizeRef,
    transformRef,
    paintStateRef,
  });

  const reset = useLayoutRun({
    run,
    stop,
    clearPositions,
    layout,
    focus,
    mode,
    layoutKind,
    pinnedRef,
    setPinCount,
    viewport,
  });
  // Labels re-cull when the pinned set (hover, selection, path, search) or
  // the viewport class changes, and path edges reroute when the path
  // changes, without restarting the layout.
  useLayoutEffect(() => {
    paint();
  }, [paint, pinnedKey, isCompactViewport, pathEdgeIds]);
  const ringGuides = useMemo(
    () => ringGuideRadii(layout.ringTargets),
    [layout.ringTargets],
  );

  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const transform = transformRef.current;
    return {
      x: (clientX - rect.left - transform.x) / transform.k,
      y: (clientY - rect.top - transform.y) / transform.k,
    };
  };
  const tipXY = (clientX: number, clientY: number) =>
    tipPositionFromClient(
      stageRef.current!.getBoundingClientRect(),
      clientX,
      clientY,
    );
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
    transformRef,
    setPinCount,
    setTip,
    toLocal,
    tipXY,
    setPos,
    paint,
    markViewAdjusted: viewport.markViewAdjusted,
    showKeyboardTip,
    tip,
    hoveredId,
    onSelect,
    onPickPath,
    onRecenter,
    onHoverChange,
  };
  // Handlers delegate to vouchCanvas.helpers.ts and read refs only on events.
  const { nodeHandlers, edgeHandlers, svgHandlers } =
    useCanvasInteractionHandlers(handlerContext);

  return {
    registerNode,
    registerEdge,
    registerHull,
    hullScenes,
    ringGuides,
    tip,
    hasPins: pinCount > 0,
    nodeHandlers,
    edgeHandlers,
    svgHandlers,
    zoomCenter: viewport.zoomCenter,
    fit: viewport.fit,
    reset,
  };
}
