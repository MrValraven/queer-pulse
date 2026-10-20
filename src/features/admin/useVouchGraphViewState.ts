import { useReducer } from "react";
import type { TrustGraph } from "./trustGraph/trustGraphModel";
import type {
  CenterRequest,
  VouchGraphFilters,
  VouchGraphUrlView,
  VouchMode,
} from "./vouchGraph.types";

/** Every piece of trust-network view state. `view` is the shareable part
 *  (it round-trips through the `tn*` URL params); the rest is session-only.
 *  The reducer keeps `view` referentially stable for session-only actions so
 *  a URL sync runs only when the shareable view really changed. */
export interface VouchGraphViewState {
  view: VouchGraphUrlView;
  crumbs: string[];
  expanded: ReadonlySet<string>;
  expandedBubbles: ReadonlySet<string>;
  search: string;
  hoveredId: string | null;
  centerRequest: CenterRequest | null;
  ringHighlightOverride: string | null;
}

export type VouchGraphViewAction =
  | { type: "setSearch"; value: string }
  | { type: "select"; id: string | null }
  | { type: "setHovered"; id: string | null }
  | { type: "centerOn"; id: string }
  | { type: "recenter"; id: string }
  | { type: "gotoCrumb"; index: number }
  | { type: "toggleExpand"; id: string }
  | { type: "toggleBubble"; parentId: string }
  | { type: "pickPath"; id: string }
  | { type: "clearPath" }
  | { type: "changeMode"; mode: VouchMode }
  | { type: "setFilters"; filters: VouchGraphFilters }
  | { type: "setListView"; isOn: boolean }
  | { type: "showRing"; ringId: string };

function toggleInSet(
  source: ReadonlySet<string>,
  id: string,
): ReadonlySet<string> {
  const next = new Set(source);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

const EMPTY_SET: ReadonlySet<string> = new Set();

/** Moves the focus to `focusId`: a fresh neighbourhood with `focusId`
 *  selected and the ring highlight back on the selection. */
function withFocus(
  state: VouchGraphViewState,
  focusId: string,
  crumbs: string[],
): VouchGraphViewState {
  return {
    ...state,
    view: { ...state.view, focus: focusId, selectedId: focusId },
    crumbs,
    expanded: EMPTY_SET,
    expandedBubbles: EMPTY_SET,
    ringHighlightOverride: null,
  };
}

export function vouchGraphViewReducer(
  state: VouchGraphViewState,
  action: VouchGraphViewAction,
): VouchGraphViewState {
  const { view } = state;
  switch (action.type) {
    case "setSearch":
      return { ...state, search: action.value };
    case "select":
      if (view.selectedId === action.id) return state;
      return {
        ...state,
        view: { ...view, selectedId: action.id },
        ringHighlightOverride: null,
      };
    case "setHovered":
      if (state.hoveredId === action.id) return state;
      return { ...state, hoveredId: action.id };
    case "centerOn":
      return {
        ...state,
        centerRequest: {
          id: action.id,
          nonce: (state.centerRequest?.nonce ?? 0) + 1,
        },
      };
    case "recenter":
      if (action.id === view.focus) {
        return vouchGraphViewReducer(state, { type: "select", id: action.id });
      }
      return withFocus(state, action.id, [...state.crumbs, view.focus]);
    case "gotoCrumb": {
      const target = state.crumbs[action.index];
      if (target === undefined) return state;
      return withFocus(state, target, state.crumbs.slice(0, action.index));
    }
    case "toggleExpand":
      return { ...state, expanded: toggleInSet(state.expanded, action.id) };
    case "toggleBubble":
      return {
        ...state,
        expandedBubbles: toggleInSet(state.expandedBubbles, action.parentId),
      };
    case "pickPath": {
      // Picking the first person again would compare them with themselves.
      if (action.id === view.pathA) return state;
      const isStartingOver = !view.pathA || Boolean(view.pathB);
      return {
        ...state,
        view: isStartingOver
          ? { ...view, pathA: action.id, pathB: null }
          : { ...view, pathB: action.id },
      };
    }
    case "clearPath":
      if (!view.pathA && !view.pathB) return state;
      return { ...state, view: { ...view, pathA: null, pathB: null } };
    case "changeMode":
      if (view.mode === action.mode) {
        // Choosing Safety while already there returns to the case list.
        if (action.mode !== "safety" || view.selectedId === null) return state;
        return { ...state, view: { ...view, selectedId: null } };
      }
      return {
        ...state,
        view: {
          ...view,
          mode: action.mode,
          // The Safety tab opens on its triage list, so it starts with
          // nothing selected.
          selectedId: action.mode === "safety" ? null : view.selectedId,
        },
      };
    case "setFilters":
      return { ...state, view: { ...view, filters: action.filters } };
    case "setListView":
      if (view.isListView === action.isOn) return state;
      return { ...state, view: { ...view, isListView: action.isOn } };
    case "showRing":
      return { ...state, ringHighlightOverride: action.ringId };
  }
}

/** Drops ids the loaded graph does not hold, so a stale or hand-edited
 *  link opens on a valid view. Selection falls back to the focus on every
 *  viewport (the phone sheet opens in its peek state), except in Safety,
 *  which opens on its triage list. */
function initialState(input: {
  graph: TrustGraph;
  initialView: VouchGraphUrlView;
}): VouchGraphViewState {
  const { graph, initialView } = input;
  const knownOrNull = (id: string | null): string | null =>
    id && graph.peopleById[id] ? id : null;
  return {
    view: {
      ...initialView,
      selectedId:
        knownOrNull(initialView.selectedId) ??
        (initialView.mode === "safety" ? null : initialView.focus),
      pathA: knownOrNull(initialView.pathA),
      pathB: knownOrNull(initialView.pathA)
        ? knownOrNull(initialView.pathB)
        : null,
    },
    crumbs: [],
    expanded: EMPTY_SET,
    expandedBubbles: EMPTY_SET,
    search: "",
    hoveredId: null,
    centerRequest: null,
    ringHighlightOverride: null,
  };
}

export function useVouchGraphViewState(
  graph: TrustGraph,
  initialView: VouchGraphUrlView,
) {
  return useReducer(
    vouchGraphViewReducer,
    { graph, initialView },
    initialState,
  );
}
