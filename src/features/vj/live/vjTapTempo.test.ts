import { describe, expect, it } from "vitest";
import {
  VJ_TAP_MEMORY,
  VJ_TAP_RESET_GAP_MS,
  registerVjTap,
} from "./vjTapTempo";

function tapAll(tapTimes: readonly number[]): {
  tapTimes: number[];
  bpm: number | null;
} {
  let result: { tapTimes: number[]; bpm: number | null } = {
    tapTimes: [],
    bpm: null,
  };
  for (const tapTime of tapTimes) {
    result = registerVjTap(result.tapTimes, tapTime);
  }
  return result;
}

describe("vjTapTempo", () => {
  it("needs two taps for a tempo", () => {
    const firstTap = registerVjTap([], 1000);
    expect(firstTap).toEqual({ tapTimes: [1000], bpm: null });
    const secondTap = registerVjTap(firstTap.tapTimes, 1500);
    expect(secondTap.bpm).toBe(120);
  });

  it("averages the intervals of the last taps", () => {
    expect(tapAll([0, 500, 1000, 1500]).bpm).toBe(120);
    expect(tapAll([0, 480, 1000, 1500]).bpm).toBe(120);
    expect(tapAll([0, 400, 900, 1500]).bpm).toBe(120);
  });

  it("starts over after a 2 second gap", () => {
    const beforeGap = tapAll([0, 500, 1000]);
    const afterGap = registerVjTap(
      beforeGap.tapTimes,
      1000 + VJ_TAP_RESET_GAP_MS + 1,
    );
    expect(afterGap).toEqual({ tapTimes: [3001], bpm: null });
  });

  it("starts over when the clock goes backwards", () => {
    const beforeJump = tapAll([5000, 5500]);
    expect(registerVjTap(beforeJump.tapTimes, 100)).toEqual({
      tapTimes: [100],
      bpm: null,
    });
  });

  it("keeps the last 8 taps", () => {
    const slowTaps = [0, 1000, 2000, 3000];
    const fastTaps = Array.from(
      { length: 8 },
      (_, tapIndex) => 3500 + tapIndex * 500,
    );
    const result = tapAll([...slowTaps, ...fastTaps]);
    expect(result.tapTimes).toHaveLength(VJ_TAP_MEMORY);
    expect(result.tapTimes).toEqual(fastTaps);
    expect(result.bpm).toBe(120);
  });

  it("clamps to 60 and 200 and rounds to one decimal", () => {
    expect(tapAll([0, 1900]).bpm).toBe(60);
    expect(tapAll([0, 100, 200]).bpm).toBe(200);
    expect(tapAll([0, 100, 100]).bpm).toBe(200);
    expect(tapAll([0, 487]).bpm).toBe(123.2);
  });
});
