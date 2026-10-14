import { describe, expect, it } from "vitest";
import { formatChapterTime, parseChapterTime } from "./studioChapterTime";

describe("chapter times", () => {
  it("reads m:ss, mm:ss and h:mm:ss", () => {
    expect(parseChapterTime("0:00")).toBe(0);
    expect(parseChapterTime("03:15")).toBe(195);
    expect(parseChapterTime("75:10")).toBe(4510);
    expect(parseChapterTime(" 1:02:30 ")).toBe(3750);
  });

  it("refuses impossible times", () => {
    for (const value of ["", "1:75", "1:60:00", "abc", "1:2", "-1:00"])
      expect(parseChapterTime(value)).toBeNull();
  });

  it("formats with hours only when needed", () => {
    expect(formatChapterTime(195)).toBe("3:15");
    expect(formatChapterTime(3750)).toBe("1:02:30");
  });
});
