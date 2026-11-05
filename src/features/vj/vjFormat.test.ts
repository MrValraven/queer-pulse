import { describe, expect, it } from "vitest";
import { formatVjBytes, formatVjDuration } from "./vjFormat";

describe("vjFormat", () => {
  it("formats durations as minutes and seconds", () => {
    expect(formatVjDuration(8000)).toBe("0:08");
    expect(formatVjDuration(75400)).toBe("1:15");
    expect(formatVjDuration(3600000)).toBe("60:00");
    expect(formatVjDuration(999)).toBe("0:01");
  });

  it("falls back to zero for a length that is not a number", () => {
    expect(formatVjDuration(Number.NaN)).toBe("0:00");
    expect(formatVjDuration(-5)).toBe("0:00");
  });

  it("formats sizes the way the upload copy reads", () => {
    expect(formatVjBytes(146800640)).toBe("140 MB");
    expect(formatVjBytes(8808038)).toBe("8.4 MB");
    expect(formatVjBytes(262144)).toBe("256 KB");
    expect(formatVjBytes(900)).toBe("1 KB");
  });

  it("rolls a size just under 1 MB over to MB", () => {
    expect(formatVjBytes(1048575)).toBe("1.0 MB");
  });
});
