import { describe, expect, it } from "vitest";
import { chapterRowsFromNotes } from "./studioEpisodeChapters";
import { parseChapterTime } from "./upload/chapters/studioChapterTime";

describe("chapterRowsFromNotes", () => {
  it("reads the lines that start with a time and skips the rest", () => {
    const rows = chapterRowsFromNotes(
      "We start with a question.\n\n00:00 Intro\n1:02:30 Housing in Lisbon\nSkip to 22:40 for the recipe",
    );
    expect(
      rows.map((row) => [parseChapterTime(row.time), row.title, row.artist]),
    ).toEqual([
      [0, "Intro", ""],
      [3750, "Housing in Lisbon", ""],
    ]);
  });

  it("keeps a spaced hyphen inside the title", () => {
    const [row] = chapterRowsFromNotes("04:10 Why now - and why here");
    expect(row?.title).toBe("Why now - and why here");
    expect(row?.artist).toBe("");
  });

  it("keeps the title as the member typed it", () => {
    const rows = chapterRowsFromNotes(
      "00:00 - Cold open\n04:10 Why now \u2013 and why here\n[12:30] Q&A |  part one",
    );
    expect(rows.map((row) => row.title)).toEqual([
      "Cold open",
      "Why now \u2013 and why here",
      "Q&A |  part one",
    ]);
  });

  it("has nothing for notes without times", () => {
    expect(chapterRowsFromNotes("Just words")).toEqual([]);
  });
});
