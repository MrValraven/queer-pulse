import { describe, expect, it } from "vitest";
import { appendFilePages } from "./pdfEditModel";
import {
  EMPTY_SELECTION,
  isWholeGridSelected,
  nextGridFocusIndex,
  pruneSelection,
  selectAllPages,
  selectPageRange,
  togglePageSelection,
} from "./pdfSelection";

const fourPages = appendFilePages([], "file-1", 4);

describe("pdfSelection", () => {
  it("toggles a page and moves the anchor", () => {
    const picked = togglePageSelection(EMPTY_SELECTION, "file-1:1");
    expect(picked.selectedIds.size).toBe(1);
    expect(picked.anchorId).toBe("file-1:1");
    const cleared = togglePageSelection(picked, "file-1:1");
    expect(cleared.selectedIds.size).toBe(0);
    expect(cleared.anchorId).toBe("file-1:1");
  });

  it("selects a range from the anchor and keeps earlier picks", () => {
    const picked = togglePageSelection(
      togglePageSelection(EMPTY_SELECTION, "file-1:0"),
      "file-1:1",
    );
    const ranged = selectPageRange(picked, fourPages, "file-1:3");
    expect([...ranged.selectedIds].sort()).toEqual([
      "file-1:0",
      "file-1:1",
      "file-1:2",
      "file-1:3",
    ]);
  });

  it("selects a range running backwards from the anchor", () => {
    const anchored = togglePageSelection(EMPTY_SELECTION, "file-1:3");
    const ranged = selectPageRange(anchored, fourPages, "file-1:1");
    expect([...ranged.selectedIds].sort()).toEqual([
      "file-1:1",
      "file-1:2",
      "file-1:3",
    ]);
  });

  it("treats a range with no anchor as a toggle", () => {
    expect(
      selectPageRange(EMPTY_SELECTION, fourPages, "file-1:2").selectedIds,
    ).toEqual(new Set(["file-1:2"]));
  });

  it("prunes removed pages and clears an anchor that was removed", () => {
    const picked = togglePageSelection(
      togglePageSelection(EMPTY_SELECTION, "file-1:0"),
      "file-1:2",
    );
    const remaining = fourPages.filter((page) => page.id !== "file-1:2");
    const pruned = pruneSelection(picked, remaining);
    expect([...pruned.selectedIds]).toEqual(["file-1:0"]);
    expect(pruned.anchorId).toBeNull();
  });

  it("keeps the same object when pruning changes nothing", () => {
    const picked = togglePageSelection(EMPTY_SELECTION, "file-1:1");
    expect(pruneSelection(picked, fourPages)).toBe(picked);
    expect(pruneSelection(EMPTY_SELECTION, fourPages)).toBe(EMPTY_SELECTION);
  });

  it("knows when the whole grid is selected", () => {
    expect(isWholeGridSelected(selectAllPages(fourPages), fourPages)).toBe(
      true,
    );
    expect(isWholeGridSelected(EMPTY_SELECTION, [])).toBe(false);
    expect(
      isWholeGridSelected(
        togglePageSelection(EMPTY_SELECTION, "file-1:0"),
        fourPages,
      ),
    ).toBe(false);
  });

  it("moves grid focus by row and column", () => {
    expect(nextGridFocusIndex(0, "ArrowRight", 3, 5)).toBe(1);
    expect(nextGridFocusIndex(0, "ArrowLeft", 3, 5)).toBe(0);
    expect(nextGridFocusIndex(4, "ArrowRight", 3, 5)).toBe(4);
    expect(nextGridFocusIndex(1, "ArrowDown", 3, 5)).toBe(4);
    expect(nextGridFocusIndex(2, "ArrowDown", 3, 5)).toBe(4);
    expect(nextGridFocusIndex(3, "ArrowDown", 3, 5)).toBe(3);
    expect(nextGridFocusIndex(4, "ArrowUp", 3, 5)).toBe(1);
    expect(nextGridFocusIndex(1, "ArrowUp", 3, 5)).toBe(1);
    expect(nextGridFocusIndex(2, "End", 3, 5)).toBe(4);
    expect(nextGridFocusIndex(2, "Home", 3, 5)).toBe(0);
  });
});
