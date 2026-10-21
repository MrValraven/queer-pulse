import { describe, expect, it } from "vitest";
import {
  shouldAnnounceSeek,
  shouldReleaseSeekHold,
  type StudioSeekHold,
} from "./studioSeekDisplay";

const hold: StudioSeekHold = {
  targetSeconds: 100,
  originSeconds: 20,
  startedAtMs: 0,
  expectedSeekCount: 4,
};

/** The clock after this bar's own seek landed, unless told otherwise. */
function clockAt(clockSeconds: number, isPlaying: boolean, clockSeekCount = 4) {
  return { clockSeconds, clockSeekCount, isPlaying };
}

describe("shouldReleaseSeekHold", () => {
  it("keeps the hold on the tick that lands exactly on the target while playing", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(100, true))).toBe(false);
  });

  it("lets go on the next real tick near the target while playing", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(100.25, true))).toBe(true);
    expect(shouldReleaseSeekHold(hold, clockAt(99.6, true))).toBe(true);
  });

  it("lets go as soon as a paused clock reaches the target", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(100, false))).toBe(true);
  });

  it("keeps the hold through a stale tick near the origin", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(20.25, true))).toBe(false);
    expect(shouldReleaseSeekHold(hold, clockAt(21.5, false))).toBe(false);
  });

  it("keeps the hold while the clock has not counted this seek yet", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(20, true, 3))).toBe(false);
  });

  it("lets go at once when another control seeks, even near the origin", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(21, true, 5))).toBe(true);
    expect(shouldReleaseSeekHold(hold, clockAt(100, true, 5))).toBe(true);
  });

  it("lets go when the clock jumps far from both ends", () => {
    expect(shouldReleaseSeekHold(hold, clockAt(160, true))).toBe(true);
    expect(shouldReleaseSeekHold(hold, clockAt(5, false))).toBe(true);
  });
});

describe("shouldAnnounceSeek", () => {
  it("speaks every exact change", () => {
    expect(shouldAnnounceSeek(20, 21, true)).toBe(true);
    expect(shouldAnnounceSeek(20, 20, true)).toBe(false);
    expect(shouldAnnounceSeek(Number.NaN, Number.NaN, true)).toBe(false);
  });

  it("speaks steady playback in five second steps", () => {
    expect(shouldAnnounceSeek(20, 24.75, false)).toBe(false);
    expect(shouldAnnounceSeek(20, 25, false)).toBe(true);
  });

  it("speaks a jump back at once", () => {
    expect(shouldAnnounceSeek(20, 19.75, false)).toBe(false);
    expect(shouldAnnounceSeek(20, 18, false)).toBe(true);
  });
});
