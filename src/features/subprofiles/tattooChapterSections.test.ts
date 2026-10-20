import { describe, expect, it } from "vitest";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { buildEditorRailGroups } from "./editorRail.data";
import { chapterKeyForPath, skinFieldAnchorId } from "./skinFieldAnchor";
import { TATTOO_CHAPTERS } from "./tattooEditorChapters.data";

const tattooView = {
  kind: "tattoo_artist",
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

describe("tattoo chapters in the editor", () => {
  it("lists the eight chapters as rail sub-rows", () => {
    const pageBlocksEntry = buildEditorRailGroups(tattooView)
      .flatMap((group) => group.entries)
      .find((entry) => entry.key === "skinBlocks");
    expect(pageBlocksEntry?.chapters?.map((chapter) => chapter.key)).toEqual(
      TATTOO_CHAPTERS.map((chapter) => chapter.key),
    );
    expect(pageBlocksEntry?.chapters).toHaveLength(8);
  });

  it("anchors each skin field for a deep link", () => {
    for (const chapter of TATTOO_CHAPTERS) {
      for (const group of chapter.groups) {
        for (const control of group.controls) {
          const isSectionControl =
            control.kind === "sectionList" || control.kind === "sectionItems";
          if (isSectionControl) continue;
          expect(chapterKeyForPath(TATTOO_CHAPTERS, control.path)).toBe(
            chapter.key,
          );
        }
      }
    }
    expect(skinFieldAnchorId("tattoo.status")).toBe("skin-field-tattoo-status");
  });
});
