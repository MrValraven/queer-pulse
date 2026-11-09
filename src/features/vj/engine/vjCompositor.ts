/**
 * The WebGL2 compositor (engine plan, Task E21): one canvas, its own
 * requestAnimationFrame loop, and the projector's whole pass graph. React
 * hands it a look and layers (`setLook`, `setLayers`) and the queued frame
 * (`schedule`); it never re-renders React per frame.
 *
 * - `create` makes the GL context and starts every program. A missing
 *   context or a core program failure answers `unavailable`; the loop starts
 *   at once and draws black until the core programs are ready.
 * - Scheduling (decision 9): `schedule` pre-rolls the next look's live
 *   source and mix clip at once and applies the look and layers on the first
 *   frame at or after `clock.toLocalTime(applyAtServerMs)`. A `setLook` whose
 *   version key is already applied changes only the lead flag; while the
 *   engine runs ahead of React, an older look and its layers are ignored.
 * - Swap (decision 12): a live target naming the mix slot's clip takes the
 *   mix source, playhead and all, into the live layers.
 * - `firstLiveFrame` fires once per compositor, on the first ready frame
 *   that draws the live source with the startup curtain fully down (or any
 *   ready frame when nothing is live), so the screen can hand over to the
 *   engine with no black frame. A context restore does not fire it again,
 *   and no frame fires it before the first layers apply.
 * - `shouldCutFirstTarget` (a hand-off arrival): every target set before
 *   the first live frame cuts in and lowers the curtain at once, so a target
 *   that replaces one still decoding cuts in too; once a live frame showed,
 *   targets use the look's transition. The first look also sets the blackout
 *   at once, so an arrival during a blackout draws black from its first
 *   frame. A normal page start leaves it off and keeps both fades.
 * - Context loss stops the loop and reports the loss count; a restore
 *   rebuilds programs, targets and every source's textures and resumes.
 * - `dispose` releases everything and reports no URL: the page revokes every
 *   URL it holds on unmount (v1 rule).
 *
 * The caller sets the look before the layers in each commit (the layers'
 * target uses the look's transition).
 */
import type { RefObject } from "react";
import {
  createVjStageState,
  type VjPreloadFailure,
  type VjTransitionId,
} from "../../../shared/contracts/vj";
import type { VjRenderableSource } from "../screen/vjLayerMachine";
import { VJ_FIRST_TARGET_CUT } from "../screen/vjStageLayerRules";
import {
  createVjGlContext,
  type VjEngineUnavailableReason,
  type VjGlContext,
} from "./gl/vjGlContext";
import { createVjFullscreenTriangle } from "./gl/vjGlQuad";
import { VjTargetPool } from "./gl/vjGlTargets";
import { createVjGpuTimer } from "./gl/vjGpuTimer";
import {
  VJ_PROBE_SIZE,
  VJ_PROBE_SOURCE_SIZE,
  VjLuminanceProbe,
} from "./gl/vjLuminanceProbe";
import { vjTransitionFlashKind } from "./safety/vjFlashGovernor";
import {
  createVjLuminanceNet,
  isVjLuminanceNetSmoothing,
} from "./safety/vjLuminanceNet";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import { VJ_GIF_SHARED_BUDGET_BYTES } from "./sources/vjGifDecode";
import { VjRingBudget } from "./sources/vjReverseRing";
import { createVjEngineSource } from "./sources/vjSourceFactory";
import type {
  VjEngineSource,
  VjEngineSourceDeps,
} from "./sources/vjSourceTypes";
import { VjCompositorFlashes } from "./vjCompositorFlashes";
import {
  VjPassGraphCache,
  VjTargetResolver,
  clearVjCanvas,
  createVjBindLayer,
  runVjCompositorFrame,
  vjBlendModeIndexOf,
  type VjCompositorRuntime,
} from "./vjCompositorFrame";
import { VjCompositorHealth, type VjEngineHealth } from "./vjCompositorHealth";
import {
  VjCompositorLayers,
  VjSourceRegistry,
  isVjLiveFrameShown,
} from "./vjCompositorLayers";
import { VjCompositorMixSlot } from "./vjCompositorMixSlot";
import {
  vjEngineLookOf,
  type VjClockReader,
  type VjEngineLayers,
  type VjEngineLook,
} from "./vjEngineLook";
import { createVjFrameUniformValues } from "./vjFrameUniforms";
import { VjProgramCache, type VjProgramCacheStatus } from "./vjProgramCache";
import type { VjPalette } from "./vjPalette";
import { vjTransitionProgramKey } from "./vjTransitionRegistry";

export type { VjEngineHealth } from "./vjCompositorHealth";

export interface VjCompositorOptions {
  canvas: HTMLCanvasElement;
  mediaHost: HTMLElement;
  palette: VjPalette;
  clock: VjClockReader;
  micLevelRef: RefObject<number | null> | null;
  onEvent: (event: VjCompositorEvent) => void;
  now?: () => number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  /** A hand-off arrival: the first layers target cuts in (the leaving renderer still draws). Default false. */
  shouldCutFirstTarget?: boolean;
  /** Test seam: builds each engine source (defaults to createVjEngineSource). */
  createSource?: (
    source: VjRenderableSource,
    deps: VjEngineSourceDeps,
  ) => VjEngineSource;
}

export type VjCompositorEvent =
  | { type: "clipFailed"; clipId: string; failure: VjPreloadFailure }
  | { type: "sourceReleased"; sourceUrl: string }
  | { type: "contextLost"; lossCount: number }
  | { type: "contextRestored" }
  | { type: "unavailable"; reason: VjEngineUnavailableReason }
  | { type: "firstLiveFrame" };

export interface VjScheduledLook {
  look: VjEngineLook;
  layers: VjEngineLayers;
  applyAtServerMs: number;
}

/** The probe texture's mip chain plus its two pack buffers. */
const VJ_PROBE_GPU_BYTES =
  Math.round((VJ_PROBE_SOURCE_SIZE * VJ_PROBE_SOURCE_SIZE * 4 * 4) / 3) +
  2 * VJ_PROBE_SIZE * VJ_PROBE_SIZE * 4;

function splitVjVersionKey(versionKey: string): {
  epoch: string;
  revision: number;
} {
  const separator = versionKey.lastIndexOf("|");
  return {
    epoch: versionKey.slice(0, Math.max(0, separator)),
    revision: Number(versionKey.slice(separator + 1)),
  };
}

/** True when `candidate` is an earlier revision of the same stage epoch than `reference`. */
export function isVjVersionBefore(
  candidate: string,
  reference: string,
): boolean {
  const candidateVersion = splitVjVersionKey(candidate);
  const referenceVersion = splitVjVersionKey(reference);
  return (
    candidateVersion.epoch === referenceVersion.epoch &&
    Number.isFinite(candidateVersion.revision) &&
    Number.isFinite(referenceVersion.revision) &&
    candidateVersion.revision < referenceVersion.revision
  );
}

/** The look the engine shows before the first `setLook`: the default stage, black. */
function initialVjLook(): VjEngineLook {
  return vjEngineLookOf(createVjStageState("", 0), { isStrobeEnabled: false });
}

interface VjRuntimeParts {
  options: VjCompositorOptions;
  context: VjGlContext;
  programs: VjProgramCache;
  now: () => number;
  ringBudget: VjRingBudget;
  gifBudget: VjRingBudget;
  triangle: { draw(): void };
  transitionProgramOf: (mode: VjTransitionId, nowMs: number) => VjProgramKey;
}

function createVjSourceParts(
  parts: VjRuntimeParts,
  pool: VjTargetPool,
): { registry: VjSourceRegistry; layers: VjCompositorLayers } {
  const { options, context, programs } = parts;
  const build = options.createSource ?? createVjEngineSource;
  const baseDeps: Omit<VjEngineSourceDeps, "events"> = {
    context,
    targets: pool,
    mediaHost: options.mediaHost,
    ringBudget: parts.ringBudget,
    gifBudget: parts.gifBudget,
    backdrop: { programs, triangle: parts.triangle },
  };
  let layers: VjCompositorLayers | null = null;
  const registry = new VjSourceRegistry({
    build: (renderable, events) => build(renderable, { ...baseDeps, events }),
    onReleased: (sourceUrl) =>
      options.onEvent({ type: "sourceReleased", sourceUrl }),
    pendingSourceUrl: () => layers?.pendingSourceUrl() ?? null,
  });
  layers = new VjCompositorLayers({
    sources: registry,
    transitionProgramOf: parts.transitionProgramOf,
    onClipFailed: (clipId, failure) =>
      options.onEvent({ type: "clipFailed", clipId, failure }),
    onChange: () => registry.markChanged(),
  });
  return { registry, layers };
}

function createVjRuntime(parts: VjRuntimeParts): VjCompositorRuntime {
  const { options, context, programs, now } = parts;
  const pool = new VjTargetPool(context.gl, now);
  const { registry, layers } = createVjSourceParts(parts, pool);
  const look = initialVjLook();
  let runtime: VjCompositorRuntime | null = null;
  const bindLayer = createVjBindLayer(() => {
    if (runtime === null) throw new Error("vjCompositor: runtime not ready");
    return runtime;
  });
  runtime = {
    context,
    canvas: options.canvas,
    programs,
    pool,
    resolver: new VjTargetResolver(pool, options.canvas),
    triangle: parts.triangle,
    probe: new VjLuminanceProbe(context),
    gpuTimer: createVjGpuTimer(context),
    net: createVjLuminanceNet(),
    registry,
    layers,
    mixSlot: new VjCompositorMixSlot(registry),
    flashes: new VjCompositorFlashes(),
    health: new VjCompositorHealth(),
    graph: new VjPassGraphCache(),
    palette: options.palette,
    clock: options.clock,
    micLevelRef: options.micLevelRef,
    look,
    isStrobeEnabled: look.strobe.isEnabled,
    blendModeIndex: vjBlendModeIndexOf(look),
    startMs: now(),
    lastFrameMs: null,
    blackoutLevel: look.isBlackout ? 1 : 0,
    netCounts: { general: 0, red: 0 },
    frameUniforms: createVjFrameUniformValues(),
    frameUniformInput: {
      engineTimeMs: 0,
      speed: look.speed,
      serverNowMs: 0,
      tempo: look.tempo,
      micLevel: null,
      width: options.canvas.width,
      height: options.canvas.height,
    },
    flashInput: {
      nowMs: 0,
      settings: look.settings,
      isStrobing: false,
      isStrobeEnabled: false,
      beatIndex: 0,
      beatPhase: 0,
      beatPeriodMs: 500,
      drive: 0,
      micLevel: null,
    },
    sourceFrame: {
      nowMs: 0,
      deltaMs: 0,
      playhead: { mode: "forward", rate: 1, stutterSliceBeats: 1 },
      beats: 0,
      beatPeriodMs: 500,
      isVisible: false,
    },
    graphInput: {
      live: null,
      outgoing: null,
      mix: null,
      transition: null,
      mixBlend: null,
      settings: look.settings,
      palette: options.palette,
      gates: {
        invertBeatGate: 0,
        invertRamp: 0,
        glitchSeed: 0,
        glitchBurst: 0,
        isGlitchLumaShiftGranted: false,
        drive: 0,
      },
      output: { gain: 1, blackout: 0, curtain: 1, strobe: 0, slewLimit: 0 },
      outputHeight: Math.max(1, options.canvas.height),
      isOutputIdle: true,
    },
    mixBlend: { amount: 0, blendModeIndex: 0 },
    bindLayer,
  };
  return runtime;
}

export class VjCompositor {
  private readonly options: VjCompositorOptions;
  private readonly runtime: VjCompositorRuntime;
  private readonly now: () => number;
  private readonly requestFrame: (callback: FrameRequestCallback) => number;
  private readonly cancelFrame: (handle: number) => void;
  private readonly ringBudget: VjRingBudget;
  private readonly gifBudget: VjRingBudget;
  private currentTriangle: { draw(): void; dispose(): void };
  private programStatus: VjProgramCacheStatus;
  private frameHandle: number | null = null;
  private isDisposed = false;
  private isLost = false;
  private isUnavailable = false;
  /** Set on the first frame that shows the live source; never re-armed (a context restore included). */
  private hasReportedFirstLiveFrame = false;
  /** False until the first look's layers apply: the first live frame waits on it. */
  private hasAppliedLayers = false;
  private appliedVersionKey: string | null = null;
  /** The scheduled version the engine applied before React did; older looks wait it out. */
  private aheadVersionKey: string | null = null;
  private scheduled: VjScheduledLook | null = null;
  private readonly frameCallback = (timestampMs: number): void => {
    this.onFrame(timestampMs);
  };

  static create(
    options: VjCompositorOptions,
  ):
    | { ok: true; compositor: VjCompositor }
    | { ok: false; reason: VjEngineUnavailableReason } {
    let compositor: VjCompositor | null = null;
    const contextResult = createVjGlContext(options.canvas, {
      onLost: (lossCount) => compositor?.handleLost(lossCount),
      onRestored: () => compositor?.handleRestored(),
    });
    if (!contextResult.ok) return { ok: false, reason: contextResult.reason };
    const { context } = contextResult;
    const programs = new VjProgramCache(context);
    programs.startAll();
    const programStatus = programs.poll();
    if (programStatus === "coreFailed") {
      programs.dispose();
      context.dispose();
      return { ok: false, reason: "programFailed" };
    }
    compositor = new VjCompositor(options, context, programs, programStatus);
    compositor.startLoop();
    return { ok: true, compositor };
  }

  private constructor(
    options: VjCompositorOptions,
    context: VjGlContext,
    programs: VjProgramCache,
    programStatus: VjProgramCacheStatus,
  ) {
    this.options = options;
    this.now = options.now ?? (() => performance.now());
    this.requestFrame =
      options.requestFrame ??
      ((callback) => window.requestAnimationFrame(callback));
    this.cancelFrame =
      options.cancelFrame ?? ((handle) => window.cancelAnimationFrame(handle));
    this.programStatus = programStatus;
    this.ringBudget = new VjRingBudget();
    this.gifBudget = new VjRingBudget(VJ_GIF_SHARED_BUDGET_BYTES);
    this.currentTriangle = createVjFullscreenTriangle(context.gl);
    this.runtime = createVjRuntime({
      options,
      context,
      programs,
      now: this.now,
      ringBudget: this.ringBudget,
      gifBudget: this.gifBudget,
      triangle: { draw: () => this.currentTriangle.draw() },
      transitionProgramOf: (mode, nowMs) =>
        this.transitionProgramOf(mode, nowMs),
    });
  }

  setLook(look: VjEngineLook): void {
    if (this.isDisposed) return;
    this.runtime.isStrobeEnabled = look.strobe.isEnabled;
    if (look.versionKey === this.appliedVersionKey) {
      if (this.aheadVersionKey === look.versionKey) this.aheadVersionKey = null;
      return;
    }
    if (this.aheadVersionKey !== null) {
      if (isVjVersionBefore(look.versionKey, this.aheadVersionKey)) return;
      this.aheadVersionKey = null;
    }
    this.applyLook(look);
  }

  setLayers(layers: VjEngineLayers): void {
    if (this.isDisposed || this.aheadVersionKey !== null) return;
    this.applyLayers(layers);
  }

  schedule(next: VjScheduledLook | null): void {
    if (this.isDisposed) return;
    const { layers, mixSlot, registry } = this.runtime;
    this.scheduled = next;
    registry.markChanged();
    if (next === null) {
      layers.prepare(null);
      mixSlot.prepare(null);
      return;
    }
    const live = next.layers.live;
    const isSwap = live !== null && live.clipId === mixSlot.currentClipId;
    // A swap needs no pre-roll (the mix source moves); any other next frame
    // replaces a source an earlier schedule prepared.
    const isPreRolled =
      live !== null && !isSwap && !layers.isCurrentTarget(live);
    layers.prepare(isPreRolled ? live : null);
    mixSlot.prepare(next.layers.mix);
  }

  holdsSource(sourceUrl: string): boolean {
    return !this.isDisposed && this.runtime.registry.holdsSourceUrl(sourceUrl);
  }

  readHealth(): VjEngineHealth {
    const runtime = this.runtime;
    const nowMs = this.now();
    return runtime.health.read({
      nowMs,
      failedProgramKeys: runtime.programs.failedKeys(),
      gpuBytes:
        runtime.pool.byteSize() +
        runtime.registry.byteSize() +
        VJ_PROBE_GPU_BYTES,
      flashGuard: {
        isSmoothing: isVjLuminanceNetSmoothing(runtime.net, nowMs),
        generalFlashesLastSecond: runtime.netCounts.general,
        redFlashesLastSecond: runtime.netCounts.red,
        grantsHeld: runtime.flashes.heldGrantCount(nowMs),
      },
      ringRefusals: this.ringBudget.refusedCount,
      gifRefusals: this.gifBudget.refusedCount,
    });
  }

  dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stopLoop();
    const runtime = this.runtime;
    runtime.registry.disposeAll();
    runtime.layers.disposeAll();
    runtime.mixSlot.disposeAll();
    runtime.pool.disposeAll();
    runtime.programs.dispose();
    runtime.probe.dispose();
    runtime.gpuTimer?.dispose();
    this.currentTriangle.dispose();
    runtime.context.dispose();
  }

  private applyLook(look: VjEngineLook): void {
    const isFirstLook = this.appliedVersionKey === null;
    this.appliedVersionKey = look.versionKey;
    this.runtime.look = look;
    this.runtime.blendModeIndex = vjBlendModeIndexOf(look);
    // A hand-off arrival takes the blackout as it stands: no fade in from 0.
    if (isFirstLook && this.options.shouldCutFirstTarget === true) {
      this.runtime.blackoutLevel = look.isBlackout ? 1 : 0;
    }
  }

  private applyLayers(next: VjEngineLayers): void {
    const { layers, mixSlot, registry, look } = this.runtime;
    const live = next.live;
    // The arrival cut stays armed until something shows: a target that
    // replaces one still decoding cuts in as well.
    const isArrivalCut =
      this.options.shouldCutFirstTarget === true &&
      !this.hasReportedFirstLiveFrame &&
      layers.state.front === null;
    const transition = isArrivalCut ? VJ_FIRST_TARGET_CUT : look.transition;
    this.hasAppliedLayers = true;
    const isSwap =
      live !== null &&
      live.mediaKind !== "generator" &&
      live.clipId === mixSlot.currentClipId &&
      !layers.isCurrentTarget(live);
    const swapped = isSwap ? mixSlot.takeCurrent() : null;
    if (live !== null && swapped !== null) {
      layers.adoptSwap(live, swapped, transition);
    } else {
      layers.target(live, transition);
    }
    mixSlot.setClip(next.mix);
    registry.markChanged();
  }

  /** Applies the scheduled look and layers on the first frame at or after its applyAt. */
  private applyScheduledIfDue(nowMs: number): void {
    const scheduled = this.scheduled;
    if (scheduled === null) return;
    const applyAtMs = this.runtime.clock.toLocalTime(scheduled.applyAtServerMs);
    if (Number.isFinite(applyAtMs) && nowMs < applyAtMs) return;
    this.scheduled = null;
    const versionKey = scheduled.look.versionKey;
    const appliedKey = this.appliedVersionKey;
    if (appliedKey !== null && isVjVersionBefore(versionKey, appliedKey)) {
      return;
    }
    if (versionKey !== appliedKey) {
      this.applyLook(scheduled.look);
      this.aheadVersionKey = versionKey;
    }
    this.applyLayers(scheduled.layers);
  }

  /** The program a starting transition draws: governed (dipWhite, glitch), and `fade` for a failed program. */
  private transitionProgramOf(
    mode: VjTransitionId,
    nowMs: number,
  ): VjProgramKey {
    const flashKind = vjTransitionFlashKind(mode);
    const isGranted =
      flashKind === null || this.runtime.flashes.request(flashKind, nowMs);
    const programKey = vjTransitionProgramKey(mode, isGranted);
    if (programKey === null || this.runtime.programs.get(programKey) === null) {
      return "transition.fade";
    }
    return programKey;
  }

  private startLoop(): void {
    if (this.frameHandle !== null) return;
    this.frameHandle = this.requestFrame(this.frameCallback);
  }

  private stopLoop(): void {
    if (this.frameHandle === null) return;
    this.cancelFrame(this.frameHandle);
    this.frameHandle = null;
  }

  private onFrame(nowMs: number): void {
    this.frameHandle = null;
    if (this.isDisposed || this.isLost || this.isUnavailable) return;
    this.startLoop();
    this.applyScheduledIfDue(nowMs);
    const runtime = this.runtime;
    if (this.programStatus === "compiling") {
      this.programStatus = runtime.programs.poll();
    }
    if (this.programStatus === "coreFailed") {
      this.becomeUnavailable();
      return;
    }
    if (this.programStatus !== "ready") {
      clearVjCanvas(runtime);
      runtime.registry.endFrame();
      return;
    }
    runVjCompositorFrame(runtime, nowMs);
    this.reportFirstLiveFrameIfShown();
  }

  /** The screen's hand-off signal: the first ready frame that shows the live source. */
  private reportFirstLiveFrameIfShown(): void {
    if (this.hasReportedFirstLiveFrame || !this.hasAppliedLayers) return;
    const { layers } = this.runtime;
    if (!isVjLiveFrameShown(layers.draw, layers.hasLiveTarget)) return;
    this.hasReportedFirstLiveFrame = true;
    this.options.onEvent({ type: "firstLiveFrame" });
  }

  private becomeUnavailable(): void {
    this.isUnavailable = true;
    this.stopLoop();
    this.options.onEvent({ type: "unavailable", reason: "programFailed" });
  }

  private handleLost(lossCount: number): void {
    if (this.isDisposed) return;
    this.isLost = true;
    this.stopLoop();
    this.options.onEvent({ type: "contextLost", lossCount });
  }

  /** Every GL handle died with the context: rebuild programs, targets, the probe and every source's textures. */
  private handleRestored(): void {
    if (this.isDisposed) return;
    const runtime = this.runtime;
    const { context } = runtime;
    runtime.pool.disposeAll();
    runtime.probe.dispose();
    runtime.probe = new VjLuminanceProbe(context);
    this.currentTriangle.dispose();
    this.currentTriangle = createVjFullscreenTriangle(context.gl);
    runtime.gpuTimer?.dispose();
    runtime.gpuTimer = createVjGpuTimer(context);
    runtime.programs.rebuild();
    this.programStatus = runtime.programs.poll();
    runtime.registry.restoreAll();
    runtime.graph.invalidate();
    runtime.health.reset();
    runtime.lastFrameMs = null;
    this.isLost = false;
    this.options.onEvent({ type: "contextRestored" });
    if (this.programStatus === "coreFailed") {
      this.becomeUnavailable();
      return;
    }
    if (!this.isUnavailable) this.startLoop();
  }
}
