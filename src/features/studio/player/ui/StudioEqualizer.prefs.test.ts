import { afterEach, describe, expect, it } from "vitest";
import {
  clampEqualizerGain,
  FLAT_EQUALIZER_GAINS,
  isFlatEqualizer,
  normalizeEqualizerGains,
  readEqualizerGains,
  STUDIO_EQUALIZER_KEY,
  writeEqualizerGains,
} from "../studioPlayerPreferences";

afterEach(() => {
  window.localStorage.removeItem(STUDIO_EQUALIZER_KEY);
  writeEqualizerGains(FLAT_EQUALIZER_GAINS);
  window.localStorage.removeItem(STUDIO_EQUALIZER_KEY);
});

describe("clampEqualizerGain", () => {
  it("keeps a gain inside plus or minus 12 dB, in half-decibel steps", () => {
    expect(clampEqualizerGain(3)).toBe(3);
    expect(clampEqualizerGain(2.74)).toBe(2.5);
    expect(clampEqualizerGain(40)).toBe(12);
    expect(clampEqualizerGain(-40)).toBe(-12);
  });

  it("reads anything that is not a finite number as 0", () => {
    expect(clampEqualizerGain(Number.NaN)).toBe(0);
    expect(clampEqualizerGain(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampEqualizerGain("6")).toBe(0);
    expect(clampEqualizerGain(null)).toBe(0);
    expect(Object.is(clampEqualizerGain(-0.1), 0)).toBe(true);
  });
});

describe("normalizeEqualizerGains", () => {
  it("keeps five clamped gains", () => {
    expect(normalizeEqualizerGains({ gainsDb: [3, 1, 0, -1, 20] })).toEqual([
      3, 1, 0, -1, 12,
    ]);
  });

  it("falls back to flat for a missing or malformed record", () => {
    expect(normalizeEqualizerGains(null)).toBe(FLAT_EQUALIZER_GAINS);
    expect(normalizeEqualizerGains("warm")).toBe(FLAT_EQUALIZER_GAINS);
    expect(normalizeEqualizerGains({ gainsDb: [1, 2] })).toBe(
      FLAT_EQUALIZER_GAINS,
    );
    expect(normalizeEqualizerGains({ gainsDb: "1,2,3,4,5" })).toBe(
      FLAT_EQUALIZER_GAINS,
    );
  });

  it("answers the shared flat array for an all-zero record", () => {
    const gainsDb = normalizeEqualizerGains({ gainsDb: [0, 0, 0, 0, 0] });
    expect(gainsDb).toBe(FLAT_EQUALIZER_GAINS);
    expect(isFlatEqualizer(gainsDb)).toBe(true);
  });
});

describe("the stored equaliser", () => {
  it("stores flat as a record, so a reset reaches other tabs", () => {
    writeEqualizerGains([5, 2, 0, 0, 0]);
    expect(readEqualizerGains()).toEqual([5, 2, 0, 0, 0]);
    writeEqualizerGains(FLAT_EQUALIZER_GAINS);
    expect(window.localStorage.getItem(STUDIO_EQUALIZER_KEY)).toBe(
      JSON.stringify({ gainsDb: FLAT_EQUALIZER_GAINS }),
    );
    expect(readEqualizerGains()).toBe(FLAT_EQUALIZER_GAINS);
  });

  it("follows a record another tab wrote", () => {
    writeEqualizerGains([3, 1, 0, -1, -2]);
    window.localStorage.setItem(
      STUDIO_EQUALIZER_KEY,
      JSON.stringify({ gainsDb: [0, 0, 0, 0, 0] }),
    );
    expect(isFlatEqualizer(readEqualizerGains())).toBe(true);
  });
});
