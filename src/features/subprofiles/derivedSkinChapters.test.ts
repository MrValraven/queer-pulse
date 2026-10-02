import { describe, expect, it } from "vitest";
import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_SECTIONS } from "./subprofile-kinds";
import { SKIN_BLOCKS_BY_FAMILY } from "./skinBlockFields.data";
import { PAGE_OUTLINE_BY_FAMILY } from "./skinPageOutline.data";
import { deriveSkinChapters } from "./derivedSkinChapters";
import { hasSkinBlocks, skinChaptersForKind } from "./skinChapters";
import { THERAPIST_CHAPTERS } from "./therapistEditorChapters.data";

const ALL_KINDS = Object.keys(KIND_SECTIONS) as SubprofileKind[];
const chapterKeys = (kind: SubprofileKind) =>
  deriveSkinChapters(kind).map((chapter) => chapter.key);

describe("deriveSkinChapters", () => {
  it("orders a stage kind as its sections, the gallery, then its end blocks", () => {
    expect(chapterKeys("dj")).toEqual(["mixes", "gigs", "gallery", "end"]);
    const endChapter = deriveSkinChapters("dj").at(-1);
    expect(endChapter?.titleKey).toBe(
      "subprofiles:skinBlock.stage.booker.title",
    );
    // A single-block chapter's card carries no heading of its own (the
    // chapter title above already names the block), but keeps the block's
    // helper text (undefined for the booker block, which has none).
    const [onlyGroup] = endChapter?.groups ?? [];
    expect(onlyGroup?.titleKey).toBeUndefined();
    expect(onlyGroup?.helperKey).toBeUndefined();
  });

  it("gives a studio kind (no blocks) only its sections and the gallery", () => {
    expect(chapterKeys("visual_artist")).toEqual([
      "portfolio",
      "exhibitions",
      "gallery",
    ]);
  });

  it("wraps a family's top and end blocks around the sections", () => {
    expect(chapterKeys("astrologer")).toEqual([
      "top",
      "charts",
      "sky",
      "gallery",
      "end",
    ]);
    const [topChapter] = deriveSkinChapters("astrologer");
    expect(topChapter?.titleKey).toBe(
      "subprofiles:skinChapter.derived.top.title",
    );
    expect(topChapter?.groups.map((group) => group.titleKey)).toEqual([
      "subprofiles:skinBlock.chart.sky.title",
      "subprofiles:skinBlock.chart.birthData.title",
    ]);
  });

  it("follows the practice layout, fees and times before the place", () => {
    expect(chapterKeys("coach")).toEqual([
      "programmes",
      "credentials",
      "howYouWork",
      "gallery",
      "fees",
      "place",
    ]);
    const chapters = deriveSkinChapters("coach");
    const pathsOf = (key: string) =>
      chapters
        .find((chapter) => chapter.key === key)
        ?.groups.flatMap((group) =>
          group.controls.map((control) => control.path),
        );
    expect(pathsOf("fees")).toContain("availability");
    expect(pathsOf("place")).toContain("venue.name");
    expect(chapters.at(-1)?.ledeKey).toBe(
      "subprofiles:skinChapter.derived.place.lede",
    );
  });

  it("makes a single block's helper the chapter lede", () => {
    const [topChapter] = deriveSkinChapters("game_master");
    expect(topChapter?.key).toBe("top");
    expect(topChapter?.ledeKey).toBe(
      "subprofiles:skinBlock.quest.atTheTable.helper",
    );
  });

  it("splits a block with cards into titled cards, each control once", () => {
    const [topChapter] = deriveSkinChapters("game_master");
    const groups = topChapter?.groups ?? [];
    expect(groups.map((group) => group.titleKey)).toEqual([
      "subprofiles:skinBlock.quest.atTheTable.howTitle",
      "subprofiles:skinBlock.quest.atTheTable.systems",
      "subprofiles:skinBlock.quest.atTheTable.vibe",
      "subprofiles:skinBlock.quest.atTheTable.safetyTools",
      "subprofiles:skinBlock.quest.atTheTable.note",
    ]);
    const paths = groups.flatMap((group) =>
      group.controls.map((control) => control.path),
    );
    expect([...paths].sort()).toEqual(
      [
        "atTheTable.format",
        "atTheTable.note",
        "atTheTable.price",
        "atTheTable.safetyTools",
        "atTheTable.systems",
        "atTheTable.vibe",
        "atTheTable.where",
      ].sort(),
    );
  });

  it("puts one sectionList control in each section chapter", () => {
    const [mixes] = deriveSkinChapters("dj");
    expect(mixes?.titleKey).toBe("subprofiles:section.mixes");
    expect(mixes?.ledeKey).toBe("subprofiles:skinChapter.derived.section.lede");
    expect(mixes?.groups).toHaveLength(1);
    expect(mixes?.groups[0]?.controls).toEqual([
      {
        path: "section:mixes",
        kind: "sectionList",
        section: "mixes",
        labelKey: "subprofiles:section.mixes",
      },
    ]);
  });

  it("moves retired training into the kind's credentials list", () => {
    const trainingOf = (kind: SubprofileKind) =>
      deriveSkinChapters(kind)
        .flatMap((chapter) => chapter.groups)
        .flatMap((group) => group.controls)
        .find((control) => control.path === "training");
    expect(trainingOf("coach")).toMatchObject({
      isRetired: true,
      moveToSection: "credentials",
      helperKey: "subprofiles:skinBlock.practice.training.retiredHelper",
    });
    // A yoga teacher lists qualifications under Trainings.
    expect(trainingOf("yoga_teacher")).toMatchObject({
      isRetired: true,
      moveToSection: "trainings",
      helperKey:
        "subprofiles:skinBlock.practice.training.retiredHelperTrainings",
    });
    // A sex educator has neither list, so training stays a live field.
    const liveTraining = trainingOf("sex_educator");
    expect(liveTraining?.isRetired).toBe(false);
    expect(liveTraining?.moveToSection).toBeUndefined();
    expect(liveTraining?.helperKey).toBe(
      "subprofiles:skinBlock.practice.training.helper",
    );
  });

  it("retires the practice fee, sliding scale and next opening", () => {
    const retiredPaths = deriveSkinChapters("coach")
      .flatMap((chapter) => chapter.groups)
      .flatMap((group) => group.controls)
      .filter((control) => control.isRetired)
      .map((control) => control.path);
    expect(retiredPaths.sort()).toEqual([
      "practical.fee",
      "practical.next",
      "practical.sliding",
      "training",
    ]);
  });

  it("gives every kind unique chapter keys", () => {
    for (const kind of ALL_KINDS) {
      const keys = chapterKeys(kind);
      expect(new Set(keys).size, kind).toBe(keys.length);
    }
  });
});

describe("PAGE_OUTLINE_BY_FAMILY", () => {
  it("places every family block exactly once and names no unknown block", () => {
    for (const [family, blocks] of Object.entries(SKIN_BLOCKS_BY_FAMILY)) {
      const outline =
        PAGE_OUTLINE_BY_FAMILY[family as keyof typeof PAGE_OUTLINE_BY_FAMILY];
      const placed = outline.flatMap((entry) =>
        entry.kind === "blocks" ? entry.blockKeys : [],
      );
      expect([...placed].sort(), family).toEqual(
        (blocks ?? []).map((block) => block.blockKey).sort(),
      );
    }
  });
});

describe("skinChaptersForKind", () => {
  it("keeps the therapist's hand-written chapters", () => {
    expect(skinChaptersForKind("therapist")).toBe(THERAPIST_CHAPTERS);
  });

  it("gives every kind a Page blocks pane", () => {
    for (const kind of ALL_KINDS) expect(hasSkinBlocks(kind), kind).toBe(true);
  });
});
