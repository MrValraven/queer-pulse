import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import type { NodePos } from "./useVouchSimulation";
import type { CenterRequest } from "./vouchGraph.types";
import {
  startCenterPan,
  type CanvasLayoutModel,
  type HullScene,
} from "./vouchCanvas.helpers";
import {
  DEFAULT_STAGE_FIT,
  findInspectorSheet,
  findPathBar,
  isSameStageFit,
  measureStageFit,
  type StageFit,
} from "./vouchCanvasFitBox";
import {
  applyZoomAt,
  computeFitTransform,
  fitOptionsFor,
  paintCanvas,
  type Transform,
} from "./vouchCanvasPaint";

/** What the painter reads at paint time, refreshed after every render. */
export interface PaintState {
  layout: CanvasLayoutModel;
  pinnedIds: string[];
  scenes: HullScene[];
  isCompactViewport: boolean;
  /** Edges on the highlighted trust path, routed around other nodes. */
  pathEdgeIds: ReadonlySet<string>;
}

const ORIGIN = { x: 0, y: 0 };
/** Frames of the eased refit when the fit target changes (about 300ms). */
const FIT_TWEEN_FRAMES = 18;

/** Eases the view to `goal` (pan and zoom together), cancelling any pan or
 *  refit already running on `frameHandleRef`. */
function startFitTween({
  transformRef,
  frameHandleRef,
  goal,
  paint,
}: {
  transformRef: RefObject<Transform>;
  frameHandleRef: RefObject<number | null>;
  goal: Transform;
  paint: () => void;
}): void {
  if (frameHandleRef.current !== null) {
    cancelAnimationFrame(frameHandleRef.current);
  }
  const start = { ...transformRef.current };
  let frame = 0;
  const step = () => {
    frame += 1;
    const eased = 1 - Math.pow(1 - frame / FIT_TWEEN_FRAMES, 3);
    transformRef.current = {
      x: start.x + (goal.x - start.x) * eased,
      y: start.y + (goal.y - start.y) * eased,
      k: start.k + (goal.k - start.k) * eased,
    };
    paint();
    frameHandleRef.current =
      frame < FIT_TWEEN_FRAMES ? requestAnimationFrame(step) : null;
  };
  frameHandleRef.current = requestAnimationFrame(step);
}

interface StageMeasureInput {
  stageRef: RefObject<HTMLDivElement | null>;
  stageSizeRef: RefObject<{ width: number; height: number }>;
  stageFitRef: RefObject<StageFit>;
  isCompactViewport: boolean;
  isPathBarShown: boolean;
  /** Changes when a phone compare starts, changes or ends. */
  fitTargetKey: string;
  refitUnlessAdjusted: () => void;
  /** Starts a fresh view on the new fit target, eased. */
  refitToNewTarget: () => void;
}

/** Measures the stage and its fit box (path bar, zoom controls, the phone
 *  sheet's peek) and writes `--vg-occluded-bottom` so the floating controls
 *  lift above the sheet. The stage, the sheet and the shown path bar are
 *  observed; a change in any, or the path bar showing or hiding, refits
 *  until the admin pans or zooms. A new fit target always refits. */
function useStageMeasure({
  stageRef,
  stageSizeRef,
  stageFitRef,
  isCompactViewport,
  isPathBarShown,
  fitTargetKey,
  refitUnlessAdjusted,
  refitToNewTarget,
}: StageMeasureInput) {
  const fitFlagsRef = useRef({ isCompactViewport, isPathBarShown });
  const fitTargetKeyRef = useRef(fitTargetKey);

  /** True when the size or the fit box changed since the last measure. */
  const measure = useCallback((): boolean => {
    const stage = stageRef.current;
    if (!stage) return false;
    const rect = stage.getBoundingClientRect();
    const nextFit = measureStageFit(stage, rect, fitFlagsRef.current);
    const previousSize = stageSizeRef.current;
    const hasChanged =
      previousSize.width !== rect.width ||
      previousSize.height !== rect.height ||
      !isSameStageFit(stageFitRef.current, nextFit);
    stageSizeRef.current = { width: rect.width, height: rect.height };
    stageFitRef.current = nextFit;
    stage.style.setProperty(
      "--vg-occluded-bottom",
      `${nextFit.occludedBottom}px`,
    );
    return hasChanged;
  }, [stageRef, stageSizeRef, stageFitRef]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // The first callback always fits, as the stage first lays out.
    let isFirstCallback = true;
    const observer = new ResizeObserver(() => {
      const hasChanged = measure();
      if (hasChanged || isFirstCallback) refitUnlessAdjusted();
      isFirstCallback = false;
    });
    observer.observe(stage);
    const sheet = findInspectorSheet(stage);
    if (sheet) observer.observe(sheet);
    return () => observer.disconnect();
  }, [stageRef, measure, refitUnlessAdjusted]);

  // The path bar mounts (or changes its text) in this commit, so it is
  // measurable here.
  useLayoutEffect(() => {
    const flags = fitFlagsRef.current;
    const isTargetChanged = fitTargetKeyRef.current !== fitTargetKey;
    const isFlagsChanged =
      flags.isCompactViewport !== isCompactViewport ||
      flags.isPathBarShown !== isPathBarShown;
    if (!isTargetChanged && !isFlagsChanged) return;
    fitFlagsRef.current = { isCompactViewport, isPathBarShown };
    fitTargetKeyRef.current = fitTargetKey;
    const hasBoxChanged = measure();
    if (isTargetChanged) refitToNewTarget();
    else if (hasBoxChanged) refitUnlessAdjusted();
  }, [
    isCompactViewport,
    isPathBarShown,
    fitTargetKey,
    measure,
    refitUnlessAdjusted,
    refitToNewTarget,
  ]);

  // The bar grows from the one-line hint to the path sentence (two lines on
  // a phone, more in PT), so its measured height is followed while shown.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pathBar = stage && isPathBarShown ? findPathBar(stage) : null;
    if (!pathBar || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (measure()) refitUnlessAdjusted();
    });
    observer.observe(pathBar);
    return () => observer.disconnect();
  }, [stageRef, isPathBarShown, measure, refitUnlessAdjusted]);
}

interface CanvasViewportInput {
  focus: string;
  layout: CanvasLayoutModel;
  centerRequest: CenterRequest | null;
  isReducedMotion: boolean;
  isCompactViewport: boolean;
  isPathBarShown: boolean;
  /** Changes when a phone compare starts, changes or ends: the view then
   *  refits fresh, below the path bar's measured height. */
  fitTargetKey: string;
  getPos: (id: string) => NodePos | undefined;
  stageRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  viewportRef: RefObject<SVGGElement | null>;
  paintStateRef: RefObject<PaintState>;
  /** Nodes the admin dragged into place. */
  pinnedRef: RefObject<Set<string>>;
  elementRefs: {
    nodes: RefObject<Map<string, SVGGElement>>;
    edges: RefObject<Map<string, SVGPathElement>>;
    hulls: RefObject<Map<string, SVGPathElement>>;
  };
}

/** The viewport transform: painting, fit on settle and on resize (A5) inside
 *  the measured fit box, wheel and button zoom, and eased centre requests.
 *  Called after the paint state effect and before the layout run, so its
 *  layout effects see fresh state and a measured stage. */
export function useCanvasViewport({
  focus,
  layout,
  centerRequest,
  isReducedMotion,
  isCompactViewport,
  isPathBarShown,
  fitTargetKey,
  getPos,
  stageRef,
  svgRef,
  viewportRef,
  paintStateRef,
  pinnedRef,
  elementRefs,
}: CanvasViewportInput) {
  const transformRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
  const hasUserAdjustedViewRef = useRef(false);
  const panFrameRef = useRef<number | null>(null);
  // A request already pending at mount is stale: a remount never replays it.
  const handledCenterNonceRef = useRef<number | null>(
    centerRequest?.nonce ?? null,
  );
  const stageSizeRef = useRef({ width: 0, height: 0 });
  const stageFitRef = useRef<StageFit>(DEFAULT_STAGE_FIT);

  const paint = useCallback(() => {
    const state = paintStateRef.current;
    paintCanvas({
      viewport: viewportRef.current,
      nodeElements: elementRefs.nodes.current,
      edgeElements: elementRefs.edges.current,
      hullElements: elementRefs.hulls.current,
      transform: transformRef.current,
      nodeIds: state.layout.nodeIds,
      edges: state.layout.edges,
      scenes: state.scenes,
      getPos: getPos,
      radiusFor: state.layout.radiusFor,
      pathEdgeIds: state.pathEdgeIds,
      labels: {
        pinnedIds: state.pinnedIds,
        weightFor: state.layout.weightFor,
        nameFor: state.layout.nameFor,
        isCompactViewport: state.isCompactViewport,
        stageSize: stageSizeRef.current,
      },
    });
  }, [getPos, viewportRef, paintStateRef, elementRefs]);

  /** Frames every visible id (bubbles and any path endpoints included)
   *  inside the measured fit box, so nothing sits under the path bar, the
   *  zoom row or the sheet peek. Snaps, or eases when `isEased` (a new fit
   *  target). */
  const fitView = useCallback(
    (isEased = false) => {
      const { layout: currentLayout } = paintStateRef.current;
      const ids = currentLayout.nodeIds;
      const goal = computeFitTransform(
        stageSizeRef.current,
        ids,
        getPos,
        currentLayout.radiusFor,
        fitOptionsFor({
          insets: stageFitRef.current.insets,
          nodeCount: ids.length,
          anchor: getPos(focus) ?? ORIGIN,
        }),
      );
      if (isEased && !isReducedMotion) {
        startFitTween({
          transformRef,
          frameHandleRef: panFrameRef,
          goal,
          paint,
        });
        return;
      }
      if (panFrameRef.current !== null) {
        cancelAnimationFrame(panFrameRef.current);
        panFrameRef.current = null;
      }
      transformRef.current = goal;
      paint();
    },
    [getPos, paint, paintStateRef, focus, isReducedMotion],
  );

  /** A5: settle and resize refit the view until the admin pans or zooms. */
  const refitUnlessAdjusted = useCallback(() => {
    if (hasUserAdjustedViewRef.current) paint();
    else fitView();
  }, [fitView, paint]);

  const refitToNewTarget = useCallback(() => {
    hasUserAdjustedViewRef.current = false;
    fitView(true);
  }, [fitView]);

  useStageMeasure({
    stageRef,
    stageSizeRef,
    stageFitRef,
    isCompactViewport,
    isPathBarShown,
    fitTargetKey,
    refitUnlessAdjusted,
    refitToNewTarget,
  });

  const markViewAdjusted = useCallback(() => {
    hasUserAdjustedViewRef.current = true;
  }, []);

  /** Fit and Reset: clear the manual-view flag and frame everything. */
  const fit = useCallback(() => {
    hasUserAdjustedViewRef.current = false;
    fitView();
  }, [fitView]);

  // A focus change starts a fresh view: the next settle fits again.
  useLayoutEffect(() => {
    hasUserAdjustedViewRef.current = false;
  }, [focus]);

  // Centre requests pan with an eased rAF (zoom unchanged) to the middle of
  // the stage above the phone sheet. A dragged node is centred where it
  // sits; others at their ring target when there is one. A request for a
  // node that is not laid out yet waits for the next layout.
  useEffect(() => {
    if (!centerRequest) return;
    if (handledCenterNonceRef.current === centerRequest.nonce) return;
    const targetId = centerRequest.id;
    const position =
      (pinnedRef.current.has(targetId) ? getPos(targetId) : undefined) ??
      layout.ringTargets?.get(targetId) ??
      (targetId === focus ? ORIGIN : getPos(targetId));
    if (!position) return;
    handledCenterNonceRef.current = centerRequest.nonce;
    hasUserAdjustedViewRef.current = true;
    const stageSize = stageSizeRef.current;
    startCenterPan({
      transformRef,
      frameHandleRef: panFrameRef,
      stageSize: {
        width: stageSize.width,
        height: stageSize.height - stageFitRef.current.occludedBottom,
      },
      position,
      isReducedMotion,
      paint,
    });
  }, [centerRequest, layout, focus, getPos, isReducedMotion, paint, pinnedRef]);

  useEffect(
    () => () => {
      if (panFrameRef.current !== null) {
        cancelAnimationFrame(panFrameRef.current);
      }
    },
    [],
  );

  const zoomCenter = useCanvasZoom({
    svgRef,
    transformRef,
    paint,
    markViewAdjusted,
  });

  return {
    transformRef,
    stageSizeRef,
    hasUserAdjustedViewRef,
    paint,
    refitUnlessAdjusted,
    markViewAdjusted,
    fit,
    zoomCenter,
  };
}

/** Wheel zoom about the pointer and button zoom about the stage centre;
 *  returns the button zoom. Both mark the view as adjusted. */
function useCanvasZoom({
  svgRef,
  transformRef,
  paint,
  markViewAdjusted,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  transformRef: RefObject<Transform>;
  paint: () => void;
  markViewAdjusted: () => void;
}) {
  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) =>
      applyZoomAt(
        clientX,
        clientY,
        factor,
        svgRef.current,
        transformRef,
        paint,
      ),
    [paint, svgRef, transformRef],
  );

  useCanvasWheelZoom({ svgRef, zoomAt, markViewAdjusted });

  return useCallback(
    (factor: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      markViewAdjusted();
      const rect = svg.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    },
    [zoomAt, svgRef, markViewAdjusted],
  );
}

/** Native non-passive wheel listener, so zoom can preventDefault. */
function useCanvasWheelZoom({
  svgRef,
  zoomAt,
  markViewAdjusted,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  zoomAt: (clientX: number, clientY: number, factor: number) => void;
  markViewAdjusted: () => void;
}) {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      markViewAdjusted();
      zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 0.9);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [zoomAt, svgRef, markViewAdjusted]);
}
