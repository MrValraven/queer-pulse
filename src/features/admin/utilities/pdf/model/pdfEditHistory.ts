import {
  appendFilePages,
  movePage,
  nudgePages,
  removePages,
  rotatePages,
  toggleCut,
  type NudgeDirection,
  type PageItem,
  type RotationDirection,
} from "./pdfEditModel";

export interface EditHistory {
  readonly past: readonly (readonly PageItem[])[];
  readonly present: readonly PageItem[];
  readonly future: readonly (readonly PageItem[])[];
}

export type PdfEditAction =
  | { type: "addFile"; fileId: string; pageCount: number }
  | { type: "remove"; pageIds: ReadonlySet<string> }
  | {
      type: "rotate";
      pageIds: ReadonlySet<string>;
      direction: RotationDirection;
    }
  | { type: "move"; pageId: string; toIndex: number }
  | { type: "nudge"; pageIds: ReadonlySet<string>; direction: NudgeDirection }
  | { type: "toggleCut"; pageId: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

export const EMPTY_HISTORY: EditHistory = { past: [], present: [], future: [] };

export function canUndo(history: EditHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: EditHistory): boolean {
  return history.future.length > 0;
}

function nextPages(
  present: readonly PageItem[],
  action: PdfEditAction,
): readonly PageItem[] {
  switch (action.type) {
    case "addFile":
      return appendFilePages(present, action.fileId, action.pageCount);
    case "remove":
      return removePages(present, action.pageIds);
    case "rotate":
      return rotatePages(present, action.pageIds, action.direction);
    case "move":
      return movePage(present, action.pageId, action.toIndex);
    case "nudge":
      return nudgePages(present, action.pageIds, action.direction);
    case "toggleCut":
      return toggleCut(present, action.pageId);
    default:
      return present;
  }
}

export function pdfEditReducer(
  history: EditHistory,
  action: PdfEditAction,
): EditHistory {
  if (action.type === "reset") return EMPTY_HISTORY;
  if (action.type === "undo") {
    const previous = history.past.at(-1);
    if (!previous) return history;
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    };
  }
  if (action.type === "redo") {
    const [following, ...remaining] = history.future;
    if (!following) return history;
    return {
      past: [...history.past, history.present],
      present: following,
      future: remaining,
    };
  }
  const next = nextPages(history.present, action);
  if (next === history.present) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: [],
  };
}
