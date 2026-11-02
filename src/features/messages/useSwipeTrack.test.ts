import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSwipeTrack } from "./useSwipeTrack";

/**
 * The swipe track's decisions and its settle: what it writes while a finger
 * is down, what a release commits to (distance or flick), how it lands, and
 * what survives a drag that starts mid-settle. The pure numbers are covered by
 * `chatImageZoom.test.ts`; these cases drive the real node writes and timers.
 *
 * The stage is 400px wide and the neighbours sit 422px away (a stage width
 * plus the slide gap), the same layout the stylesheet produces. jsdom has no
 * layout, so both are stood up by hand.
 */
const STAGE_WIDTH = 400;
const SLIDE_TRAVEL = 422;

function setup(
  options: {
    hasNeighbours?: boolean;
    reducedMotion?: boolean;
    stageWidth?: number;
    slideTravel?: number;
  } = {},
) {
  const slideTravel = options.slideTravel ?? SLIDE_TRAVEL;
  const trackNode = document.createElement("div");
  const stageNode = document.createElement("div");
  Object.defineProperty(stageNode, "offsetWidth", {
    value: options.stageWidth ?? STAGE_WIDTH,
  });
  for (const [role, offsetLeft] of [
    ["prev", -slideTravel],
    ["current", 0],
    ["next", slideTravel],
  ] as const) {
    const slideNode = document.createElement("div");
    slideNode.dataset.slide = role;
    Object.defineProperty(slideNode, "offsetLeft", { value: offsetLeft });
    trackNode.append(slideNode);
  }
  const trackRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  const stageRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  trackRef.current = trackNode;
  stageRef.current = stageNode;
  const actions = { onNext: vi.fn(), onPrev: vi.fn() };
  const { result } = renderHook(() =>
    useSwipeTrack({
      trackRef,
      stageRef,
      hasNeighbours: options.hasNeighbours ?? true,
      reducedMotion: options.reducedMotion ?? false,
      ...actions,
    }),
  );
  return { track: result.current, trackNode, actions };
}

/** Lets every pending settle and fallback timer run. */
function runTimers() {
  vi.advanceTimersByTime(1000);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useSwipeTrack while the finger is down", () => {
  it("moves the track one-to-one with the finger and marks it as paging", () => {
    const { track, trackNode } = setup();
    track.follow(-120, 1000);
    expect(trackNode.style.transform).toBe("translateX(-120px)");
    expect(trackNode.style.transition).toBe("none");
    expect(trackNode.dataset.paging).toBe("true");
  });

  it("does not resist in the middle of the gallery, however far it is dragged", () => {
    const { track, trackNode } = setup();
    track.follow(-380, 1000);
    expect(trackNode.style.transform).toBe("translateX(-380px)");
  });

  it("resists a single-photo drag and caps it", () => {
    const { track, trackNode } = setup({ hasNeighbours: false });
    track.follow(-300, 1000);
    const offset = Math.abs(
      Number(/-?[\d.]+/.exec(trackNode.style.transform)![0]),
    );
    expect(offset).toBeGreaterThan(64);
    expect(offset).toBeLessThanOrEqual(64 * 1.6);
  });
});

describe("useSwipeTrack when the finger lifts", () => {
  it("commits to the next photo past a quarter of the stage, calling onNext only after the settle", () => {
    const { track, trackNode, actions } = setup();
    const onSettled = vi.fn();
    track.follow(-150, 1000);
    track.release(-150, 1500, onSettled);
    // Animating a full slide, with the decelerating curve.
    expect(trackNode.style.transform).toBe(`translateX(-${SLIDE_TRAVEL}px)`);
    expect(trackNode.style.transition).toContain(
      "cubic-bezier(0.22, 1, 0.36, 1)",
    );
    expect(actions.onNext).not.toHaveBeenCalled();
    runTimers();
    expect(actions.onNext).toHaveBeenCalledTimes(1);
    expect(actions.onPrev).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("commits to the previous photo on a rightward drag past the distance", () => {
    const { track, trackNode, actions } = setup();
    track.follow(150, 1000);
    track.release(150, 1500, vi.fn());
    expect(trackNode.style.transform).toBe(`translateX(${SLIDE_TRAVEL}px)`);
    runTimers();
    expect(actions.onPrev).toHaveBeenCalledTimes(1);
    expect(actions.onNext).not.toHaveBeenCalled();
  });

  it("lands on transitionend without waiting for the fallback timer", () => {
    const { track, trackNode, actions } = setup();
    track.follow(-150, 1000);
    track.release(-150, 1500, vi.fn());
    const landed = new Event("transitionend");
    Object.assign(landed, { propertyName: "transform" });
    trackNode.dispatchEvent(landed);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
    runTimers();
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("commits a flick that stopped well short of the distance", () => {
    const { track, actions } = setup();
    track.follow(-10, 1000);
    track.follow(-30, 1016);
    track.follow(-50, 1032);
    track.release(-50, 1032, vi.fn());
    runTimers();
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("springs back a slow drag that stopped short, calling nothing", () => {
    const { track, trackNode, actions } = setup();
    const onSettled = vi.fn();
    track.follow(-60, 1000);
    track.release(-60, 1600, onSettled);
    expect(trackNode.style.transform).toBe("translateX(0px)");
    expect(trackNode.style.transition).toContain("transform");
    expect(trackNode.style.transition).toContain(
      "cubic-bezier(0.22, 1, 0.36, 1)",
    );
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onPrev).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(trackNode.dataset.paging).toBeUndefined();
  });

  it("cancels on a flick against the drag even past the distance", () => {
    const { track, trackNode, actions } = setup();
    track.follow(-200, 1000);
    track.follow(-150, 1016);
    track.follow(-120, 1032);
    track.release(-120, 1032, vi.fn());
    expect(trackNode.style.transform).toBe("translateX(0px)");
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
  });

  it("springs a single-photo drag back whatever its distance or speed", () => {
    const { track, trackNode, actions } = setup({ hasNeighbours: false });
    track.follow(-100, 1000);
    track.follow(-300, 1016);
    track.release(-300, 1016, vi.fn());
    expect(trackNode.style.transform).toBe("translateX(0px)");
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
  });

  it("springs back through cancel, as a lost pointer would", () => {
    const { track, trackNode, actions } = setup();
    const onSettled = vi.fn();
    track.follow(-200, 1000);
    track.cancel(onSettled);
    expect(trackNode.style.transform).toBe("translateX(0px)");
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("answers a release that has no drag behind it straight away", () => {
    const { track, actions } = setup();
    const onSettled = vi.fn();
    track.release(-300, 1000, onSettled);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(actions.onNext).not.toHaveBeenCalled();
  });
});

describe("useSwipeTrack under reduced motion", () => {
  it("still follows the finger", () => {
    const { track, trackNode } = setup({ reducedMotion: true });
    track.follow(-120, 1000);
    expect(trackNode.style.transform).toBe("translateX(-120px)");
  });

  it("commits with no slide: the neighbour is parked in the centre and the photo changes at once", () => {
    const { track, trackNode, actions } = setup({ reducedMotion: true });
    track.follow(-150, 1000);
    track.release(-150, 1500, vi.fn());
    expect(trackNode.style.transform).toBe(`translateX(-${SLIDE_TRAVEL}px)`);
    expect(trackNode.style.transition).toBe("none");
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("snaps back with no transition when a drag does not commit", () => {
    const { track, trackNode } = setup({ reducedMotion: true });
    track.follow(-40, 1000);
    track.release(-40, 1600, vi.fn());
    expect(trackNode.style.transform).toBe("translateX(0px)");
    expect(trackNode.style.transition).toBe("none");
  });

  it("changes photo at once for a button or key", () => {
    const { track, trackNode, actions } = setup({ reducedMotion: true });
    track.slideBy(1);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
    expect(trackNode.style.transform).not.toContain("-422");
  });
});

describe("useSwipeTrack when a drag starts mid-settle", () => {
  it("picks up from where the track visibly is and drops the pending photo change", () => {
    const { track, trackNode, actions } = setup();
    track.follow(-150, 1000);
    track.release(-150, 1500, vi.fn());
    // Partway through the slide, per the browser's computed transform.
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      transform: "matrix(1, 0, 0, 1, -200, 0)",
    } as unknown as CSSStyleDeclaration);
    track.follow(-20, 1550);
    expect(trackNode.style.transform).toBe("translateX(-200px)");
    expect(trackNode.style.transition).toBe("none");
    track.follow(-50, 1566);
    expect(trackNode.style.transform).toBe("translateX(-230px)");
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
  });
});

describe("useSwipeTrack paging without a finger", () => {
  it("slides a full slide and then asks for the photo change", () => {
    const { track, trackNode, actions } = setup();
    track.slideBy(1);
    expect(trackNode.style.transform).toBe(`translateX(-${SLIDE_TRAVEL}px)`);
    expect(trackNode.style.transition).toContain(
      "cubic-bezier(0.22, 1, 0.36, 1)",
    );
    expect(trackNode.dataset.paging).toBe("true");
    expect(actions.onNext).not.toHaveBeenCalled();
    runTimers();
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("slides the other way for the previous photo", () => {
    const { track, trackNode, actions } = setup();
    track.slideBy(-1);
    expect(trackNode.style.transform).toBe(`translateX(${SLIDE_TRAVEL}px)`);
    runTimers();
    expect(actions.onPrev).toHaveBeenCalledTimes(1);
  });

  it("ignores a second request while one is still settling", () => {
    const { track, actions } = setup();
    track.slideBy(1);
    track.slideBy(1);
    runTimers();
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("changes photo at once when there is no layout to slide across", () => {
    // Zero everywhere, as in a bare jsdom render.
    const { track, actions } = setup({ stageWidth: 0, slideTravel: 0 });
    track.slideBy(1);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("does nothing in a single-photo gallery", () => {
    const { track, actions } = setup({ hasNeighbours: false });
    track.slideBy(1);
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
  });
});

describe("useSwipeTrack reset", () => {
  it("puts the track back at zero with no transition and clears the paging flag", () => {
    const { track, trackNode } = setup();
    track.slideBy(1);
    track.reset();
    expect(trackNode.style.transform).toBe("translateX(0px)");
    expect(trackNode.style.transition).toBe("none");
    expect(trackNode.dataset.paging).toBeUndefined();
  });

  it("cancels the settle in flight, so no photo change fires after it", () => {
    const { track, actions } = setup();
    track.slideBy(1);
    track.reset();
    runTimers();
    expect(actions.onNext).not.toHaveBeenCalled();
  });

  it("clears the zoom a former current photo still carries as a neighbour", () => {
    const { track, trackNode } = setup();
    const neighbourImage = document.createElement("img");
    neighbourImage.style.transform = "translate(10px, 5px) scale(2)";
    trackNode.querySelector('[data-slide="prev"]')!.append(neighbourImage);
    track.reset();
    expect(neighbourImage.style.transform).toBe("");
  });

  it("forces the track home when a committed swipe never changes the photo", () => {
    const { track, trackNode, actions } = setup();
    track.follow(-150, 1000);
    track.release(-150, 1500, vi.fn());
    runTimers();
    // onNext was called, but the test never re-renders, so nothing reset the
    // track. The fallback does, after its own delay.
    expect(actions.onNext).toHaveBeenCalledTimes(1);
    expect(trackNode.style.transform).toBe("translateX(0px)");
    expect(trackNode.style.transition).toBe("none");
  });
});
