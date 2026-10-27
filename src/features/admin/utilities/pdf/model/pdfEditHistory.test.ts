import { describe, expect, it } from "vitest";
import {
  EMPTY_HISTORY,
  canRedo,
  canUndo,
  pdfEditReducer,
} from "./pdfEditHistory";
import type { PageItem } from "./pdfEditModel";

function pageAt(pages: readonly PageItem[], index: number): PageItem {
  const page = pages[index];
  if (!page) throw new Error(`Test fixture has no page at index ${index}`);
  return page;
}

const loaded = pdfEditReducer(EMPTY_HISTORY, {
  type: "addFile",
  fileId: "file-1",
  pageCount: 4,
});

describe("pdfEditReducer", () => {
  it("loads a file as one undoable step", () => {
    expect(loaded.present).toHaveLength(4);
    expect(canUndo(loaded)).toBe(true);
    expect(canRedo(loaded)).toBe(false);
  });

  it("undo brings a removed page back and redo removes it again", () => {
    const removed = pdfEditReducer(loaded, {
      type: "remove",
      pageIds: new Set(["file-1:2"]),
    });
    const undone = pdfEditReducer(removed, { type: "undo" });
    expect(undone.present).toHaveLength(4);
    expect(pdfEditReducer(undone, { type: "redo" }).present).toHaveLength(3);
  });

  it("restores a cut with its page on undo", () => {
    const cut = pdfEditReducer(loaded, {
      type: "toggleCut",
      pageId: "file-1:1",
    });
    const removed = pdfEditReducer(cut, {
      type: "remove",
      pageIds: new Set(["file-1:1"]),
    });
    expect(
      pageAt(pdfEditReducer(removed, { type: "undo" }).present, 1).hasCutAfter,
    ).toBe(true);
  });

  it("records no step for an edit that changes nothing", () => {
    const all = new Set(loaded.present.map((page) => page.id));
    expect(pdfEditReducer(loaded, { type: "remove", pageIds: all })).toBe(
      loaded,
    );
  });

  it("records no step for a cut on the last page", () => {
    expect(
      pdfEditReducer(loaded, { type: "toggleCut", pageId: "file-1:3" }),
    ).toBe(loaded);
  });

  it("records no step for a blocked nudge or a move to the same index", () => {
    expect(
      pdfEditReducer(loaded, {
        type: "nudge",
        pageIds: new Set(["file-1:0"]),
        direction: -1,
      }),
    ).toBe(loaded);
    expect(
      pdfEditReducer(loaded, { type: "move", pageId: "file-1:1", toIndex: 1 }),
    ).toBe(loaded);
  });

  it("clears redo when a new edit follows an undo", () => {
    const rotated = pdfEditReducer(loaded, {
      type: "rotate",
      pageIds: new Set(["file-1:0"]),
      direction: "right",
    });
    const undone = pdfEditReducer(rotated, { type: "undo" });
    expect(canRedo(undone)).toBe(true);
    const moved = pdfEditReducer(undone, {
      type: "move",
      pageId: "file-1:0",
      toIndex: 3,
    });
    expect(canRedo(moved)).toBe(false);
  });

  it("undoing an added file takes its pages out", () => {
    expect(pdfEditReducer(loaded, { type: "undo" }).present).toEqual([]);
  });

  it("returns the same history for undo and redo with nothing to step to", () => {
    expect(pdfEditReducer(EMPTY_HISTORY, { type: "undo" })).toBe(EMPTY_HISTORY);
    expect(pdfEditReducer(loaded, { type: "redo" })).toBe(loaded);
  });

  it("reset empties present, past and future", () => {
    const undone = pdfEditReducer(loaded, { type: "undo" });
    expect(canRedo(undone)).toBe(true);
    expect(pdfEditReducer(loaded, { type: "reset" })).toEqual(EMPTY_HISTORY);
    expect(pdfEditReducer(undone, { type: "reset" })).toEqual(EMPTY_HISTORY);
  });
});
