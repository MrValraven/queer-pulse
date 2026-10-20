import { describe, expect, it } from "vitest";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  buildEditorRailGroups,
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

describe("sectionsInPageBlocks for the tattoo artist", () => {
  it("edits every tattoo section inside its chapter", () => {
    const moved = sectionsInPageBlocks("tattoo_artist");
    expect(moved.size).toBe(12);
    expect(moved.get("section:scar_work")).toMatchObject({
      chapter: "scarCoverUps",
      controlKind: "sectionList",
    });
    expect(moved.get("section:gallery")).toMatchObject({ chapter: "about" });
    expect(sectionsNormalizedOnSave("tattoo_artist").size).toBe(0);
  });
});

describe("sectionsNormalizedOnSave", () => {
  it("normalises only topic-style sections", () => {
    expect([...sectionsNormalizedOnSave("therapist")]).toEqual(["specialisms"]);
    expect(sectionsNormalizedOnSave("dj").size).toBe(0);
  });
});

describe("buildEditorRailGroups Works at entry", () => {
  const view = {
    kind: "dj",
    sections: [],
    affiliations: [],
    bio: "",
    handle: null,
    avatarUrl: null,
    coverUrl: null,
    availability: null,
    socialLinks: [],
    linkVisibility: "linked",
    skinData: null,
    featured: null,
  } as unknown as SubprofileView;
  const findWorksAt = (options?: { worksAtAttentionCount?: number }) =>
    buildEditorRailGroups(view, options)
      .flatMap((group) => group.entries)
      .find((entry) => entry.key === "works-at");

  it("puts Works at right after Part of", () => {
    const peopleGroup = buildEditorRailGroups(view).find(
      (group) => group.headingKey === "subprofiles:editorRail.people",
    );
    expect(peopleGroup?.entries.map((entry) => entry.key)).toEqual([
      "affiliations",
      "works-at",
      "owners",
    ]);
  });

  it("carries the attention count only above zero", () => {
    expect(findWorksAt({ worksAtAttentionCount: 2 })?.attentionCount).toBe(2);
    expect(findWorksAt({ worksAtAttentionCount: 0 })).not.toHaveProperty(
      "attentionCount",
    );
    expect(findWorksAt()).not.toHaveProperty("attentionCount");
  });
});
