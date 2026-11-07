/**
 * The pass runner (engine plan, Task E16): draws the steps `buildVjPassGraph`
 * answers, in order, then blits the output to the canvas.
 *
 * Conventions (the pass graph header in `vjPassGraph.ts` sets them):
 * - A step with no inputs is a source draw into a layer target (`live`,
 *   `outgoing` or `mix`). The runner first calls `bindLayer(output, 0)`: the
 *   layer may repaint its backdrop target first (with `drawVjProgramPass`),
 *   then binds its own textures from unit 0 in its program's sampler order;
 *   the runner binds the program and the output only afterwards. `bindLayer`
 *   answering false (no frame yet) clears the layer target to black.
 * - Every other step binds its inputs to texture units in the program's
 *   sampler order. A layer target read before any step of this frame wrote
 *   it (no layer present) is cleared to black first.
 * - A program that is not linked (failed, or still compiling) draws a
 *   passthrough copy of the step's first input through the output program
 *   with gain 1 and every other uniform 0, so only that effect drops out. A
 *   source draw without its program clears its target.
 * - Each step's `uResolution` is the size of the target it writes.
 * - After the echo step the runner copies its result into `feedback`.
 * - The caller presents `outputCurrent` with `presentVjOutput`, then swaps
 *   `outputCurrent` and `outputPrevious` in its resolver, which owns the
 *   mapping from target names to pooled targets.
 *
 * Nothing here allocates per call: scratch uniform records live at module
 * level and are rewritten for each step.
 */
import type { VjGlContext } from "./gl/vjGlContext";
import {
  bindVjProgram,
  setVjUniforms,
  type VjGlProgram,
  type VjUniformValue,
} from "./gl/vjGlProgram";
import type { VjRenderTarget } from "./gl/vjGlTargets";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import type { VjFrameUniformValues } from "./vjFrameUniforms";
import type { VjPassStep, VjTargetName } from "./vjPassGraph";
import type { VjProgramCache } from "./vjProgramCache";

export interface VjPassRunnerTargets {
  resolve(name: VjTargetName, scale: 1 | 0.5): VjRenderTarget;
}

export interface VjPassTriangle {
  draw(): void;
}

/** Binds a layer's textures from `unit` on; false when the layer has nothing to draw yet. */
export type VjBindLayer = (name: VjTargetName, unit: number) => boolean;

/** The output program drawn as a plain copy of its first input. */
const PASSTHROUGH_PROGRAM_KEY: VjProgramKey = "output";
const PASSTHROUGH_UNIFORMS: Readonly<Record<string, VjUniformValue>> = {
  uOutputGain: 1,
  uBlackout: 0,
  uCurtain: 0,
  uStrobe: 0,
  uSlewLimit: 0,
};
const PASSTHROUGH_SAMPLER_COUNT = 2;

/** The frame uniforms with this step's target size, rewritten per step. */
type VjFrameUniformScratch = {
  uResolution: Float32Array;
  uTime: number;
  uBeats: number;
  uBeatPhase: number;
  uBarPhase: number;
  uBeatPulse: number;
  uDrive: number;
};
const frameScratch: VjFrameUniformScratch = {
  uResolution: new Float32Array(2),
  uTime: 0,
  uBeats: 0,
  uBeatPhase: 0,
  uBarPhase: 0,
  uBeatPulse: 0,
  uDrive: 0,
};

const LAYER_TARGETS: ReadonlySet<VjTargetName> = new Set<VjTargetName>([
  "live",
  "outgoing",
  "mix",
]);

function copyFrameUniforms(frame: VjFrameUniformValues): void {
  frameScratch.uTime = frame.uTime;
  frameScratch.uBeats = frame.uBeats;
  frameScratch.uBeatPhase = frame.uBeatPhase;
  frameScratch.uBarPhase = frame.uBarPhase;
  frameScratch.uBeatPulse = frame.uBeatPulse;
  frameScratch.uDrive = frame.uDrive;
}

function bindVjOutput(
  gl: WebGL2RenderingContext,
  output: VjRenderTarget,
): void {
  gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer);
  gl.viewport(0, 0, output.width, output.height);
}

export function clearVjTarget(
  gl: WebGL2RenderingContext,
  target: VjRenderTarget,
): void {
  bindVjOutput(gl, target);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Draws one program into `output` with the textures bound right now: frame
 * uniforms (with `uResolution` set to the output size), sampler units, then
 * the step's own uniforms. Also used by layers to repaint their backdrop.
 */
export function drawVjProgramPass(
  context: VjGlContext,
  program: VjGlProgram,
  samplerUnits: Readonly<Record<string, number>>,
  triangle: VjPassTriangle,
  output: VjRenderTarget,
  uniforms: Readonly<Record<string, VjUniformValue>>,
): void {
  bindVjOutput(context.gl, output);
  bindVjProgram(context, program);
  frameScratch.uResolution[0] = output.width;
  frameScratch.uResolution[1] = output.height;
  setVjUniforms(context, program, frameScratch);
  setVjUniforms(context, program, samplerUnits);
  setVjUniforms(context, program, uniforms);
  triangle.draw();
}

/** The scale the target was last written at by an earlier step of this frame, else null. */
function writtenScaleOf(
  steps: readonly VjPassStep[],
  beforeIndex: number,
  name: VjTargetName,
): 1 | 0.5 | null {
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    const step = steps[index];
    if (step?.output === name) return step.scale;
  }
  return null;
}

/**
 * Binds `samplerCount` units from the step's first `inputLimit` inputs; units
 * past the limit repeat the last input used, so no stale texture from an
 * earlier step can alias the target this step writes.
 */
function bindVjStepInputs(
  context: VjGlContext,
  targets: VjPassRunnerTargets,
  steps: readonly VjPassStep[],
  stepIndex: number,
  samplerCount: number,
  inputLimit: number,
): void {
  const { gl } = context;
  const step = steps[stepIndex];
  if (!step || step.inputs.length === 0) return;
  const lastInputIndex = Math.min(inputLimit, step.inputs.length) - 1;
  for (let unit = 0; unit < samplerCount; unit += 1) {
    const inputIndex = Math.min(unit, lastInputIndex);
    const name = step.inputs[inputIndex];
    if (name === undefined) continue;
    const writtenScale = writtenScaleOf(steps, stepIndex, name);
    const input = targets.resolve(name, writtenScale ?? 1);
    const isFirstUseOfInput = unit === inputIndex;
    if (isFirstUseOfInput && writtenScale === null && LAYER_TARGETS.has(name)) {
      clearVjTarget(gl, input);
    }
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, input.texture);
  }
}

/** Copies a chain target into another of any size (the echo history). */
function copyVjTarget(
  gl: WebGL2RenderingContext,
  source: VjRenderTarget,
  destination: VjRenderTarget,
): void {
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, destination.framebuffer);
  gl.blitFramebuffer(
    0,
    0,
    source.width,
    source.height,
    0,
    0,
    destination.width,
    destination.height,
    gl.COLOR_BUFFER_BIT,
    gl.LINEAR,
  );
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
}

function runVjSourceStep(
  context: VjGlContext,
  programs: VjProgramCache,
  output: VjRenderTarget,
  triangle: VjPassTriangle,
  step: VjPassStep,
  bindLayer: VjBindLayer,
): void {
  const program = programs.get(step.programKey);
  if (!program || !bindLayer(step.output, 0)) {
    clearVjTarget(context.gl, output);
    return;
  }
  const samplerUnits = programs.samplerUnitsOf(step.programKey);
  drawVjProgramPass(
    context,
    program,
    samplerUnits,
    triangle,
    output,
    step.uniforms,
  );
}

function runVjChainStep(
  context: VjGlContext,
  programs: VjProgramCache,
  targets: VjPassRunnerTargets,
  triangle: VjPassTriangle,
  steps: readonly VjPassStep[],
  stepIndex: number,
): void {
  const step = steps[stepIndex];
  if (!step) return;
  const output = targets.resolve(step.output, step.scale);
  const program = programs.get(step.programKey);
  const passthrough = program ? null : programs.get(PASSTHROUGH_PROGRAM_KEY);
  if (!program && !passthrough) {
    clearVjTarget(context.gl, output);
    return;
  }
  if (program) {
    const samplerCount = programs.samplerCountOf(step.programKey);
    bindVjStepInputs(
      context,
      targets,
      steps,
      stepIndex,
      samplerCount,
      samplerCount,
    );
    const samplerUnits = programs.samplerUnitsOf(step.programKey);
    drawVjProgramPass(
      context,
      program,
      samplerUnits,
      triangle,
      output,
      step.uniforms,
    );
  } else if (passthrough) {
    // The first input on both units: uSource copies it, uPrevious is unread at slew 0.
    bindVjStepInputs(
      context,
      targets,
      steps,
      stepIndex,
      PASSTHROUGH_SAMPLER_COUNT,
      1,
    );
    const samplerUnits = programs.samplerUnitsOf(PASSTHROUGH_PROGRAM_KEY);
    drawVjProgramPass(
      context,
      passthrough,
      samplerUnits,
      triangle,
      output,
      PASSTHROUGH_UNIFORMS,
    );
  }
  if (step.programKey === "time.echo") {
    copyVjTarget(context.gl, output, targets.resolve("feedback", step.scale));
  }
}

/** Draws every step in order into its output target. */
export function runVjPassGraph(
  context: VjGlContext,
  programs: VjProgramCache,
  targets: VjPassRunnerTargets,
  triangle: VjPassTriangle,
  steps: readonly VjPassStep[],
  frame: VjFrameUniformValues,
  bindLayer: VjBindLayer,
): void {
  copyFrameUniforms(frame);
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
    const step = steps[stepIndex];
    if (!step) continue;
    if (step.inputs.length === 0) {
      const output = targets.resolve(step.output, step.scale);
      runVjSourceStep(context, programs, output, triangle, step, bindLayer);
    } else {
      runVjChainStep(context, programs, targets, triangle, steps, stepIndex);
    }
  }
  context.gl.bindFramebuffer(context.gl.FRAMEBUFFER, null);
}

/** Blits the output target onto the canvas, scaling it to the drawing buffer. */
export function presentVjOutput(
  context: VjGlContext,
  output: VjRenderTarget,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const { gl } = context;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, output.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  gl.blitFramebuffer(
    0,
    0,
    output.width,
    output.height,
    0,
    0,
    canvasWidth,
    canvasHeight,
    gl.COLOR_BUFFER_BIT,
    gl.LINEAR,
  );
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
}
