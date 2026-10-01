import { describe, expect, it } from "vitest";
import {
  MARKER_CELLS,
  MAX_MARKER_INDEX,
  cellLumaFromRow,
  markerPattern,
  readMarker,
} from "./frameMarker";

const toLuma = (pattern: boolean[]): number[] =>
  pattern.map((light) => (light ? 255 : 0));

describe("frame marker", () => {
  it("round-trips every index a long render can reach", () => {
    for (const index of [0, 1, 2, 7, 1440, 5759, MAX_MARKER_INDEX]) {
      expect(readMarker(toLuma(markerPattern(index)))).toBe(index);
    }
  });

  it("rejects indexes it cannot encode", () => {
    expect(() => markerPattern(-1)).toThrow(RangeError);
    expect(() => markerPattern(MAX_MARKER_INDEX + 1)).toThrow(RangeError);
    expect(() => markerPattern(1.5)).toThrow(RangeError);
  });

  it("skips a frame whose guard cells are wrong", () => {
    const luma = toLuma(markerPattern(42));
    luma[MARKER_CELLS - 1] = 255;
    expect(readMarker(luma)).toBeNull();
  });

  it("skips a frame caught mid-transition", () => {
    const luma = toLuma(markerPattern(42));
    luma[3] = 128;
    expect(readMarker(luma)).toBeNull();
  });

  it("samples the centre of each cell from a pixel row", () => {
    const width = 160;
    const pattern = markerPattern(1234);
    const row = new Uint8ClampedArray(width * 4);
    for (let x = 0; x < width; x++) {
      const value = pattern[Math.floor((x / width) * MARKER_CELLS)] ? 255 : 0;
      row.set([value, value, value, 255], x * 4);
    }
    expect(readMarker(cellLumaFromRow(row, width))).toBe(1234);
  });
});
