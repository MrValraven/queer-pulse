import { describe, expect, it } from "vitest";
import { buildEditorRailGroups } from "../editorRail.data";
import { demoPodcastView } from "./feedImportTestData";
import {
  FEED_IMPORT_KINDS,
  defaultFeedSection,
  feedImportSections,
  supportsFeedImport,
} from "./feedImportKinds";

describe("feed import kinds", () => {
  it("covers the show and channel crafts, and only those", () => {
    expect([...FEED_IMPORT_KINDS].sort()).toEqual(
      [
        "actual_play",
        "host",
        "podcast_producer",
        "podcaster",
        "radio_host",
        "video_creator",
      ].sort(),
    );
    expect(supportsFeedImport("podcaster")).toBe(true);
    expect(supportsFeedImport("developer")).toBe(false);
  });

  it("offers a kind's own sections, never the gallery or links", () => {
    expect(feedImportSections("podcaster")).toEqual([
      "episodes",
      "appearances",
    ]);
    for (const kind of FEED_IMPORT_KINDS) {
      const sections = feedImportSections(kind);
      expect(sections).not.toContain("gallery");
      expect(sections).not.toContain("links");
      expect(sections.length).toBeGreaterThan(0);
    }
  });

  it("defaults to episodes when the kind has it, else its first section", () => {
    expect(defaultFeedSection("podcaster")).toBe("episodes");
    expect(defaultFeedSection("radio_host")).toBe("episodes");
    expect(defaultFeedSection("video_creator")).toBe("videos");
  });
});

describe("the editor rail's Import entry", () => {
  const railKeys = (view: ReturnType<typeof demoPodcastView>) =>
    buildEditorRailGroups(view).flatMap((group) =>
      group.entries.map((entry) => entry.key),
    );

  it("shows for a podcaster", () => {
    expect(railKeys(demoPodcastView())).toContain("import");
  });

  it("is absent for a kind that cannot import a feed", () => {
    expect(railKeys({ ...demoPodcastView(), kind: "developer" })).not.toContain(
      "import",
    );
  });
});
