/**
 * The source part of the pass graph: layer draws, the transition and the mix
 * blend. Each function appends its steps and answers the target the chain
 * continues from.
 */
import type {
  VjLayerDraw,
  VjPassGraphInput,
  VjPassStep,
  VjTargetName,
} from "./vjPassGraph";

/** The index of "normal" in VJ_BLEND_MODES. */
const NORMAL_BLEND_MODE_INDEX = 0;

/** The chain target a step writes after reading `current`: never the one it reads. */
export function nextVjChainTarget(current: VjTargetName): VjTargetName {
  return current === "chainA" ? "chainB" : "chainA";
}

function layerDrawStep(draw: VjLayerDraw, output: VjTargetName): VjPassStep {
  return {
    programKey: draw.programKey,
    inputs: [],
    output,
    uniforms: draw.uniforms,
    scale: 1,
  };
}

/** True while a transition runs between two present layers. */
export function isVjTransitionDrawn(input: VjPassGraphInput): boolean {
  return (
    input.transition !== null && input.live !== null && input.outgoing !== null
  );
}

/** True when the mix layer is present and blended in above amount 0. */
export function isVjMixDrawn(input: VjPassGraphInput): boolean {
  return (
    input.mix !== null && input.mixBlend !== null && input.mixBlend.amount > 0
  );
}

/**
 * Appends the layer draws, the transition and the mix blend. With no layer at
 * all the chain starts from the empty `live` target, which the runner clears.
 */
export function appendVjSourceSteps(
  steps: VjPassStep[],
  input: VjPassGraphInput,
): VjTargetName {
  const isTransitionDrawn = isVjTransitionDrawn(input);
  const isMixDrawn = isVjMixDrawn(input);
  if (input.live !== null) steps.push(layerDrawStep(input.live, "live"));
  if (isTransitionDrawn && input.outgoing !== null) {
    steps.push(layerDrawStep(input.outgoing, "outgoing"));
  }
  if (isMixDrawn && input.mix !== null) {
    steps.push(layerDrawStep(input.mix, "mix"));
  }

  let current: VjTargetName = "live";
  if (isTransitionDrawn && input.transition !== null) {
    const output = nextVjChainTarget(current);
    steps.push({
      programKey: input.transition.programKey,
      inputs: ["outgoing", "live"],
      output,
      uniforms: {
        uProgress: input.transition.progress,
        uSeed: input.transition.seed,
      },
      scale: 1,
    });
    current = output;
  }

  if (isMixDrawn && input.mixBlend !== null) {
    const { amount, blendModeIndex } = input.mixBlend;
    // A full normal blend shows only the mix layer: it feeds the chain straight.
    if (amount >= 1 && blendModeIndex === NORMAL_BLEND_MODE_INDEX) return "mix";
    const output = nextVjChainTarget(current);
    steps.push({
      programKey: "mix",
      inputs: [current, "mix"],
      output,
      uniforms: { uMixAmount: amount, uBlendMode: blendModeIndex },
      scale: 1,
    });
    current = output;
  }
  return current;
}
