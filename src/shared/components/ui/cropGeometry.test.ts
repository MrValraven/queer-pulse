import { describe, it, expect } from "vitest";
import {
  baseCropForAspect,
  cropRectFromPanZoom,
  panZoomFromCropRect,
  cropToImgStyle,
  cropFocalPosition,
  IDENTITY_CROP,
} from "./cropGeometry";

const wide = { width: 2000, height: 1000 }; // 2:1 source

describe("baseCropForAspect", () => {
  it("for a square frame on a 2:1 source, height is the limiting dimension", () => {
    const base = baseCropForAspect(wide, 1); // aspect 1:1
    expect(base.height).toBeCloseTo(1, 5);
    expect(base.width).toBeCloseTo(0.5, 5); // 1000px square / 2000px width
  });
});

describe("pan/zoom round-trip", () => {
  it("recovers the same rect it produced", () => {
    const rect = cropRectFromPanZoom(wide, 1, 1.5, 0.25, 0.75, "1:1");
    const { zoom, panX, panY } = panZoomFromCropRect(wide, 1, rect);
    const rebuilt = cropRectFromPanZoom(wide, 1, zoom, panX, panY, "1:1");
    expect(rebuilt.x).toBeCloseTo(rect.x, 4);
    expect(rebuilt.y).toBeCloseTo(rect.y, 4);
    expect(rebuilt.width).toBeCloseTo(rect.width, 4);
    expect(rebuilt.height).toBeCloseTo(rect.height, 4);
  });

  it("zoom shrinks the crop rect", () => {
    const wideRect = cropRectFromPanZoom(wide, 1, 1, 0.5, 0.5, "1:1");
    const zoomedRect = cropRectFromPanZoom(wide, 1, 2, 0.5, 0.5, "1:1");
    expect(zoomedRect.width).toBeLessThan(wideRect.width);
  });
});

describe("cropToImgStyle", () => {
  it("maps a centered half-size square crop to img percentages", () => {
    const style = cropToImgStyle({
      x: 0.25,
      y: 0,
      width: 0.5,
      height: 1,
      aspect: "1:1",
    });
    expect(style.width).toBe("200%"); // 100 / 0.5
    expect(style.height).toBe("100%");
    expect(style.left).toBe("-50%"); // -100 * 0.25 / 0.5
    expect(style.top).toBe("0%");
  });
});

describe("cropFocalPosition", () => {
  it("centres on the middle of the crop rect", () => {
    // A 3:1 band taken from the TOP THIRD of a tall source: the subject the
    // member framed sits at 1/6 down the file, so that is where the banner
    // must anchor — not the 50% the browser would default to.
    expect(
      cropFocalPosition({ x: 0, y: 0, width: 1, height: 1 / 3, aspect: "3:1" }),
    ).toBe("50% 16.7%");
  });

  it("is the plain centre for an unreframed crop", () => {
    expect(cropFocalPosition(IDENTITY_CROP)).toBe("50% 50%");
  });

  it("clamps a rect that runs past the image edge", () => {
    expect(
      cropFocalPosition({
        x: 0.9,
        y: 0.9,
        width: 1,
        height: 1,
        aspect: "free",
      }),
    ).toBe("100% 100%");
  });
});
