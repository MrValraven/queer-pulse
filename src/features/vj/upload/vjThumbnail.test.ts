import { describe, expect, it } from "vitest";
import { vjThumbnailSize } from "./vjThumbnail";

describe("vjThumbnailSize", () => {
  it("scales the longest edge to 480", () => {
    expect(vjThumbnailSize(1920, 1080)).toEqual({
      width: 480,
      height: 270,
      isPixelated: false,
    });
    expect(vjThumbnailSize(180, 320)).toEqual({
      width: 270,
      height: 480,
      isPixelated: false,
    });
  });

  it("draws tiny GIFs pixelated", () => {
    expect(vjThumbnailSize(64, 48)).toEqual({
      width: 480,
      height: 360,
      isPixelated: true,
    });
  });

  it("keeps each side at least one pixel", () => {
    expect(vjThumbnailSize(10_000, 1)).toEqual({
      width: 480,
      height: 1,
      isPixelated: false,
    });
  });
});
