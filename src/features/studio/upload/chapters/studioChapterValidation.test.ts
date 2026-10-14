import { describe, expect, it } from "vitest";
import { validateChapters } from "./studioChapterValidation";

const row = (time: string, title = "Title", artist = "") => ({
  id: time + title,
  time,
  title,
  artist,
});

describe("validateChapters", () => {
  it("answers the wire chapters when every row is valid", () => {
    const result = validateChapters(
      [row("0:00", " Intro "), row("2:10", "Body", " DJ ")],
      600,
    );
    expect(result.isValid).toBe(true);
    expect(result.chapters).toEqual([
      { startSeconds: 0, title: "Intro", artist: null },
      { startSeconds: 130, title: "Body", artist: "DJ" },
    ]);
  });

  it("treats an empty list as no chapters", () => {
    expect(validateChapters([], 600)).toMatchObject({
      isValid: true,
      chapters: [],
    });
  });

  it("marks each rule on its row", () => {
    const result = validateChapters(
      [
        row("0:05"),
        row("0:03"),
        row("9:99"),
        row("11:00", ""),
        row("12:00", "x".repeat(121), "y".repeat(121)),
      ],
      600,
    );
    expect(result.isValid).toBe(false);
    expect(result.chapters).toBeNull();
    expect(result.rowErrors).toEqual([
      ["firstAtZero"],
      ["order"],
      ["time"],
      ["pastEnd", "titleRequired"],
      ["pastEnd", "titleTooLong", "artistTooLong"],
    ]);
  });

  it("caps the list at 100 rows", () => {
    const rows = Array.from({ length: 101 }, (_row, index) =>
      row(`${index}:00`),
    );
    expect(validateChapters(rows, 100000).listError).toBe("tooMany");
  });

  it("skips the duration check while the duration is unknown", () => {
    expect(validateChapters([row("0:00"), row("90:00")], null).isValid).toBe(
      true,
    );
  });
});
