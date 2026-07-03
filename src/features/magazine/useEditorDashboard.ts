import { useReducer } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  PIECES,
  PITCHES,
  ME,
  stripEm,
  firstName,
  type Piece,
  type Pitch,
  type Editor,
  type Stage,
  type SortKey,
  type Filters,
  type TriageVerdict,
} from "./editorDashboard.data";

export type { TriageVerdict };
export type FilterKey = "fEditor" | "fStatus" | "fSection" | "sort";

export interface DashState {
  pieces: Piece[];
  pitches: Pitch[];
  selPitches: string[];
  me: Editor;
  q: string;
  fEditor: string;
  fStatus: string;
  fSection: string;
  sort: SortKey;
  myQueue: boolean;
}

type Action =
  | { type: "setStage"; id: string; stage: Stage }
  | { type: "assign"; id: string; editor: Editor }
  | { type: "removePitches"; ids: string[] }
  | { type: "toggleSelect"; id: string }
  | { type: "clearSelect" }
  | { type: "setMe"; me: Editor }
  | { type: "setQuery"; q: string }
  | { type: "setFilter"; key: FilterKey; value: string }
  | { type: "toggleMyQueue" }
  | { type: "reset" };

function init(): DashState {
  return {
    pieces: PIECES.map((p) => ({ ...p })),
    pitches: PITCHES.map((p) => ({ ...p })),
    selPitches: [],
    me: ME,
    q: "",
    fEditor: "all",
    fStatus: "all",
    fSection: "all",
    sort: "due",
    myQueue: false,
  };
}

function reducer(state: DashState, action: Action): DashState {
  switch (action.type) {
    case "setStage":
      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.id === action.id
            ? {
                ...p,
                stage: action.stage,
                blocked: action.stage === "Ready" ? null : p.blocked,
              }
            : p,
        ),
      };
    case "assign":
      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.id === action.id ? { ...p, editor: action.editor } : p,
        ),
      };
    case "removePitches": {
      const remove = new Set(action.ids);
      return {
        ...state,
        pitches: state.pitches.filter((p) => !remove.has(p.id)),
        selPitches: state.selPitches.filter((id) => !remove.has(id)),
      };
    }
    case "toggleSelect":
      return {
        ...state,
        selPitches: state.selPitches.includes(action.id)
          ? state.selPitches.filter((id) => id !== action.id)
          : [...state.selPitches, action.id],
      };
    case "clearSelect":
      return { ...state, selPitches: [] };
    case "setMe":
      return { ...state, me: action.me };
    case "setQuery":
      return { ...state, q: action.q };
    case "setFilter":
      return { ...state, [action.key]: action.value } as DashState;
    case "toggleMyQueue":
      return { ...state, myQueue: !state.myQueue };
    case "reset":
      return {
        ...state,
        q: "",
        fEditor: "all",
        fStatus: "all",
        fSection: "all",
        myQueue: false,
      };
    default:
      return state;
  }
}

const TRIAGE_LABEL: Record<TriageVerdict, string> = {
  yes: "Accepted",
  maybe: "Saved to Maybe",
  no: "Declined",
};

export interface EditorDashboard {
  state: DashState;
  filters: Filters;
  setStage: (piece: Piece, stage: Stage) => void;
  assign: (piece: Piece, editor: Editor) => void;
  handoff: (piece: Piece, editor: Editor) => void;
  triage: (id: string, verdict: TriageVerdict) => void;
  bulkTriage: (verdict: TriageVerdict) => void;
  toggleSelect: (id: string) => void;
  clearSelect: () => void;
  setMe: (me: Editor) => void;
  setQuery: (q: string) => void;
  setFilter: (key: FilterKey, value: string) => void;
  toggleMyQueue: () => void;
  reset: () => void;
  chaseSent: (piece: Piece) => void;
}

export function useEditorDashboard(): EditorDashboard {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const { showToast } = useToast();

  const filters: Filters = {
    q: state.q,
    fEditor: state.fEditor,
    fStatus: state.fStatus,
    fSection: state.fSection,
    sort: state.sort,
    myQueue: state.myQueue,
    me: state.me,
  };

  return {
    state,
    filters,
    setStage(piece, stage) {
      dispatch({ type: "setStage", id: piece.id, stage });
      showToast(`“${stripEm(piece.title)}” → ${stage}`, "success");
    },
    assign(piece, editor) {
      if (editor === piece.editor) return;
      dispatch({ type: "assign", id: piece.id, editor });
      showToast(`Reassigned to ${editor}`, "success");
    },
    handoff(piece, editor) {
      dispatch({ type: "assign", id: piece.id, editor });
      showToast(`Handed to ${editor} with a note`, "success");
    },
    triage(id, verdict) {
      const pitch = state.pitches.find((p) => p.id === id);
      dispatch({ type: "removePitches", ids: [id] });
      showToast(
        `${TRIAGE_LABEL[verdict]} · ${pitch?.name ?? ""}`,
        verdict === "no" ? "info" : "success",
      );
    },
    bulkTriage(verdict) {
      const ids = state.selPitches;
      if (!ids.length) return;
      dispatch({ type: "removePitches", ids });
      const label = {
        yes: "Accepted",
        maybe: "Moved to Maybe",
        no: "Declined",
      }[verdict];
      showToast(
        `${label} ${ids.length} pitch${ids.length > 1 ? "es" : ""} · templated replies sent`,
        "success",
      );
    },
    toggleSelect(id) {
      dispatch({ type: "toggleSelect", id });
    },
    clearSelect() {
      dispatch({ type: "clearSelect" });
    },
    setMe(me) {
      dispatch({ type: "setMe", me });
    },
    setQuery(q) {
      dispatch({ type: "setQuery", q });
    },
    setFilter(key, value) {
      dispatch({ type: "setFilter", key, value });
    },
    toggleMyQueue() {
      dispatch({ type: "toggleMyQueue" });
    },
    reset() {
      dispatch({ type: "reset" });
    },
    chaseSent(piece) {
      showToast(`Nudge sent to ${firstName(piece.author)}`, "success");
    },
  };
}
