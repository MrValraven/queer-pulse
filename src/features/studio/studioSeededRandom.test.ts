import { describe, expect, it } from "vitest";
import { hashOfText, seededRandom } from "./studioSeededRandom";

describe("hashOfText", () => {
  it("gives the same unsigned 32-bit number for the same text", () => {
    expect(hashOfText("demo-track-home-2-01")).toBe(
      hashOfText("demo-track-home-2-01"),
    );
    expect(hashOfText("a")).not.toBe(hashOfText("b"));
    expect(Number.isInteger(hashOfText("ç"))).toBe(true);
    expect(hashOfText("ç")).toBeGreaterThanOrEqual(0);
  });
});

describe("seededRandom", () => {
  it("repeats its sequence for a seed and stays inside 0 to 1", () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const firstValues = Array.from({ length: 50 }, () => first());
    const secondValues = Array.from({ length: 50 }, () => second());
    expect(firstValues).toEqual(secondValues);
    for (const value of firstValues) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("gives another sequence for another seed", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
});
