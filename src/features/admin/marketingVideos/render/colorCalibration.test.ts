import { describe, expect, it } from "vitest";
import { FILM_FORMATS } from "../marketingVideos.data";
import {
  calibrationPatchSize,
  calibrationPatches,
  colourError,
  parseCssRgb,
} from "./colorCalibration";

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

describe("calibrationPatches", () => {
  it("keeps the 16:9 patches where they always were", () => {
    expect(calibrationPatches(FILM_FORMATS.landscape)).toEqual([
      { x: 560, y: 540 },
      { x: 960, y: 540 },
      { x: 1360, y: 540 },
    ]);
    expect(calibrationPatchSize(FILM_FORMATS.landscape)).toBe(240);
  });

  it.each(Object.entries(FILM_FORMATS))(
    "fits every %s patch inside the film without overlap",
    (_format, size) => {
      const patches = calibrationPatches(size);
      const half = calibrationPatchSize(size) / 2;
      expect(patches).toHaveLength(3);
      for (const { x, y } of patches) {
        expect(x - half).toBeGreaterThanOrEqual(0);
        expect(x + half).toBeLessThanOrEqual(size.width);
        expect(y - half).toBeGreaterThanOrEqual(0);
        expect(y + half).toBeLessThanOrEqual(size.height);
      }
      const gaps = patches
        .slice(1)
        .map(({ x }, index) => x - (patches[index]?.x ?? 0));
      for (const gap of gaps) expect(gap).toBeGreaterThan(half * 2);
    },
  );
});
