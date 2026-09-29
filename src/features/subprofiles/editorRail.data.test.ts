import { describe, expect, it } from "vitest";
import {
  sectionsInPageBlocks,
  sectionsNormalizedOnSave,
} from "./editorRail.data";

describe("sectionsInPageBlocks", () => {
  it("moves every DJ section into its own chapter", () => {
    const moved = sectionsInPageBlocks("dj");
    expect([...moved.keys()].sort()).toEqual([
      "section:gallery",
      "section:gigs",
      "section:mixes",
    ]);
    expect(moved.get("section:gigs")).toEqual({
      section: "gigs",
      chapter: "gigs",
      field: "section:gigs",
      labelKey: "subprofiles:section.gigs",
      controlKind: "sectionList",
    });
  });

  it("keeps the therapist's specialisms as a topics control", () => {
    expect(
      sectionsInPageBlocks("therapist").get("section:specialisms")?.controlKind,
    ).toBe("sectionItems");
  });
});

describe("sectionsNormalizedOnSave", () => {
  it("normalises only topic-style sections", () => {
    expect([...sectionsNormalizedOnSave("therapist")]).toEqual(["specialisms"]);
    expect(sectionsNormalizedOnSave("dj").size).toBe(0);
  });
});
