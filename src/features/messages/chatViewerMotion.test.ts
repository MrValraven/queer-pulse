import { describe, expect, it } from "vitest";
import {
  flipTransformFrom,
  isOriginStillVisible,
  readViewerMotionVariant,
} from "./chatViewerMotion";

const rect = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
});

describe("readViewerMotionVariant", () => {
  it("reads the zoom variant off the query string", () => {
    expect(readViewerMotionVariant("?photoAnim=zoom")).toBe("zoom");
  });

  it("falls back to the scale variant for anything else", () => {
    // The fallback is the variant that needs nothing from the page it opened
    // over, so a typo or a stale link can never leave the viewer with no
    // animation at all.
    expect(readViewerMotionVariant("")).toBe("scale");
    expect(readViewerMotionVariant("?photoAnim=")).toBe("scale");
    expect(readViewerMotionVariant("?photoAnim=sparkle")).toBe("scale");
    expect(readViewerMotionVariant("?tab=photos")).toBe("scale");
  });
});

describe("flipTransformFrom", () => {
  it("parks the full screen photo exactly on its thumbnail", () => {
    // A 200-wide thumbnail at (20, 400) and an 800-wide photo letterboxed at
    // (100, 100): quarter scale, and the two centres must meet — (120, 475)
    // against (500, 400).
    const transform = flipTransformFrom(
      rect(20, 400, 200, 150),
      rect(100, 100, 800, 600),
    );
    expect(transform).toBe("translate(-380px, 75px) scale(0.25)");
  });

  it("scales uniformly rather than per axis", () => {
    // Both rectangles hold the same photo, so one factor matches both axes.
    // Deriving height separately would stretch the photo on any pair that
    // rounded differently, which is exactly what subpixel layout produces.
    // Concentric, so only the scale is under test: the thumbnail's height is
    // 74 against a quarter of 300, which is 75.
    const transform = flipTransformFrom(
      rect(150, 113, 100, 74),
      rect(0, 0, 400, 300),
    );
    expect(transform).toBe("translate(0px, 0px) scale(0.25)");
  });

  it("gives up on a rectangle with no area", () => {
    // An image that has not been measured yet (no intrinsic dimensions on the
    // attachment, nothing decoded), or a bubble the virtualized log unmounted
    // while the viewer was open. Null is the caller's cue to fade instead.
    expect(
      flipTransformFrom(rect(0, 0, 0, 0), rect(0, 0, 400, 300)),
    ).toBeNull();
    expect(flipTransformFrom(rect(0, 0, 100, 75), rect(0, 0, 0, 0))).toBeNull();
  });
});

describe("isOriginStillVisible", () => {
  function bubbleAt(top: number, height: number): HTMLElement {
    const element = document.createElement("div");
    element.getBoundingClientRect = () =>
      ({
        left: 0,
        top,
        width: 200,
        height,
        bottom: top + height,
        right: 200,
      }) as DOMRect;
    document.body.append(element);
    return element;
  }

  it("accepts a bubble still on screen", () => {
    expect(isOriginStillVisible(bubbleAt(300, 150), 800)).toBe(true);
  });

  it("rejects a bubble scrolled off either edge", () => {
    // Shrinking the photo into a rectangle above the top of the window reads
    // as it flying off somewhere arbitrary.
    expect(isOriginStillVisible(bubbleAt(-400, 150), 800)).toBe(false);
    expect(isOriginStillVisible(bubbleAt(900, 150), 800)).toBe(false);
  });

  it("rejects a bubble the log has unmounted", () => {
    const detached = document.createElement("div");
    expect(isOriginStillVisible(detached, 800)).toBe(false);
    expect(isOriginStillVisible(null, 800)).toBe(false);
  });
});
