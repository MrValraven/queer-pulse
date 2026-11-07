/**
 * The effect part of the pass graph: colour (fused), texture effects in
 * catalog order, geometry (fused), echo, and the output step.
 */
import { VJ_EFFECT_IDS } from "../../../shared/contracts/vj";
import type { VjUniformValue } from "./gl/vjGlProgram";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import {
  VJ_EFFECT_REGISTRY,
  hasActiveVjStage,
  vjEffectAmountOf,
} from "./vjEffectRegistry";
import {
  colourUniformsOf,
  geometryUniformsOf,
  textureUniformsOf,
} from "./vjEffectUniforms";
import type { VjPassGraphInput, VjPassStep, VjTargetName } from "./vjPassGraph";
import { nextVjChainTarget } from "./vjPassGraphSources";

/** Dream blurs up to this share of the screen height (contract 3.2). */
const DREAM_BLUR_HEIGHT_SHARE = 0.02;
/** The dream blurs run on half-size targets. */
const DREAM_BLUR_SCALE = 0.5;
const HORIZONTAL: readonly number[] = [1, 0];
const VERTICAL: readonly number[] = [0, 1];

function chainStep(
  steps: VjPassStep[],
  current: VjTargetName,
  programKey: VjProgramKey,
  uniforms: Readonly<Record<string, VjUniformValue>>,
  extraInputs: readonly VjTargetName[] = [],
): VjTargetName {
  const output = nextVjChainTarget(current);
  steps.push({
    programKey,
    inputs: [current, ...extraInputs],
    output,
    uniforms,
    scale: 1,
  });
  return output;
}

/** Dream: a horizontal then a vertical half-size blur, then the combine over the chain. */
function appendDreamSteps(
  steps: VjPassStep[],
  current: VjTargetName,
  input: VjPassGraphInput,
  amount: number,
): VjTargetName {
  const blurRadius =
    DREAM_BLUR_HEIGHT_SHARE * amount * input.outputHeight * DREAM_BLUR_SCALE;
  steps.push({
    programKey: "texture.dreamBlur",
    inputs: [current],
    output: "dreamHalfA",
    uniforms: { uBlurDirection: HORIZONTAL, uBlurRadius: blurRadius },
    scale: DREAM_BLUR_SCALE,
  });
  steps.push({
    programKey: "texture.dreamBlur",
    inputs: ["dreamHalfA"],
    output: "dreamHalfB",
    uniforms: { uBlurDirection: VERTICAL, uBlurRadius: blurRadius },
    scale: DREAM_BLUR_SCALE,
  });
  return chainStep(
    steps,
    current,
    "texture.dreamCombine",
    { uDreamAmount: amount },
    ["dreamHalfB"],
  );
}

function appendTextureSteps(
  steps: VjPassStep[],
  start: VjTargetName,
  input: VjPassGraphInput,
): VjTargetName {
  let current = start;
  for (const effectId of VJ_EFFECT_IDS) {
    const spec = VJ_EFFECT_REGISTRY[effectId];
    const setting = input.settings[effectId];
    const amount = vjEffectAmountOf(input.settings, effectId);
    if (spec.stage !== "texture" || setting === undefined || amount <= 0) {
      continue;
    }
    if (effectId === "dream") {
      current = appendDreamSteps(steps, current, input, amount);
      continue;
    }
    const [programKey] = spec.programKeys;
    if (programKey === undefined) continue;
    const uniforms = textureUniformsOf(effectId, setting, input.palette, {
      seed: input.gates.glitchSeed,
      burst: input.gates.glitchBurst,
      isLumaShiftGranted: input.gates.isGlitchLumaShiftGranted,
      drive: input.gates.drive,
    });
    current = chainStep(steps, current, programKey, uniforms);
  }
  return current;
}

/** Appends colour, texture, geometry and echo steps that have an active effect. */
export function appendVjEffectSteps(
  steps: VjPassStep[],
  start: VjTargetName,
  input: VjPassGraphInput,
): VjTargetName {
  const { settings } = input;
  let current = start;
  if (hasActiveVjStage(settings, "colour")) {
    current = chainStep(
      steps,
      current,
      "colour",
      colourUniformsOf(settings, input.palette, {
        invertBeatGate: input.gates.invertBeatGate,
        invertRamp: input.gates.invertRamp,
      }),
    );
  }
  current = appendTextureSteps(steps, current, input);
  if (hasActiveVjStage(settings, "geometry")) {
    current = chainStep(
      steps,
      current,
      "geometry",
      geometryUniformsOf(settings),
    );
  }
  const echoAmount = vjEffectAmountOf(settings, "echo");
  if (echoAmount > 0) {
    current = chainStep(
      steps,
      current,
      "time.echo",
      { uEchoAmount: echoAmount },
      ["feedback"],
    );
  }
  return current;
}

/** The output step: always last, reads the chain and the previous output. */
export function vjOutputStep(
  current: VjTargetName,
  output: VjPassGraphInput["output"],
): VjPassStep {
  return {
    programKey: "output",
    inputs: [current, "outputPrevious"],
    output: "outputCurrent",
    uniforms: {
      uOutputGain: output.gain,
      uBlackout: output.blackout,
      uCurtain: output.curtain,
      uStrobe: output.strobe,
      uSlewLimit: output.slewLimit,
    },
    scale: 1,
  };
}
