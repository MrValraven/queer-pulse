/**
 * The pass graph (engine plan, Task E8): the ordered list of full-screen
 * draws for one frame, in the design's order. Source draws (live; outgoing
 * during a transition; mix when blended), then the transition, the mix blend,
 * colour (fused), texture effects in catalog order, geometry (fused), echo,
 * and the output step, always last, into `outputCurrent`.
 *
 * Step conventions the pass runner follows:
 * - A source draw writes a layer target (`live`, `outgoing` or `mix`) with no
 *   inputs: the runner calls `bindLayer(output, 0)` so the layer binds its own
 *   textures (source and backdrop) and repaints its backdrop target itself.
 * - Every other step binds `inputs` to texture units in the program's
 *   sampler order and never reads the target it writes.
 * - The runner copies the echo step's result into `feedback`, blits
 *   `outputCurrent` to the canvas, then swaps it with `outputPrevious`.
 *
 * The graph is a pure function of its input; the compositor may reuse the
 * answer while its input is unchanged.
 */
import type { VjEffectSettings } from "../../../shared/contracts/vj";
import type { VjUniformValue } from "./gl/vjGlProgram";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import { appendVjEffectSteps, vjOutputStep } from "./vjPassGraphEffects";
import { appendVjSourceSteps } from "./vjPassGraphSources";
import type { VjPalette } from "./vjPalette";

export { nextVjChainTarget } from "./vjPassGraphSources";

export type VjTargetName =
  | "live"
  | "outgoing"
  | "mix"
  | "liveBackdrop"
  | "outgoingBackdrop"
  | "mixBackdrop"
  | "chainA"
  | "chainB"
  | "dreamHalfA"
  | "dreamHalfB"
  | "feedback"
  | "outputCurrent"
  | "outputPrevious";

export interface VjPassStep {
  programKey: VjProgramKey;
  inputs: readonly VjTargetName[];
  output: VjTargetName;
  uniforms: Readonly<Record<string, VjUniformValue>>;
  scale: 1 | 0.5;
}

/** One layer's draw, as its engine source answers it. */
export interface VjLayerDraw {
  programKey: VjProgramKey;
  uniforms: Readonly<Record<string, VjUniformValue>>;
  hasBackdrop: boolean;
}

export interface VjPassGraphInput {
  live: VjLayerDraw | null;
  outgoing: VjLayerDraw | null;
  mix: VjLayerDraw | null;
  /** The running transition (program already resolved through the governor), else null. */
  transition: {
    programKey: VjProgramKey;
    progress: number;
    seed: number;
  } | null;
  mixBlend: { amount: number; blendModeIndex: number } | null;
  settings: VjEffectSettings;
  palette: VjPalette;
  gates: {
    invertBeatGate: number;
    invertRamp: number;
    glitchSeed: number;
    glitchBurst: number;
    isGlitchLumaShiftGranted: boolean;
    /** This frame's uDrive (mic level, else the beat pulse): a `beat` rgbSplit scales by it. */
    drive: number;
  };
  output: {
    gain: number;
    blackout: number;
    curtain: number;
    strobe: number;
    slewLimit: number;
  };
  /** Height in px of a scale 1 target; the dream blur radius is a share of it. */
  outputHeight: number;
  /** Blackout or curtain fully up while nothing transitions: the output step alone. */
  isOutputIdle: boolean;
}

export function buildVjPassGraph(input: VjPassGraphInput): VjPassStep[] {
  if (input.isOutputIdle) return [vjOutputStep("live", input.output)];
  const steps: VjPassStep[] = [];
  const afterSources = appendVjSourceSteps(steps, input);
  const afterEffects = appendVjEffectSteps(steps, afterSources, input);
  steps.push(vjOutputStep(afterEffects, input.output));
  return steps;
}
