import { describe, expect, it } from "vitest";
import {
  SKIN_OF,
  SKIN_META,
  VISUAL_SECTIONS,
  skinFor,
} from "./subprofile-skins";
import { KIND_SECTIONS } from "./subprofile-kinds";
import type { SubprofileKind } from "./api/subprofiles.api";

const ALL_KINDS = Object.keys(KIND_SECTIONS) as SubprofileKind[];

describe("subprofile-skins", () => {
  it("maps every kind to a known family", () => {
    for (const kind of ALL_KINDS) {
      const family = skinFor(kind);
      expect(SKIN_META[family]).toBeDefined();
      expect(SKIN_OF[kind]).toBe(family);
    }
  });

  it("covers exactly the SubprofileKind set (no orphans)", () => {
    expect(Object.keys(SKIN_OF).sort()).toEqual([...ALL_KINDS].sort());
  });

  it("only lists real sections as visual", () => {
    const known = new Set(Object.values(KIND_SECTIONS).flat());
    for (const section of VISUAL_SECTIONS)
      expect(known.has(section)).toBe(true);
  });

  it("excludes the universal gallery section", () => {
    // `gallery` gets its own "gallery" render shape via an explicit check in
    // `sectionShape()` (personaSkinRender.ts) that runs before VISUAL_SECTIONS
    // is consulted, so it must NOT be listed here too — `getStudioWorks()`
    // (skins/studioWorks.ts) filters on this same array to build the studio
    // lightbox/checklist, and gallery items have no `title`, so a stray
    // membership here would leak blank-titled items into that flow.
    expect(VISUAL_SECTIONS.includes("gallery")).toBe(false);
  });
});
