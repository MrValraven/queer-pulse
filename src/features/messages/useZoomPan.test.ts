import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useZoomPan } from "./useZoomPan";

/**
 * The hook's own event plumbing and gesture arbitration: what
 * `chatImageZoom.test.ts` proves about the pure zoom/pan arithmetic, this
 * file proves is wired to real pointer/wheel events correctly (which gesture
 * a pointer stream resolves to, when a timer is armed or cleared, when a
 * photo change resets everything). `useDragFeedback.test.ts` already covers
 * the scale-1 drag/dismiss/swipe DECISIONS in isolation; the one case
 * repeated here (a downward swipe dismissing) exists only to prove this hook
 * actually ROUTES to that controller, and only at scale 1.
 *
 * The stage is 400x800, the same box `chatImageZoom.test.ts` uses as
 * `stageSize`, so results here can be cross-checked against that file's own
 * worked examples. The `<img>` node is never given a real `offsetWidth` in
 * jsdom (it stays 0), so `computeStageGeometry` takes its documented
 * fallback and treats the image's own box as equal to the stage's, the same
 * "fitting" photo `chatImageZoom.test.ts` calls `fittingImageSize`. The
 * letterboxed-box arithmetic itself is already covered there; this file only
 * needs ONE simple box to exercise the hook's own wiring.
 */

const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 800;

interface SetupOverrides {
  photoKey?: string;
  hasSiblings?: boolean;
  reducedMotion?: boolean;
}

function setup(overrides: SetupOverrides = {}) {
  const imageNode = document.createElement("img");
  const stageNode = document.createElement("div");
  const washNode = document.createElement("div");

  vi.spyOn(stageNode, "getBoundingClientRect").mockReturnValue({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    left: 0,
    top: 0,
    right: STAGE_WIDTH,
    bottom: STAGE_HEIGHT,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  const imageRef = createRef<HTMLImageElement>() as {
    current: HTMLImageElement | null;
  };
  imageRef.current = imageNode;
  const viewportRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  viewportRef.current = stageNode;
  const scrimWashRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  scrimWashRef.current = washNode;

  const actions = {
    onGestureActive: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onDismiss: vi.fn(),
    onToggleChrome: vi.fn(),
  };

  const { result, rerender } = renderHook(
    (props: { photoKey: string }) =>
      useZoomPan({
        imageRef,
        viewportRef,
        scrimWashRef,
        onGestureActive: actions.onGestureActive,
        photoKey: props.photoKey,
        hasSiblings: overrides.hasSiblings ?? true,
        reducedMotion: overrides.reducedMotion ?? false,
        onNext: actions.onNext,
        onPrev: actions.onPrev,
        onDismiss: actions.onDismiss,
        onToggleChrome: actions.onToggleChrome,
      }),
    { initialProps: { photoKey: overrides.photoKey ?? "photo-1" } },
  );

  return { result, rerender, imageNode, stageNode, washNode, actions };
}

/** A pointer event shaped enough for the hook's own reads. `currentTarget`
 *  carries a no-op `setPointerCapture` so `beginGesture`'s best-effort call
 *  never falls into its (harmless but noisy) catch branch. */
function pointerEvent(
  overrides: Record<string, unknown> = {},
): React.PointerEvent {
  return {
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    button: 0,
    target: undefined,
    currentTarget: { setPointerCapture: vi.fn() },
    ...overrides,
  } as unknown as React.PointerEvent;
}

function wheelEvent(overrides: Record<string, unknown> = {}): React.WheelEvent {
  return {
    deltaY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    ...overrides,
  } as unknown as React.WheelEvent;
}

/** Splits `translate(Xpx, Ypx) scale(S)` into numbers, for the one case
 *  (the 1.15x wheel step) whose translate is a genuine floating-point
 *  product rather than an exact one, so it can be compared with
 *  `toBeCloseTo` instead of an exact string match. */
function parseTransform(transform: string): {
  x: number;
  y: number;
  scale: number;
} {
  const match = transform.match(
    /^translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.]+)\)$/,
  );
  if (!match) throw new Error(`Unparseable transform: "${transform}"`);
  return { x: Number(match[1]), y: Number(match[2]), scale: Number(match[3]) };
}

describe("useZoomPan", () => {
  it("double-tap toggles zoom around the tap point, and a second double-tap toggles it back", () => {
    const { result, imageNode } = setup();

    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerDown(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
    });

    // Anchored at the stage's top-left corner (client 0,0), which sits at
    // the image box's own (-200,-400) relative to its centre. Scaling to
    // DOUBLE_TAP_SCALE (2.5x) around that anchor and clamping to the pan
    // bounds lands exactly at the clamp limit in both axes, the same
    // "shifts the image when the anchor is off centre" shape
    // `chatImageZoom.test.ts` derives for a 2x zoom, scaled up here.
    expect(imageNode.style.transform).toBe(
      "translate(300px, 600px) scale(2.5)",
    );
    expect(imageNode.style.transition).toBe("transform 180ms var(--ease)");
    expect(result.current.isZoomed).toBe(true);

    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerDown(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
      );
    });

    expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(result.current.isZoomed).toBe(false);
  });

  it("pinch scales the photo anchored to the pointers' midpoint, clamped at the maximum", () => {
    const { result, imageNode } = setup();

    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 1, clientX: 150, clientY: 400 }),
      );
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 2, clientX: 250, clientY: 400 }),
      );
    });

    // Distance 100 -> 200 doubles the scale; the pointers straddle the
    // stage's own centre off-axis, which leaves a small x shift.
    act(() => {
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 2, clientX: 350, clientY: 400 }),
      );
    });
    expect(imageNode.style.transform).toBe("translate(-50px, 0px) scale(2)");
    expect(result.current.isZoomed).toBe(true);

    // A very large spread never scales past MAX_SCALE (4).
    act(() => {
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 2, clientX: 5150, clientY: 400 }),
      );
    });
    expect(imageNode.style.transform).toBe("translate(-600px, 0px) scale(4)");
  });
});

describe("useZoomPan: pinch, pan and wheel", () => {
  it("pans a zoomed photo one-to-one until the drag reaches the image bounds for that scale", () => {
    const { result, imageNode } = setup();

    // A symmetric pinch around the stage's centre, so the translate stays
    // (0,0) and the scale alone (1.5x) sets the pan limits that follow.
    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 400 }),
      );
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 2, clientX: 300, clientY: 400 }),
      );
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 1, clientX: 50, clientY: 400 }),
      );
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 2, clientX: 350, clientY: 400 }),
      );
    });
    expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1.5)");

    act(() => {
      result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 1, clientX: 50, clientY: 400 }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 2, clientX: 350, clientY: 400 }),
      );
    });
    // A one-finger drag while zoomed is a pan; the transform must survive
    // the pinch's own release untouched.
    expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1.5)");

    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 3, clientX: 200, clientY: 400 }),
      );
      // Well inside the bounds: followed exactly, one-to-one.
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 3, clientX: 230, clientY: 380 }),
      );
    });
    expect(imageNode.style.transform).toBe("translate(30px, -20px) scale(1.5)");

    act(() => {
      // Thrown far past the edge: clamped to the real overflow at 1.5x:
      // (1.5 * 400 - 400) / 2 = 100 horizontally, (1.5 * 800 - 800) / 2 =
      // 200 vertically, the same formula `clampTranslate`'s own tests use.
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 3, clientX: 10199, clientY: 10399 }),
      );
    });
    expect(imageNode.style.transform).toBe(
      "translate(100px, 200px) scale(1.5)",
    );
  });

  it("springs a pinch back to 1 the instant it shrinks past the minimum, and stays there on release", () => {
    const { result, imageNode, actions } = setup();

    act(() => {
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 400 }),
      );
      result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 2, clientX: 300, clientY: 400 }),
      );
    });
    // The pinch's own start (the second finger landing) announces a gesture
    // in progress right away, before any move.
    expect(actions.onGestureActive).toHaveBeenLastCalledWith(true);

    act(() => {
      // Shrinks the 200px baseline distance to 1px: the scale this implies
      // floors at MIN_SCALE, and `zoomAround` takes its exact-minimum
      // shortcut back to the idle transform, mid-gesture, with no transition
      // (a pinch move never animates).
      result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 2, clientX: 101, clientY: 400 }),
      );
    });
    expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(imageNode.style.transition).toBe("none");
    expect(result.current.isZoomed).toBe(false);

    act(() => {
      result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 400 }),
      );
      result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 2, clientX: 101, clientY: 400 }),
      );
    });
    // Releasing an already-idle pinch must not dismiss, navigate, or leave
    // the gesture-active flag stuck true.
    expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(actions.onGestureActive.mock.calls).toEqual([[true], [false]]);
  });

  it("wheel zoom (ctrl+wheel, a trackpad pinch) zooms in around the cursor and floors at 1 on the way out", () => {
    const zoomIn = setup();
    act(() => {
      zoomIn.result.current.handlers.onWheel(
        wheelEvent({ deltaY: -100, clientX: 0, clientY: 0, ctrlKey: true }),
      );
    });
    // Same corner anchor as the double-tap test above, scaled to wheel's own
    // 1.15x-per-notch step instead of DOUBLE_TAP_SCALE. 1.15 is not exactly
    // representable in binary floating point, so the translate (unlike
    // DOUBLE_TAP_SCALE's exact 2.5 above) comes out a few ULPs off 30/60,
    // parsed and compared with `toBeCloseTo` rather than an exact string.
    const zoomInTransform = parseTransform(zoomIn.imageNode.style.transform);
    expect(zoomInTransform.x).toBeCloseTo(30, 9);
    expect(zoomInTransform.y).toBeCloseTo(60, 9);
    expect(zoomInTransform.scale).toBeCloseTo(1.15, 9);
    expect(zoomIn.imageNode.style.transition).toBe("none");

    const zoomOut = setup();
    act(() => {
      zoomOut.result.current.handlers.onWheel(
        wheelEvent({ deltaY: 100, clientX: 0, clientY: 0, ctrlKey: true }),
      );
    });
    // Zooming out from the idle scale floors at MIN_SCALE and snaps to the
    // idle translate regardless of the cursor position.
    expect(zoomOut.imageNode.style.transform).toBe(
      "translate(0px, 0px) scale(1)",
    );
  });
});

describe("useZoomPan: photo change and dismiss gesture", () => {
  it("resets zoom and clears an armed tap timer when the photo (photoKey) changes", () => {
    // Fake timers from the very start: the single tap below arms a REAL
    // `window.setTimeout` the instant it releases, so switching to fake
    // timers any later than this would let that timer already be a live,
    // real one that `vi.advanceTimersByTime` below can never see or clear.
    vi.useFakeTimers();
    try {
      const { result, rerender, imageNode, actions } = setup({
        photoKey: "photo-1",
      });

      act(() => {
        // Double-tap zoomed in first, so the reset has something real to
        // undo.
        result.current.handlers.onPointerDown(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
        result.current.handlers.onPointerUp(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
        result.current.handlers.onPointerDown(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
        result.current.handlers.onPointerUp(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
      });
      expect(result.current.isZoomed).toBe(true);

      act(() => {
        // One more, single, tap: arms the deferred chrome-toggle timer, left
        // pending on purpose to prove the photo change clears it.
        result.current.handlers.onPointerDown(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
        result.current.handlers.onPointerUp(
          pointerEvent({ clientX: 0, clientY: 0, target: imageNode }),
        );
      });

      act(() => {
        rerender({ photoKey: "photo-2" });
      });

      expect(imageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
      expect(result.current.isZoomed).toBe(false);

      act(() => {
        vi.advanceTimersByTime(400);
      });
      // Without the fix this hook's own comments describe, the timer armed
      // on "photo-1" would still fire here and toggle the chrome on
      // "photo-2".
      expect(actions.onToggleChrome).not.toHaveBeenCalled();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("swipe-down-to-dismiss only fires at scale 1; the same drag while zoomed is a pan and never dismisses", () => {
    const atScale1 = setup();
    act(() => {
      atScale1.result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 100 }),
      );
      atScale1.result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 230 }),
      );
      atScale1.result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 230 }),
      );
    });
    expect(atScale1.actions.onDismiss).toHaveBeenCalledTimes(1);

    // Zoom to 1.5x first (the same symmetric pinch as the pan-clamp test
    // above, so the translate stays 0,0), then repeat an identical downward
    // drag: at scale > 1 a one-finger drag is always read as a pan.
    const zoomed = setup();
    act(() => {
      zoomed.result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 1, clientX: 100, clientY: 400 }),
      );
      zoomed.result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 2, clientX: 300, clientY: 400 }),
      );
      zoomed.result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 1, clientX: 50, clientY: 400 }),
      );
      zoomed.result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 2, clientX: 350, clientY: 400 }),
      );
      zoomed.result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 1, clientX: 50, clientY: 400 }),
      );
      zoomed.result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 2, clientX: 350, clientY: 400 }),
      );
    });
    expect(zoomed.result.current.isZoomed).toBe(true);

    act(() => {
      zoomed.result.current.handlers.onPointerDown(
        pointerEvent({ pointerId: 3, clientX: 100, clientY: 100 }),
      );
      zoomed.result.current.handlers.onPointerMove(
        pointerEvent({ pointerId: 3, clientX: 100, clientY: 230 }),
      );
      zoomed.result.current.handlers.onPointerUp(
        pointerEvent({ pointerId: 3, clientX: 100, clientY: 230 }),
      );
    });
    expect(zoomed.actions.onDismiss).not.toHaveBeenCalled();
  });
});
