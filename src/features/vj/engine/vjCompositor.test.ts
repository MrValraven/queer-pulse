import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  createVjStageState,
  type VjEffectId,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import {
  createVjFakeWebGl2Canvas,
  type VjFakeWebGl2,
  type VjFakeWebGl2Options,
} from "../../../test/vjFakeWebGl2";
import type {
  VjRenderableClip,
  VjRenderableSource,
} from "../screen/vjLayerMachine";
import { VJ_PROGRAM_KEYS } from "./shaders/vjProgramKeys";
import {
  vjEngineSourceKey,
  type VjEngineSource,
  type VjEngineSourceDeps,
  type VjSourceFrameInput,
} from "./sources/vjSourceTypes";
import { VjCompositor, type VjCompositorEvent } from "./vjCompositor";
import {
  vjEngineLookOf,
  type VjEngineLook,
  type VjResolvedTransition,
} from "./vjEngineLook";
import type { VjLayerDraw } from "./vjPassGraph";
import { readVjPalette } from "./vjPalette";

const FRAME_MS = 1000 / 60;
/** The synced server clock runs this far ahead of performance.now(). */
const SERVER_OFFSET_MS = 1_000_000;

/** A source the test drives by hand; counts every bind (one per drawn frame and more). */
class FakeEngineSource implements VjEngineSource {
  readonly key: string;
  readonly kind: "video" | "generator";
  readonly renderable: VjRenderableSource;
  isReady = false;
  playheadMs = 0;
  isDisposed = false;
  restoreCount = 0;
  bindCount = 0;
  readonly visibleUpdates: boolean[] = [];
  private readonly deps: VjEngineSourceDeps;
  private readonly draw: VjLayerDraw = {
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
  };

  constructor(renderable: VjRenderableSource, deps: VjEngineSourceDeps) {
    this.renderable = renderable;
    this.deps = deps;
    this.key = vjEngineSourceKey(renderable);
    this.kind = renderable.mediaKind === "generator" ? "generator" : "video";
  }

  emitFirstFrame(): void {
    this.isReady = true;
    this.deps.events.onFirstFrame(this.key);
  }

  update(frame: VjSourceFrameInput): void {
    this.visibleUpdates.push(frame.isVisible);
  }

  bindDraw(): VjLayerDraw {
    this.bindCount += 1;
    return this.draw;
  }

  holdsSourceUrl(sourceUrl: string): boolean {
    return sourceUrl !== "" && sourceUrl === this.renderable.sourceUrl;
  }

  byteSize(): number {
    return 0;
  }

  restore(): void {
    this.restoreCount += 1;
  }

  dispose(): void {
    this.isDisposed = true;
  }
}

function clipOf(clipId: string): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl: `blob:${clipId}`,
    durationMs: 10_000,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
  };
}

function settingsOf(
  ...effects: (VjEffectId | [VjEffectId, string])[]
): VjEffectSettings {
  const settings: VjEffectSettings = {};
  for (const effect of effects) {
    const effectId: VjEffectId = Array.isArray(effect) ? effect[0] : effect;
    const variant: string | null = Array.isArray(effect) ? effect[1] : null;
    const entry = VJ_EFFECT_CATALOG[effectId];
    settings[effectId] = {
      isOn: true,
      amount: 1,
      variant: variant ?? entry.defaultVariant,
    };
  }
  return settings;
}

interface LookOptions {
  revision?: number;
  settings?: VjEffectSettings;
  transition?: VjResolvedTransition;
  isStrobing?: boolean;
  isStrobeEnabled?: boolean;
  bpm?: number;
}

function lookOf(options: LookOptions = {}): VjEngineLook {
  const base = vjEngineLookOf(createVjStageState("epoch", 0), {
    isStrobeEnabled: options.isStrobeEnabled ?? true,
  });
  return {
    ...base,
    versionKey: `epoch|${options.revision ?? 1}`,
    settings: options.settings ?? {},
    transition: options.transition ?? { mode: "fade", durationMs: 400 },
    tempo: { ...base.tempo, bpm: options.bpm ?? 120, downbeatAt: 0 },
    strobe: {
      isStrobing: options.isStrobing ?? false,
      isEnabled: options.isStrobeEnabled ?? true,
    },
  };
}

/** The program key a fake program was linked from (its fragment's marker line). */
function programKeyOf(program: unknown): string | null {
  const shaders =
    (program as { shaders?: { source: string }[] } | null)?.shaders ?? [];
  for (const shader of shaders) {
    const match = /vj-program-key:\s*(\S+)/.exec(shader.source);
    if (match?.[1]) return match[1];
  }
  return null;
}

function usedProgramKeys(fake: VjFakeWebGl2): string[] {
  return fake
    .callsNamed("useProgram")
    .map((call) => programKeyOf(call.args[0]))
    .filter((key): key is string => key !== null);
}

/** The last float this frame wrote to the named uniform, else null. */
function uniformValue(fake: VjFakeWebGl2, name: string): number | null {
  const calls = fake
    .callsNamed("uniform1f")
    .filter(
      (call) => (call.args[0] as { name?: string } | null)?.name === name,
    );
  const value = calls[calls.length - 1]?.args[1];
  return typeof value === "number" ? value : null;
}

function setUp(fakeOptions: VjFakeWebGl2Options = {}) {
  const fake = createVjFakeWebGl2Canvas(fakeOptions);
  let nowMs = 1000;
  const pendingFrames: FrameRequestCallback[] = [];
  const sources: FakeEngineSource[] = [];
  const events: VjCompositorEvent[] = [];
  const result = VjCompositor.create({
    canvas: fake.canvas,
    mediaHost: document.createElement("div"),
    palette: readVjPalette(),
    clock: {
      serverNow: () => nowMs + SERVER_OFFSET_MS,
      toLocalTime: (serverMs) => serverMs - SERVER_OFFSET_MS,
    },
    micLevelRef: null,
    onEvent: (event) => events.push(event),
    now: () => nowMs,
    requestFrame: (callback) => {
      pendingFrames.push(callback);
      return pendingFrames.length;
    },
    cancelFrame: () => {
      pendingFrames.length = 0;
    },
    createSource: (renderable, deps) => {
      const source = new FakeEngineSource(renderable, deps);
      sources.push(source);
      return source;
    },
  });
  /** Runs one animation frame `stepMs` later; the GL calls of that frame stay in `fake.calls`. */
  const step = (stepMs = FRAME_MS) => {
    nowMs += stepMs;
    fake.calls.length = 0;
    for (const callback of pendingFrames.splice(0)) callback(nowMs);
  };
  const run = (durationMs: number) => {
    const endMs = nowMs + durationMs;
    while (nowMs < endMs) step();
  };
  const sourceFor = (clipId: string): FakeEngineSource => {
    const matching = sources.filter(
      (source) => source.renderable.clipId === clipId,
    );
    const last = matching[matching.length - 1];
    if (!last) throw new Error(`no source for ${clipId}`);
    return last;
  };
  return {
    fake,
    result,
    events,
    sources,
    step,
    run,
    sourceFor,
    nowMs: () => nowMs,
    pendingFrameCount: () => pendingFrames.length,
  };
}

function compositorOf(harness: ReturnType<typeof setUp>): VjCompositor {
  if (!harness.result.ok) throw new Error("expected a compositor");
  return harness.result.compositor;
}

/** Shows `clipId` live with a cut, past the curtain. */
function showLive(
  harness: ReturnType<typeof setUp>,
  look: VjEngineLook,
  clipId: string,
): void {
  const compositor = compositorOf(harness);
  compositor.setLook(look);
  compositor.setLayers({ live: clipOf(clipId), mix: null });
  harness.sourceFor(clipId).emitFirstFrame();
  harness.run(600);
}

/** Bind counts across one step: a source bound in a frame is drawn in it. */
function drawnOnStep(
  harness: ReturnType<typeof setUp>,
  sources: readonly FakeEngineSource[],
): boolean[] {
  const before = sources.map((source) => source.bindCount);
  harness.step();
  return sources.map(
    (source, index) => source.bindCount > (before[index] ?? 0),
  );
}

describe("VjCompositor layers and scheduling", () => {
  it("starts the crossfade only once the incoming clip has a frame", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    showLive(harness, lookOf(), "clip-a");

    compositor.setLayers({ live: clipOf("clip-b"), mix: null });
    const incoming = harness.sourceFor("clip-b");
    for (let frameIndex = 0; frameIndex < 10; frameIndex += 1) {
      const [isDrawn] = drawnOnStep(harness, [incoming]);
      expect(isDrawn).toBe(false);
      expect(usedProgramKeys(harness.fake)).not.toContain("transition.fade");
    }

    incoming.emitFirstFrame();
    harness.step();
    expect(usedProgramKeys(harness.fake)).toContain("transition.fade");
    expect(drawnOnStep(harness, [incoming])).toEqual([true]);
  });

  it("keeps the outgoing source playing until the transition ends, then releases its URL", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    showLive(harness, lookOf(), "clip-a");
    const outgoing = harness.sourceFor("clip-a");

    compositor.setLayers({ live: clipOf("clip-b"), mix: null });
    harness.sourceFor("clip-b").emitFirstFrame();
    harness.step();
    const updatesAtStart = outgoing.visibleUpdates.length;
    for (let frameIndex = 0; frameIndex < 18; frameIndex += 1) {
      expect(drawnOnStep(harness, [outgoing])).toEqual([true]);
    }
    expect(outgoing.visibleUpdates.slice(updatesAtStart).every(Boolean)).toBe(
      true,
    );
    expect(outgoing.isDisposed).toBe(false);
    expect(harness.events).not.toContainEqual({
      type: "sourceReleased",
      sourceUrl: "blob:clip-a",
    });

    harness.run(300);
    expect(outgoing.isDisposed).toBe(true);
    const releases = harness.events.filter(
      (event) => event.type === "sourceReleased",
    );
    expect(releases).toEqual([
      { type: "sourceReleased", sourceUrl: "blob:clip-a" },
    ]);
    expect(compositor.holdsSource("blob:clip-a")).toBe(false);
    expect(compositor.holdsSource("blob:clip-b")).toBe(true);
  });

  it("runs no effect pass for an effect that is off", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    const offSettings: VjEffectSettings = {
      vignette: { isOn: false, amount: 0.8, variant: null },
      monochrome: { isOn: false, amount: 0.8, variant: null },
      dream: { isOn: false, amount: 0.8, variant: null },
    };
    showLive(harness, lookOf({ settings: offSettings }), "clip-a");
    harness.step();
    const offKeys = usedProgramKeys(harness.fake);
    expect(offKeys).toEqual(["source.clip", "output"]);

    compositor.setLook(
      lookOf({ revision: 2, settings: settingsOf("vignette", "monochrome") }),
    );
    harness.step();
    const onKeys = usedProgramKeys(harness.fake);
    expect(onKeys).toContain("texture.vignette");
    expect(onKeys).toContain("colour");
    expect(onKeys).not.toContain("texture.dreamBlur");
  });

  it("swaps a scheduled look on the first frame at or after applyAt", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    const firstLook = lookOf({ revision: 1 });
    showLive(harness, firstLook, "clip-a");
    const applyAtLocalMs = harness.nowMs() + 100;
    compositor.schedule({
      look: lookOf({ revision: 2, settings: settingsOf("monochrome") }),
      layers: { live: clipOf("clip-a"), mix: null },
      applyAtServerMs: applyAtLocalMs + SERVER_OFFSET_MS,
    });

    while (harness.nowMs() + FRAME_MS < applyAtLocalMs) {
      harness.step();
      expect(usedProgramKeys(harness.fake)).not.toContain("colour");
    }
    harness.step();
    expect(harness.nowMs()).toBeGreaterThanOrEqual(applyAtLocalMs);
    expect(usedProgramKeys(harness.fake)).toContain("colour");

    // React still holds the older look for a few ms: the engine stays on the newer one.
    compositor.setLook(firstLook);
    harness.step();
    expect(usedProgramKeys(harness.fake)).toContain("colour");
  });

  it("pre-rolls the scheduled clip so the cut lands on the frame at applyAt", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    showLive(harness, lookOf({ revision: 1 }), "clip-a");
    const current = harness.sourceFor("clip-a");
    const applyAtLocalMs = harness.nowMs() + 200;
    compositor.schedule({
      look: lookOf({
        revision: 2,
        transition: { mode: "cut", durationMs: 0 },
      }),
      layers: { live: clipOf("clip-b"), mix: null },
      applyAtServerMs: applyAtLocalMs + SERVER_OFFSET_MS,
    });
    // The source starts loading when the frame arrives, long before applyAt.
    const next = harness.sourceFor("clip-b");
    next.emitFirstFrame();

    while (harness.nowMs() + FRAME_MS < applyAtLocalMs) {
      expect(drawnOnStep(harness, [current, next])).toEqual([true, false]);
    }
    expect(drawnOnStep(harness, [current, next])).toEqual([false, true]);
    expect(harness.nowMs()).toBeGreaterThanOrEqual(applyAtLocalMs);
    expect(harness.nowMs()).toBeLessThan(applyAtLocalMs + FRAME_MS);
    expect(current.isDisposed).toBe(true);
  });
});

describe("VjCompositor flashes", () => {
  it("renders dipWhite as a fade while the strobe holds the budget", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    const dipWhite: VjResolvedTransition = {
      mode: "dipWhite",
      durationMs: 400,
    };
    showLive(
      harness,
      lookOf({ revision: 1, transition: dipWhite, isStrobing: true }),
      "clip-a",
    );
    compositor.setLayers({ live: clipOf("clip-b"), mix: null });
    harness.sourceFor("clip-b").emitFirstFrame();
    const strobeKeys = new Set<string>();
    for (let frameIndex = 0; frameIndex < 20; frameIndex += 1) {
      harness.step();
      for (const key of usedProgramKeys(harness.fake)) strobeKeys.add(key);
    }
    expect(strobeKeys).toContain("transition.fade");
    expect(strobeKeys).not.toContain("transition.dipWhite");

    // With the strobe off and the budget free, the same transition draws as itself.
    compositor.setLook(lookOf({ revision: 2, transition: dipWhite }));
    harness.run(1500);
    compositor.setLayers({ live: clipOf("clip-c"), mix: null });
    harness.sourceFor("clip-c").emitFirstFrame();
    harness.step();
    harness.step();
    expect(usedProgramKeys(harness.fake)).toContain("transition.dipWhite");
  });

  it("flashes the strobe on the lead only and stops 10 s after it applied", () => {
    const follower = setUp();
    compositorOf(follower).setLook(
      lookOf({ isStrobing: true, isStrobeEnabled: false }),
    );
    let followerFlashes = 0;
    for (let frameIndex = 0; frameIndex < 120; frameIndex += 1) {
      follower.step();
      if (uniformValue(follower.fake, "uStrobe") === 1) followerFlashes += 1;
    }
    expect(followerFlashes).toBe(0);

    const lead = setUp();
    lead.step();
    compositorOf(lead).setLook(lookOf({ isStrobing: true }));
    const appliedAtMs = lead.nowMs();
    const flashFramesAt: number[] = [];
    while (lead.nowMs() < appliedAtMs + 11_000) {
      lead.step();
      if (uniformValue(lead.fake, "uStrobe") === 1) {
        flashFramesAt.push(lead.nowMs() - appliedAtMs);
      }
    }
    expect(flashFramesAt.length).toBeGreaterThan(0);
    expect(flashFramesAt[0]).toBeLessThan(1000);
    expect(flashFramesAt.some((atMs) => atMs > 9000)).toBe(true);
    // The run counts from the first frame that applied it, so allow that frame and one more.
    expect(
      flashFramesAt.filter((atMs) => atMs > 10_000 + 2 * FRAME_MS),
    ).toEqual([]);
  });

  it("never grants more than 3 flash events in a rolling second with strobe, beat pulse and glitch all on", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    const flashySettings = settingsOf("beatPulse", "glitch", [
      "invert",
      "beat",
    ]);
    showLive(
      harness,
      lookOf({ settings: flashySettings, isStrobing: true, bpm: 200 }),
      "clip-a",
    );
    const eventsAt: number[] = [];
    const previous = { strobe: 0, gain: 1, luma: 0, invert: 0 };
    const sample = () => {
      const strobe = uniformValue(harness.fake, "uStrobe") ?? 0;
      const gain = uniformValue(harness.fake, "uOutputGain") ?? 1;
      const luma = uniformValue(harness.fake, "uGlitchLumaShift") ?? 0;
      const invert = uniformValue(harness.fake, "uInvert") ?? 0;
      const isGainFlash = gain > 1.08;
      const isInvertFlash = invert > 0.08;
      if (strobe === 1 && previous.strobe !== 1) eventsAt.push(harness.nowMs());
      if (isGainFlash && !(previous.gain > 1.08))
        eventsAt.push(harness.nowMs());
      if (luma === 1 && previous.luma !== 1) eventsAt.push(harness.nowMs());
      if (isInvertFlash && !(previous.invert > 0.08))
        eventsAt.push(harness.nowMs());
      previous.strobe = strobe;
      previous.gain = gain;
      previous.luma = luma;
      previous.invert = invert;
    };
    for (let frameIndex = 0; frameIndex < 300; frameIndex += 1) {
      harness.step();
      sample();
    }
    // The strobe ends: beat pulse, glitch bursts and beat inverts compete for the budget.
    compositor.setLook(
      lookOf({ revision: 2, settings: flashySettings, bpm: 200 }),
    );
    for (let frameIndex = 0; frameIndex < 300; frameIndex += 1) {
      harness.step();
      sample();
    }
    expect(eventsAt.length).toBeGreaterThan(3);
    for (let index = 0; index < eventsAt.length; index += 1) {
      const startMs = eventsAt[index] ?? 0;
      const inWindow = eventsAt.filter(
        (atMs) => atMs >= startMs && atMs < startMs + 1000,
      );
      expect(inWindow.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("VjCompositor safety net, health and context", () => {
  it("turns the slew limit on when the probe counts 3 flashes in a second", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    showLive(harness, lookOf(), "clip-a");
    harness.step();
    expect(uniformValue(harness.fake, "uSlewLimit")).toBe(0);

    const dark = new Uint8Array(16 * 16 * 4).fill(0);
    const bright = new Uint8Array(16 * 16 * 4).fill(255);
    let slewLimit = 0;
    for (
      let frameIndex = 0;
      frameIndex < 20 && slewLimit === 0;
      frameIndex += 1
    ) {
      harness.fake.setProbeBytes(frameIndex % 2 === 0 ? bright : dark);
      harness.step();
      slewLimit = uniformValue(harness.fake, "uSlewLimit") ?? 0;
    }
    expect(slewLimit).toBeGreaterThan(0);
    expect(compositor.readHealth().flashGuard.isSmoothing).toBe(true);
    expect(
      compositor.readHealth().flashGuard.generalFlashesLastSecond,
    ).toBeGreaterThanOrEqual(3);
  });

  it("drops render scale after 3 s of low fps with effects on", () => {
    const harness = setUp();
    const compositor = compositorOf(harness);
    compositor.setLook(lookOf({ settings: settingsOf("vignette") }));
    compositor.setLayers({ live: clipOf("clip-a"), mix: null });
    harness.sourceFor("clip-a").emitFirstFrame();
    const startMs = harness.nowMs();
    // Two frames on time, then one that took three: about 36 fps on a 60 Hz display.
    const lowFpsUntil = (endMs: number) => {
      while (harness.nowMs() < endMs) {
        harness.step(FRAME_MS);
        harness.step(FRAME_MS);
        harness.step(FRAME_MS * 3);
      }
    };
    lowFpsUntil(startMs + 2700);
    expect(compositor.readHealth().renderScale).toBe(1);
    lowFpsUntil(startMs + 4200);
    const health = compositor.readHealth();
    expect(health.renderScale).toBe(0.75);
    expect(health.isEffectLoadHigh).toBe(true);

    harness.step();
    const viewports = harness.fake
      .callsNamed("viewport")
      .map((call) => [call.args[2], call.args[3]]);
    // The chain draws at 0.75; the live layer and the output stay full size.
    expect(viewports).toContainEqual([1440, 810]);
    expect(viewports).toContainEqual([1920, 1080]);
  });

  it("reports contextLost with the loss count and rebuilds on restore", () => {
    const harness = setUp();
    showLive(harness, lookOf(), "clip-a");
    const source = harness.sourceFor("clip-a");
    const programsBefore = harness.fake.programs().length;

    harness.fake.loseContext();
    expect(harness.events).toContainEqual({
      type: "contextLost",
      lossCount: 1,
    });
    expect(harness.pendingFrameCount()).toBe(0);
    harness.step();
    expect(harness.fake.callsNamed("drawArrays")).toHaveLength(0);

    harness.fake.restoreContext();
    expect(harness.events).toContainEqual({ type: "contextRestored" });
    expect(harness.fake.programs().length - programsBefore).toBe(
      VJ_PROGRAM_KEYS.length,
    );
    expect(source.restoreCount).toBe(1);
    harness.step();
    expect(harness.fake.callsNamed("drawArrays").length).toBeGreaterThan(0);
    expect(usedProgramKeys(harness.fake)).toContain("output");

    harness.fake.loseContext();
    expect(harness.events).toContainEqual({
      type: "contextLost",
      lossCount: 2,
    });
  });

  it("answers unavailable when the output program fails to link", () => {
    const failing = setUp({ failingProgramKeys: ["output"] });
    expect(failing.result).toEqual({ ok: false, reason: "programFailed" });

    // With parallel compile the failure shows once the driver finishes.
    const parallel = setUp({
      failingProgramKeys: ["output"],
      hasParallelCompile: true,
    });
    expect(parallel.result.ok).toBe(true);
    parallel.step();
    expect(parallel.fake.callsNamed("clear").length).toBeGreaterThan(0);
    parallel.fake.completeCompiles();
    parallel.step();
    expect(parallel.events).toContainEqual({
      type: "unavailable",
      reason: "programFailed",
    });
    expect(parallel.pendingFrameCount()).toBe(0);
  });
});
