import { useCallback, useMemo } from "react";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TrustGraph, VouchEdge } from "./trustGraph/trustGraphModel";
import { findTrustPath, type TrustPath } from "./trustGraph/trustPath";
import type {
  CenterRequest,
  InviteBubble,
  VouchGraphFilters,
  VouchGraphUrlView,
  VouchLayoutKind,
  VouchMode,
} from "./vouchGraph.types";
import { countActiveFilters, EMPTY_FILTERS } from "./vouchGraphFilters";
import { matchIdsInView } from "./vouchGraphSearch";
import { useVouchReplay } from "./useVouchReplay";
import { useVouchGraphViewState } from "./useVouchGraphViewState";
import { deriveVisibleGraph } from "./vouchVisibility";

export type { VouchMode };

export interface VouchGraphController {
  focus: string;
  mode: VouchMode;
  selectedId: string | null;
  hoveredId: string | null;
  pathA: string | null;
  pathB: string | null;
  filters: VouchGraphFilters;
  search: string;
  isListView: boolean;
  crumbs: string[];
  expanded: ReadonlySet<string>;
  expandedBubbles: ReadonlySet<string>;
  visIds: string[];
  visEdges: VouchEdge[];
  bubbles: InviteBubble[];
  layoutKind: VouchLayoutKind;
  isFilteredEmpty: boolean;
  path: TrustPath | null;
  searchMatchIds: ReadonlySet<string>;
  highlightedRingId: string | null;
  centerRequest: CenterRequest | null;
  activeFilterCount: number;
  isScenesAvailable: boolean;
  isCompactViewport: boolean;
  timeCut: number;
  eventCount: number;
  currentEvent: VouchEdge | null;
  isFullyRevealed: boolean;
  isReplaying: boolean;
  activeEdgeId: string | null;
  isEdgeRevealed: (edgeId: string) => boolean;
  urlView: VouchGraphUrlView;
  setSearch: (value: string) => void;
  setTime: (step: number) => void;
  select: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  centerOn: (id: string) => void;
  recenter: (id: string) => void;
  focusCase: (subjectId: string) => void;
  showRing: (ringId: string) => void;
  gotoCrumb: (index: number) => void;
  toggleExpand: (id: string) => void;
  toggleBubble: (parentId: string) => void;
  pickPath: (id: string) => void;
  clearPath: () => void;
  changeMode: (mode: VouchMode) => void;
  setFilters: (next: VouchGraphFilters) => void;
  clearFilters: () => void;
  setListView: (isOn: boolean) => void;
  replay: () => void;
  stopReplay: () => void;
}

/**
 * The one controller for the trust-network modal: focus, selection, hover,
 * the two-point trust path, filters, search, expanded neighbourhoods and
 * invite bubbles, the crumb trail, replay, and centre requests. Derives the
 * visible node and edge sets from the fetched `graph` (demo fixture or live
 * `/admin/trust-network` data). `urlView` changes only when the shareable
 * view changes, so callers sync the URL from it.
 */
export function useVouchGraph(
  graph: TrustGraph,
  initialView: VouchGraphUrlView,
  options: { onJumpToMember: (slug: string) => void },
): VouchGraphController {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { onJumpToMember } = options;
  const isCompactViewport = useMediaQuery("(max-width: 920px)");
  const [state, dispatch] = useVouchGraphViewState(graph, initialView);
  const { view, search } = state;
  const replayState = useVouchReplay(graph);
  const { isEdgeRevealed } = replayState;

  const allPersonIds = useMemo(
    () => graph.people.map((person) => person.id),
    [graph],
  );
  // Matches across the whole loaded graph pin those members (they skip the
  // filters and stay out of bubbles); the highlight set is the visible part.
  const graphSearchMatchIds = useMemo(
    () => matchIdsInView(graph, allPersonIds, search),
    [graph, allPersonIds, search],
  );
  const pinnedIds = useMemo(() => {
    const ids = new Set(graphSearchMatchIds);
    [view.selectedId, view.pathA, view.pathB].forEach((id) => {
      if (id) ids.add(id);
    });
    return ids;
  }, [graphSearchMatchIds, view.selectedId, view.pathA, view.pathB]);

  const visible = useMemo(
    () =>
      deriveVisibleGraph({
        graph,
        focus: view.focus,
        mode: view.mode,
        expanded: state.expanded,
        expandedBubbles: state.expandedBubbles,
        filters: view.filters,
        isEdgeRevealed,
        pinnedIds,
      }),
    [
      graph,
      view.focus,
      view.mode,
      view.filters,
      state.expanded,
      state.expandedBubbles,
      isEdgeRevealed,
      pinnedIds,
    ],
  );
  const { visIds } = visible;

  const searchMatchIds = useMemo(() => {
    const visibleIdSet = new Set(visIds);
    return new Set(
      [...graphSearchMatchIds].filter((id) => visibleIdSet.has(id)),
    );
  }, [graphSearchMatchIds, visIds]);

  const path = useMemo(
    () =>
      view.pathA && view.pathB
        ? findTrustPath(graph, view.pathA, view.pathB, (edge) =>
            isEdgeRevealed(edge.id),
          )
        : null,
    [graph, view.pathA, view.pathB, isEdgeRevealed],
  );

  const isScenesAvailable = useMemo(() => {
    if (view.mode === "clusters") return true;
    const primarySceneIds = new Set<string>();
    for (const personId of visIds) {
      const sceneId = graph.peopleById[personId]?.sceneId;
      if (sceneId) primarySceneIds.add(sceneId);
      if (primarySceneIds.size >= 2) return true;
    }
    return false;
  }, [graph, visIds, view.mode]);

  const selectedRingId = view.selectedId
    ? (graph.peopleById[view.selectedId]?.ringId ?? null)
    : null;

  const select = useCallback(
    (id: string | null) => dispatch({ type: "select", id }),
    [dispatch],
  );
  const centerOn = useCallback(
    (id: string) => dispatch({ type: "centerOn", id }),
    [dispatch],
  );
  const recenter = useCallback(
    (id: string) => {
      if (graph.peopleById[id]?.private) {
        showToast(t("admin:vouchGraph.modal.privateToast"), "info");
        return;
      }
      dispatch({ type: "recenter", id });
    },
    [dispatch, graph, showToast, t],
  );
  const focusCase = useCallback(
    (subjectId: string) => {
      const subject = graph.peopleById[subjectId];
      if (!subject) {
        onJumpToMember(subjectId);
        return;
      }
      // A private subject keeps the current focus: select it to open its
      // case in the inspector, with no private-network toast.
      if (subject.private) {
        select(subjectId);
        return;
      }
      recenter(subjectId);
    },
    [graph, onJumpToMember, recenter, select],
  );
  const showRing = useCallback(
    (ringId: string) => {
      dispatch({ type: "showRing", ringId });
      const visibleIdSet = new Set(visIds);
      const firstMemberInView = graph
        .ringById(ringId)
        ?.memberIds.find((memberId) => visibleIdSet.has(memberId));
      if (firstMemberInView) centerOn(firstMemberInView);
    },
    [centerOn, dispatch, graph, visIds],
  );

  const actions = useMemo(
    () => ({
      setSearch: (value: string) => dispatch({ type: "setSearch", value }),
      setHovered: (id: string | null) => dispatch({ type: "setHovered", id }),
      gotoCrumb: (index: number) => dispatch({ type: "gotoCrumb", index }),
      toggleExpand: (id: string) => dispatch({ type: "toggleExpand", id }),
      toggleBubble: (parentId: string) =>
        dispatch({ type: "toggleBubble", parentId }),
      pickPath: (id: string) => dispatch({ type: "pickPath", id }),
      clearPath: () => dispatch({ type: "clearPath" }),
      changeMode: (mode: VouchMode) => dispatch({ type: "changeMode", mode }),
      setFilters: (next: VouchGraphFilters) =>
        dispatch({ type: "setFilters", filters: next }),
      clearFilters: () =>
        dispatch({ type: "setFilters", filters: EMPTY_FILTERS }),
      setListView: (isOn: boolean) => dispatch({ type: "setListView", isOn }),
    }),
    [dispatch],
  );

  return {
    focus: view.focus,
    mode: view.mode,
    selectedId: view.selectedId,
    hoveredId: state.hoveredId,
    pathA: view.pathA,
    pathB: view.pathB,
    filters: view.filters,
    search,
    isListView: view.isListView,
    crumbs: state.crumbs,
    expanded: state.expanded,
    expandedBubbles: state.expandedBubbles,
    visIds,
    visEdges: visible.visEdges,
    bubbles: visible.bubbles,
    layoutKind: visible.layoutKind,
    isFilteredEmpty: visible.isFilteredEmpty,
    path,
    searchMatchIds,
    highlightedRingId: state.ringHighlightOverride ?? selectedRingId,
    centerRequest: state.centerRequest,
    activeFilterCount: countActiveFilters(view.filters),
    isScenesAvailable,
    isCompactViewport,
    timeCut: replayState.timeCut,
    eventCount: replayState.eventCount,
    currentEvent: replayState.currentEvent,
    isFullyRevealed: replayState.isFullyRevealed,
    isReplaying: replayState.isReplaying,
    activeEdgeId: replayState.currentEvent?.id ?? null,
    isEdgeRevealed,
    urlView: view,
    ...actions,
    setTime: replayState.setTimeCut,
    select,
    centerOn,
    recenter,
    focusCase,
    showRing,
    replay: replayState.replay,
    stopReplay: replayState.stopReplay,
  };
}
