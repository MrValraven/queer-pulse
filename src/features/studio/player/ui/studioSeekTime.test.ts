import { describe, expect, it } from "vitest";
import {
  chapterAt,
  reservedTimeChars,
  toFractionSpans,
  UNKNOWN_TIME_LABEL,
} from "./studioSeekTime";

const chapter = (startSeconds: number) => ({
  startSeconds,
  title: `Part at ${startSeconds}`,
  artist: null,
  timeLabel: "0:00",
});

describe("chapterAt", () => {
  const chapters = [chapter(0), chapter(60), chapter(120)];

  it("finds the chapter that holds the time", () => {
    expect(chapterAt(chapters, 0)?.title).toBe("Part at 0");
    expect(chapterAt(chapters, 59.9)?.title).toBe("Part at 0");
    expect(chapterAt(chapters, 60)?.title).toBe("Part at 60");
    expect(chapterAt(chapters, 500)?.title).toBe("Part at 120");
  });

  it("answers null for a track without chapters", () => {
    expect(chapterAt(null, 30)).toBeNull();
    expect(chapterAt([], 30)).toBeNull();
  });

  it("answers null before the first chapter starts", () => {
    expect(chapterAt([chapter(10)], 5)).toBeNull();
  });
});

describe("toFractionSpans", () => {
  it("turns loaded seconds into fractions of the track", () => {
    expect(
      toFractionSpans(
        [
          { startSeconds: 0, endSeconds: 50 },
          { startSeconds: 100, endSeconds: 150 },
        ],
        200,
      ),
    ).toEqual([
      { startFraction: 0, endFraction: 0.25 },
      { startFraction: 0.5, endFraction: 0.75 },
    ]);
  });

  it("clamps spans past the end and drops empty ones", () => {
    expect(
      toFractionSpans(
        [
          { startSeconds: 40, endSeconds: 40 },
          { startSeconds: 150, endSeconds: 260 },
          { startSeconds: 300, endSeconds: 320 },
        ],
        200,
      ),
    ).toEqual([{ startFraction: 0.75, endFraction: 1 }]);
  });

  it("answers an empty list while the length is unknown", () => {
    expect(toFractionSpans([{ startSeconds: 0, endSeconds: 10 }], 0)).toEqual(
      [],
    );
  });
});

describe("reservedTimeChars", () => {
  it("reserves four characters for short labels", () => {
    expect(reservedTimeChars("3:20")).toBe(4);
    expect(reservedTimeChars("0:05")).toBe(4);
  });

  it("reserves the full length of a longer label", () => {
    expect(reservedTimeChars("−3:20")).toBe(5);
    expect(reservedTimeChars("−1:02:03")).toBe(8);
    expect(reservedTimeChars(UNKNOWN_TIME_LABEL)).toBe(5);
  });
});
