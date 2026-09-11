import { describe, expect, it } from "vitest";
import { newDraftBlock, type DraftSection } from "./guideDraft";
import {
  convertBlock,
  insertBlocksAfter,
  insertSectionAfter,
  moveBlock,
  moveSection,
  previousBlockLocation,
  removeBlock,
  renameSection,
  restoreBlock,
} from "./guideDocumentOps";

function makeSection(
  key: string,
  id: string,
  blockKeys: string[],
  isAnchorLocked = true,
): DraftSection {
  return {
    key,
    id,
    heading: "",
    isAnchorLocked,
    blocks: blockKeys.map((blockKey) => ({
      key: blockKey,
      kind: "paragraph",
      html: blockKey,
      text: blockKey,
    })),
  };
}

describe("guideDocumentOps", () => {
  it("lets an unlocked anchor follow the heading, uniquely", () => {
    const sections = [
      makeSection("one", "routes", []),
      makeSection("two", "section", [], false),
    ];
    const renamed = renameSection(sections, "two", "Routes");
    expect(renamed[1]?.id).toBe("routes-2");
    expect(renameSection(sections, "one", "Other")[0]?.id).toBe("routes");
  });

  it("inserts a section after another, or at the end", () => {
    const sections = [makeSection("one", "a", []), makeSection("two", "b", [])];
    const added = makeSection("new", "section", [], false);
    expect(
      insertSectionAfter(sections, "one", added).map((section) => section.key),
    ).toEqual(["one", "new", "two"]);
    expect(
      insertSectionAfter(sections, null, added).map((section) => section.key),
    ).toEqual(["one", "two", "new"]);
  });

  it("moves sections and blocks", () => {
    const sections = [
      makeSection("one", "a", ["x", "y"]),
      makeSection("two", "b", []),
    ];
    expect(moveSection(sections, 0, 1).map((section) => section.key)).toEqual([
      "two",
      "one",
    ]);
    expect(
      moveBlock(sections, "one", "x", "down")[0]?.blocks.map(
        (block) => block.key,
      ),
    ).toEqual(["y", "x"]);
    expect(
      moveBlock(sections, "one", "x", "up")[0]?.blocks.map(
        (block) => block.key,
      ),
    ).toEqual(["x", "y"]);
  });

  it("inserts, removes and restores blocks", () => {
    const sections = [makeSection("one", "a", ["x", "y"])];
    const inserted = insertBlocksAfter(sections, "one", "x", [
      newDraftBlock("note", "n", "n"),
    ]);
    expect(inserted[0]?.blocks.map((block) => block.kind)).toEqual([
      "paragraph",
      "note",
      "paragraph",
    ]);
    const removed = removeBlock(sections, "one", "x");
    expect(removed[0]?.blocks.map((block) => block.key)).toEqual(["y"]);
    const restored = restoreBlock(removed, "one", 0, sections[0]!.blocks[0]!);
    expect(restored[0]?.blocks.map((block) => block.key)).toEqual(["x", "y"]);
  });

  it("converts a block under a new key, clearing it when asked", () => {
    const sections = [makeSection("one", "a", ["x"])];
    const cleared = convertBlock(sections, "one", "x", "subheading", {
      nextKey: "x2",
      shouldClear: true,
    });
    expect(cleared[0]?.blocks[0]).toEqual({
      key: "x2",
      kind: "subheading",
      html: "",
      text: "",
    });
    const kept = convertBlock(sections, "one", "x", "note", {
      nextKey: "x3",
      shouldClear: false,
    });
    expect(kept[0]?.blocks[0]).toEqual({
      key: "x3",
      kind: "note",
      html: "x",
      text: "x",
    });
  });

  it("finds the previous block across sections", () => {
    const sections = [
      makeSection("one", "a", ["x"]),
      makeSection("two", "b", []),
      makeSection("three", "c", ["y"]),
    ];
    expect(previousBlockLocation(sections, "three", "y")).toEqual({
      sectionKey: "one",
      blockKey: "x",
    });
    expect(previousBlockLocation(sections, "one", "x")).toBeNull();
  });
});
