import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjCompositor } from "../engine/vjCompositor";
import { VJ_SCREEN_STATUS_REPORT_INTERVAL_MS } from "../vj.constants";
import { INITIAL_VJ_RENDERER, type VjRendererState } from "./vjRendererKind";
import {
  useVjScreenHealth,
  VJ_SAMPLED_FIRST_REPORT_DELAY_MS,
  type VjRendererHealth,
} from "./useVjScreenHealth";

const FRAME_STEP_MS = 16;
const DOM_STATE: VjRendererState = { ...INITIAL_VJ_RENDERER, phase: "dom" };
const SIMPLE_STATE: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "simple",
};

interface Clock {
  nowMs: number;
  queuedFrames: Map<number, FrameRequestCallback>;
  nextHandle: number;
  isDisplayRunning: boolean;
}

function installClock(): Clock {
  const clock: Clock = {
    nowMs: 1_000,
    queuedFrames: new Map(),
    nextHandle: 1,
    isDisplayRunning: true,
  };
  vi.spyOn(performance, "now").mockImplementation(() => clock.nowMs);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    const handle = clock.nextHandle;
    clock.nextHandle += 1;
    clock.queuedFrames.set(handle, callback);
    return handle;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((handle) => {
    clock.queuedFrames.delete(handle);
  });
  return clock;
}

/** Advances time in frame steps; each step runs the queued frames when the display runs. */
function advance(clock: Clock, totalMs: number): void {
  for (let elapsedMs = 0; elapsedMs < totalMs; elapsedMs += FRAME_STEP_MS) {
    clock.nowMs += FRAME_STEP_MS;
    if (clock.isDisplayRunning) {
      const frames = [...clock.queuedFrames.entries()];
      clock.queuedFrames.clear();
      for (const [, callback] of frames) callback(clock.nowMs);
    }
    act(() => {
      vi.advanceTimersByTime(FRAME_STEP_MS);
    });
  }
}

function renderHealth(renderer: VjRendererState) {
  const reports: VjRendererHealth[] = [];
  const view = renderHook(
    (props: { renderer: VjRendererState }) =>
      useVjScreenHealth({
        renderer: props.renderer,
        compositorRef: { current: null as VjCompositor | null },
        onHealth: (health) => reports.push(health),
      }),
    { initialProps: { renderer } },
  );
  return { reports, view };
}

describe("useVjScreenHealth sampled renderers", () => {
  let clock: Clock;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    clock = installClock();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("sends nothing before the sampling window has passed", () => {
    const { reports } = renderHealth(DOM_STATE);
    advance(clock, VJ_SAMPLED_FIRST_REPORT_DELAY_MS - 2 * FRAME_STEP_MS);
    expect(reports).toEqual([]);
  });

  it("sends the first report inside the window with real frame figures", () => {
    const { reports } = renderHealth(SIMPLE_STATE);
    advance(clock, VJ_SAMPLED_FIRST_REPORT_DELAY_MS + FRAME_STEP_MS);
    expect(reports).toHaveLength(1);
    const [firstReport] = reports;
    expect(firstReport?.renderer).toBe("simple");
    expect(firstReport?.frames).not.toBeNull();
    expect(firstReport?.frames?.fps ?? 0).toBeGreaterThan(30);
    expect(firstReport?.isEffectLoadHigh).toBe(false);
  });

  it("never reports an empty sampler as zero frames a second", () => {
    clock.isDisplayRunning = false;
    const { reports } = renderHealth(DOM_STATE);
    advance(clock, VJ_SAMPLED_FIRST_REPORT_DELAY_MS + 4 * FRAME_STEP_MS);
    expect(reports).toEqual([]);
  });

  it("reports on the regular interval after the first report", () => {
    const { reports } = renderHealth(DOM_STATE);
    advance(clock, VJ_SCREEN_STATUS_REPORT_INTERVAL_MS + FRAME_STEP_MS);
    expect(reports.length).toBeGreaterThanOrEqual(2);
    for (const report of reports) {
      expect(report.renderer).toBe("dom");
      expect(report.frames?.fps ?? 0).toBeGreaterThan(30);
    }
  });

  it("clears the pending first report when the renderer changes", () => {
    const { reports, view } = renderHealth(DOM_STATE);
    advance(clock, 2 * FRAME_STEP_MS);
    view.rerender({ renderer: SIMPLE_STATE });
    advance(clock, VJ_SAMPLED_FIRST_REPORT_DELAY_MS + FRAME_STEP_MS);
    expect(reports.map((report) => report.renderer)).toEqual(["simple"]);
  });

  it("sends no report after unmount", () => {
    const { reports, view } = renderHealth(DOM_STATE);
    advance(clock, 2 * FRAME_STEP_MS);
    view.unmount();
    advance(clock, VJ_SCREEN_STATUS_REPORT_INTERVAL_MS);
    expect(reports).toEqual([]);
  });
});

describe("useVjScreenHealth webgl2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("still sends its first report right away", () => {
    const { reports } = renderHealth({
      ...INITIAL_VJ_RENDERER,
      phase: "webgl2",
    });
    expect(reports).toEqual([
      { renderer: "webgl2", frames: null, isEffectLoadHigh: false },
    ]);
  });
});
