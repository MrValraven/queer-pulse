import { useCallback, useMemo, useReducer, useState } from "react";
import {
  canRedo,
  canUndo,
  EMPTY_HISTORY,
  pdfEditReducer,
} from "../model/pdfEditHistory";
import type { EditHistory, PdfEditAction } from "../model/pdfEditHistory";
import { splitIntoChunks } from "../model/pdfEditModel";
import type {
  NudgeDirection,
  OpenedFileInfo,
  PageItem,
  RotationDirection,
} from "../model/pdfEditModel";
import {
  EMPTY_SELECTION,
  isWholeGridSelected as isSelectionWholeGrid,
  pruneSelection,
  selectAllPages,
  selectPageRange,
  togglePageSelection,
} from "../model/pdfSelection";
import type { PageSelection } from "../model/pdfSelection";

export type PdfEditKind =
  | "removed"
  | "rotated"
  | "moved"
  | "added"
  | "cutAdded"
  | "cutRemoved"
  | "undone"
  | "redone";

export interface PdfLastEdit {
  readonly kind: PdfEditKind;
  readonly count: number;
  readonly sequence: number;
}

export interface PdfEditorApi {
  pages: readonly PageItem[];
  /** Files that still have a page in the grid, in open order. */
  files: readonly OpenedFileInfo[];
  /** Every file opened since the last reset, so undo can bring one back. */
  filesById: ReadonlyMap<string, OpenedFileInfo>;
  /** Always pruned against the pages. */
  selection: PageSelection;
  isWholeGridSelected: boolean;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  chunkCount: number;
  lastEdit: PdfLastEdit | null;
  addFile(info: OpenedFileInfo): void;
  togglePage(pageId: string): void;
  selectRange(pageId: string): void;
  selectAll(): void;
  clearSelection(): void;
  removeSelected(): void;
  rotateSelected(direction: RotationDirection): void;
  nudgeSelected(direction: NudgeDirection): void;
  movePage(pageId: string, toIndex: number): void;
  toggleCut(pageId: string): void;
  undo(): void;
  redo(): void;
  reset(): void;
}

interface EditorState {
  readonly history: EditHistory;
  readonly lastEdit: PdfLastEdit | null;
  readonly editSequence: number;
}

const INITIAL_EDITOR_STATE: EditorState = {
  history: EMPTY_HISTORY,
  lastEdit: null,
  editSequence: 0,
};

function countPresent(
  pages: readonly PageItem[],
  pageIds: ReadonlySet<string>,
): number {
  return pages.filter((page) => pageIds.has(page.id)).length;
}

/** What a recorded edit did, for the live announcement. */
function describeEdit(
  previous: EditHistory,
  next: EditHistory,
  action: PdfEditAction,
): Omit<PdfLastEdit, "sequence"> | null {
  switch (action.type) {
    case "addFile":
      return { kind: "added", count: action.pageCount };
    case "remove":
      return {
        kind: "removed",
        count: previous.present.length - next.present.length,
      };
    case "rotate":
      return {
        kind: "rotated",
        count: countPresent(previous.present, action.pageIds),
      };
    case "nudge":
      return {
        kind: "moved",
        count: countPresent(previous.present, action.pageIds),
      };
    case "move":
      return { kind: "moved", count: 1 };
    case "toggleCut": {
      const page = previous.present.find(
        (candidate) => candidate.id === action.pageId,
      );
      return { kind: page?.hasCutAfter ? "cutRemoved" : "cutAdded", count: 1 };
    }
    case "undo":
      return { kind: "undone", count: 1 };
    case "redo":
      return { kind: "redone", count: 1 };
    case "reset":
      return null;
  }
}

/**
 * Wraps the history reducer. An edit counts as recorded when the history
 * reference changes, and each recorded edit gets the next sequence number.
 */
function editorReducer(state: EditorState, action: PdfEditAction): EditorState {
  if (action.type === "reset") {
    return { ...INITIAL_EDITOR_STATE, editSequence: state.editSequence };
  }
  const history = pdfEditReducer(state.history, action);
  if (history === state.history) return state;
  const editSequence = state.editSequence + 1;
  const description = describeEdit(state.history, history, action);
  return {
    history,
    editSequence,
    lastEdit: description ? { ...description, sequence: editSequence } : null,
  };
}

export function usePdfEditor(): PdfEditorApi {
  const [editorState, dispatch] = useReducer(
    editorReducer,
    INITIAL_EDITOR_STATE,
  );
  const [openedFiles, setOpenedFiles] = useState<readonly OpenedFileInfo[]>([]);
  const [storedSelection, setStoredSelection] =
    useState<PageSelection>(EMPTY_SELECTION);

  const { history, lastEdit } = editorState;
  const pages = history.present;
  const selection = useMemo(
    () => pruneSelection(storedSelection, pages),
    [storedSelection, pages],
  );
  const isWholeGridSelected = isSelectionWholeGrid(selection, pages);
  const filesById = useMemo(
    () => new Map(openedFiles.map((file) => [file.id, file])),
    [openedFiles],
  );
  const files = useMemo(() => {
    const fileIdsInGrid = new Set(pages.map((page) => page.fileId));
    return openedFiles.filter((file) => fileIdsInGrid.has(file.id));
  }, [openedFiles, pages]);
  const chunkCount = useMemo(() => splitIntoChunks(pages).length, [pages]);

  const addFile = useCallback(
    (info: OpenedFileInfo) => {
      if (filesById.has(info.id)) return;
      setOpenedFiles((current) => [...current, info]);
      dispatch({
        type: "addFile",
        fileId: info.id,
        pageCount: info.pageCount,
      });
    },
    [filesById],
  );

  const togglePage = useCallback(
    (pageId: string) =>
      setStoredSelection((current) =>
        togglePageSelection(pruneSelection(current, pages), pageId),
      ),
    [pages],
  );
  const selectRange = useCallback(
    (pageId: string) =>
      setStoredSelection((current) =>
        selectPageRange(pruneSelection(current, pages), pages, pageId),
      ),
    [pages],
  );
  const selectAll = useCallback(
    () => setStoredSelection(selectAllPages(pages)),
    [pages],
  );
  const clearSelection = useCallback(
    () => setStoredSelection(EMPTY_SELECTION),
    [],
  );

  const { selectedIds } = selection;
  const hasSelection = selectedIds.size > 0;

  const removeSelected = useCallback(() => {
    // The grid always keeps one page, so the whole grid is never removed.
    if (!hasSelection || isWholeGridSelected) return;
    dispatch({ type: "remove", pageIds: selectedIds });
    setStoredSelection(EMPTY_SELECTION);
  }, [hasSelection, isWholeGridSelected, selectedIds]);
  const rotateSelected = useCallback(
    (direction: RotationDirection) => {
      if (hasSelection)
        dispatch({ type: "rotate", pageIds: selectedIds, direction });
    },
    [hasSelection, selectedIds],
  );
  const nudgeSelected = useCallback(
    (direction: NudgeDirection) => {
      if (hasSelection)
        dispatch({ type: "nudge", pageIds: selectedIds, direction });
    },
    [hasSelection, selectedIds],
  );

  const movePage = useCallback(
    (pageId: string, toIndex: number) =>
      dispatch({ type: "move", pageId, toIndex }),
    [],
  );
  const toggleCut = useCallback(
    (pageId: string) => dispatch({ type: "toggleCut", pageId }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    setOpenedFiles([]);
    setStoredSelection(EMPTY_SELECTION);
  }, []);

  return {
    pages,
    files,
    filesById,
    selection,
    isWholeGridSelected,
    isUndoAvailable: canUndo(history),
    isRedoAvailable: canRedo(history),
    chunkCount,
    lastEdit,
    addFile,
    togglePage,
    selectRange,
    selectAll,
    clearSelection,
    removeSelected,
    rotateSelected,
    nudgeSelected,
    movePage,
    toggleCut,
    undo,
    redo,
    reset,
  };
}
