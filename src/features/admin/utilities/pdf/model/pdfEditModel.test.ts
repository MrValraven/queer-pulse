import { describe, expect, it } from "vitest";
import {
  appendFilePages,
  everyPageChunks,
  hasEffectiveCuts,
  movePage,
  nudgePages,
  pageIdFor,
  removePages,
  rotatePages,
  splitIntoChunks,
  toggleCut,
  type PageItem,
} from "./pdfEditModel";

const fourPages = appendFilePages([], "file-1", 4);
const pageIdsOf = (list: readonly PageItem[]) => list.map((page) => page.id);
const sourceIndexesOf = (list: readonly PageItem[]) =>
  list.map((page) => page.sourceIndex);

function pageAt(pages: readonly PageItem[], index: number): PageItem {
  const page = pages[index];
  if (!page) throw new Error(`Test fixture has no page at index ${index}`);
  return page;
}

describe("pdfEditModel", () => {
  it("builds a page id from the file id and source index", () => {
    expect(pageIdFor("file-9", 2)).toBe("file-9:2");
  });

  it("appends pages with ids unique per file", () => {
    const merged = appendFilePages(
      appendFilePages([], "file-1", 3),
      "file-2",
      3,
    );
    expect(pageIdsOf(merged)).toEqual([
      "file-1:0",
      "file-1:1",
      "file-1:2",
      "file-2:0",
      "file-2:1",
      "file-2:2",
    ]);
    expect(new Set(pageIdsOf(merged)).size).toBe(6);
    expect(pageAt(merged, 0)).toMatchObject({
      sourceIndex: 0,
      rotation: 0,
      hasCutAfter: false,
    });
  });

  it("returns the same array when a file has no pages", () => {
    expect(appendFilePages(fourPages, "file-2", 0)).toBe(fourPages);
  });

  it("removes page three of four and keeps three", () => {
    expect(
      sourceIndexesOf(removePages(fourPages, new Set(["file-1:2"]))),
    ).toEqual([0, 1, 3]);
  });

  it("refuses to remove every page", () => {
    expect(removePages(fourPages, new Set(pageIdsOf(fourPages)))).toBe(
      fourPages,
    );
  });

  it("returns the same array when the removal matches nothing", () => {
    expect(removePages(fourPages, new Set(["file-9:0"]))).toBe(fourPages);
    expect(removePages(fourPages, new Set())).toBe(fourPages);
  });

  it("drops a cut together with the page it belongs to", () => {
    const cut = toggleCut(fourPages, "file-1:1");
    expect(pageAt(cut, 1).hasCutAfter).toBe(true);
    expect(
      removePages(cut, new Set(["file-1:1"])).some((page) => page.hasCutAfter),
    ).toBe(false);
  });

  it("rotates in quarter turns both ways", () => {
    const firstOnly = new Set(["file-1:0"]);
    const right = rotatePages(
      rotatePages(fourPages, firstOnly, "right"),
      firstOnly,
      "right",
    );
    expect(pageAt(right, 0).rotation).toBe(180);
    expect(pageAt(right, 1).rotation).toBe(0);
    const threeQuarter = rotatePages(fourPages, firstOnly, "left");
    expect(pageAt(threeQuarter, 0).rotation).toBe(270);
    expect(
      pageAt(rotatePages(threeQuarter, firstOnly, "right"), 0).rotation,
    ).toBe(0);
  });

  it("returns the same array when a rotation matches nothing", () => {
    expect(rotatePages(fourPages, new Set(["file-9:0"]), "right")).toBe(
      fourPages,
    );
  });

  it("moves a page and its cut travels with it", () => {
    const moved = movePage(toggleCut(fourPages, "file-1:0"), "file-1:0", 2);
    expect(sourceIndexesOf(moved)).toEqual([1, 2, 0, 3]);
    expect(pageAt(moved, 2).hasCutAfter).toBe(true);
  });

  it("returns the same array for a move to the same index or an unknown id", () => {
    expect(movePage(fourPages, "file-1:1", 1)).toBe(fourPages);
    expect(movePage(fourPages, "file-9:0", 2)).toBe(fourPages);
  });

  it("nudges a selected block one slot earlier and later", () => {
    const lastTwo = new Set(["file-1:2", "file-1:3"]);
    expect(sourceIndexesOf(nudgePages(fourPages, lastTwo, -1))).toEqual([
      0, 2, 3, 1,
    ]);
    expect(
      sourceIndexesOf(nudgePages(fourPages, new Set(["file-1:0"]), 1)),
    ).toEqual([1, 0, 2, 3]);
  });

  it("returns the same array when a nudge is blocked at either edge", () => {
    expect(nudgePages(fourPages, new Set(["file-1:0"]), -1)).toBe(fourPages);
    expect(nudgePages(fourPages, new Set(["file-1:3"]), 1)).toBe(fourPages);
    expect(nudgePages(fourPages, new Set(), 1)).toBe(fourPages);
  });

  it("toggles a cut on and off", () => {
    const cut = toggleCut(fourPages, "file-1:1");
    expect(pageAt(cut, 1).hasCutAfter).toBe(true);
    expect(pageAt(toggleCut(cut, "file-1:1"), 1).hasCutAfter).toBe(false);
  });

  it("ignores a cut toggle on the last page or an unknown id", () => {
    expect(toggleCut(fourPages, "file-1:3")).toBe(fourPages);
    expect(toggleCut(fourPages, "file-9:0")).toBe(fourPages);
  });

  it("splits at cuts into chunks", () => {
    const cut = toggleCut(toggleCut(fourPages, "file-1:0"), "file-1:2");
    expect(splitIntoChunks(cut).map((chunk) => chunk.length)).toEqual([
      1, 2, 1,
    ]);
    expect(hasEffectiveCuts(cut)).toBe(true);
  });

  it("ignores a cut that ends up on the last page", () => {
    const cutThenMoved = movePage(
      toggleCut(fourPages, "file-1:1"),
      "file-1:1",
      3,
    );
    expect(pageAt(cutThenMoved, 3).hasCutAfter).toBe(true);
    expect(hasEffectiveCuts(cutThenMoved)).toBe(false);
    expect(splitIntoChunks(cutThenMoved)).toHaveLength(1);
  });

  it("makes one chunk per page for the every-page shortcut", () => {
    const chunks = everyPageChunks(fourPages);
    expect(chunks).toHaveLength(4);
    expect(chunks.every((chunk) => chunk.length === 1)).toBe(true);
  });

  it("returns a single chunk when there are no cuts", () => {
    expect(splitIntoChunks(fourPages)).toHaveLength(1);
    expect(splitIntoChunks([])).toEqual([]);
  });
});
