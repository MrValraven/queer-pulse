import { describe, expect, it } from "vitest";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { bakesCropIntoPixels, cropPixelRect } from "./uploadProcessing";

/**
 * The pure half of the baked avatar crop: which kinds bake, and how a
 * fractional reframe crop maps onto whole source pixels. The canvas half
 * (`cropDecoded`) needs a real 2D context, which jsdom lacks.
 */

function cropOf(x: number, y: number, width: number, height: number) {
  const crop: CropRect = { x, y, width, height, aspect: "1:1" };
  return crop;
}

describe("bakesCropIntoPixels", () => {
  it("bakes the three square avatar kinds", () => {
    expect(bakesCropIntoPixels("avatar")).toBe(true);
    expect(bakesCropIntoPixels("group-avatar")).toBe(true);
    expect(bakesCropIntoPixels("community-avatar")).toBe(true);
  });

  it("keeps covers and freeform photos on the metadata path", () => {
    expect(bakesCropIntoPixels("story-cover")).toBe(false);
    expect(bakesCropIntoPixels("persona-cover")).toBe(false);
    expect(bakesCropIntoPixels("community-cover")).toBe(false);
    expect(bakesCropIntoPixels("listing-photo")).toBe(false);
    expect(bakesCropIntoPixels("work-image")).toBe(false);
  });
});

describe("cropPixelRect", () => {
  it("maps a square crop of a landscape photo onto source pixels", () => {
    // 0.48 of 1000 and 0.6 of 800 are both 480px: a square in pixels.
    expect(cropPixelRect(cropOf(0.1, 0.2, 0.48, 0.6), 1000, 800)).toEqual({
      sourceX: 100,
      sourceY: 160,
      sourceWidth: 480,
      sourceHeight: 480,
    });
  });

  it("moves the origin back when rounding pushes the rect past the edge", () => {
    // 1.5 rounds up for both origin and size, which would end at 4 on a 3px image.
    expect(cropPixelRect(cropOf(0.5, 0.5, 0.5, 0.5), 3, 3)).toEqual({
      sourceX: 1,
      sourceY: 1,
      sourceWidth: 2,
      sourceHeight: 2,
    });
  });

  it("keeps a vanishingly small crop at least one pixel wide", () => {
    const rect = cropPixelRect(cropOf(0, 0, 0.0001, 0.0001), 200, 200);
    expect(rect.sourceWidth).toBe(1);
    expect(rect.sourceHeight).toBe(1);
  });

  it("clamps a crop that overshoots the image to the image bounds", () => {
    expect(cropPixelRect(cropOf(-0.01, -0.02, 1.2, 1.1), 400, 300)).toEqual({
      sourceX: 0,
      sourceY: 0,
      sourceWidth: 400,
      sourceHeight: 300,
    });
  });
});
