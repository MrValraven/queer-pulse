import { describe, expect, it } from "vitest";
import { barsForWidth, chapterTickPositions } from "./studioWaveformBars";

const ramp = Array.from({ length: 200 }, (_peak, index) => index / 199);

describe("barsForWidth", () => {
  it("keeps all 200 peaks when there is room", () => {
    expect(barsForWidth(ramp, 600)).toHaveLength(200);
  });

  it("merges neighbours by their maximum on a narrow bar", () => {
    const bars = barsForWidth(ramp, 300);
    expect(bars).toHaveLength(100);
    expect(bars[0]).toBeCloseTo(1 / 199, 6);
    expect(bars[99]).toBe(1);
  });

  it("answers nothing before the width is known", () => {
    expect(barsForWidth(ramp, 0)).toEqual([]);
  });
});

describe("chapterTickPositions", () => {
  it("leaves out the start and anything past the end", () => {
    expect(chapterTickPositions([0, 50, 150, 250], 200)).toEqual([0.25, 0.75]);
    expect(chapterTickPositions([0, 50], 0)).toEqual([]);
  });
});
