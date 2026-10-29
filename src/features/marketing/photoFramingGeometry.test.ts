import { describe, expect, it } from "vitest";
import {
  CENTRE_OVER_CROP_ZOOM,
  DEFAULT_PHOTO_FRAMING,
  PHOTO_ZOOM_SLIDER_STEP,
  clampPhotoFraming,
  coverRenderedSize,
  framingForSave,
  isSamePhotoFraming,
  nudgePhotoFraming,
  photoFramingStyle,
  resolveShotFraming,
  roundPhotoFraming,
  visibleFractionOf,
} from "./photoFramingGeometry";

describe("photoFramingGeometry", () => {
  it("clampPhotoFraming holds focus inside 0..1 and zoom inside 1..3", () => {
    expect(clampPhotoFraming({ focusX: -0.2, focusY: 1.4, zoom: 9 })).toEqual({
      focusX: 0,
      focusY: 1,
      zoom: 3,
    });
    expect(
      clampPhotoFraming({ focusX: 0.3, focusY: 0.3, zoom: 0.5 }).zoom,
    ).toBe(1);
  });

  it("clampPhotoFraming replaces a non-finite value with the centred default for that field", () => {
    expect(
      clampPhotoFraming({ focusX: Number.NaN, focusY: 0.2, zoom: Infinity }),
    ).toEqual({ focusX: 0.5, focusY: 0.2, zoom: 1 });
  });

  it("roundPhotoFraming keeps four decimals", () => {
    expect(
      roundPhotoFraming({ focusX: 0.123456, focusY: 0.5, zoom: 1.98765 }),
    ).toEqual({ focusX: 0.1235, focusY: 0.5, zoom: 1.9877 });
  });

  it("isSamePhotoFraming ignores differences below the fourth decimal", () => {
    expect(
      isSamePhotoFraming(
        { focusX: 0.5, focusY: 0.5, zoom: 1 },
        { focusX: 0.50004, focusY: 0.5, zoom: 1 },
      ),
    ).toBe(true);
    expect(
      isSamePhotoFraming(DEFAULT_PHOTO_FRAMING, {
        ...DEFAULT_PHOTO_FRAMING,
        zoom: CENTRE_OVER_CROP_ZOOM,
      }),
    ).toBe(false);
  });

  it("resolveShotFraming prefers framing, then the media crop centre at zoom 1, then the centre", () => {
    const crop = { x: 0.1, y: 0.2, width: 0.4, height: 0.2, aspect: "free" };
    expect(
      resolveShotFraming({
        framing: { focusX: 0.9, focusY: 0.1, zoom: 2 },
        crop,
      }),
    ).toEqual({ focusX: 0.9, focusY: 0.1, zoom: 2 });
    expect(resolveShotFraming({ crop })).toEqual({
      focusX: 0.3,
      focusY: 0.3,
      zoom: 1,
    });
    expect(resolveShotFraming({})).toEqual(DEFAULT_PHOTO_FRAMING);
  });

  it("photoFramingStyle writes the focal point as percentages and the zoom as a number", () => {
    expect(photoFramingStyle({ focusX: 0.25, focusY: 0.8, zoom: 1.5 })).toEqual(
      {
        "--frame-x": "25%",
        "--frame-y": "80%",
        "--frame-zoom": "1.5",
      },
    );
  });

  it("coverRenderedSize scales the image until it covers the frame", () => {
    expect(
      coverRenderedSize(
        { width: 400, height: 200 },
        { width: 1000, height: 1000 },
      ),
    ).toEqual({ width: 400, height: 400 });
    expect(
      coverRenderedSize(
        { width: 400, height: 200 },
        { width: 2000, height: 500 },
      ),
    ).toEqual({ width: 800, height: 200 });
  });

  it("visibleFractionOf returns the share of the rendered image the frame shows", () => {
    expect(visibleFractionOf(400, 800, 2)).toBe(0.25);
    expect(visibleFractionOf(400, 400, 1)).toBe(1);
    expect(visibleFractionOf(400, 0, 1)).toBeNull();
  });

  it("nudgePhotoFraming moves the picture the way each arrow points, as a drag that way does", () => {
    expect(
      nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "ArrowRight")?.focusX,
    ).toBeCloseTo(0.45);
    expect(
      nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "ArrowLeft")?.focusX,
    ).toBeCloseTo(0.55);
    expect(
      nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "ArrowDown")?.focusY,
    ).toBeCloseTo(0.45);
    expect(
      nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "ArrowUp")?.focusY,
    ).toBeCloseTo(0.55);
    expect(
      nudgePhotoFraming({ ...DEFAULT_PHOTO_FRAMING, focusX: 1 }, "ArrowLeft")
        ?.focusX,
    ).toBe(1);
    expect(
      nudgePhotoFraming({ ...DEFAULT_PHOTO_FRAMING, focusY: 0 }, "ArrowDown")
        ?.focusY,
    ).toBe(0);
  });

  it("nudgePhotoFraming zooms with plus and minus and stays in bounds", () => {
    expect(nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "+")?.zoom).toBeCloseTo(
      1.1,
    );
    expect(nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "=")?.zoom).toBeCloseTo(
      1.1,
    );
    expect(nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "-")?.zoom).toBe(1);
    expect(
      nudgePhotoFraming({ ...DEFAULT_PHOTO_FRAMING, zoom: 3 }, "+")?.zoom,
    ).toBe(3);
    expect(nudgePhotoFraming(DEFAULT_PHOTO_FRAMING, "a")).toBeNull();
  });

  it("the zoom slider covers 1x to 3x in 40 keyboard steps", () => {
    expect(PHOTO_ZOOM_SLIDER_STEP).toBe(0.05);
    expect(Math.round((3 - 1) / PHOTO_ZOOM_SLIDER_STEP)).toBe(40);
  });

  it("framingForSave keeps an explicit centre when the photo has a media crop", () => {
    expect(framingForSave(DEFAULT_PHOTO_FRAMING, true)).toEqual({
      focusX: 0.5,
      focusY: 0.5,
      zoom: CENTRE_OVER_CROP_ZOOM,
    });
    expect(framingForSave(DEFAULT_PHOTO_FRAMING, false)).toEqual(
      DEFAULT_PHOTO_FRAMING,
    );
    expect(
      framingForSave({ focusX: 0.123456, focusY: 2, zoom: 1.5 }, true),
    ).toEqual({ focusX: 0.1235, focusY: 1, zoom: 1.5 });
  });
});
