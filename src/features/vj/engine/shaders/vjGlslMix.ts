/**
 * The mix program (engine plan, Task E4, decision 11; contract 3.4): the mix
 * clip (`uLayer`) over the live chain (`uBase`) by the crossfader amount and
 * blend mode. `uBlendMode` carries the index in `VJ_BLEND_MODES`.
 *
 * `normal` is a linear crossfade. Every other mode ramps the blend in over
 * amount 0 to 0.5 and fades the base out over 0.5 to 1, so amount 0 shows only
 * the live source and amount 1 only the mix clip.
 */

import {
  VJ_BLEND_MODES,
  type VjBlendMode,
} from "../../../../shared/contracts/vj";
import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

/** Each mode's GLSL expression over `base` and `layer`; `normal` is drawn by the linear crossfade. */
const VJ_BLEND_EXPRESSIONS: Readonly<Record<VjBlendMode, string>> = {
  normal: "layer",
  screen: "1.0 - (1.0 - base) * (1.0 - layer)",
  multiply: "base * layer",
  difference: "abs(base - layer)",
  add: "min(base + layer, vec3(1.0))",
  lighten: "max(base, layer)",
};

const BLEND_BRANCHES_GLSL = VJ_BLEND_MODES.map(
  (blendMode, modeIndex) =>
    `  if (uBlendMode == ${modeIndex}) return ${VJ_BLEND_EXPRESSIONS[blendMode]}; // ${blendMode}`,
).join("\n");

const NORMAL_MODE_INDEX = VJ_BLEND_MODES.indexOf("normal");

const MIX_BODY = `
uniform sampler2D uBase;
uniform sampler2D uLayer;
uniform float uMixAmount;
uniform int uBlendMode;

vec3 vjBlend(vec3 base, vec3 layer) {
${BLEND_BRANCHES_GLSL}
  return layer;
}

void main() {
  vec3 base = texture(uBase, vUv).rgb;
  vec3 layer = texture(uLayer, vUv).rgb;
  float amount = clamp(uMixAmount, 0.0, 1.0);
  if (uBlendMode == ${NORMAL_MODE_INDEX}) {
    outColour = vec4(mix(base, layer, amount), 1.0);
    return;
  }
  float blendIn = clamp(amount * 2.0, 0.0, 1.0);
  float baseOut = clamp(amount * 2.0 - 1.0, 0.0, 1.0);
  vec3 blended = mix(base, vjBlend(base, layer), blendIn);
  outColour = vec4(mix(blended, layer, baseOut), 1.0);
}
`;

export const VJ_MIX_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  mix: {
    fragment: vjFragment("mix", MIX_BODY),
    uniforms: ["uMixAmount", "uBlendMode"],
    samplers: ["uBase", "uLayer"],
  },
};
