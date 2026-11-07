/**
 * The last pass of every frame. It applies the governed beatPulse gain, the
 * blackout and curtain fades to black and the strobe flash to white. When the
 * luminance net asks for smoothing (`uSlewLimit` above zero, in sRGB units per
 * frame), each channel moves at most that far from `uPrevious`, the output of
 * the frame before. The targets are RGBA8, so vjOutputSlewLimit sends whole
 * 1/255 steps (or a hold value under half a step) built up across frames.
 */

import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const OUTPUT_BODY = `
uniform sampler2D uSource;
uniform sampler2D uPrevious;
uniform float uOutputGain;
uniform float uBlackout;
uniform float uCurtain;
uniform float uStrobe;
uniform float uSlewLimit;

void main() {
  vec3 colour = clamp(texture(uSource, vUv).rgb * uOutputGain, 0.0, 1.0);
  colour = mix(colour, vec3(0.0), clamp(uBlackout, 0.0, 1.0));
  colour = mix(colour, vec3(0.0), clamp(uCurtain, 0.0, 1.0));
  colour = mix(colour, vec3(1.0), clamp(uStrobe, 0.0, 1.0));
  if (uSlewLimit > 0.0) {
    vec3 previous = texture(uPrevious, vUv).rgb;
    colour = previous + clamp(colour - previous, -uSlewLimit, uSlewLimit);
  }
  outColour = vec4(colour, 1.0);
}
`;

export const VJ_OUTPUT_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  output: {
    fragment: vjFragment("output", OUTPUT_BODY),
    uniforms: ["uOutputGain", "uBlackout", "uCurtain", "uStrobe", "uSlewLimit"],
    samplers: ["uSource", "uPrevious"],
  },
};
