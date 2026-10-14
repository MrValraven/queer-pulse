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

  it("never crossfades consecutive positions of the same release", () => {
    const at = (trackId: string, releaseId: string) => ({ trackId, releaseId });
    const tracklist = ["t1", "t2", "t3"];
    expect(canCrossfadeBetween(at("t1", "r1"), at("x", "r2"), tracklist)).toBe(
      true,
    );
    expect(canCrossfadeBetween(at("t1", "r1"), at("t2", "r1"), tracklist)).toBe(
      false,
    );
    expect(canCrossfadeBetween(at("t3", "r1"), at("t1", "r1"), tracklist)).toBe(
      true,
    );
    expect(canCrossfadeBetween(at("t1", "r1"), at("t2", "r1"), null)).toBe(
      false,
    );
  });
});
