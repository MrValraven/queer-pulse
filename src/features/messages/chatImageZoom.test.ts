import { describe, expect, it } from "vitest";
import {
  clampScale,
  clampTranslate,
  DOUBLE_TAP_SCALE,
  dragFeedbackFor,
  DRAG_AXIS_LOCK_PX,
  IDLE_DRAG,
  IDLE_ZOOM,
  lockDragAxis,
  MAX_SCALE,
  toTransform,
  zoomAround,
} from "./chatImageZoom";

const stageSize = { width: 400, height: 800 };
// A photo whose aspect ratio matches the stage's: its own box equals the
// stage's box in both axes, so the fitting-axis maths and the letterboxed-
// axis maths agree here. Every case below except the "letterboxed" describe
// block uses this, so it still exercises the general formula, not a
// coincidence of one particular box.
const fittingImageSize = stageSize;

describe("clampScale", () => {
  it("never goes below 1 or above the maximum", () => {
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(99)).toBe(MAX_SCALE);
    expect(clampScale(2.5)).toBe(2.5);
  });
});

describe("clampTranslate", () => {
  it("pins the image to the origin while it fits the stage", () => {
    const panned = clampTranslate(
      { scale: 1, x: 120, y: -80 },
      fittingImageSize,
      stageSize,
    );
    expect(panned).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("stops the pan at the image edge once zoomed", () => {
    // At 2x, with the image box equal to the stage, the overflow is half the
    // stage in each axis.
    const panned = clampTranslate(
      { scale: 2, x: 9999, y: 9999 },
      fittingImageSize,
      stageSize,
    );
    expect(panned.x).toBe(stageSize.width / 2);
    expect(panned.y).toBe(stageSize.height / 2);
  });

  it("keeps a pan that is inside the bounds", () => {
    const panned = clampTranslate(
      { scale: 2, x: 40, y: -30 },
      fittingImageSize,
      stageSize,
    );
    expect(panned).toEqual({ scale: 2, x: 40, y: -30 });
  });
});

describe("clampTranslate on a letterboxed photo", () => {
  // A landscape photo on a portrait stage: the image is narrower than the
  // stage in neither axis but shorter than it, so it is letterboxed
  // vertically (bars above and below), the way `object-fit: contain` lays it
  // out. This is exactly the shape the single-box arithmetic got wrong: it
  // used the image's own (smaller) height as if it were the stage's.
  const stage = { width: 390, height: 600 };
  const image = { width: 390, height: 220 };

  it("has no vertical limit while the scaled image still fits inside the stage", () => {
    // At 2x the image is 390x440 tall, which still fits inside the 600-tall
    // stage, so the correct vertical limit is 0: the photo must not be
    // draggable into the letterbox bars at all. The old formula,
    // `(scale - 1) * imageHeight / 2`, returned `(2 - 1) * 220 / 2 = 110`
    // here, which is exactly the bug: it let the photo be dragged 110px into
    // dead space and left there with nothing to settle it back.
    const panned = clampTranslate({ scale: 2, x: 0, y: 9999 }, image, stage);
    expect(panned.y).toBe(0);
  });

  it("limits the pan to the real overflow once the scaled image is taller than the stage", () => {
    // At 4x the image is 390x880 tall, 280px taller than the 600-tall stage,
    // so half that overflow, 140px, is the correct limit.
    const panned = clampTranslate({ scale: 4, x: 0, y: 9999 }, image, stage);
    expect(panned.y).toBe(140);
  });
});

describe("zoomAround", () => {
  it("holds the anchor point still while scaling up", () => {
    const centre = {
      x: fittingImageSize.width / 2,
      y: fittingImageSize.height / 2,
    };
    const zoomed = zoomAround(
      IDLE_ZOOM,
      2,
      centre,
      fittingImageSize,
      stageSize,
    );
    expect(zoomed.scale).toBe(2);
    expect(zoomed.x).toBe(0);
    expect(zoomed.y).toBe(0);
  });

  it("shifts the image when the anchor is off centre", () => {
    const zoomed = zoomAround(
      IDLE_ZOOM,
      2,
      { x: 0, y: 0 },
      fittingImageSize,
      stageSize,
    );
    expect(zoomed.x).toBe(stageSize.width / 2);
    expect(zoomed.y).toBe(stageSize.height / 2);
  });

  it("returns to the idle state when zooming back to 1", () => {
    const zoomed = zoomAround(
      IDLE_ZOOM,
      DOUBLE_TAP_SCALE,
      { x: 0, y: 0 },
      fittingImageSize,
      stageSize,
    );
    expect(
      zoomAround(zoomed, 1, { x: 0, y: 0 }, fittingImageSize, stageSize),
    ).toEqual(IDLE_ZOOM);
  });
});

describe("toTransform", () => {
  it("writes a translate/scale pair in device pixels", () => {
    expect(toTransform({ scale: 2, x: 10, y: -4 })).toBe(
      "translate(10px, -4px) scale(2)",
    );
  });
});

// The live feedback shown WHILE a one-finger drag at scale 1 is in progress.
// The thresholds are the same ones `useZoomPan` judges the release against, so
// progress reaching 1 means "let go now and it commits".
const dragThresholds = { dismissDistance: 110, nextDistance: 64 };
const withScale = { allowScale: true };

describe("lockDragAxis", () => {
  it("stays unlocked until the drag has travelled far enough to have an intent", () => {
    expect(lockDragAxis(4, 3)).toBe(null);
    expect(lockDragAxis(DRAG_AXIS_LOCK_PX - 1, 0)).toBe(null);
  });

  it("locks to the axis the drag has travelled furthest along", () => {
    expect(lockDragAxis(40, 12)).toBe("horizontal");
    expect(lockDragAxis(-40, 12)).toBe("horizontal");
    expect(lockDragAxis(12, 40)).toBe("vertical");
    expect(lockDragAxis(12, -40)).toBe("vertical");
  });

  it("treats an exactly diagonal drag as vertical, so a dismiss is never stolen by a stray sideways pixel", () => {
    expect(lockDragAxis(30, 30)).toBe("vertical");
  });
});

describe("dragFeedbackFor, vertical", () => {
  it("does not follow an upward drag, since there is no upward dismiss to promise", () => {
    expect(
      dragFeedbackFor("vertical", 0, -80, dragThresholds, withScale),
    ).toEqual(IDLE_DRAG);
  });

  it("follows the finger down one-to-one", () => {
    const feedback = dragFeedbackFor(
      "vertical",
      0,
      55,
      dragThresholds,
      withScale,
    );
    expect(feedback.y).toBe(55);
    expect(feedback.x).toBe(0);
  });

  it("reaches full progress, the smallest scale and the clearest scrim exactly at the dismiss distance", () => {
    const feedback = dragFeedbackFor(
      "vertical",
      0,
      110,
      dragThresholds,
      withScale,
    );
    expect(feedback.progress).toBe(1);
    expect(feedback.scale).toBeCloseTo(0.85, 5);
    expect(feedback.scrimOpacity).toBeCloseTo(0.15, 5);
  });

  it("keeps following past the threshold without overshooting scale or scrim", () => {
    const feedback = dragFeedbackFor(
      "vertical",
      0,
      400,
      dragThresholds,
      withScale,
    );
    expect(feedback.y).toBe(400);
    expect(feedback.progress).toBe(1);
    expect(feedback.scale).toBeCloseTo(0.85, 5);
    expect(feedback.scrimOpacity).toBeCloseTo(0.15, 5);
  });

  it("drops the shrink but keeps the follow and the scrim fade under reduced motion", () => {
    const feedback = dragFeedbackFor("vertical", 0, 110, dragThresholds, {
      allowScale: false,
    });
    expect(feedback.scale).toBe(1);
    expect(feedback.y).toBe(110);
    expect(feedback.scrimOpacity).toBeCloseTo(0.15, 5);
  });
});

describe("dragFeedbackFor, non-finite input", () => {
  it("stays idle rather than emitting a NaN translate for a non-finite deltaX", () => {
    // A flaky pointer frame arriving after the axis already locked: without
    // the guard, `Math.sign(NaN) * ...` and every magnitude comparison below
    // it resolve to NaN, and a `translate(NaNpx, ...)` is discarded wholesale
    // by the browser, snapping the photo to the origin for that frame.
    expect(
      dragFeedbackFor("horizontal", NaN, 0, dragThresholds, withScale),
    ).toEqual(IDLE_DRAG);
  });

  it("stays idle rather than emitting a NaN translate for a non-finite deltaY", () => {
    expect(
      dragFeedbackFor("vertical", 0, NaN, dragThresholds, withScale),
    ).toEqual(IDLE_DRAG);
  });
});

describe("dragFeedbackFor, horizontal", () => {
  it("follows the finger one-to-one up to the point a release would navigate", () => {
    const feedback = dragFeedbackFor(
      "horizontal",
      -64,
      0,
      dragThresholds,
      withScale,
    );
    expect(feedback.x).toBe(-64);
    expect(feedback.y).toBe(0);
  });

  it("resists beyond that point instead of sliding off into nothing", () => {
    const feedback = dragFeedbackFor(
      "horizontal",
      -200,
      0,
      dragThresholds,
      withScale,
    );
    expect(Math.abs(feedback.x)).toBeGreaterThan(64);
    expect(Math.abs(feedback.x)).toBeLessThan(200);
  });

  it("never travels further than the cap, however hard it is thrown", () => {
    const feedback = dragFeedbackFor(
      "horizontal",
      5000,
      0,
      dragThresholds,
      withScale,
    );
    expect(feedback.x).toBeLessThanOrEqual(64 * 1.6);
  });

  it("leaves the scrim and the scale alone, since nothing is being dismissed", () => {
    const feedback = dragFeedbackFor(
      "horizontal",
      -90,
      0,
      dragThresholds,
      withScale,
    );
    expect(feedback.scrimOpacity).toBe(1);
    expect(feedback.scale).toBe(1);
    expect(feedback.progress).toBe(0);
  });
});

describe("toTransform over drag feedback", () => {
  it("renders a drag the same way it renders a zoom, since both are translate then scale", () => {
    const feedback = dragFeedbackFor(
      "vertical",
      0,
      110,
      dragThresholds,
      withScale,
    );
    expect(toTransform(feedback)).toBe("translate(0px, 110px) scale(0.85)");
  });
});
