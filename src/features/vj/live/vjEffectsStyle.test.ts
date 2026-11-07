import { describe, expect, it } from "vitest";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";
import {
  shouldPixelateVjClip,
  vjEffectivePlaybackRate,
  vjPlaybackRateFor,
  vjRenderScale,
} from "./vjEffectsStyle";

const FULL_HD = { width: 1920, height: 1080 };

describe("vjEffectsStyle", () => {
  it("composes clip default speed with the stage speed", () => {
    expect(vjEffectivePlaybackRate(1, 1.5)).toBe(1.5);
    expect(vjEffectivePlaybackRate(2, 0.5)).toBe(1);
    expect(vjEffectivePlaybackRate(0.5, 2)).toBe(1);
    expect(vjEffectivePlaybackRate(1.5, 2)).toBe(3);
    expect(vjPlaybackRateFor("video", 1.5)).toBe(1.5);
    expect(vjPlaybackRateFor("video", 2, 0.5)).toBe(1);
  });

  it("clamps to 0.25 and 4", () => {
    expect(vjEffectivePlaybackRate(4, 4)).toBe(4);
    expect(vjEffectivePlaybackRate(2, 4)).toBe(4);
    expect(vjEffectivePlaybackRate(0.25, 0.25)).toBe(0.25);
    expect(vjEffectivePlaybackRate(0.5, 0.25)).toBe(0.25);
    expect(vjPlaybackRateFor("video", 4, 4)).toBe(4);
  });

  it("reads a non-finite default speed as 1", () => {
    expect(vjEffectivePlaybackRate(Number.NaN, 2)).toBe(2);
    expect(vjEffectivePlaybackRate(Number.POSITIVE_INFINITY, 0.5)).toBe(0.5);
  });

  it("a GIF still answers null", () => {
    expect(vjPlaybackRateFor("gif", 2)).toBeNull();
    expect(vjPlaybackRateFor("gif", 1, 1.5)).toBeNull();
  });

  it("pixelates a 320 by 240 GIF filling a 1920 by 1080 screen", () => {
    const smallGif = {
      mediaKind: "gif" as const,
      width: 320,
      height: 240,
      fitMode: "fill" as const,
    };
    expect(vjRenderScale(smallGif, FULL_HD)).toBe(6);
    expect(VJ_PIXELATED_MIN_SCALE).toBeLessThanOrEqual(6);
    expect(shouldPixelateVjClip(smallGif, FULL_HD)).toBe(true);
  });

  it("leaves a large GIF and every video smooth", () => {
    expect(
      shouldPixelateVjClip(
        { mediaKind: "gif", width: 1920, height: 1080, fitMode: "fill" },
        FULL_HD,
      ),
    ).toBe(false);
    expect(
      shouldPixelateVjClip(
        { mediaKind: "video", width: 320, height: 240, fitMode: "fill" },
        FULL_HD,
      ),
    ).toBe(false);
  });

  it("uses the contain scale for a fitted clip", () => {
    const wideClip = { width: 960, height: 240 };
    expect(vjRenderScale({ ...wideClip, fitMode: "fit" }, FULL_HD)).toBe(2);
    expect(vjRenderScale({ ...wideClip, fitMode: "fill" }, FULL_HD)).toBe(4.5);
  });

  it("reads an unknown size as scale 1", () => {
    expect(
      vjRenderScale({ width: 0, height: 240, fitMode: "fill" }, FULL_HD),
    ).toBe(1);
    expect(
      vjRenderScale(
        { width: 320, height: 240, fitMode: "fill" },
        { width: 0, height: 0 },
      ),
    ).toBe(1);
  });
});
