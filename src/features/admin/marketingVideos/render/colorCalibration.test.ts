import { describe, expect, it } from "vitest";
import { colourError, parseCssRgb } from "./colorCalibration";

describe("parseCssRgb", () => {
  it("reads getComputedStyle colours", () => {
    expect(parseCssRgb("rgb(232, 119, 90)")).toEqual([232, 119, 90]);
    expect(parseCssRgb("rgba(74, 140, 111, 1)")).toEqual([74, 140, 111]);
    expect(parseCssRgb("rgb(74 140 111)")).toEqual([74, 140, 111]);
  });

  it("refuses anything else", () => {
    expect(parseCssRgb("#4a8c6f")).toBeNull();
    expect(parseCssRgb("transparent")).toBeNull();
  });
});

describe("colourError", () => {
  it("prefers the matrix label that brings the brand colours back", () => {
    const truth = [
      [74, 140, 111],
      [232, 119, 90],
    ] as const;
    // Measured in Chromium on Linux: as labelled (BT.709) vs relabelled BT.601.
    const asLabelled = [
      [68, 131, 110],
      [242, 130, 90],
    ] as const;
    const asBt601 = [
      [73, 140, 110],
      [231, 120, 90],
    ] as const;
    expect(colourError(asBt601, truth)).toBeLessThan(
      colourError(asLabelled, truth),
    );
    expect(colourError(truth, truth)).toBe(0);
  });
});
