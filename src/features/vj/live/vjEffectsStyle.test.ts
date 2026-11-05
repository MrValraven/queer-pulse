import { describe, expect, it } from "vitest";
import { VJ_PIXELATED_MIN_SCALE } from "../vj.constants";
import {
  shouldPixelateVjClip,
  vjLayerFilter,
  vjLayerTransform,
  vjPlaybackRateFor,
  vjRenderScale,
} from "./vjEffectsStyle";

const FULL_HD = { width: 1920, height: 1080 };

describe("vjEffectsStyle", () => {
  it("maps black and white and mirror to a filter and a transform", () => {
    expect(vjLayerFilter({ isMonochrome: true })).toBe("grayscale(1)");
    expect(vjLayerFilter({ isMonochrome: false })).toBe("none");
    expect(vjLayerTransform({ isMirrored: true })).toBe("scaleX(-1)");
    expect(vjLayerTransform({ isMirrored: false })).toBe("none");
  });

  it("gives videos the speed and GIFs none", () => {
    expect(vjPlaybackRateFor("video", 1.5)).toBe(1.5);
    expect(vjPlaybackRateFor("video", 0.5)).toBe(0.5);
    expect(vjPlaybackRateFor("gif", 2)).toBeNull();
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
