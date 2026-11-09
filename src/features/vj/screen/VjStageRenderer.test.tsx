import { readFileSync } from "node:fs";
import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjEffects,
  type VjGeneratorId,
} from "../../../shared/contracts/vj";
import type {
  VjClockReader,
  VjResolvedTransition,
} from "../engine/vjEngineLook";
import {
  vjGeneratorSourceKey,
  type VjRenderableClip,
  type VjRenderableGenerator,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
import { VjStageRenderer, type VjStageRendererProps } from "./VjStageRenderer";
import stageStyles from "./VjStage.module.css";

/** The hashed class the stage stylesheet gives `name`; Vitest scopes CSS module names. */
function stageClassOf(name: string): string {
  const scopedName = stageStyles[name];
  if (scopedName === undefined)
    throw new Error(`VjStage.module.css has no .${name}`);
  return scopedName;
}

const BASE_STATE = createVjStageState("epoch-test", 0);
const FADE: VjResolvedTransition = { mode: "fade", durationMs: 800 };
const NO_MIX: VjStageRendererProps["mix"] = {
  clip: null,
  amount: 0,
  blendMode: "normal",
};
const CLOCK: VjClockReader = {
  serverNow: () => 0,
  toLocalTime: (serverMs) => serverMs,
};

function effectsWith(changes: Partial<VjEffects> = {}): VjEffects {
  return { ...BASE_STATE.effects, ...changes };
}

function videoClip(
  clipId: string,
  changes: Partial<VjRenderableClip> = {},
): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl: `blob:source-${clipId}`,
    durationMs: null,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
    ...changes,
  };
}

function generatorSource(
  generatorId: VjGeneratorId,
  generatorVariant: string | null = null,
): VjRenderableGenerator {
  return {
    clipId: vjGeneratorSourceKey(generatorId, generatorVariant),
    generatorId,
    generatorVariant,
    mediaKind: "generator",
    sourceUrl: "",
  };
}

function gifClip(
  clipId: string,
  width: number,
  height: number,
): VjRenderableClip {
  return videoClip(clipId, { mediaKind: "gif", width, height });
}

function renderStage(changes: Partial<VjStageRendererProps> = {}) {
  const props: VjStageRendererProps = {
    target: null,
    mix: NO_MIX,
    transition: FADE,
    effects: effectsWith(),
    tempo: BASE_STATE.tempo,
    clock: CLOCK,
    onClipFailed: vi.fn(),
    onSourceReleased: vi.fn(),
    ...changes,
  };
  const view = render(
    <LazyMotion features={domMax} strict>
      <VjStageRenderer {...props} />
    </LazyMotion>,
  );
  const rerenderStage = (next: Partial<VjStageRendererProps>): void => {
    Object.assign(props, next);
    view.rerender(
      <LazyMotion features={domMax} strict>
        <VjStageRenderer {...props} />
      </LazyMotion>,
    );
  };
  return { ...view, props, rerenderStage };
}

function layerOf(container: HTMLElement, clipId: string): HTMLElement {
  const layer = container.querySelector<HTMLElement>(
    `[data-vj-clip-id="${clipId}"]`,
  );
  if (!layer) throw new Error(`no layer for ${clipId}`);
  return layer;
}

function mainVideoOf(layer: HTMLElement): HTMLVideoElement {
  const video = layer.querySelector<HTMLVideoElement>(
    "video:not([data-vj-fit-backdrop])",
  );
  if (!video) throw new Error("no main video");
  return video;
}

function elementBySelector(container: HTMLElement, selector: string) {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

interface FakeCanvasContext {
  filter: string;
  clearRect: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
}

/** jsdom has no canvas: give every canvas the same recording 2d context. */
function mockCanvasContext(): FakeCanvasContext {
  const context: FakeCanvasContext = {
    filter: "none",
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  return context;
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

describe("VjStageRenderer", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLImageElement.prototype, "decode");
  });

  it("plays every video muted, looping and inline", () => {
    const { container } = renderStage({
      target: videoClip("one", { fitMode: "fit" }),
    });
    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos).toHaveLength(1);
    for (const video of videos) {
      expect(video.muted).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.autoplay).toBe(true);
      expect(video.hasAttribute("playsinline")).toBe(true);
      expect(video.hasAttribute("disablepictureinpicture")).toBe(true);
      expect(video.hasAttribute("controls")).toBe(false);
      expect(video.getAttribute("preload")).toBe("auto");
    }
  });

  it("applies the speed to videos and leaves GIFs at their own", () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      effects: effectsWith({ speed: 2 }),
    });
    const video = mainVideoOf(layerOf(container, "one"));
    expect(video.playbackRate).toBe(2);
    rerenderStage({ effects: effectsWith({ speed: 0.5 }) });
    expect(video.playbackRate).toBe(0.5);

    const fastClipView = renderStage({
      target: videoClip("fast", { defaultSpeed: 2 }),
      effects: effectsWith({ speed: 0.5 }),
    });
    expect(
      mainVideoOf(layerOf(fastClipView.container, "fast")).playbackRate,
    ).toBe(1);

    const gifView = renderStage({
      target: gifClip("loop", 640, 360),
      effects: effectsWith({ speed: 2 }),
    });
    const gifLayer = layerOf(gifView.container, "loop");
    expect(gifLayer.querySelector("img")).not.toBeNull();
    expect(gifLayer.querySelector("video")).toBeNull();
  });

  it("pixelates a small GIF shown large", () => {
    const small = renderStage({ target: gifClip("tiny", 120, 90) });
    const tinyImage = layerOf(small.container, "tiny").querySelector("img");
    expect(tinyImage?.getAttribute("data-vj-pixelated")).toBe("true");

    const large = renderStage({ target: gifClip("large", 1920, 1080) });
    const largeImage = layerOf(large.container, "large").querySelector("img");
    expect(largeImage?.hasAttribute("data-vj-pixelated")).toBe(false);
  });

  it("stacks the effects, the curtain, the blackout and the strobe and draws no overlay", () => {
    const { container } = renderStage({
      target: videoClip("one"),
      effects: effectsWith({ isBlackout: true, isStrobing: true }),
    });
    const stage = elementBySelector(container, "[data-vj-stage]");
    const layersBottomToTop = [
      "[data-vj-effects-frame]",
      "[data-vj-curtain]",
      "[data-vj-blackout]",
      "[data-vj-strobe]",
    ].map((selector) => elementBySelector(container, selector));
    for (const layer of layersBottomToTop) {
      expect(layer.parentElement).toBe(stage);
      expect(layer.style.zIndex).toBe("");
    }
    layersBottomToTop.slice(1).forEach((layer, layerIndex) => {
      const below = layersBottomToTop[layerIndex];
      if (!below) throw new Error("missing lower layer");
      expect(
        below.compareDocumentPosition(layer) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
    expect(container.querySelector("[data-vj-overlay]")).toBeNull();
  });

  it("fades the blackout with the transition length", () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 1500 },
    });
    const blackout = elementBySelector(container, "[data-vj-blackout]");
    expect(blackout.style.opacity).toBe("0");
    rerenderStage({ effects: effectsWith({ isBlackout: true }) });
    expect(blackout.style.opacity).toBe("1");
    expect(blackout.getAttribute("data-vj-fade-ms")).toBe("1500");
    rerenderStage({ transition: { mode: "wipeLeft", durationMs: 300 } });
    expect(blackout.getAttribute("data-vj-fade-ms")).toBe("300");
  });

  it("snaps the blackout on and off in Cut mode and fades it in Fade mode", () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "cut", durationMs: 0 },
    });
    const blackout = elementBySelector(container, "[data-vj-blackout]");
    expect(blackout.getAttribute("data-vj-fade-ms")).toBe("0");
    expect(blackout.style.getPropertyValue("--vj-blackout-fade")).toBe("0ms");
    rerenderStage({ effects: effectsWith({ isBlackout: true }) });
    expect(blackout.style.opacity).toBe("1");
    expect(blackout.style.getPropertyValue("--vj-blackout-fade")).toBe("0ms");
    rerenderStage({ effects: effectsWith({ isBlackout: false }) });
    expect(blackout.style.opacity).toBe("0");
    expect(blackout.getAttribute("data-vj-fade-ms")).toBe("0");

    rerenderStage({ transition: { mode: "fade", durationMs: 1500 } });
    expect(blackout.getAttribute("data-vj-fade-ms")).toBe("1500");
    expect(blackout.style.getPropertyValue("--vj-blackout-fade")).toBe(
      "1500ms",
    );
  });

  it("reports a clip that fails to decode and keeps the current one", async () => {
    const onClipFailed = vi.fn();
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      onClipFailed,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    const currentLayer = layerOf(container, "one");
    expect(currentLayer).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(currentLayer.style.opacity).toBe("1");

    rerenderStage({ target: videoClip("broken") });
    const brokenLayer = layerOf(container, "broken");
    expect(brokenLayer).toHaveAttribute("data-vj-layer-phase", "loading");
    expect(brokenLayer.style.opacity).toBe("0");
    act(() => {
      fireEvent.error(mainVideoOf(brokenLayer));
    });

    expect(onClipFailed).toHaveBeenCalledWith("broken");
    expect(container.querySelector('[data-vj-clip-id="broken"]')).toBeNull();
    const stillCurrent = layerOf(container, "one");
    expect(stillCurrent).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(stillCurrent.style.opacity).toBe("1");
  });
});

describe("VjStageRenderer fit backdrop", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLImageElement.prototype, "decode");
  });

  it("draws a fitted clip over a small painted backdrop and decodes it once", () => {
    const { container } = renderStage({
      target: videoClip("wide", { fitMode: "fit" }),
    });
    const layer = layerOf(container, "wide");
    expect(layer.querySelectorAll("video")).toHaveLength(1);
    const backdrop = layer.querySelector<HTMLCanvasElement>(
      "canvas[data-vj-fit-backdrop]",
    );
    const main = mainVideoOf(layer);
    expect(backdrop).not.toBeNull();
    if (!backdrop) return;
    expect(backdrop.width).toBe(64);
    expect(backdrop.height).toBe(36);
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(
      backdrop.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const filled = renderStage({ target: videoClip("full") });
    expect(
      layerOf(filled.container, "full").querySelector("[data-vj-fit-backdrop]"),
    ).toBeNull();
  });

  it("styles the backdrop canvas to cover the whole layer", () => {
    const { container } = renderStage({
      target: videoClip("wide", { fitMode: "fit" }),
    });
    const backdrop = layerOf(container, "wide").querySelector("canvas");
    expect(backdrop).not.toBeNull();
    expect(backdrop).toHaveClass(stageClassOf("fitBackdrop"));
    const stageCss = readFileSync(
      "src/features/vj/screen/VjStage.module.css",
      "utf8",
    );
    const ruleBody = /\.fitBackdrop\s*\{([^}]*)\}/.exec(stageCss)?.[1] ?? "";
    expect(ruleBody).toMatch(/position:\s*absolute/);
    expect(ruleBody).toMatch(/inset:\s*0/);
    expect(ruleBody).toMatch(/width:\s*100%/);
    expect(ruleBody).toMatch(/height:\s*100%/);
    expect(ruleBody).toMatch(/object-fit:\s*cover/);
  });

  it("matches the backdrop canvas to the clip's aspect ratio", () => {
    const portrait = renderStage({
      target: videoClip("tall", { fitMode: "fit", width: 1080, height: 1920 }),
    });
    const backdrop = layerOf(portrait.container, "tall").querySelector(
      "canvas",
    );
    expect(backdrop?.width).toBe(64);
    expect(backdrop?.height).toBe(114);
  });

  it("paints the GIF backdrop from the one image and keeps pixelation on the main image only", () => {
    const { container } = renderStage({
      target: { ...gifClip("tiny", 120, 90), fitMode: "fit" },
    });
    const layer = layerOf(container, "tiny");
    expect(layer.querySelectorAll("img")).toHaveLength(1);
    expect(layer.querySelector("canvas[data-vj-fit-backdrop]")).not.toBeNull();
    expect(layer.querySelector("img")?.getAttribute("data-vj-pixelated")).toBe(
      "true",
    );
    expect(
      layer.querySelector("canvas")?.hasAttribute("data-vj-pixelated"),
    ).toBe(false);
  });
});

describe("VjStageRenderer fades cut short", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Clip "one" shown, then clip "two" mid-fade over it. */
  async function renderMidFade(): Promise<{
    container: HTMLElement;
    rerenderStage: (next: Partial<VjStageRendererProps>) => void;
  }> {
    const view = renderStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 2000 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(view.container, "one")));
    view.rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(view.container, "two")));
    const fadingLayer = layerOf(view.container, "two");
    expect(fadingLayer).toHaveAttribute("data-vj-layer-phase", "fadingIn");
    expect(fadingLayer).toHaveAttribute("data-vj-fading", "true");
    expect(fadingLayer).toHaveAttribute("data-vj-fade-ms", "2000");
    return view;
  }

  function expectSnappedToFull(layer: HTMLElement): void {
    expect(layer).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(layer).not.toHaveAttribute("data-vj-fading");
    expect(layer).toHaveAttribute("data-vj-fade-ms", "0");
    expect(layer.style.opacity).toBe("1");
  }

  it("snaps the fading layer to full opacity when the screen goes black mid-fade", async () => {
    const { container, rerenderStage } = await renderMidFade();
    rerenderStage({ target: null });
    expectSnappedToFull(layerOf(container, "two"));
    expect(
      elementBySelector(container, "[data-vj-curtain]").style.opacity,
    ).toBe("1");
  });
});

describe("VjStageRenderer catches a fading clip up when a new clip is tapped", () => {
  let animateSpy: ReturnType<typeof vi.fn>;
  let finishCatchUp: () => void;
  let cancelAnimation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
    cancelAnimation = vi.fn();
    finishCatchUp = () => undefined;
    animateSpy = vi.fn(() => ({
      addEventListener: (_type: string, listener: () => void) => {
        finishCatchUp = listener;
      },
      removeEventListener: vi.fn(),
      cancel: cancelAnimation,
    }));
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      writable: true,
      value: animateSpy,
    });
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
      const computed = realGetComputedStyle(element);
      if (!element.hasAttribute("data-vj-catching-up")) return computed;
      return { opacity: "0.4" } as CSSStyleDeclaration;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, "animate");
  });

  async function renderMidFade() {
    const view = renderStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 2000 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(view.container, "one")));
    view.rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(view.container, "two")));
    expect(layerOf(view.container, "two")).toHaveAttribute(
      "data-vj-layer-phase",
      "fadingIn",
    );
    return view;
  }

  it("keeps the old front mounted and opaque and the fading layer opaque while it eases up from where it is", async () => {
    const { container, rerenderStage } = await renderMidFade();
    const handleRef = createRef<VjStageHandle>();
    rerenderStage({ target: videoClip("three"), handleRef });

    const catchingLayer = layerOf(container, "two");
    expect(catchingLayer).toHaveAttribute("data-vj-layer-phase", "catchingUp");
    expect(catchingLayer).toHaveAttribute("data-vj-catching-up", "true");
    expect(catchingLayer.style.opacity).toBe("1");
    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(animateSpy).toHaveBeenCalledWith(
      [{ opacity: 0.4 }, { opacity: 1 }],
      { duration: 180, easing: "ease-out", fill: "forwards" },
    );

    const oldFront = layerOf(container, "one");
    expect(oldFront).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(oldFront.style.opacity).toBe("1");
    expect(oldFront.querySelector("video")).not.toBeNull();
    expect(Number(catchingLayer.style.zIndex)).toBeGreaterThan(
      Number(oldFront.style.zIndex),
    );
    expect(container.querySelector('[data-vj-clip-id="three"]')).toBeNull();
    // The waiting target has no layer yet; the handle still counts its URL as held.
    expect(handleRef.current?.holdsSource("blob:source-three")).toBe(true);
    expect(cancelAnimation).not.toHaveBeenCalled();
  });

  it("promotes the caught-up layer, then loads the new clip into the freed layer with the normal fade", async () => {
    const { container, rerenderStage } = await renderMidFade();
    rerenderStage({ target: videoClip("three") });
    act(() => {
      finishCatchUp();
    });

    const promoted = layerOf(container, "two");
    expect(promoted).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(promoted.style.opacity).toBe("1");
    expect(container.querySelector('[data-vj-clip-id="one"]')).toBeNull();
    const loading = layerOf(container, "three");
    expect(loading).toHaveAttribute("data-vj-layer-phase", "loading");
    expect(loading.style.opacity).toBe("0");

    await bringToFirstFrame(mainVideoOf(loading));
    expect(loading).toHaveAttribute("data-vj-layer-phase", "fadingIn");
    expect(loading).toHaveAttribute("data-vj-fade-ms", "2000");
    expect(layerOf(container, "two").style.opacity).toBe("1");
  });
});

describe("VjStageRenderer strobe on a follower screen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Samples the strobe every 10 ms for two seconds and counts the samples with a flash up. */
  function samplesWithFlash(container: HTMLElement): number {
    const strobe = elementBySelector(container, "[data-vj-strobe]");
    let flashSamples = 0;
    for (let elapsedMs = 0; elapsedMs < 2000; elapsedMs += 10) {
      act(() => {
        vi.advanceTimersByTime(10);
      });
      if (strobe.getAttribute("data-vj-flash") === "true") {
        expect(strobe.style.opacity).toBe("1");
        flashSamples += 1;
      } else {
        expect(strobe.style.opacity).toBe("0");
      }
    }
    return flashSamples;
  }

  it("flashes when the strobe is enabled, which is the default", () => {
    const { container } = renderStage({
      target: videoClip("one"),
      effects: effectsWith({ isStrobing: true }),
    });
    expect(samplesWithFlash(container)).toBeGreaterThan(0);
  });

  it("renders no flash on a follower screen with the strobe disabled", () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      effects: effectsWith({ isStrobing: true }),
      isStrobeEnabled: false,
    });
    expect(samplesWithFlash(container)).toBe(0);
    expect(
      elementBySelector(container, "[data-vj-strobe]").getAttribute(
        "data-vj-strobe-enabled",
      ),
    ).toBe("false");

    rerenderStage({ isStrobeEnabled: true });
    expect(samplesWithFlash(container)).toBeGreaterThan(0);
  });
});

describe("VjStageRenderer video first frame without a presented frame", () => {
  let videoReadyState = 0;
  let videoWidth = 0;
  let requestFrameCallback = vi.fn(() => 7);
  let cancelFrameCallback = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    videoReadyState = 0;
    videoWidth = 0;
    requestFrameCallback = vi.fn(() => 7);
    cancelFrameCallback = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
    // A browser that never presents a frame for a layer held at opacity 0.
    Object.defineProperty(
      HTMLVideoElement.prototype,
      "requestVideoFrameCallback",
      { configurable: true, writable: true, value: requestFrameCallback },
    );
    Object.defineProperty(
      HTMLVideoElement.prototype,
      "cancelVideoFrameCallback",
      { configurable: true, writable: true, value: cancelFrameCallback },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Reflect.deleteProperty(
      HTMLVideoElement.prototype,
      "requestVideoFrameCallback",
    );
    Reflect.deleteProperty(
      HTMLVideoElement.prototype,
      "cancelVideoFrameCallback",
    );
  });

  /** Lets the test say when the video holds a decoded frame. */
  function controlDecodedFrame(video: HTMLVideoElement): void {
    Object.defineProperty(video, "readyState", {
      configurable: true,
      get: () => videoReadyState,
    });
    Object.defineProperty(video, "videoWidth", {
      configurable: true,
      get: () => videoWidth,
    });
  }

  async function startPlaying(video: HTMLVideoElement): Promise<void> {
    await act(async () => {
      fireEvent.canPlayThrough(video);
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.playing(video);
      await Promise.resolve();
    });
  }

  function advance(durationMs: number): void {
    act(() => {
      vi.advanceTimersByTime(durationMs);
    });
  }

  it("shows the clip 300 ms after playing and two painted frames when the callback never fires", async () => {
    const { container } = renderStage({ target: videoClip("one") });
    const video = mainVideoOf(layerOf(container, "one"));
    controlDecodedFrame(video);
    videoReadyState = 4;
    videoWidth = 1920;
    await startPlaying(video);
    expect(requestFrameCallback).toHaveBeenCalled();

    advance(290);
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "loading",
    );
    advance(100);
    const layer = layerOf(container, "one");
    expect(layer).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(layer.style.opacity).toBe("1");
    expect(cancelFrameCallback).toHaveBeenCalledWith(7);
  });

  it("never shows a video with no decoded frame, then shows it once a frame is decoded", async () => {
    const { container } = renderStage({ target: videoClip("one") });
    const video = mainVideoOf(layerOf(container, "one"));
    controlDecodedFrame(video);
    videoReadyState = 1;
    videoWidth = 1920;
    await startPlaying(video);

    advance(2000);
    const waitingLayer = layerOf(container, "one");
    expect(waitingLayer).toHaveAttribute("data-vj-layer-phase", "loading");
    expect(waitingLayer.style.opacity).toBe("0");
    expect(
      elementBySelector(container, "[data-vj-curtain]").style.opacity,
    ).toBe("1");

    videoReadyState = 4;
    advance(200);
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(
      elementBySelector(container, "[data-vj-curtain]").style.opacity,
    ).toBe("0");
  });
});

describe("VjStageRenderer releases video decoders", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops the source and reloads every video when the stage unmounts", () => {
    const loadSpy = vi
      .spyOn(HTMLMediaElement.prototype, "load")
      .mockImplementation(() => undefined);
    const { container, unmount } = renderStage({
      target: videoClip("one", { fitMode: "fit" }),
    });
    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos).toHaveLength(1);
    for (const video of videos) {
      expect(video.getAttribute("src")).toBe("blob:source-one");
    }
    unmount();
    for (const video of videos) {
      expect(video.hasAttribute("src")).toBe(false);
    }
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it("paints the fit backdrop on first frame and every 500 ms, and stops painting on unmount", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    try {
      const canvasContext = mockCanvasContext();
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");
      const { container, unmount } = renderStage({
        target: videoClip("one", { fitMode: "fit" }),
      });
      expect(canvasContext.drawImage).not.toHaveBeenCalled();

      const video = mainVideoOf(layerOf(container, "one"));
      await bringToFirstFrame(video);
      expect(canvasContext.filter).toBe("blur(2px) brightness(0.45)");
      const paintsAtFirstFrame = canvasContext.drawImage.mock.calls.length;
      expect(paintsAtFirstFrame).toBeGreaterThanOrEqual(1);
      expect(canvasContext.drawImage.mock.calls[0]?.[0]).toBe(video);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(canvasContext.drawImage.mock.calls.length).toBe(
        paintsAtFirstFrame + 2,
      );

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      const paintsAtUnmount = canvasContext.drawImage.mock.calls.length;
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(canvasContext.drawImage.mock.calls.length).toBe(paintsAtUnmount);
    } finally {
      vi.useRealTimers();
    }
  });

  it("survives a canvas that refuses to draw", async () => {
    const canvasContext = mockCanvasContext();
    canvasContext.drawImage.mockImplementation(() => {
      throw new DOMException("tainted", "SecurityError");
    });
    const { container } = renderStage({
      target: videoClip("one", { fitMode: "fit" }),
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
  });

  it("releases the old clip's video once a cut has switched to the new clip", async () => {
    const loadSpy = vi
      .spyOn(HTMLMediaElement.prototype, "load")
      .mockImplementation(() => undefined);
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "cut", durationMs: 0 },
    });
    const oldVideo = mainVideoOf(layerOf(container, "one"));
    await bringToFirstFrame(oldVideo);
    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));

    // The old layer stays as an empty leaving slot: its media is gone.
    const leavingLayer = layerOf(container, "one");
    expect(leavingLayer).toHaveAttribute("data-vj-layer-phase", "leaving");
    expect(leavingLayer.querySelector("video")).toBeNull();
    expect(oldVideo.hasAttribute("src")).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(mainVideoOf(layerOf(container, "two")).getAttribute("src")).toBe(
      "blob:source-two",
    );
  });
});

describe("VjStageRenderer v2 sources, mix and transitions", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders gradientField for plasma, starfield and tunnel", () => {
    const domIncapableGenerators: VjGeneratorId[] = [
      "plasma",
      "starfield",
      "tunnel",
    ];
    for (const generatorId of domIncapableGenerators) {
      const view = renderStage({ target: generatorSource(generatorId) });
      const drawn = elementBySelector(view.container, "[data-vj-generator]");
      expect(drawn).toHaveAttribute("data-vj-generator", "gradientField");
      expect(drawn).toHaveAttribute("data-vj-generator-source", generatorId);
      // A generator is ready at once: its layer shows and the curtain lifts.
      expect(
        layerOf(view.container, vjGeneratorSourceKey(generatorId, null)),
      ).toHaveAttribute("data-vj-layer-phase", "shown");
      expect(
        elementBySelector(view.container, "[data-vj-curtain]").style.opacity,
      ).toBe("0");
      view.unmount();
    }
    const gradientView = renderStage({
      target: generatorSource("gradientField"),
    });
    expect(
      elementBySelector(gradientView.container, "[data-vj-generator]"),
    ).toHaveAttribute("data-vj-generator", "gradientField");
  });

  it("draws prideFlagWave as stripes of its flag", () => {
    const { container, rerenderStage } = renderStage({
      target: generatorSource("prideFlagWave", "trans"),
    });
    const stripes = elementBySelector(container, "[data-vj-generator]");
    expect(stripes).toHaveAttribute("data-vj-generator", "prideFlagWave");
    expect(stripes).toHaveAttribute("data-vj-flag", "trans");
    const background = stripes.style.getPropertyValue("--vj-flag-stripes");
    // Stripe tokens are numbered from 1; the trans flag has five.
    expect(background).toContain("rgb(var(--vj-flag-trans-1)) 0% 20%");
    expect(background).toContain("rgb(var(--vj-flag-trans-5)) 80% 100%");
    expect(background).not.toContain("--vj-flag-trans-0");
    expect(background).not.toContain("--vj-flag-trans-6");

    rerenderStage({ target: generatorSource("prideFlagWave", "unknown") });
    expect(
      elementBySelector(
        container,
        `[data-vj-clip-id="${vjGeneratorSourceKey("prideFlagWave", "unknown")}"] [data-vj-generator]`,
      ),
    ).toHaveAttribute("data-vj-flag", "rainbow");
  });

  it("draws the mix clip at the crossfader opacity with its blend mode", () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("live"),
      mix: { clip: videoClip("mixer"), amount: 0.4, blendMode: "normal" },
    });
    const mixLayer = elementBySelector(container, "[data-vj-mix-layer]");
    const liveGroup = elementBySelector(container, "[data-vj-live-group]");
    expect(mixLayer).toHaveAttribute("data-vj-mix-clip-id", "mixer");
    expect(mixLayer.querySelector("video")?.getAttribute("src")).toBe(
      "blob:source-mixer",
    );
    expect(mixLayer.style.opacity).toBe("0.4");
    expect(mixLayer).toHaveAttribute("data-vj-css-blend", "normal");
    expect(liveGroup.style.opacity).toBe("1");
    // The mix layer sits above the live layers.
    expect(
      liveGroup.compareDocumentPosition(mixLayer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    rerenderStage({
      mix: { clip: videoClip("mixer"), amount: 0.25, blendMode: "screen" },
    });
    expect(mixLayer.style.opacity).toBe("0.5");
    expect(mixLayer).toHaveAttribute("data-vj-css-blend", "screen");
    expect(liveGroup.style.opacity).toBe("1");

    rerenderStage({
      mix: { clip: videoClip("mixer"), amount: 1, blendMode: "add" },
    });
    expect(mixLayer.style.opacity).toBe("1");
    expect(mixLayer).toHaveAttribute("data-vj-css-blend", "plus-lighter");
    expect(liveGroup.style.opacity).toBe("0");

    rerenderStage({ mix: { clip: null, amount: 1, blendMode: "add" } });
    expect(mixLayer.style.opacity).toBe("0");
    expect(mixLayer.querySelector("video")).toBeNull();
    expect(liveGroup.style.opacity).toBe("1");
  });

  it("answers holdsSource for a shown clip, a loading clip and the mix clip", async () => {
    const handleRef = createRef<VjStageHandle>();
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      handleRef,
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({
      target: videoClip("two"),
      mix: { clip: videoClip("mixer"), amount: 0.5, blendMode: "normal" },
    });
    expect(layerOf(container, "two")).toHaveAttribute(
      "data-vj-layer-phase",
      "loading",
    );
    const handle = handleRef.current;
    if (!handle) throw new Error("no stage handle");
    expect(handle.holdsSource("blob:source-one")).toBe(true);
    expect(handle.holdsSource("blob:source-two")).toBe(true);
    expect(handle.holdsSource("blob:source-mixer")).toBe(true);
    expect(handle.holdsSource("blob:source-elsewhere")).toBe(false);
    expect(handle.holdsSource("")).toBe(false);

    // A replaced mix clip is released once nothing holds it.
    rerenderStage({
      mix: { clip: videoClip("other"), amount: 0.5, blendMode: "normal" },
    });
    expect(onSourceReleased).toHaveBeenCalledWith("blob:source-mixer");
    expect(handleRef.current?.holdsSource("blob:source-mixer")).toBe(false);
    expect(handleRef.current?.holdsSource("blob:source-other")).toBe(true);
  });

  it("keeps a mix URL the live layer also shows when the mix slot empties", async () => {
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      mix: { clip: videoClip("one"), amount: 0.5, blendMode: "normal" },
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({ mix: NO_MIX });
    expect(onSourceReleased).not.toHaveBeenCalledWith("blob:source-one");
  });
});

describe("VjStageRenderer v2 transitions and freeze", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a dipWhite as a fade when the strobe holds the budget", async () => {
    const dipWhite: VjResolvedTransition = {
      mode: "dipWhite",
      durationMs: 1000,
    };

    const granted = renderStage({
      target: videoClip("one"),
      transition: dipWhite,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(granted.container, "one")));
    granted.rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(granted.container, "two")));
    const dippingLayer = layerOf(granted.container, "two");
    expect(dippingLayer).toHaveAttribute("data-vj-layer-phase", "fadingIn");
    expect(dippingLayer).toHaveAttribute("data-vj-transition", "dip");
    expect(dippingLayer).toHaveClass(stageClassOf("clipLayerDip"));
    expect(dippingLayer.style.getPropertyValue("--vj-dip-colour")).toBe(
      "var(--vj-white)",
    );
    granted.unmount();

    const strobing = renderStage({
      target: videoClip("one"),
      transition: dipWhite,
      effects: effectsWith({ isStrobing: true }),
    });
    await bringToFirstFrame(mainVideoOf(layerOf(strobing.container, "one")));
    strobing.rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(strobing.container, "two")));
    const fadingLayer = layerOf(strobing.container, "two");
    expect(fadingLayer).toHaveAttribute("data-vj-layer-phase", "fadingIn");
    expect(fadingLayer).toHaveAttribute("data-vj-transition", "fade");
    expect(fadingLayer).toHaveClass(stageClassOf("clipLayerFading"));
    expect(fadingLayer).not.toHaveClass(stageClassOf("clipLayerDip"));
  });

  it("wipes the incoming layer in from the right edge for wipeLeft and ends on its animation", async () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "wipeLeft", durationMs: 1000 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    const wipingLayer = layerOf(container, "two");
    expect(wipingLayer).toHaveAttribute("data-vj-transition", "clip");
    expect(wipingLayer).toHaveClass(stageClassOf("clipLayerClip"));
    expect(wipingLayer.style.getPropertyValue("--vj-clip-from")).toBe(
      "inset(0 0 0 100%)",
    );
    expect(wipingLayer.style.getPropertyValue("--vj-clip-to")).toBe(
      "inset(0 0 0 0)",
    );
    // The wipe uncovers the layer at full opacity from the first frame.
    expect(wipingLayer.style.opacity).toBe("1");

    act(() => {
      fireEvent.animationEnd(wipingLayer);
    });
    expect(layerOf(container, "two")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
  });

  it("draws a DOM-incapable transition as the fade", async () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "zoomBlur", durationMs: 1000 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(layerOf(container, "two")).toHaveAttribute(
      "data-vj-transition",
      "fade",
    );
  });

  it("pauses the shown clip while freeze is on", async () => {
    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    pauseSpy.mockClear();
    rerenderStage({
      effects: effectsWith({
        settings: { freeze: { isOn: true, amount: 1, variant: null } },
      }),
    });
    expect(pauseSpy).toHaveBeenCalled();
  });
});

describe("VjStageRenderer loop window", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Gives the video a media time the test moves, and records every seek. */
  function controlMediaTime(video: HTMLVideoElement) {
    const seeks: number[] = [];
    let mediaTimeSec = 0;
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => mediaTimeSec,
      set: (nextSec: number) => {
        seeks.push(nextSec);
        mediaTimeSec = nextSec;
      },
    });
    const playTo = (atSec: number): void => {
      mediaTimeSec = atSec;
      act(() => {
        fireEvent.timeUpdate(video);
      });
    };
    return { seeks, playTo };
  }

  it("seeks back to loop in at loop out", () => {
    const { container } = renderStage({
      target: videoClip("looped", {
        durationMs: 10_000,
        loopInMs: 2000,
        loopOutMs: 6000,
      }),
    });
    const video = mainVideoOf(layerOf(container, "looped"));
    const { seeks, playTo } = controlMediaTime(video);

    act(() => {
      fireEvent.loadedMetadata(video);
    });
    expect(seeks).toEqual([2]);

    playTo(4);
    expect(seeks).toEqual([2]);
    playTo(5.97);
    expect(seeks).toEqual([2, 2]);
  });

  it("plays a ping-pong clip as a forward loop on the DOM", () => {
    const { container } = renderStage({
      target: videoClip("bounce", {
        durationMs: 8000,
        loopInMs: 1000,
        loopOutMs: 5000,
        loopMode: "pingPong",
      }),
    });
    const video = mainVideoOf(layerOf(container, "bounce"));
    const { seeks, playTo } = controlMediaTime(video);
    playTo(4.99);
    expect(seeks).toEqual([1]);
  });

  it("leaves a clip with no loop points to the native loop", () => {
    const { container } = renderStage({
      target: videoClip("whole", { durationMs: 10_000 }),
    });
    const video = mainVideoOf(layerOf(container, "whole"));
    const { seeks, playTo } = controlMediaTime(video);
    playTo(9.99);
    expect(seeks).toEqual([]);
    expect(video.loop).toBe(true);
  });
});

describe("VjStageRenderer hand-off props", () => {
  beforeEach(() => {
    mockCanvasContext();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports onShown once the first clip shows", async () => {
    const onShown = vi.fn();
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      onShown,
    });
    expect(onShown).not.toHaveBeenCalled();
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(onShown).toHaveBeenCalledTimes(1);

    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it("cuts the first clip in when shouldCutFirstTarget is set", async () => {
    const { container, rerenderStage } = renderStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 600 },
      shouldCutFirstTarget: true,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(elementBySelector(container, "[data-vj-curtain]")).toHaveAttribute(
      "data-vj-fade-ms",
      "0",
    );

    // Later clips keep the stage's own transition.
    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(layerOf(container, "two")).toHaveAttribute("data-vj-fade-ms", "600");
  });

  it("fades the first clip in over the transition without shouldCutFirstTarget", async () => {
    const { container } = renderStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 600 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(elementBySelector(container, "[data-vj-curtain]")).toHaveAttribute(
      "data-vj-fade-ms",
      "600",
    );
  });
});
