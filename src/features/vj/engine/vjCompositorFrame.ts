/**
 * One compositor frame (engine plan, Task E21), in this order: frame
 * uniforms (with this screen's mic level), the layers' transition and
 * curtain, the strobe clock and every flash grant, the blackout fade, source
 * updates (uploads only while the output shows something), the pass graph,
 * present, the luminance probe, then frame stats, the render scale and the
 * idle target sweep.
 *
 * Handoffs this file applies (E16, E8, E5, E3):
 * - `runVjPassGraph`, then `presentVjOutput(resolve("outputCurrent"))`, then
 *   the probe captures `outputCurrent`, then the resolver swaps the
 *   `outputCurrent` and `outputPrevious` names: the output pass reads the
 *   frame before for its slew limit (only while the limit is above 0).
 * - The resolver answers per-name sizes: layers and outputs at canvas size,
 *   the chain at the adaptive render scale, dream targets at half of that.
 * - The pass graph gets `gates.drive` (this frame's uDrive) and
 *   `outputHeight` (the chain height the dream radius is a share of).
 * - The probe answer is read at once (the net reuses its object); between
 *   readings `vjOutputSlewLimit` answers, in whole RGBA8 steps.
 *
 * Nothing here allocates per frame in a steady look: the graph is rebuilt
 * only when its structure changes, and the values that move every frame
 * (transition progress, mix amount, invert level, rgbSplit drive, glitch
 * burst, output values) are patched into the built steps in place.
 */
import { VJ_BLEND_MODES } from "../../../shared/contracts/vj";
import type { VjGlContext } from "./gl/vjGlContext";
import type { VjUniformValue } from "./gl/vjGlProgram";
import type { VjRenderTarget, VjTargetPool } from "./gl/vjGlTargets";
import type { VjGpuTimer } from "./gl/vjGpuTimer";
import type { VjLuminanceProbe } from "./gl/vjLuminanceProbe";
import {
  observeVjProbe,
  vjOutputSlewLimit,
  type VjLuminanceNet,
} from "./safety/vjLuminanceNet";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import {
  VJ_BACKDROP_WIDTH_PX,
  type VjSourceFrameInput,
} from "./sources/vjSourceTypes";
import type {
  VjCompositorFlashes,
  VjFlashTickInput,
} from "./vjCompositorFlashes";
import type { VjCompositorHealth } from "./vjCompositorHealth";
import {
  vjPlayheadOf,
  type VjCompositorLayers,
  type VjHeldSource,
  type VjSourceRegistry,
} from "./vjCompositorLayers";
import type { VjCompositorMixSlot } from "./vjCompositorMixSlot";
import type { VjClockReader, VjEngineLook } from "./vjEngineLook";
import { vjEffectVariantOf } from "./vjEffectRegistry";
import {
  writeVjFrameUniforms,
  type VjFrameUniformValues,
} from "./vjFrameUniforms";
import type { VjPalette } from "./vjPalette";
import {
  buildVjPassGraph,
  type VjLayerDraw,
  type VjPassGraphInput,
  type VjPassStep,
  type VjTargetName,
} from "./vjPassGraph";
import { isVjMixDrawn, isVjTransitionDrawn } from "./vjPassGraphSources";
import type { VjProgramCache } from "./vjProgramCache";
import {
  presentVjOutput,
  runVjPassGraph,
  type VjBindLayer,
  type VjPassRunnerTargets,
  type VjPassTriangle,
} from "./vjPassRunner";
import type { VjRenderScale } from "./vjRenderScale";

/** Targets drawn at the adaptive render scale; layers and outputs stay at canvas size. */
const CHAIN_TARGETS: ReadonlySet<VjTargetName> = new Set<VjTargetName>([
  "chainA",
  "chainB",
  "feedback",
  "dreamHalfA",
  "dreamHalfB",
]);
const BACKDROP_TARGETS: ReadonlySet<VjTargetName> = new Set<VjTargetName>([
  "liveBackdrop",
  "outgoingBackdrop",
  "mixBackdrop",
]);
/** Longest frame step the blackout fade and the slew limit read. */
const MAX_FRAME_DELTA_MS = 250;

/**
 * Maps pass graph target names onto pooled targets at their sizes, and owns
 * the swap of the two output targets after each present.
 */
export class VjTargetResolver implements VjPassRunnerTargets {
  renderScale: VjRenderScale = 1;
  private readonly pool: VjTargetPool;
  private readonly canvas: HTMLCanvasElement;
  private isOutputSwapped = false;

  constructor(pool: VjTargetPool, canvas: HTMLCanvasElement) {
    this.pool = pool;
    this.canvas = canvas;
  }

  /** Height in px of a scale 1 chain target (the dream radius is a share of it). */
  get chainHeight(): number {
    return Math.max(1, this.canvas.height * this.renderScale);
  }

  resolve(name: VjTargetName, scale: 1 | 0.5): VjRenderTarget {
    const width = Math.max(1, this.canvas.width);
    const height = Math.max(1, this.canvas.height);
    if (BACKDROP_TARGETS.has(name)) {
      const backdropHeight = (VJ_BACKDROP_WIDTH_PX * height) / width;
      return this.pool.acquire(name, VJ_BACKDROP_WIDTH_PX, backdropHeight);
    }
    const share = (CHAIN_TARGETS.has(name) ? this.renderScale : 1) * scale;
    return this.pool.acquire(
      this.poolNameOf(name),
      width * share,
      height * share,
    );
  }

  /** After the present: this frame's output becomes the previous one. */
  swapOutputs(): void {
    this.isOutputSwapped = !this.isOutputSwapped;
  }

  private poolNameOf(name: VjTargetName): string {
    if (name === "outputCurrent") {
      return this.isOutputSwapped ? "outputB" : "outputA";
    }
    if (name === "outputPrevious") {
      return this.isOutputSwapped ? "outputA" : "outputB";
    }
    return name;
  }
}

type VjMutableUniforms = Record<string, VjUniformValue>;

function mutableUniformsOf(step: VjPassStep): VjMutableUniforms {
  // The graph builds fresh uniform records per build; the cache owns them.
  return step.uniforms;
}

/**
 * Reuses the pass graph while its structure holds (layer draws, transition
 * program, mix shape, effective settings, palette, chain height, idle) and
 * patches the values that move every frame into the built steps.
 */
export class VjPassGraphCache {
  private steps: VjPassStep[] = [];
  private hasBuilt = false;
  private live: VjLayerDraw | null = null;
  private outgoing: VjLayerDraw | null = null;
  private mix: VjLayerDraw | null = null;
  private transitionProgram: VjProgramKey | null = null;
  private isMixDrawn = false;
  private isMixFull = false;
  private settings: VjPassGraphInput["settings"] | null = null;
  private palette: VjPalette | null = null;
  private outputHeight = 0;
  private isOutputIdle = false;
  private isRgbSplitBeat = false;
  private transitionUniforms: VjMutableUniforms | null = null;
  private mixUniforms: VjMutableUniforms | null = null;
  private colourUniforms: VjMutableUniforms | null = null;
  private rgbSplitUniforms: VjMutableUniforms | null = null;
  private glitchUniforms: VjMutableUniforms | null = null;
  private outputUniforms: VjMutableUniforms | null = null;

  /** The steps for this frame; `invertLevel` is the governed uInvert. */
  stepsFor(
    input: VjPassGraphInput,
    invertLevel: number,
  ): readonly VjPassStep[] {
    if (!this.hasBuilt || !this.matches(input)) this.rebuild(input);
    this.patch(input, invertLevel);
    return this.steps;
  }

  /** Forces a rebuild on the next frame (after a context restore). */
  invalidate(): void {
    this.hasBuilt = false;
  }

  private matches(input: VjPassGraphInput): boolean {
    const isMixDrawn = isVjMixDrawn(input);
    return (
      this.live === input.live &&
      this.outgoing === input.outgoing &&
      this.mix === input.mix &&
      this.transitionProgram === this.transitionProgramOf(input) &&
      this.isMixDrawn === isMixDrawn &&
      this.isMixFull === (isMixDrawn && this.isFullNormalMix(input)) &&
      this.settings === input.settings &&
      this.palette === input.palette &&
      this.outputHeight === input.outputHeight &&
      this.isOutputIdle === input.isOutputIdle
    );
  }

  private transitionProgramOf(input: VjPassGraphInput): VjProgramKey | null {
    return isVjTransitionDrawn(input) && input.transition !== null
      ? input.transition.programKey
      : null;
  }

  private isFullNormalMix(input: VjPassGraphInput): boolean {
    const blend = input.mixBlend;
    return blend !== null && blend.amount >= 1 && blend.blendModeIndex === 0;
  }

  private rebuild(input: VjPassGraphInput): void {
    this.steps = buildVjPassGraph(input);
    this.hasBuilt = true;
    this.live = input.live;
    this.outgoing = input.outgoing;
    this.mix = input.mix;
    this.transitionProgram = this.transitionProgramOf(input);
    this.isMixDrawn = isVjMixDrawn(input);
    this.isMixFull = this.isMixDrawn && this.isFullNormalMix(input);
    this.settings = input.settings;
    this.palette = input.palette;
    this.outputHeight = input.outputHeight;
    this.isOutputIdle = input.isOutputIdle;
    this.isRgbSplitBeat =
      vjEffectVariantOf(input.settings, "rgbSplit") === "beat";
    this.transitionUniforms = null;
    this.mixUniforms = null;
    this.colourUniforms = null;
    this.rgbSplitUniforms = null;
    this.glitchUniforms = null;
    this.outputUniforms = null;
    for (const step of this.steps) this.rememberStep(step);
  }

  private rememberStep(step: VjPassStep): void {
    const key = step.programKey;
    if (key === "output") this.outputUniforms = mutableUniformsOf(step);
    else if (key === "mix") this.mixUniforms = mutableUniformsOf(step);
    else if (key === "colour") this.colourUniforms = mutableUniformsOf(step);
    else if (key === "texture.rgbSplit") {
      this.rgbSplitUniforms = mutableUniformsOf(step);
    } else if (key === "texture.glitch") {
      this.glitchUniforms = mutableUniformsOf(step);
    } else if (key.startsWith("transition.")) {
      this.transitionUniforms = mutableUniformsOf(step);
    }
  }

  private patch(input: VjPassGraphInput, invertLevel: number): void {
    const { gates, output } = input;
    if (this.transitionUniforms && input.transition) {
      this.transitionUniforms.uProgress = input.transition.progress;
      this.transitionUniforms.uSeed = input.transition.seed;
    }
    if (this.mixUniforms && input.mixBlend) {
      this.mixUniforms.uMixAmount = input.mixBlend.amount;
      this.mixUniforms.uBlendMode = input.mixBlend.blendModeIndex;
    }
    if (this.colourUniforms) this.colourUniforms.uInvert = invertLevel;
    if (this.rgbSplitUniforms) {
      this.rgbSplitUniforms.uRgbSplitDrive = this.isRgbSplitBeat
        ? gates.drive
        : 1;
    }
    if (this.glitchUniforms) {
      this.glitchUniforms.uGlitchSeed = gates.glitchSeed;
      this.glitchUniforms.uGlitchBurst = gates.glitchBurst;
      this.glitchUniforms.uGlitchLumaShift = gates.isGlitchLumaShiftGranted
        ? 1
        : 0;
    }
    if (this.outputUniforms) {
      this.outputUniforms.uOutputGain = output.gain;
      this.outputUniforms.uBlackout = output.blackout;
      this.outputUniforms.uCurtain = output.curtain;
      this.outputUniforms.uStrobe = output.strobe;
      this.outputUniforms.uSlewLimit = output.slewLimit;
    }
  }
}

/** Everything a frame reads and writes, owned by the compositor. */
export interface VjCompositorRuntime {
  context: VjGlContext;
  canvas: HTMLCanvasElement;
  programs: VjProgramCache;
  pool: VjTargetPool;
  resolver: VjTargetResolver;
  /** Stable across restores: it forwards to the current full-screen triangle. */
  triangle: VjPassTriangle;
  probe: VjLuminanceProbe;
  gpuTimer: VjGpuTimer | null;
  net: VjLuminanceNet;
  registry: VjSourceRegistry;
  layers: VjCompositorLayers;
  mixSlot: VjCompositorMixSlot;
  flashes: VjCompositorFlashes;
  health: VjCompositorHealth;
  graph: VjPassGraphCache;
  palette: VjPalette;
  clock: VjClockReader;
  micLevelRef: { readonly current: number | null } | null;
  look: VjEngineLook;
  /** The lead flag of the last setLook (it can change without a new version key). */
  isStrobeEnabled: boolean;
  blendModeIndex: number;
  startMs: number;
  lastFrameMs: number | null;
  blackoutLevel: number;
  /** The last luminance net counts, read at once from the net's reused answer. */
  netCounts: { general: number; red: number };
  frameUniforms: VjFrameUniformValues;
  frameUniformInput: Parameters<typeof writeVjFrameUniforms>[1];
  flashInput: VjFlashTickInput;
  sourceFrame: VjSourceFrameInput;
  graphInput: VjPassGraphInput;
  mixBlend: { amount: number; blendModeIndex: number };
  bindLayer: VjBindLayer;
}

export function vjBlendModeIndexOf(look: VjEngineLook): number {
  return Math.max(0, VJ_BLEND_MODES.indexOf(look.mix.blendMode));
}

/** The draw of a ready source, binding its textures from unit 0; null before its first frame. */
function layerDrawOf(
  held: VjHeldSource | null,
  palette: VjPalette,
): VjLayerDraw | null {
  if (!held || !held.source.isReady) return null;
  return held.source.bindDraw(0, palette);
}

/** The runner's `bindLayer`, built once per runtime. */
export function createVjBindLayer(
  runtime: () => VjCompositorRuntime,
): VjBindLayer {
  return (name, unit) => {
    const current = runtime();
    const draw = current.layers.draw;
    let held: VjHeldSource | null = null;
    if (name === "live") held = draw.live;
    else if (name === "outgoing") held = draw.outgoing;
    else if (name === "mix") held = current.mixSlot.current;
    if (!held || !held.source.isReady) return false;
    held.source.bindDraw(unit, current.palette);
    return true;
  };
}

function writeFrameUniforms(runtime: VjCompositorRuntime, nowMs: number): void {
  const input = runtime.frameUniformInput;
  const micLevel = runtime.micLevelRef?.current ?? null;
  input.engineTimeMs = nowMs - runtime.startMs;
  input.speed = runtime.look.speed;
  input.serverNowMs = runtime.clock.serverNow();
  input.tempo = runtime.look.tempo;
  input.micLevel =
    micLevel !== null && Number.isFinite(micLevel)
      ? Math.min(1, Math.max(0, micLevel))
      : null;
  input.width = runtime.canvas.width;
  input.height = runtime.canvas.height;
  writeVjFrameUniforms(runtime.frameUniforms, input);
}

function advanceBlackout(runtime: VjCompositorRuntime, deltaMs: number): void {
  const target = runtime.look.isBlackout ? 1 : 0;
  const fadeMs = runtime.look.blackoutFadeMs;
  if (!(fadeMs > 0)) {
    runtime.blackoutLevel = target;
    return;
  }
  const step = deltaMs / fadeMs;
  runtime.blackoutLevel =
    target > runtime.blackoutLevel
      ? Math.min(target, runtime.blackoutLevel + step)
      : Math.max(target, runtime.blackoutLevel - step);
}

function updateHeld(
  runtime: VjCompositorRuntime,
  held: VjHeldSource | null,
): void {
  if (!held) return;
  const frame = runtime.sourceFrame;
  frame.playhead = vjPlayheadOf(
    held,
    runtime.graphInput.settings,
    runtime.look.speed,
  );
  held.source.update(frame);
}

/**
 * Every held source updates: the live and outgoing layers, a loading or
 * primed incoming one, and the mix slot's three. While the output is idle
 * they update with `isVisible: false`, which uploads nothing (a generator
 * still reports its first frame, so the curtain can lift).
 */
function updateSources(
  runtime: VjCompositorRuntime,
  nowMs: number,
  deltaMs: number,
  isOutputIdle: boolean,
): void {
  const frame = runtime.sourceFrame;
  frame.nowMs = nowMs;
  frame.deltaMs = deltaMs;
  frame.beats = runtime.frameUniforms.uBeats;
  frame.beatPeriodMs = runtime.frameUniforms.beatPeriodMs;
  frame.isVisible = !isOutputIdle;
  runtime.gpuTimer?.begin("sources");
  updateHeld(runtime, runtime.layers.heldOf("a"));
  updateHeld(runtime, runtime.layers.heldOf("b"));
  updateHeld(runtime, runtime.mixSlot.current);
  updateHeld(runtime, runtime.mixSlot.pending);
  updateHeld(runtime, runtime.mixSlot.prepared);
  runtime.gpuTimer?.end();
}

function fillGraphInput(
  runtime: VjCompositorRuntime,
  nowMs: number,
  deltaMs: number,
  isOutputIdle: boolean,
): void {
  const { graphInput: input, layers, flashes, palette } = runtime;
  const draw = layers.draw;
  const flash = flashes.frame;
  input.live = layerDrawOf(draw.live, palette);
  input.outgoing =
    draw.transition === null ? null : layerDrawOf(draw.outgoing, palette);
  input.transition = draw.transition;
  const mixAmount = runtime.look.mix.amount;
  const mixHeld = runtime.mixSlot.current;
  input.mix = mixAmount > 0 ? layerDrawOf(mixHeld, palette) : null;
  runtime.mixBlend.amount = mixAmount;
  runtime.mixBlend.blendModeIndex = runtime.blendModeIndex;
  input.mixBlend = input.mix === null ? null : runtime.mixBlend;
  input.palette = palette;
  input.gates.invertBeatGate = flash.invertBeatGate;
  input.gates.invertRamp = flash.invertRamp;
  input.gates.glitchSeed = flash.glitchSeed;
  input.gates.glitchBurst = flash.glitchBurst;
  input.gates.isGlitchLumaShiftGranted = flash.isGlitchLumaShiftGranted;
  input.gates.drive = runtime.frameUniforms.uDrive;
  input.output.gain = flash.outputGain;
  input.output.blackout = runtime.blackoutLevel;
  input.output.curtain = draw.curtain;
  input.output.strobe = flash.strobe;
  input.output.slewLimit = vjOutputSlewLimit(runtime.net, nowMs, deltaMs);
  input.outputHeight = runtime.resolver.chainHeight;
  input.isOutputIdle = isOutputIdle;
}

/** Runs the steps, presents, captures the probe, swaps the outputs and feeds the net. */
function drawVjGraph(
  runtime: VjCompositorRuntime,
  steps: readonly VjPassStep[],
  nowMs: number,
): void {
  const { context, programs, resolver, triangle, gpuTimer } = runtime;
  gpuTimer?.begin("effects");
  runVjPassGraph(
    context,
    programs,
    resolver,
    triangle,
    steps,
    runtime.frameUniforms,
    runtime.bindLayer,
  );
  gpuTimer?.end();
  const output = resolver.resolve("outputCurrent", 1);
  gpuTimer?.begin("output");
  presentVjOutput(context, output, runtime.canvas.width, runtime.canvas.height);
  runtime.probe.capture(output);
  gpuTimer?.end();
  resolver.swapOutputs();
  const probeBytes = runtime.probe.poll();
  if (probeBytes !== null) {
    const answer = observeVjProbe(runtime.net, probeBytes, nowMs);
    runtime.netCounts.general = answer.generalFlashesLastSecond;
    runtime.netCounts.red = answer.redFlashesLastSecond;
  }
  gpuTimer?.read();
}

/** Clears the canvas to black: before the core programs are ready. */
export function clearVjCanvas(runtime: VjCompositorRuntime): void {
  const { gl } = runtime.context;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, runtime.canvas.width, runtime.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/** Draws one frame at `nowMs` (requestAnimationFrame time). */
export function runVjCompositorFrame(
  runtime: VjCompositorRuntime,
  nowMs: number,
): void {
  const deltaMs =
    runtime.lastFrameMs === null
      ? 0
      : Math.min(MAX_FRAME_DELTA_MS, Math.max(0, nowMs - runtime.lastFrameMs));
  runtime.lastFrameMs = nowMs;
  runtime.registry.drainEvents();
  writeFrameUniforms(runtime, nowMs);
  const draw = runtime.layers.advance(nowMs);
  const uniforms = runtime.frameUniforms;
  const flashInput = runtime.flashInput;
  flashInput.nowMs = nowMs;
  flashInput.settings = runtime.look.settings;
  flashInput.isStrobing = runtime.look.strobe.isStrobing;
  flashInput.isStrobeEnabled = runtime.isStrobeEnabled;
  flashInput.beatIndex = uniforms.beatIndex;
  flashInput.beatPhase = uniforms.uBeatPhase;
  flashInput.beatPeriodMs = uniforms.beatPeriodMs;
  flashInput.drive = uniforms.uDrive;
  flashInput.micLevel = runtime.frameUniformInput.micLevel;
  const flash = runtime.flashes.tick(flashInput);
  runtime.graphInput.settings = runtime.flashes.effectiveSettings(
    runtime.look.settings,
  );
  advanceBlackout(runtime, deltaMs);
  const isOutputIdle =
    (runtime.blackoutLevel >= 1 || draw.curtain >= 1) &&
    draw.transition === null;
  updateSources(runtime, nowMs, deltaMs, isOutputIdle);
  runtime.resolver.renderScale = runtime.health.renderScale;
  fillGraphInput(runtime, nowMs, deltaMs, isOutputIdle);
  const steps = runtime.graph.stepsFor(runtime.graphInput, flash.invertLevel);
  drawVjGraph(runtime, steps, nowMs);
  runtime.health.stepFrame(nowMs, runtime.look.settings, runtime.pool);
  runtime.registry.endFrame();
}
