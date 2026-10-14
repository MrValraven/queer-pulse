import { describe, expect, it } from "vitest";
import { STUDIO_LOUDNESS_TARGET_LUFS, trackGainDb } from "./studioLoudness";

const gain = (loudnessLufs: number | null, peakDb: number | null) =>
  trackGainDb({ loudnessLufs, peakDb });

describe("trackGainDb", () => {
  it("targets -14 LUFS", () => {
    expect(STUDIO_LOUDNESS_TARGET_LUFS).toBe(-14);
    expect(gain(-14, -3)).toBeCloseTo(0);
  });

  it("turns a loud master down", () => {
    expect(gain(-7.8, -0.1)).toBeCloseTo(-6.2);
  });

  it("boosts a quiet track while its peak stays at or below -1 dBFS", () => {
    expect(gain(-20, -6)).toBeCloseTo(5);
    expect(gain(-20, -10)).toBeCloseTo(6);
    expect(gain(-20, 2.5)).toBeCloseTo(-3.5);
  });

  it("keeps the gain between -12 and +6 dB", () => {
    expect(gain(-40, -30)).toBe(6);
    expect(gain(-1, -1)).toBe(-12);
  });

  it("clamps whatever the server sends", () => {
    expect(gain(5, 10)).toBe(-12);
    expect(gain(-500, -500)).toBe(6);
  });

  it("is 0 dB when a measurement is missing", () => {
    expect(gain(null, -1)).toBe(0);
    expect(gain(-9, null)).toBe(0);
    expect(gain(Number.NaN, -1)).toBe(0);
  });
});
