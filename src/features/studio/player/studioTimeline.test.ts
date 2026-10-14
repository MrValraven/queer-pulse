import { describe, expect, it } from "vitest";
import { activeIndexAt, nextStartAfter } from "./studioTimeline";

const starts = [0, 30, 30, 95.5, 200];

describe("activeIndexAt", () => {
  it("is null before the first start and for an empty list", () => {
    expect(activeIndexAt([], 10)).toBeNull();
    expect(activeIndexAt([5, 10], 4.99)).toBeNull();
  });

  it("returns the last start at or before the time", () => {
    expect(activeIndexAt(starts, 0)).toBe(0);
    expect(activeIndexAt(starts, 29.9)).toBe(0);
    expect(activeIndexAt(starts, 30)).toBe(2);
    expect(activeIndexAt(starts, 95.5)).toBe(3);
    expect(activeIndexAt(starts, 10_000)).toBe(4);
  });
});

describe("nextStartAfter", () => {
  it("returns the first start strictly after the time", () => {
    expect(nextStartAfter(starts, -1)).toBe(0);
    expect(nextStartAfter(starts, 0)).toBe(30);
    expect(nextStartAfter(starts, 30)).toBe(95.5);
    expect(nextStartAfter(starts, 200)).toBeNull();
    expect(nextStartAfter([], 0)).toBeNull();
  });
});
