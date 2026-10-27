import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OpenedFileInfo } from "../model/pdfEditModel";
import { usePdfEditor } from "./usePdfEditor";

function info(id: string, pageCount: number): OpenedFileInfo {
  return {
    id,
    name: `${id}.pdf`,
    pageCount,
    toneIndex: 0,
    isSigned: false,
    isLarge: false,
  };
}

function renderEditor() {
  return renderHook(() => usePdfEditor());
}

function pageIdsOf(pages: readonly { id: string }[]): string[] {
  return pages.map((page) => page.id);
}

describe("usePdfEditor", () => {
  it("starts empty with nothing to undo", () => {
    const { result } = renderEditor();

    expect(result.current.pages).toEqual([]);
    expect(result.current.files).toEqual([]);
    expect(result.current.chunkCount).toBe(0);
    expect(result.current.isUndoAvailable).toBe(false);
    expect(result.current.isRedoAvailable).toBe(false);
    expect(result.current.isWholeGridSelected).toBe(false);
    expect(result.current.lastEdit).toBeNull();
  });

  it("adds a file's pages with nothing selected", () => {
    const { result } = renderEditor();
    const firstFile = info("file-1", 4);

    act(() => result.current.addFile(firstFile));

    expect(result.current.pages).toHaveLength(4);
    expect(result.current.files).toEqual([firstFile]);
    expect(result.current.filesById.get("file-1")).toBe(firstFile);
    expect(result.current.selection.selectedIds.size).toBe(0);
    expect(result.current.lastEdit).toMatchObject({ kind: "added", count: 4 });
    expect(result.current.isUndoAvailable).toBe(true);
  });

  it("removes the selection, clears it, and undo brings the page back", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 4)));

    act(() => result.current.togglePage("file-1:2"));
    expect(result.current.selection.selectedIds.has("file-1:2")).toBe(true);

    act(() => result.current.removeSelected());
    expect(result.current.pages).toHaveLength(3);
    expect(pageIdsOf(result.current.pages)).not.toContain("file-1:2");
    expect(result.current.selection.selectedIds.size).toBe(0);
    expect(result.current.lastEdit).toMatchObject({
      kind: "removed",
      count: 1,
    });

    act(() => result.current.undo());
    expect(pageIdsOf(result.current.pages)).toEqual([
      "file-1:0",
      "file-1:1",
      "file-1:2",
      "file-1:3",
    ]);
    expect(result.current.lastEdit).toMatchObject({ kind: "undone" });
    expect(result.current.isRedoAvailable).toBe(true);

    act(() => result.current.redo());
    expect(result.current.pages).toHaveLength(3);
    expect(result.current.lastEdit).toMatchObject({ kind: "redone" });
  });

  it("refuses to remove the whole grid", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 4)));

    act(() => result.current.selectAll());
    expect(result.current.isWholeGridSelected).toBe(true);

    act(() => result.current.removeSelected());
    expect(result.current.pages).toHaveLength(4);
    expect(result.current.selection.selectedIds.size).toBe(4);
    expect(result.current.lastEdit).toMatchObject({ kind: "added" });

    // The only step on the undo stack is the addFile.
    act(() => result.current.undo());
    expect(result.current.pages).toEqual([]);
    expect(result.current.isUndoAvailable).toBe(false);
  });

  it("drops a file from the file list once its last page is gone", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 2)));
    act(() => result.current.addFile(info("file-2", 2)));

    act(() => result.current.togglePage("file-2:0"));
    act(() => result.current.selectRange("file-2:1"));
    expect([...result.current.selection.selectedIds].sort()).toEqual([
      "file-2:0",
      "file-2:1",
    ]);

    act(() => result.current.removeSelected());
    expect(result.current.files.map((file) => file.id)).toEqual(["file-1"]);
    expect(result.current.filesById.has("file-2")).toBe(true);

    act(() => result.current.undo());
    expect(result.current.files.map((file) => file.id)).toEqual([
      "file-1",
      "file-2",
    ]);
  });

  it("counts chunks from effective cuts", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 3)));
    expect(result.current.chunkCount).toBe(1);

    act(() => result.current.toggleCut("file-1:0"));
    expect(result.current.chunkCount).toBe(2);
    expect(result.current.lastEdit).toMatchObject({ kind: "cutAdded" });
    const sequenceAfterCut = result.current.lastEdit?.sequence;

    act(() => result.current.toggleCut("file-1:2"));
    expect(result.current.chunkCount).toBe(2);
    expect(result.current.lastEdit?.sequence).toBe(sequenceAfterCut);

    act(() => result.current.toggleCut("file-1:0"));
    expect(result.current.chunkCount).toBe(1);
    expect(result.current.lastEdit).toMatchObject({ kind: "cutRemoved" });
  });

  it("numbers every recorded edit so a repeated message is announced again", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 3)));
    act(() => result.current.togglePage("file-1:1"));

    act(() => result.current.rotateSelected("right"));
    const firstRotation = result.current.lastEdit;
    act(() => result.current.rotateSelected("right"));
    const secondRotation = result.current.lastEdit;

    expect(firstRotation).toMatchObject({ kind: "rotated", count: 1 });
    expect(secondRotation).toMatchObject({ kind: "rotated", count: 1 });
    expect(secondRotation?.sequence).toBe((firstRotation?.sequence ?? 0) + 1);
    expect(result.current.pages[1]?.rotation).toBe(180);
  });

  it("moves pages by drag and by nudge", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 3)));

    act(() => result.current.movePage("file-1:0", 2));
    expect(pageIdsOf(result.current.pages)).toEqual([
      "file-1:1",
      "file-1:2",
      "file-1:0",
    ]);
    expect(result.current.lastEdit).toMatchObject({ kind: "moved", count: 1 });

    act(() => result.current.togglePage("file-1:0"));
    act(() => result.current.nudgeSelected(-1));
    expect(pageIdsOf(result.current.pages)).toEqual([
      "file-1:1",
      "file-1:0",
      "file-1:2",
    ]);
    expect(result.current.lastEdit).toMatchObject({ kind: "moved", count: 1 });
  });

  it("leaves history alone when an edit changes nothing", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 2)));
    const editBefore = result.current.lastEdit;

    act(() => result.current.rotateSelected("left"));
    act(() => result.current.removeSelected());
    act(() => result.current.movePage("file-1:0", 0));

    expect(result.current.lastEdit).toBe(editBefore);
    act(() => result.current.undo());
    expect(result.current.isUndoAvailable).toBe(false);
  });

  it("prunes the selection when undo takes a selected page away", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 2)));
    act(() => result.current.addFile(info("file-2", 2)));
    act(() => result.current.togglePage("file-1:0"));
    act(() => result.current.togglePage("file-2:0"));

    act(() => result.current.undo());

    expect([...result.current.selection.selectedIds]).toEqual(["file-1:0"]);
    expect(result.current.selection.anchorId).toBeNull();
  });

  it("clears the selection on request", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 2)));
    act(() => result.current.selectAll());

    act(() => result.current.clearSelection());

    expect(result.current.selection.selectedIds.size).toBe(0);
    expect(result.current.isWholeGridSelected).toBe(false);
  });

  it("starts over on reset", () => {
    const { result } = renderEditor();
    act(() => result.current.addFile(info("file-1", 2)));
    act(() => result.current.togglePage("file-1:0"));

    act(() => result.current.reset());

    expect(result.current.pages).toEqual([]);
    expect(result.current.files).toEqual([]);
    expect(result.current.filesById.size).toBe(0);
    expect(result.current.selection.selectedIds.size).toBe(0);
    expect(result.current.isUndoAvailable).toBe(false);
    expect(result.current.lastEdit).toBeNull();
  });
});
