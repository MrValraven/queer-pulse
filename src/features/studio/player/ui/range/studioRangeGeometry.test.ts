import { describe, expect, it } from "vitest";
import {
  clampValue,
  fractionFromPointer,
  fractionOfValue,
  steppedValue,
  valueOfFraction,
} from "./studioRangeGeometry";

const steps = { arrow: 5, page: 30 };

describe("studioRangeGeometry", () => {
  it("clamps values into the range", () => {
    expect(clampValue(-4, 0, 100)).toBe(0);
    expect(clampValue(140, 0, 100)).toBe(100);
    expect(clampValue(Number.NaN, 0, 100)).toBe(0);
  });

  it("returns a zero fraction when the range is empty", () => {
    expect(fractionOfValue(5, 0, 0)).toBe(0);
    expect(fractionOfValue(50, 0, 200)).toBe(0.25);
  });

  it("maps fractions back to values", () => {
    expect(valueOfFraction(0.5, 10, 30)).toBe(20);
    expect(valueOfFraction(2, 10, 30)).toBe(30);
  });

  it("reads the pointer in reading order and mirrors it under RTL", () => {
    const trackBounds = { left: 100, width: 200 };
    expect(fractionFromPointer(150, trackBounds, false)).toBe(0.25);
    expect(fractionFromPointer(150, trackBounds, true)).toBe(0.75);
    expect(fractionFromPointer(50, trackBounds, false)).toBe(0);
    expect(fractionFromPointer(900, trackBounds, false)).toBe(1);
  });

  it("returns zero for a zero width track", () => {
    expect(fractionFromPointer(150, { left: 100, width: 0 }, false)).toBe(0);
    expect(fractionFromPointer(150, { left: 100, width: 0 }, true)).toBe(0);
  });

  it("steps with arrows, pages, Home and End", () => {
    expect(steppedValue("ArrowRight", 20, steps, 0, 100, false)).toBe(25);
    expect(steppedValue("ArrowLeft", 20, steps, 0, 100, false)).toBe(15);
    expect(steppedValue("PageUp", 20, steps, 0, 100, false)).toBe(50);
    expect(steppedValue("PageDown", 20, steps, 0, 100, false)).toBe(0);
    expect(steppedValue("Home", 20, steps, 0, 100, false)).toBe(0);
    expect(steppedValue("End", 20, steps, 0, 100, false)).toBe(100);
    expect(steppedValue("a", 20, steps, 0, 100, false)).toBeNull();
  });

  it("swaps left and right arrows under RTL", () => {
    expect(steppedValue("ArrowRight", 20, steps, 0, 100, true)).toBe(15);
    expect(steppedValue("ArrowLeft", 20, steps, 0, 100, true)).toBe(25);
    expect(steppedValue("ArrowUp", 20, steps, 0, 100, true)).toBe(25);
  });
});
