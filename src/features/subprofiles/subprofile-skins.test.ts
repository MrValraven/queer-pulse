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

  it("puts the tabletop and fandom kinds in the quest family", () => {
    for (const kind of [
      "game_master",
      "game_designer",
      "cosplayer",
      "streamer",
    ] as const) {
      expect(SKIN_OF[kind]).toBe("quest");
    }
    expect(SKIN_OF.podcaster).toBe("stage");
    expect(SKIN_OF.voice_actor).toBe("stage");
    expect(SKIN_OF.fanfic_writer).toBe("page");
    expect(SKIN_OF.game_critic).toBe("page");
  });

  it("groups the video creators with video and the audio kinds on stage", () => {
    expect(SKIN_OF.video_creator).toBe("studio");
    expect(SKIN_OF.short_form_creator).toBe("studio");
    expect(SKIN_OF.podcast_producer).toBe("stage");
    expect(SKIN_OF.radio_host).toBe("stage");
  });
});
