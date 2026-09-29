import { describe, expect, it } from "vitest";
import { sectionsInPageBlocks } from "./editorRail.data";
import { THERAPIST_BLOCKS } from "./therapistEditorChapters.data";
import {
  THERAPIST_EDIT_TARGETS,
  therapistEditAriaKey,
} from "./skins/therapist/therapistEditLinks.data";

describe("therapist sections in Page blocks", () => {
  it("edits credentials in How you work and the gallery in Where and access", () => {
    const moved = sectionsInPageBlocks("therapist");
    expect(moved.get("section:credentials")).toMatchObject({
      chapter: "approach",
      controlKind: "sectionList",
    });
    expect(moved.get("section:gallery")).toMatchObject({
      chapter: "where",
      controlKind: "sectionList",
    });
  });

  it("derives no SkinData block from a section control", () => {
    expect(
      THERAPIST_BLOCKS.some((block) => block.blockKey.startsWith("section:")),
    ).toBe(false);
  });

  it("points the page's Edit links at the chapters", () => {
    expect(THERAPIST_EDIT_TARGETS.credentials).toEqual({
      pane: "skinBlocks",
      chapter: "approach",
      field: "section:credentials",
    });
    expect(THERAPIST_EDIT_TARGETS.gallery).toEqual({
      pane: "skinBlocks",
      chapter: "where",
      field: "section:gallery",
    });
    expect(therapistEditAriaKey(THERAPIST_EDIT_TARGETS.credentials)).toMatch(
      /\.credentials$/,
    );
    expect(therapistEditAriaKey(THERAPIST_EDIT_TARGETS.gallery)).toMatch(
      /\.gallery$/,
    );
  });
});
