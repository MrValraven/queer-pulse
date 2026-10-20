import { describe, expect, it } from "vitest";
import {
  canCrossfadeBetween,
  crossfadeStartSeconds,
  isPreloadFresh,
  preloadStartSeconds,
} from "./studioHandover";

describe("handover timing", () => {
  it("preloads 20 seconds before the end, or halfway through a short track", () => {
    expect(preloadStartSeconds(200)).toBe(180);
    expect(preloadStartSeconds(3852)).toBe(3832);
    expect(preloadStartSeconds(30)).toBe(15);
  });

  it("starts a crossfade its length before the end", () => {
    expect(crossfadeStartSeconds(200, 6)).toBe(194);
    expect(crossfadeStartSeconds(4, 6)).toBe(0);
  });

  it("uses a preload only while its URL has more than 30 seconds left", () => {
    expect(isPreloadFresh(100_000, 69_999)).toBe(true);
    expect(isPreloadFresh(100_000, 70_000)).toBe(false);
    expect(isPreloadFresh(Number.NaN, 0)).toBe(false);
  });

  it("crossfades by default, when the next stream names no track or another one", () => {
    const current = { trackId: "t1" };
    expect(canCrossfadeBetween(current, null)).toBe(true);
    expect(canCrossfadeBetween(current, "t0")).toBe(true);
  });

  it("swaps gaplessly when the next stream follows the current track without a gap", () => {
    expect(canCrossfadeBetween({ trackId: "t1" }, "t1")).toBe(false);
  });
});
