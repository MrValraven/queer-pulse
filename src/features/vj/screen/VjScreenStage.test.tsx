import { createRef } from "react";
import { act, render } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVjStageState } from "../../../shared/contracts/vj";
import { installVjFakeWebGl2 } from "../../../test/vjFakeWebGl2";
import { resetVjWebGl2ProbeForTests } from "../engine/gl/vjGlContext";
import { VjCompositor } from "../engine/vjCompositor";
import type { VjClockReader } from "../engine/vjEngineLook";
import type { VjRenderableClip, VjRenderableSource } from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
import { VjScreenStage, type VjScreenStageProps } from "./VjScreenStage";

/**
 * Engine sources stand in for the video and GIF decoders jsdom lacks: each
 * holds its own URL and records the clip it was built for.
 */
const engineSources = vi.hoisted(() => {
  const builtClipIds: string[] = [];
  /** Per clip id: reports that clip's first frame, the way a decoder would. */
  const firstFrameOf = new Map<string, () => void>();
  const createFakeSource = (
    renderable: VjRenderableSource,
    deps: { events: { onFirstFrame(key: string): void } },
  ) => {
    builtClipIds.push(renderable.clipId);
    const key = `${renderable.clipId}|${renderable.sourceUrl}`;
    firstFrameOf.set(renderable.clipId, () => deps.events.onFirstFrame(key));
    return {
      key,
      kind: renderable.mediaKind === "generator" ? "generator" : "video",
      isReady: false,
      playheadMs: 0,
      update: () => undefined,
      bindDraw: () => ({
        programKey: "source.clip",
        uniforms: {},
        hasBackdrop: false,
      }),
      holdsSourceUrl: (sourceUrl: string) =>
        sourceUrl !== "" && sourceUrl === renderable.sourceUrl,
      byteSize: () => 0,
      restore: () => undefined,
      dispose: () => undefined,
    };
  };
  return { builtClipIds, firstFrameOf, createFakeSource };
});

vi.mock("../engine/sources/vjSourceFactory", () => ({
  createVjEngineSource: engineSources.createFakeSource,
}));

const BASE_STATE = createVjStageState("epoch-test", 0);
const CLOCK: VjClockReader = {
  serverNow: () => 0,
  toLocalTime: (serverMs) => serverMs,
};
const SCREEN_PATH = "/admin/vj/screen";
/** Past any default transition, so the live clip is the shown front. */
const LIVE_SHOWN_AT_MS = 60_000;

function videoClip(clipId: string): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl: `blob:source-${clipId}`,
    durationMs: 10_000,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
  };
}

function renderScreenStage(changes: Partial<VjScreenStageProps> = {}) {
  const handleRef = createRef<VjStageHandle>();
  const props: VjScreenStageProps = {
    state: BASE_STATE,
    upcoming: null,
    live: null,
    upcomingLive: null,
    mix: null,
    upcomingMix: null,
    isStrobeEnabled: true,
    clock: CLOCK,
    micLevelRef: null,
    handleRef,
    onClipFailed: vi.fn(),
    onSourceReleased: vi.fn(),
    onRendererChange: vi.fn(),
    onHealth: vi.fn(),
    ...changes,
  };
  const view = render(
    <LazyMotion features={domMax} strict>
      <VjScreenStage {...props} />
    </LazyMotion>,
  );
  const rerenderScreenStage = (next: Partial<VjScreenStageProps>): void => {
    Object.assign(props, next);
    view.rerender(
      <LazyMotion features={domMax} strict>
        <VjScreenStage {...props} />
      </LazyMotion>,
    );
  };
  return { ...view, props, handleRef, rerenderScreenStage };
}

/** Queues the compositor's frames, so a test runs them at the times it picks. */
function captureFrames(): (nowMs: number) => void {
  const queuedFrames: FrameRequestCallback[] = [];
  vi.mocked(window.requestAnimationFrame).mockImplementation((callback) => {
    queuedFrames.push(callback);
    return queuedFrames.length;
  });
  return (nowMs) => {
    vi.spyOn(performance, "now").mockReturnValue(nowMs);
    act(() => {
      for (const frame of queuedFrames.splice(0)) frame(nowMs);
    });
  };
}

/** Brings the live clip on: its first frame, then frames past its fade in. */
function showLiveClip(clipId: string, runFrames: (nowMs: number) => void) {
  engineSources.firstFrameOf.get(clipId)?.();
  runFrames(1_000);
  runFrames(LIVE_SHOWN_AT_MS);
}

function engineCanvasOf(container: HTMLElement): HTMLCanvasElement | null {
  return container.querySelector<HTMLCanvasElement>("[data-vj-engine-canvas]");
}

beforeEach(() => {
  engineSources.builtClipIds.length = 0;
  engineSources.firstFrameOf.clear();
  resetVjWebGl2ProbeForTests();
  window.history.replaceState(null, "", SCREEN_PATH);
  // The compositor's loop and the DOM health sampler stay still: no frame runs.
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  window.history.replaceState(null, "", SCREEN_PATH);
  vi.restoreAllMocks();
});

describe("VjScreenStage", () => {
  it("mounts the canvas when WebGL2 works", () => {
    installVjFakeWebGl2();
    const { container, props } = renderScreenStage();

    expect(engineCanvasOf(container)).toBeInstanceOf(HTMLCanvasElement);
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "webgl2",
      reason: null,
      lossCount: 0,
    });
    expect(props.onHealth).toHaveBeenLastCalledWith({
      renderer: "webgl2",
      frames: null,
      isEffectLoadHigh: false,
    });
  });

  it("falls back to the DOM renderer when getContext answers null", () => {
    installVjFakeWebGl2({ isContextAvailable: false });
    const { container, props } = renderScreenStage();

    expect(engineCanvasOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "dom",
      reason: "webgl2Missing",
      lossCount: 0,
    });
    expect(props.onHealth).toHaveBeenLastCalledWith({
      renderer: "dom",
      frames: null,
      isEffectLoadHigh: false,
    });
  });

  it("reports the renderer phase and reason", () => {
    const glFakes = installVjFakeWebGl2();
    const { container, props } = renderScreenStage();
    const canvas = engineCanvasOf(container);
    const fake = canvas === null ? null : glFakes.fakeFor(canvas);
    expect(fake).not.toBeNull();

    act(() => {
      fake?.loseContext();
    });
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "webgl2Restoring",
      reason: "contextLost",
      lossCount: 1,
    });
    // The canvas stays mounted and hidden while the DOM renderer draws.
    expect(engineCanvasOf(container)).toBe(canvas);
    expect(
      container
        .querySelector("[data-vj-engine-stage]")
        ?.getAttribute("data-vj-hidden"),
    ).toBe("true");
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(props.onHealth).toHaveBeenLastCalledWith(
      expect.objectContaining({ renderer: "dom" }),
    );

    act(() => {
      fake?.restoreContext();
    });
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "webgl2",
      reason: null,
      lossCount: 1,
    });
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
  });

  it("forces the DOM renderer with ?vjRenderer=dom and names the reason", () => {
    installVjFakeWebGl2();
    window.history.replaceState(null, "", `${SCREEN_PATH}?vjRenderer=dom`);
    const { container, props } = renderScreenStage();

    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(props.onRendererChange).toHaveBeenCalledTimes(1);
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "dom",
      reason: "forced",
      lossCount: 0,
    });
  });

  it("answers holdsSource from the renderer on screen", () => {
    installVjFakeWebGl2();
    const liveClip = videoClip("clip-live");
    const onWebGl = renderScreenStage({ live: liveClip });
    expect(engineCanvasOf(onWebGl.container)).not.toBeNull();
    expect(onWebGl.handleRef.current?.holdsSource(liveClip.sourceUrl)).toBe(
      true,
    );
    expect(onWebGl.handleRef.current?.holdsSource("blob:elsewhere")).toBe(
      false,
    );
    onWebGl.unmount();

    window.history.replaceState(null, "", `${SCREEN_PATH}?vjRenderer=dom`);
    const onDom = renderScreenStage({ live: liveClip });
    expect(onDom.container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(onDom.handleRef.current?.holdsSource(liveClip.sourceUrl)).toBe(true);
    expect(onDom.handleRef.current?.holdsSource("blob:elsewhere")).toBe(false);
  });

  it("hands the upcoming frame to the compositor for pre-roll", () => {
    installVjFakeWebGl2();
    const scheduleSpy = vi.spyOn(VjCompositor.prototype, "schedule");
    const liveClip = videoClip("clip-live");
    const nextClip = videoClip("clip-next");
    const upcomingState = { ...BASE_STATE, revision: 1 };
    const runFrames = captureFrames();
    const { handleRef, rerenderScreenStage } = renderScreenStage({
      live: liveClip,
    });
    // Pre-roll loads into the free layer, so the live clip shows first.
    showLiveClip(liveClip.clipId, runFrames);
    rerenderScreenStage({
      upcoming: { state: upcomingState, applyAt: 5000 },
      upcomingLive: nextClip,
    });

    const scheduled = scheduleSpy.mock.lastCall?.[0] ?? null;
    expect(scheduled?.look.versionKey).toBe("epoch-test|1");
    expect(scheduled?.layers).toEqual({ live: nextClip, mix: null });
    expect(scheduled?.applyAtServerMs).toBe(5000);
    expect(engineSources.builtClipIds).toContain("clip-next");
    expect(handleRef.current?.holdsSource(nextClip.sourceUrl)).toBe(true);
  });

  it("releases a URL only the DOM renderer held when WebGL comes back", () => {
    const glFakes = installVjFakeWebGl2();
    const liveClip = videoClip("clip-live");
    const { container, props } = renderScreenStage({ live: liveClip });
    const canvas = engineCanvasOf(container);
    const fake = canvas === null ? null : glFakes.fakeFor(canvas);
    expect(fake).not.toBeNull();

    act(() => {
      fake?.loseContext();
    });
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    // The engine let the URL go while the DOM renderer still played it, so
    // that release was held back.
    vi.spyOn(VjCompositor.prototype, "holdsSource").mockImplementation(
      (sourceUrl: string) => sourceUrl !== liveClip.sourceUrl,
    );
    expect(props.onSourceReleased).not.toHaveBeenCalledWith(liveClip.sourceUrl);

    act(() => {
      fake?.restoreContext();
    });
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
    expect(props.onSourceReleased).toHaveBeenCalledTimes(1);
    expect(props.onSourceReleased).toHaveBeenCalledWith(liveClip.sourceUrl);
  });

  it("keeps a URL the engine still holds when the DOM renderer leaves", () => {
    const glFakes = installVjFakeWebGl2();
    const liveClip = videoClip("clip-live");
    const { container, props } = renderScreenStage({ live: liveClip });
    const canvas = engineCanvasOf(container);
    const fake = canvas === null ? null : glFakes.fakeFor(canvas);

    act(() => {
      fake?.loseContext();
    });
    act(() => {
      fake?.restoreContext();
    });
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
    expect(props.onSourceReleased).not.toHaveBeenCalledWith(liveClip.sourceUrl);
  });

  it("releases the engine's pre-roll on a second loss and keeps what the DOM renderer took over", () => {
    const glFakes = installVjFakeWebGl2();
    const liveClip = videoClip("clip-live");
    const nextClip = videoClip("clip-next");
    const runFrames = captureFrames();
    const { container, props, rerenderScreenStage } = renderScreenStage({
      live: liveClip,
    });
    // Pre-roll loads into the free layer, so the live clip shows first.
    showLiveClip(liveClip.clipId, runFrames);
    rerenderScreenStage({
      upcoming: { state: { ...BASE_STATE, revision: 1 }, applyAt: 5000 },
      upcomingLive: nextClip,
    });
    const canvas = engineCanvasOf(container);
    const fake = canvas === null ? null : glFakes.fakeFor(canvas);
    expect(fake).not.toBeNull();

    act(() => {
      fake?.loseContext();
    });
    act(() => {
      fake?.restoreContext();
    });
    expect(props.onSourceReleased).not.toHaveBeenCalled();

    act(() => {
      fake?.loseContext();
    });
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "dom",
      reason: "contextLost",
      lossCount: 2,
    });
    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    // The pre-roll went with the engine; the DOM renderer now plays live.
    expect(props.onSourceReleased).toHaveBeenCalledTimes(1);
    expect(props.onSourceReleased).toHaveBeenCalledWith(nextClip.sourceUrl);
  });
});
