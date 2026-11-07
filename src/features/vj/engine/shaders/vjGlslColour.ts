/**
 * The fused `colour` program (engine plan, Task E2): every color-group effect
 * of the catalog as one GLSL function, applied per pixel in `VJ_EFFECT_IDS`
 * order. Each function is skipped while its amount uniform is 0, and the
 * amount uniforms already carry 0 for an effect that is off.
 *
 * The `invert` beat gate and the flash governor's ramp are folded into
 * `uInvert` on the CPU (`colourUniformsOf`), so the shader only mixes.
 */

import { VJ_GLSL_MAX_FLAG_STRIPES, vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const COLOUR_UNIFORMS = [
  "uMonochrome",
  "uInvert",
  "uSaturate",
  "uContrast",
  "uTintAmount",
  "uTintColour",
  "uDuotoneAmount",
  "uDuotoneDark",
  "uDuotoneLight",
  "uPrideAmount",
  "uPrideColours",
  "uPrideColourCount",
  "uThermal",
  "uHueCycle",
  "uHueShift",
] as const;

const COLOUR_DECLARATIONS = `
uniform sampler2D uSource;
uniform float uMonochrome;
uniform float uInvert;
uniform float uSaturate;
uniform float uContrast;
uniform float uTintAmount;
uniform vec3 uTintColour;
uniform float uDuotoneAmount;
uniform vec3 uDuotoneDark;
uniform vec3 uDuotoneLight;
uniform float uPrideAmount;
uniform vec3 uPrideColours[${VJ_GLSL_MAX_FLAG_STRIPES}];
uniform int uPrideColourCount;
uniform float uThermal;
uniform float uHueCycle;
uniform float uHueShift;
`;

/** monochrome, invert, saturate, contrast and tint: plain per-pixel mixes. */
const COLOUR_TONE_FUNCTIONS = `
vec3 vjEffectMonochrome(vec3 colour, float amount) {
  return mix(colour, vec3(vjLuma(colour)), amount);
}

vec3 vjEffectInvert(vec3 colour, float amount) {
  return mix(colour, 1.0 - colour, amount);
}

vec3 vjEffectSaturate(vec3 colour, float amount) {
  float factor = 1.0 + 2.0 * amount;
  return clamp(mix(vec3(vjLuma(colour)), colour, factor), 0.0, 1.0);
}

vec3 vjEffectContrast(vec3 colour, float amount) {
  float factor = 1.0 + 1.5 * amount;
  return clamp((colour - 0.5) * factor + 0.5, 0.0, 1.0);
}

vec3 vjEffectTint(vec3 colour, float amount) {
  return mix(colour, vjLuma(colour) * uTintColour, amount);
}
`;

/**
 * duotone, prideGrade and thermal: gradient maps by luma, mixed in by amount.
 * prideGrade gives the shadows the last stripe and the highlights the first,
 * so a flag reads from its top stripe down as the image darkens. The thermal
 * ramp runs black, blue, magenta, red, yellow, white, built from primaries.
 */
const COLOUR_GRADIENT_FUNCTIONS = `
vec3 vjEffectDuotone(vec3 colour, float amount) {
  vec3 mapped = mix(uDuotoneDark, uDuotoneLight, smoothstep(0.0, 1.0, vjLuma(colour)));
  return mix(colour, mapped, amount);
}

vec3 vjEffectPrideGrade(vec3 colour, float amount) {
  int stripeCount = clamp(uPrideColourCount, 0, ${VJ_GLSL_MAX_FLAG_STRIPES});
  if (stripeCount < 1) {
    return colour;
  }
  float position = (1.0 - clamp(vjLuma(colour), 0.0, 1.0)) * float(stripeCount);
  int stripeIndex = min(int(floor(position)), stripeCount - 1);
  int nextIndex = min(stripeIndex + 1, stripeCount - 1);
  float withinStripe = position - float(stripeIndex);
  float softEdge = smoothstep(0.85, 1.0, withinStripe);
  vec3 mapped = mix(uPrideColours[stripeIndex], uPrideColours[nextIndex], softEdge);
  return mix(colour, mapped, amount);
}

vec3 vjThermalRamp(float heat) {
  float scaled = clamp(heat, 0.0, 1.0) * 5.0;
  vec3 ramp = mix(vec3(0.0), vec3(0.0, 0.0, 1.0), clamp(scaled, 0.0, 1.0));
  ramp = mix(ramp, vec3(1.0, 0.0, 1.0), clamp(scaled - 1.0, 0.0, 1.0));
  ramp = mix(ramp, vec3(1.0, 0.0, 0.0), clamp(scaled - 2.0, 0.0, 1.0));
  ramp = mix(ramp, vec3(1.0, 1.0, 0.0), clamp(scaled - 3.0, 0.0, 1.0));
  return mix(ramp, vec3(1.0), clamp(scaled - 4.0, 0.0, 1.0));
}

vec3 vjEffectThermal(vec3 colour, float amount) {
  return mix(colour, vjThermalRamp(vjLuma(colour)), amount);
}
`;

/** hueCycle turns `amount * 90` degrees per beat; hueShift turns `amount * 360` degrees. */
const COLOUR_HUE_FUNCTIONS = `
vec3 vjEffectHueCycle(vec3 colour, float amount) {
  return vjHueRotate(colour, fract(uBeats * amount * 0.25));
}

vec3 vjEffectHueShift(vec3 colour, float amount) {
  return vjHueRotate(colour, amount);
}
`;

const COLOUR_MAIN = `
void main() {
  vec4 source = texture(uSource, vUv);
  vec3 colour = source.rgb;
  if (uMonochrome > 0.0) colour = vjEffectMonochrome(colour, uMonochrome);
  if (uInvert > 0.0) colour = vjEffectInvert(colour, uInvert);
  if (uSaturate > 0.0) colour = vjEffectSaturate(colour, uSaturate);
  if (uContrast > 0.0) colour = vjEffectContrast(colour, uContrast);
  if (uTintAmount > 0.0) colour = vjEffectTint(colour, uTintAmount);
  if (uDuotoneAmount > 0.0) colour = vjEffectDuotone(colour, uDuotoneAmount);
  if (uPrideAmount > 0.0) colour = vjEffectPrideGrade(colour, uPrideAmount);
  if (uThermal > 0.0) colour = vjEffectThermal(colour, uThermal);
  if (uHueCycle > 0.0) colour = vjEffectHueCycle(colour, uHueCycle);
  if (uHueShift > 0.0) colour = vjEffectHueShift(colour, uHueShift);
  outColour = vec4(colour, source.a);
}
`;

const COLOUR_BODY = [
  COLOUR_DECLARATIONS,
  COLOUR_TONE_FUNCTIONS,
  COLOUR_GRADIENT_FUNCTIONS,
  COLOUR_HUE_FUNCTIONS,
  COLOUR_MAIN,
].join("");

export const VJ_COLOUR_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  colour: {
    fragment: vjFragment("colour", COLOUR_BODY),
    uniforms: COLOUR_UNIFORMS,
    samplers: ["uSource"],
  },
};
