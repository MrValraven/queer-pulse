import { describe, expect, it, vi } from "vitest";
import type { VjPreloadFailure } from "../../../shared/contracts/vj";
import type {
  VjRenderableClip,
  VjRenderableSource,
} from "../screen/vjLayerMachine";
import {
  vjEngineSourceKey,
  type VjEngineSource,
  type VjSourceEvents,
  type VjSourceFrameInput,
} from "./sources/vjSourceTypes";
import {
  VjCompositorLayers,
  VjSourceRegistry,
  isVjLiveFrameShown,
  type VjHeldSource,
  type VjLayerDrawState,
} from "./vjCompositorLayers";
import { VjCompositorMixSlot } from "./vjCompositorMixSlot";
import type { VjLayerDraw } from "./vjPassGraph";

/** A source the test drives by hand: it reports a first frame or a failure when told to. */
class FakeLayerSource implements VjEngineSource {
  readonly key: string;
  readonly kind: "video" | "generator";
  readonly renderable: VjRenderableSource;
  isReady = false;
  playheadMs = 0;
  isDisposed = false;
  disposeCount = 0;
  readonly updates: number[] = [];
  private readonly events: VjSourceEvents;
  private readonly draw: VjLayerDraw = {
    programKey: "source.clip",
    uniforms: { uSource: 0, uBackdrop: 1 },
    hasBackdrop: false,
  };

  constructor(renderable: VjRenderableSource, events: VjSourceEvents) {
    this.renderable = renderable;
    this.events = events;
    this.key = vjEngineSourceKey(renderable);
    this.kind = renderable.mediaKind === "generator" ? "generator" : "video";
  }

  emitFirstFrame(): void {
    this.isReady = true;
    this.events.onFirstFrame(this.key);
  }

  emitFailed(failure: VjPreloadFailure): void {
    this.events.onFailed(this.key, failure);
  }

  update(frame: VjSourceFrameInput): void {
    this.updates.push(frame.nowMs);
  }

  bindDraw(): VjLayerDraw {
    return this.draw;
  }

  holdsSourceUrl(sourceUrl: string): boolean {
    return sourceUrl !== "" && sourceUrl === this.renderable.sourceUrl;
  }

  byteSize(): number {
    return 0;
  }

  restore(): void {
    // Nothing on a fake GPU.
  }

  dispose(): void {
    this.isDisposed = true;
    this.disposeCount += 1;
  }
}

function clipOf(
  clipId: string,
  sourceUrl = `blob:${clipId}`,
): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl,
    durationMs: 10_000,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
  };
}

const FADE = { mode: "fade", durationMs: 400 } as const;

function setUp() {
  const created: FakeLayerSource[] = [];
  const released: string[] = [];
  const onClipFailed = vi.fn();
  let layers: VjCompositorLayers | null = null;
  const registry = new VjSourceRegistry({
    build: (renderable, events) => {
      const source = new FakeLayerSource(renderable, events);
      created.push(source);
      return source;
    },
    onReleased: (sourceUrl) => released.push(sourceUrl),
    pendingSourceUrl: () => layers?.pendingSourceUrl() ?? null,
  });
  layers = new VjCompositorLayers({
    sources: registry,
    transitionProgramOf: () => "transition.fade",
    onClipFailed,
    onChange: () => registry.markChanged(),
  });
  const mixSlot = new VjCompositorMixSlot(registry);
  let nowMs = 0;
  const frame = (stepMs = 1000 / 60) => {
    nowMs += stepMs;
    registry.drainEvents();
    layers.advance(nowMs);
    registry.endFrame();
  };
  const sourceFor = (clipId: string): FakeLayerSource => {
    const source = created.filter(
      (candidate) => candidate.renderable.clipId === clipId,
    );
    const last = source[source.length - 1];
    if (!last) throw new Error(`no source for ${clipId}`);
    return last;
  };
  return {
    registry,
    layers,
    mixSlot,
    created,
    released,
    onClipFailed,
    frame,
    sourceFor,
  };
}

/** A clip live and fully shown: the curtain lifted with a cut. */
function showLive(
  harness: ReturnType<typeof setUp>,
  clip: VjRenderableClip,
): void {
  harness.layers.target(clip, { mode: "cut", durationMs: 0 });
  harness.sourceFor(clip.clipId).emitFirstFrame();
  harness.frame();
}

describe("VjCompositorLayers", () => {
  it("never adopts a second URL for a source it already holds", () => {
    const harness = setUp();
    showLive(harness, clipOf("clip-a", "blob:first"));
    expect(harness.created).toHaveLength(1);

    harness.layers.target(clipOf("clip-a", "blob:second"), FADE);
    harness.frame();

    expect(harness.created).toHaveLength(1);
    expect(harness.registry.holdsSourceUrl("blob:first")).toBe(true);
    expect(harness.registry.holdsSourceUrl("blob:second")).toBe(false);
    expect(harness.layers.draw.live?.source).toBe(harness.sourceFor("clip-a"));
    expect(harness.released).toEqual([]);
  });

  it("moves the mix source into the live slot on a swap with its playhead", () => {
    const harness = setUp();
    showLive(harness, clipOf("clip-live"));
    const mixClip = clipOf("clip-mix");
    harness.mixSlot.setClip(mixClip);
    const mixSource = harness.sourceFor("clip-mix");
    mixSource.emitFirstFrame();
    harness.frame();
    expect(harness.mixSlot.current?.source).toBe(mixSource);
    mixSource.playheadMs = 4200;

    const held = harness.mixSlot.takeCurrent();
    if (held === null) throw new Error("expected the mix source");
    harness.layers.adoptSwap(mixClip, held, FADE);
    harness.mixSlot.setClip(null);
    harness.frame();

    // No second source for the mix clip: the playing one moved, playhead and all.
    expect(
      harness.created.filter(
        (source) => source.renderable.clipId === "clip-mix",
      ),
    ).toHaveLength(1);
    expect(harness.layers.draw.live?.source).toBe(mixSource);
    expect(harness.layers.draw.live?.source.playheadMs).toBe(4200);
    expect(harness.layers.draw.outgoing?.source).toBe(
      harness.sourceFor("clip-live"),
    );
    expect(harness.layers.draw.transition?.programKey).toBe("transition.fade");
    expect(mixSource.isDisposed).toBe(false);

    for (let frameIndex = 0; frameIndex < 30; frameIndex += 1) harness.frame();
    expect(harness.layers.draw.outgoing).toBeNull();
    expect(harness.layers.draw.live?.source).toBe(mixSource);
    expect(harness.released).toEqual(["blob:clip-live"]);
    expect(mixSource.isDisposed).toBe(false);
  });

  it("swaps the mix clip at its first frame", () => {
    const harness = setUp();
    harness.mixSlot.setClip(clipOf("mix-one"));
    const firstSource = harness.sourceFor("mix-one");
    firstSource.emitFirstFrame();
    harness.frame();
    expect(harness.mixSlot.current?.source).toBe(firstSource);

    harness.mixSlot.setClip(clipOf("mix-two"));
    const secondSource = harness.sourceFor("mix-two");
    harness.frame();
    harness.frame();
    // Loading hidden: the first clip keeps drawing.
    expect(harness.mixSlot.current?.source).toBe(firstSource);
    expect(harness.mixSlot.pending?.source).toBe(secondSource);
    expect(firstSource.isDisposed).toBe(false);

    secondSource.emitFirstFrame();
    harness.frame();
    expect(harness.mixSlot.current?.source).toBe(secondSource);
    expect(harness.mixSlot.pending).toBeNull();
    expect(firstSource.isDisposed).toBe(true);
    expect(harness.released).toEqual(["blob:mix-one"]);
  });

  it("disposes a leaving source and reports its URL once", () => {
    const harness = setUp();
    showLive(harness, clipOf("clip-a"));
    const leavingSource = harness.sourceFor("clip-a");
    harness.layers.target(clipOf("clip-b"), FADE);
    harness.sourceFor("clip-b").emitFirstFrame();
    harness.frame();
    expect(harness.layers.draw.outgoing?.source).toBe(leavingSource);

    // Until the fade ends the leaving source keeps drawing and stays held.
    for (let frameIndex = 0; frameIndex < 20; frameIndex += 1) harness.frame();
    expect(leavingSource.isDisposed).toBe(false);
    expect(harness.released).toEqual([]);
    expect(harness.registry.holdsSourceUrl("blob:clip-a")).toBe(true);

    for (let frameIndex = 0; frameIndex < 10; frameIndex += 1) harness.frame();
    expect(harness.layers.draw.outgoing).toBeNull();
    expect(leavingSource.disposeCount).toBe(1);
    expect(harness.released).toEqual(["blob:clip-a"]);
    expect(harness.registry.holdsSourceUrl("blob:clip-a")).toBe(false);

    for (let frameIndex = 0; frameIndex < 10; frameIndex += 1) harness.frame();
    expect(leavingSource.disposeCount).toBe(1);
    expect(harness.released).toEqual(["blob:clip-a"]);
  });
});

/** A draw state built by hand: only `live` and `curtain` matter to the first-live-frame check. */
function drawOf(live: VjHeldSource | null, curtain: number): VjLayerDrawState {
  return { live, outgoing: null, transition: null, curtain };
}

/** A held source that only answers `isReady`. */
function heldWith(isReady: boolean): VjHeldSource {
  return { source: { isReady } } as unknown as VjHeldSource;
}

describe("isVjLiveFrameShown and hasLiveTarget", () => {
  it("isVjLiveFrameShown waits for a ready live source under a lowered curtain", () => {
    expect(isVjLiveFrameShown(drawOf(null, 1), false)).toBe(true);
    expect(isVjLiveFrameShown(drawOf(null, 1), true)).toBe(false);
    expect(isVjLiveFrameShown(drawOf(heldWith(false), 0), true)).toBe(false);
    expect(isVjLiveFrameShown(drawOf(heldWith(true), 0.3), true)).toBe(false);
    expect(isVjLiveFrameShown(drawOf(heldWith(true), 0), true)).toBe(true);
  });

  it("hasLiveTarget follows the last target", () => {
    const harness = setUp();
    expect(harness.layers.hasLiveTarget).toBe(false);
    harness.layers.target(clipOf("clip-a"), FADE);
    expect(harness.layers.hasLiveTarget).toBe(true);
    harness.layers.target(null, FADE);
    expect(harness.layers.hasLiveTarget).toBe(false);
  });

  it("lowers the curtain under the live source once a cut shows it", () => {
    const harness = setUp();
    showLive(harness, clipOf("clip-a"));
    expect(
      isVjLiveFrameShown(harness.layers.draw, harness.layers.hasLiveTarget),
    ).toBe(true);
  });
});
