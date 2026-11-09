import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVjStageState } from "../../../shared/contracts/vj";
import { installVjFakeWebGl2 } from "../../../test/vjFakeWebGl2";
import { resetVjWebGl2ProbeForTests } from "../engine/gl/vjGlContext";
import { VjCompositor } from "../engine/vjCompositor";
import type { VjClockReader } from "../engine/vjEngineLook";
import type { VjRenderableClip, VjRenderableSource } from "./vjLayerMachine";
import { VJ_RENDERER_HAND_OFF_MAX_MS } from "./vjRendererKind";
import type { VjStageHandle } from "./vjStageHandle";
import { VJ_SAMPLED_FIRST_REPORT_DELAY_MS } from "./useVjScreenHealth";
import { VjScreenStage, type VjScreenStageProps } from "./VjScreenStage";

/**
 * Engine sources stand in for the video and GIF decoders jsdom lacks: each
 * holds its own URL, records the clip it was built for, and turns ready on
 * its first frame, the way a decoder would.
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
    const source = {
      key,
      kind: renderable.mediaKind === "generator" ? "generator" : "video",
      isReady: false,
      playheadMs: 0,
      update: () => undefined,
      bindDraw: () => ({
        programKey: "source.clip",
        uniforms: {
          uSource: 0,
          uBackdrop: 1,
          uSourceSize: [1920, 1080],
          uFitMode: 0,
          uHasBackdrop: 0,
          uIsPixelated: 0,
        },
        hasBackdrop: false,
      }),
      holdsSourceUrl: (sourceUrl: string) =>
        sourceUrl !== "" && sourceUrl === renderable.sourceUrl,
      byteSize: () => 0,
      restore: () => undefined,
      dispose: () => undefined,
    };
    firstFrameOf.set(renderable.clipId, () => {
      source.isReady = true;
      deps.events.onFirstFrame(key);
    });
    return source;
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
    renderMode: "effects",
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

const SAMPLED_FRAME_STEP_MS = 16;
/** Any non-null frame figures: a sampled report carries real ones. */
const SAMPLED_FRAMES: unknown = expect.anything();

/**
 * Fake timers plus a requestAnimationFrame that calls back every 16 ms, so the
 * DOM and simple renderers' health sampler gets frames. Call it before render;
 * the file's afterEach restores real timers and the rAF mock.
 */
function installSampledFrameClock(): (totalMs: number) => void {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  let nowMs = 1_000;
  vi.spyOn(performance, "now").mockImplementation(() => nowMs);
  vi.mocked(window.requestAnimationFrame).mockImplementation((callback) =>
    window.setTimeout(() => {
      nowMs += SAMPLED_FRAME_STEP_MS;
      callback(nowMs);
    }, SAMPLED_FRAME_STEP_MS),
  );
  vi.mocked(window.cancelAnimationFrame).mockImplementation((handle) => {
    window.clearTimeout(handle);
  });
  return (totalMs) => {
    act(() => {
      vi.advanceTimersByTime(totalMs);
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

function simpleStageOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-vj-simple-stage]");
}

function engineStageOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-vj-engine-stage]");
}

/** The main video the simple renderer plays for a clip (its fit backdrop aside). */
function simpleVideoOf(
  container: HTMLElement,
  clipId: string,
): HTMLVideoElement {
  const video = container.querySelector<HTMLVideoElement>(
    `[data-vj-simple-stage] [data-vj-clip-id="${clipId}"] video:not([data-vj-fit-backdrop])`,
  );
  if (!video) throw new Error(`no simple renderer video for ${clipId}`);
  return video;
}

/** canplaythrough, play() resolves, then `playing` (jsdom has no requestVideoFrameCallback). */
async function bringToFirstFrame(video: HTMLVideoElement): Promise<void> {
  await act(async () => {
    fireEvent.canPlayThrough(video);
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.playing(video);
    await Promise.resolve();
  });
}

beforeEach(() => {
  engineSources.builtClipIds.length = 0;
  engineSources.firstFrameOf.clear();
  resetVjWebGl2ProbeForTests();
  window.history.replaceState(null, "", SCREEN_PATH);
  // The compositor's loop and the DOM health sampler stay still: no frame runs.
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  // The DOM and simple renderers' videos (jsdom has no media playback).
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  vi.useRealTimers();
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
      retiredReason: null,
      handOffFrom: null,
    });
    expect(props.onHealth).toHaveBeenLastCalledWith({
      renderer: "webgl2",
      frames: null,
      isEffectLoadHigh: false,
    });
  });

  it("falls back to the DOM renderer when getContext answers null", () => {
    const advanceFrames = installSampledFrameClock();
    installVjFakeWebGl2({ isContextAvailable: false });
    const { container, props } = renderScreenStage();

    expect(engineCanvasOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "dom",
      reason: "webgl2Missing",
      lossCount: 0,
      retiredReason: "webgl2Missing",
      handOffFrom: null,
    });
    advanceFrames(VJ_SAMPLED_FIRST_REPORT_DELAY_MS + 2 * SAMPLED_FRAME_STEP_MS);
    expect(props.onHealth).toHaveBeenLastCalledWith({
      renderer: "dom",
      frames: SAMPLED_FRAMES,
      isEffectLoadHigh: false,
    });
  });

  it("reports the renderer phase and reason", () => {
    const advanceFrames = installSampledFrameClock();
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
      retiredReason: null,
      handOffFrom: null,
    });
    // The canvas stays mounted and hidden while the DOM renderer draws.
    expect(engineCanvasOf(container)).toBe(canvas);
    expect(
      container
        .querySelector("[data-vj-engine-stage]")
        ?.getAttribute("data-vj-hidden"),
    ).toBe("true");
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    advanceFrames(VJ_SAMPLED_FIRST_REPORT_DELAY_MS + 2 * SAMPLED_FRAME_STEP_MS);
    expect(props.onHealth).toHaveBeenLastCalledWith(
      expect.objectContaining({ renderer: "dom", frames: SAMPLED_FRAMES }),
    );

    act(() => {
      fake?.restoreContext();
    });
    expect(props.onRendererChange).toHaveBeenLastCalledWith({
      phase: "webgl2",
      reason: null,
      lossCount: 1,
      retiredReason: null,
      handOffFrom: null,
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
      retiredReason: "forced",
      handOffFrom: null,
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
});

describe("VjScreenStage object URLs", () => {
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
      retiredReason: "contextLost",
      handOffFrom: null,
    });
    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    // The pre-roll went with the engine; the DOM renderer now plays live.
    expect(props.onSourceReleased).toHaveBeenCalledTimes(1);
    expect(props.onSourceReleased).toHaveBeenCalledWith(nextClip.sourceUrl);
  });
});

describe("VjScreenStage render mode hand-off", () => {
  it("opens on the simple renderer alone and reports simple health", () => {
    const advanceFrames = installSampledFrameClock();
    installVjFakeWebGl2();
    const { container, props } = renderScreenStage({ renderMode: "simple" });

    expect(engineStageOf(container)).toBeNull();
    expect(simpleStageOf(container)).not.toBeNull();
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "simple",
      handOffFrom: null,
    });
    advanceFrames(VJ_SAMPLED_FIRST_REPORT_DELAY_MS + 2 * SAMPLED_FRAME_STEP_MS);
    expect(props.onHealth).toHaveBeenLastCalledWith(
      expect.objectContaining({
        renderer: "simple",
        frames: SAMPLED_FRAMES,
        isEffectLoadHigh: false,
      }),
    );
  });

  it("keeps the engine until the simple renderer shows, then unmounts it", async () => {
    installVjFakeWebGl2();
    const { container, props, rerenderScreenStage } = renderScreenStage({
      live: videoClip("a"),
    });
    expect(engineStageOf(container)).not.toBeNull();

    rerenderScreenStage({ renderMode: "simple" });
    expect(engineStageOf(container)).not.toBeNull();
    expect(container.querySelector('[data-vj-arriving="true"]')).not.toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "simple",
      handOffFrom: "webgl2",
    });

    await bringToFirstFrame(simpleVideoOf(container, "a"));
    expect(engineStageOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-arriving]")).toBeNull();
    expect(simpleStageOf(container)).not.toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "simple",
      handOffFrom: null,
    });
  });

  it("brings the engine back under the simple renderer and hands over on its first live frame", () => {
    installVjFakeWebGl2();
    const { container, props, rerenderScreenStage } = renderScreenStage({
      renderMode: "simple",
      live: videoClip("a"),
    });
    expect(engineStageOf(container)).toBeNull();
    // Queued before the engine mounts, so its loop runs only when the test says.
    const runFrames = captureFrames();

    rerenderScreenStage({ renderMode: "effects" });
    expect(engineStageOf(container)).not.toBeNull();
    expect(simpleStageOf(container)).not.toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "webgl2",
      handOffFrom: "simple",
    });

    showLiveClip("a", runFrames);
    expect(simpleStageOf(container)).toBeNull();
    expect(engineStageOf(container)).not.toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "webgl2",
      handOffFrom: null,
    });
  });

  it("hands over after VJ_RENDERER_HAND_OFF_MAX_MS when no live frame comes", () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    installVjFakeWebGl2();
    const { container, rerenderScreenStage } = renderScreenStage({
      renderMode: "simple",
    });

    rerenderScreenStage({ renderMode: "effects" });
    expect(engineStageOf(container)).not.toBeNull();
    expect(simpleStageOf(container)).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(VJ_RENDERER_HAND_OFF_MAX_MS - 1);
    });
    expect(simpleStageOf(container)).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(simpleStageOf(container)).toBeNull();
    expect(engineStageOf(container)).not.toBeNull();
  });

  it("keeps the canvas element when the operator reverses mid hand-off", () => {
    installVjFakeWebGl2();
    const { container, props, rerenderScreenStage } = renderScreenStage({
      live: videoClip("a"),
    });
    const canvas = engineCanvasOf(container);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);

    rerenderScreenStage({ renderMode: "simple" });
    expect(simpleStageOf(container)).not.toBeNull();
    rerenderScreenStage({ renderMode: "effects" });

    expect(engineCanvasOf(container)).toBe(canvas);
    expect(canvas?.isConnected).toBe(true);
    expect(simpleStageOf(container)).toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "webgl2",
      handOffFrom: null,
    });
  });

  it("keeps a forced dom page off WebGL through simple and back", async () => {
    installVjFakeWebGl2();
    window.history.replaceState(null, "", `${SCREEN_PATH}?vjRenderer=dom`);
    const { container, props, rerenderScreenStage } = renderScreenStage({
      live: videoClip("a"),
    });
    expect(engineStageOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();

    rerenderScreenStage({ renderMode: "simple" });
    expect(engineStageOf(container)).toBeNull();
    expect(simpleStageOf(container)).not.toBeNull();

    await bringToFirstFrame(simpleVideoOf(container, "a"));
    expect(engineStageOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).toBeNull();

    rerenderScreenStage({ renderMode: "effects" });
    expect(engineStageOf(container)).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
    expect(vi.mocked(props.onRendererChange).mock.lastCall?.[0]).toMatchObject({
      phase: "dom",
      reason: "forced",
      handOffFrom: "simple",
    });
  });

  it("keeps the queue head the simple renderer pre-rolls once the engine left, and releases it when the frame is dropped", async () => {
    installVjFakeWebGl2();
    const liveClip = videoClip("a");
    const nextClip = videoClip("b");
    const runFrames = captureFrames();
    const { container, props, handleRef, rerenderScreenStage } =
      renderScreenStage({ live: liveClip });
    // Pre-roll loads into the free layer, so the live clip shows first.
    showLiveClip(liveClip.clipId, runFrames);
    rerenderScreenStage({
      upcoming: { state: { ...BASE_STATE, revision: 1 }, applyAt: 5000 },
      upcomingLive: nextClip,
    });
    expect(handleRef.current?.holdsSource(nextClip.sourceUrl)).toBe(true);

    rerenderScreenStage({ renderMode: "simple" });
    expect(props.onSourceReleased).not.toHaveBeenCalled();

    await bringToFirstFrame(simpleVideoOf(container, liveClip.clipId));
    expect(engineStageOf(container)).toBeNull();
    expect(props.onSourceReleased).not.toHaveBeenCalled();
    expect(handleRef.current?.holdsSource(nextClip.sourceUrl)).toBe(true);
    expect(simpleVideoOf(container, nextClip.clipId)).toBeInstanceOf(
      HTMLVideoElement,
    );

    // The queued frame is dropped: nothing holds the pre-roll any more.
    rerenderScreenStage({ upcoming: null, upcomingLive: null });
    expect(props.onSourceReleased).toHaveBeenCalledWith(nextClip.sourceUrl);
    expect(props.onSourceReleased).not.toHaveBeenCalledWith(liveClip.sourceUrl);
    expect(handleRef.current?.holdsSource(liveClip.sourceUrl)).toBe(true);
  });

  it("shows the fallback clip on a simple renderer that mounts while a generator is live", async () => {
    installVjFakeWebGl2();
    const fallbackClip = {
      ...videoClip("a"),
      sourceUrl: "blob:fallback-a",
    };
    const { container, props, handleRef, rerenderScreenStage } =
      renderScreenStage({
        live: {
          clipId: "generator:plasma:",
          generatorId: "plasma",
          generatorVariant: null,
          mediaKind: "generator",
          sourceUrl: "",
        },
        fallbackClip,
      });
    expect(simpleStageOf(container)).toBeNull();

    rerenderScreenStage({ renderMode: "simple" });
    await bringToFirstFrame(simpleVideoOf(container, "a"));
    expect(engineStageOf(container)).toBeNull();
    expect(handleRef.current?.holdsSource("blob:fallback-a")).toBe(true);
    expect(props.onSourceReleased).not.toHaveBeenCalledWith("blob:fallback-a");
  });
});
