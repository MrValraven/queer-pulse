import { describe, expect, it } from "vitest";
import type { StudioTrackRowView } from "./studio.adapters";
import {
  episodesOf,
  latestEpisodeOf,
  notesExcerpt,
  orderedEpisodes,
} from "./studioEpisodes";

function row(
  id: string,
  position: number,
  publishedAt: string | null,
  isDraft = false,
): StudioTrackRowView {
  return {
    id,
    position,
    title: id,
    durationSeconds: 1200,
    durationLabel: "20:00",
    isExplicit: false,
    hasAudio: true,
    href: `/studio/track?id=${id}`,
    savedId: `studio_track:${id}`,
    notesExcerpt: null,
    publishedAt,
    isDraft,
  };
}

const tracks = [
  row("third", 1, "2026-10-01T10:00:00.000Z"),
  row("first", 2, "2026-08-01T10:00:00.000Z"),
  row("draft", 3, null, true),
  row("second", 4, "2026-09-01T10:00:00.000Z"),
];

describe("episodesOf", () => {
  it("numbers the owner's published episodes by publish time and keeps drafts apart", () => {
    const { published, drafts } = episodesOf({ tracks, isOwner: true });
    expect(published.map((episode) => [episode.id, episode.number])).toEqual([
      ["first", 1],
      ["second", 2],
      ["third", 3],
    ]);
    expect(drafts.map((episode) => [episode.id, episode.number])).toEqual([
      ["draft", null],
    ]);
  });

  it("takes a listener's number from the position the server renumbered", () => {
    const listenerRows = [
      row("later", 2, "2026-08-01T10:00:00.000Z"),
      row("earlier", 1, "2026-09-01T10:00:00.000Z"),
    ];
    const { published, drafts } = episodesOf({
      tracks: listenerRows,
      isOwner: false,
    });
    expect(published.map((episode) => [episode.id, episode.number])).toEqual([
      ["earlier", 1],
      ["later", 2],
    ]);
    expect(drafts).toEqual([]);
  });

  it("lists every row of a preview link as published, in server order", () => {
    const previewRows = [
      row("second", 2, null),
      row("first", 1, null),
      { ...row("third", 3, null), hasAudio: false },
    ];
    const preview = { tracks: previewRows, isOwner: false };
    const { published, drafts } = episodesOf(preview);
    expect(published.map((episode) => [episode.id, episode.number])).toEqual([
      ["first", 1],
      ["second", 2],
      ["third", 3],
    ]);
    expect(drafts).toEqual([]);
    expect(latestEpisodeOf(preview)?.id).toBe("second");
  });

  it("orders newest or oldest first", () => {
    const { published } = episodesOf({ tracks, isOwner: true });
    expect(orderedEpisodes(published, "newest").map((item) => item.id)).toEqual(
      ["third", "second", "first"],
    );
    expect(orderedEpisodes(published, "oldest").map((item) => item.id)).toEqual(
      ["first", "second", "third"],
    );
  });

  it("finds the latest playable episode, and none on a show of drafts", () => {
    expect(latestEpisodeOf({ tracks, isOwner: true })?.id).toBe("third");
    expect(
      latestEpisodeOf({ tracks: [row("draft", 1, null, true)], isOwner: true }),
    ).toBeNull();
  });
});

describe("notesExcerpt", () => {
  it("joins lines and cuts on a word with an ellipsis", () => {
    expect(notesExcerpt("One line\nand another", 200)).toBe(
      "One line and another",
    );
    expect(notesExcerpt("alpha beta gamma delta", 12)).toBe("alpha beta…");
    expect(notesExcerpt("   ", 200)).toBeNull();
    expect(notesExcerpt(null)).toBeNull();
  });

  it("drops chapter lines and keeps the first paragraph", () => {
    expect(
      notesExcerpt(
        "Dating apps and what you want\n\nSecond paragraph\n\n00:00 Cold open\n06:30 The apps\n1:02:03 - Wrap",
      ),
    ).toBe("Dating apps and what you want");
    expect(notesExcerpt("Still editing this one\n00:00 Intro")).toBe(
      "Still editing this one",
    );
    expect(notesExcerpt("00:00 Intro\n01:30 Housing")).toBeNull();
  });

  it("keeps the whole window when the character after it is a space", () => {
    const firstWords = `${"a".repeat(99)} ${"b".repeat(100)}`;
    expect(firstWords).toHaveLength(200);
    expect(notesExcerpt(`${firstWords} tail`)).toBe(`${firstWords}…`);
  });

  it("cuts a single long word at the limit", () => {
    expect(notesExcerpt("x".repeat(250))).toBe(`${"x".repeat(200)}…`);
  });
});
