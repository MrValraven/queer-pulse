import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjGeneratorId } from "../../../shared/contracts/vj";
import type { VjResolvedTransition } from "../engine/vjEngineLook";
import {
  vjGeneratorSourceKey,
  type VjRenderableClip,
  type VjRenderableGenerator,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";
import {
  VjSimpleRenderer,
  type VjSimpleRendererProps,
} from "./VjSimpleRenderer";
import stageStyles from "./VjStage.module.css";

/** The hashed class the stage stylesheet gives `name`; Vitest scopes CSS module names. */
function stageClassOf(name: string): string {
  const scopedName = stageStyles[name];
  if (scopedName === undefined)
    throw new Error(`VjStage.module.css has no .${name}`);
  return scopedName;
}

const FADE: VjResolvedTransition = { mode: "fade", durationMs: 800 };

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
    sourceUrl: `blob:${clipId}`,
    durationMs: null,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
    ...changes,
  };
}

function generatorSource(generatorId: VjGeneratorId): VjRenderableGenerator {
  return {
    clipId: vjGeneratorSourceKey(generatorId, null),
    generatorId,
    generatorVariant: null,
    mediaKind: "generator",
    sourceUrl: "",
  };
}

function renderSimpleStage(changes: Partial<VjSimpleRendererProps> = {}) {
  const props: VjSimpleRendererProps = {
    target: null,
    transition: FADE,
    speed: 1,
    isBlackout: false,
    blackoutFadeMs: 0,
    isArriving: false,
    onClipFailed: vi.fn(),
    onSourceReleased: vi.fn(),
    onShown: vi.fn(),
    ...changes,
  };
  const view = render(
    <LazyMotion features={domMax} strict>
      <VjSimpleRenderer {...props} />
    </LazyMotion>,
  );
  const rerenderStage = (next: Partial<VjSimpleRendererProps>): void => {
    Object.assign(props, next);
    view.rerender(
      <LazyMotion features={domMax} strict>
        <VjSimpleRenderer {...props} />
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

/** jsdom has no canvas: give every canvas the same recording 2d context. */
function mockCanvasContext(): void {
  const context = {
    filter: "none",
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
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

/** jsdom plays no media: play, pause and image decode resolve at once. */
function mockMediaPlayback(): void {
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
}

function restoreMediaPlayback(): void {
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLImageElement.prototype, "decode");
}

describe("VjSimpleRenderer", () => {
  beforeEach(mockMediaPlayback);
  afterEach(restoreMediaPlayback);

  it("draws the live clip and nothing of the effects look", () => {
    const { container } = renderSimpleStage({ target: videoClip("one") });
    expect(container.querySelector('[data-vj-clip-id="one"]')).not.toBeNull();
    expect(container.querySelector("[data-vj-effects-frame]")).toBeNull();
    expect(container.querySelector("[data-vj-mix-layer]")).toBeNull();
    expect(container.querySelector("[data-vj-strobe]")).toBeNull();
    expect(container.querySelector("[data-vj-generator]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
    expect(container.querySelector("[data-vj-simple-stage]")).not.toBeNull();
  });

  it("cuts its first clip in and reports onShown once", async () => {
    const onShown = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      transition: { mode: "fade", durationMs: 800 },
      onShown,
    });
    expect(onShown).not.toHaveBeenCalled();
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(elementBySelector(container, "[data-vj-curtain]")).toHaveAttribute(
      "data-vj-fade-ms",
      "0",
    );
    expect(onShown).toHaveBeenCalledTimes(1);

    rerenderStage({ target: videoClip("two") });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it("fades a wipe and cuts a cut", async () => {
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({
      target: videoClip("two"),
      transition: { mode: "wipeLeft", durationMs: 600 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    const fadingLayer = layerOf(container, "two");
    expect(fadingLayer).toHaveAttribute("data-vj-layer-phase", "fadingIn");
    expect(fadingLayer).toHaveAttribute("data-vj-transition", "fade");
    expect(fadingLayer).toHaveAttribute("data-vj-fade-ms", "600");
    expect(fadingLayer).not.toHaveClass(stageClassOf("clipLayerClip"));

    rerenderStage({
      target: videoClip("three"),
      transition: { mode: "cut", durationMs: 0 },
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "three")));
    const cutLayer = layerOf(container, "three");
    expect(cutLayer).toHaveAttribute("data-vj-layer-phase", "shown");
    expect(cutLayer).not.toHaveAttribute("data-vj-fading");
  });

  it("keeps the last clip under a generator and holds its URL", async () => {
    const handleRef = createRef<VjStageHandle>();
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      handleRef,
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({ target: generatorSource("plasma") });
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(container.querySelector("[data-vj-generator]")).toBeNull();
    expect(onSourceReleased).not.toHaveBeenCalled();
    expect(handleRef.current?.holdsSource("blob:one")).toBe(true);
  });

  it("shows black for a generator with no earlier clip and reports onShown", () => {
    const onShown = vi.fn();
    const { container } = renderSimpleStage({
      target: generatorSource("plasma"),
      onShown,
    });
    expect(container.querySelector("[data-vj-clip-id]")).toBeNull();
    expect(container.querySelector("[data-vj-generator]")).toBeNull();
    expect(
      elementBySelector(container, "[data-vj-curtain]").style.opacity,
    ).toBe("1");
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it("plays at the stage speed", () => {
    const { container } = renderSimpleStage({
      target: videoClip("one"),
      speed: 2,
    });
    expect(mainVideoOf(layerOf(container, "one")).playbackRate).toBe(2);
  });

  it("fades the blackout over blackoutFadeMs", () => {
    const { container } = renderSimpleStage({
      target: videoClip("one"),
      isBlackout: true,
      blackoutFadeMs: 300,
    });
    const blackout = elementBySelector(container, "[data-vj-blackout]");
    expect(blackout.style.opacity).toBe("1");
    expect(blackout).toHaveAttribute("data-vj-fade-ms", "300");
    expect(blackout.style.getPropertyValue("--vj-blackout-fade")).toBe("300ms");
  });

  it("holds at 1% opacity while arriving", () => {
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      isArriving: true,
    });
    const stage = elementBySelector(container, "[data-vj-simple-stage]");
    expect(stage).toHaveAttribute("data-vj-arriving", "true");
    expect(stage).toHaveClass(stageClassOf("isArriving"));

    rerenderStage({ isArriving: false });
    expect(stage).not.toHaveAttribute("data-vj-arriving");
    expect(stage).not.toHaveClass(stageClassOf("isArriving"));
  });
});

describe("VjSimpleRenderer pre-roll and fallback clip", () => {
  beforeEach(mockMediaPlayback);
  afterEach(restoreMediaPlayback);

  it("pre-rolls the queue head's clip before its target lands", async () => {
    const handleRef = createRef<VjStageHandle>();
    const nextClip = videoClip("two");
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      handleRef,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({ upcoming: nextClip });
    expect(handleRef.current?.holdsSource("blob:two")).toBe(true);
    const preRolledVideo = mainVideoOf(layerOf(container, "two"));
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    await bringToFirstFrame(preRolledVideo);
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );

    // The quantized change lands: the decoded pre-roll starts at once.
    rerenderStage({ target: nextClip, upcoming: null });
    expect(layerOf(container, "two")).toHaveAttribute(
      "data-vj-layer-phase",
      "fadingIn",
    );
    expect(mainVideoOf(layerOf(container, "two"))).toBe(preRolledVideo);
    expect(handleRef.current?.holdsSource("blob:two")).toBe(true);
  });

  it("pre-rolls nothing for a generator queue head", async () => {
    const handleRef = createRef<VjStageHandle>();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      handleRef,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({ upcoming: generatorSource("plasma") });
    expect(container.querySelectorAll("[data-vj-clip-id]")).toHaveLength(1);
    expect(container.querySelector("[data-vj-generator]")).toBeNull();
  });

  it("holds the queue head's URL behind a target in flight and pre-rolls it once that lands", async () => {
    const handleRef = createRef<VjStageHandle>();
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      handleRef,
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({
      target: videoClip("two"),
      transition: { mode: "cut", durationMs: 0 },
      upcoming: videoClip("three"),
    });
    expect(container.querySelector('[data-vj-clip-id="three"]')).toBeNull();
    expect(handleRef.current?.holdsSource("blob:three")).toBe(true);
    expect(onSourceReleased).not.toHaveBeenCalledWith("blob:three");

    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(layerOf(container, "two")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(mainVideoOf(layerOf(container, "three"))).toBeInstanceOf(
      HTMLVideoElement,
    );
  });

  it("drops a pre-roll the queue head no longer names and releases its URL", async () => {
    const handleRef = createRef<VjStageHandle>();
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      handleRef,
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({ upcoming: videoClip("two") });
    expect(container.querySelector('[data-vj-clip-id="two"]')).not.toBeNull();

    rerenderStage({ upcoming: null });
    expect(container.querySelector('[data-vj-clip-id="two"]')).toBeNull();
    expect(handleRef.current?.holdsSource("blob:two")).toBe(false);
    expect(onSourceReleased).toHaveBeenCalledWith("blob:two");
    expect(onSourceReleased).not.toHaveBeenCalledWith("blob:one");
  });

  it("leaves a failed pre-roll to its target to report", async () => {
    const onClipFailed = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
      onClipFailed,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    rerenderStage({ upcoming: videoClip("two") });

    act(() => {
      fireEvent.error(mainVideoOf(layerOf(container, "two")));
    });
    expect(onClipFailed).not.toHaveBeenCalled();
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
  });

  it("shows the page's fallback clip for a generator when it has shown no clip", async () => {
    const handleRef = createRef<VjStageHandle>();
    const onShown = vi.fn();
    const fallbackClip = videoClip("one", { sourceUrl: "blob:fallback-one" });
    const { container } = renderSimpleStage({
      target: generatorSource("plasma"),
      fallbackClip,
      handleRef,
      onShown,
    });
    expect(container.querySelector("[data-vj-generator]")).toBeNull();
    expect(onShown).not.toHaveBeenCalled();

    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(elementBySelector(container, "[data-vj-curtain]")).toHaveAttribute(
      "data-vj-fade-ms",
      "0",
    );
    expect(onShown).toHaveBeenCalledTimes(1);
    expect(handleRef.current?.holdsSource("blob:fallback-one")).toBe(true);
  });

  it("releases the fallback clip's URL once a clip comes back", async () => {
    const onSourceReleased = vi.fn();
    const { container, rerenderStage } = renderSimpleStage({
      target: generatorSource("plasma"),
      fallbackClip: videoClip("one", { sourceUrl: "blob:fallback-one" }),
      onSourceReleased,
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({
      target: videoClip("two"),
      fallbackClip: null,
      transition: { mode: "cut", durationMs: 0 },
    });
    expect(onSourceReleased).not.toHaveBeenCalled();
    await bringToFirstFrame(mainVideoOf(layerOf(container, "two")));
    expect(onSourceReleased).toHaveBeenCalledWith("blob:fallback-one");
  });

  it("keeps its own last clip over a fallback that arrives later", async () => {
    const { container, rerenderStage } = renderSimpleStage({
      target: videoClip("one"),
    });
    await bringToFirstFrame(mainVideoOf(layerOf(container, "one")));

    rerenderStage({
      target: generatorSource("plasma"),
      fallbackClip: videoClip("other", { sourceUrl: "blob:fallback-other" }),
    });
    expect(layerOf(container, "one")).toHaveAttribute(
      "data-vj-layer-phase",
      "shown",
    );
    expect(container.querySelector('[data-vj-clip-id="other"]')).toBeNull();
  });
});
