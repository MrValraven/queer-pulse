/**
 * Texture effects that read neighbouring texels (contract 3.2): crt, rgbSplit,
 * pixelate, halftone, glitch and the two dream passes. Each fragment takes at
 * most 16 texture taps, written out one call per tap so the count stays
 * visible. Pixel sizes are given at 1080 lines and scale with the target
 * height.
 */

import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const CRT_BODY = `
uniform sampler2D uSource;
uniform float uCrtAmount;

void main() {
  vec2 centred = vUv * 2.0 - 1.0;
  centred *= 1.0 + 0.12 * uCrtAmount * dot(centred, centred);
  vec2 barrelUv = centred * 0.5 + 0.5;
  vec2 edgeDistance = min(barrelUv, 1.0 - barrelUv);
  float isInside = step(0.0, min(edgeDistance.x, edgeDistance.y));
  vec3 colour = texture(uSource, clamp(barrelUv, 0.0, 1.0)).rgb * isInside;
  float pixelScale = max(uResolution.y / 1080.0, 1.0);
  float maskColumn = mod(floor(gl_FragCoord.x / pixelScale), 3.0);
  vec3 shadowMask = 0.7 + 0.6 * vec3(equal(vec3(maskColumn), vec3(0.0, 1.0, 2.0)));
  colour *= mix(vec3(1.0), shadowMask, 0.6 * uCrtAmount);
  float cornerFalloff = smoothstep(0.0, 0.08, min(edgeDistance.x, edgeDistance.y));
  colour *= mix(1.0, cornerFalloff, uCrtAmount);
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

const RGB_SPLIT_BODY = `
uniform sampler2D uSource;
uniform float uRgbSplitAmount;
uniform float uRgbSplitDrive;

void main() {
  float offsetWidth = 0.02 * uRgbSplitAmount * uRgbSplitDrive;
  vec2 offset = vec2(offsetWidth, offsetWidth * 0.25);
  float red = texture(uSource, vUv + offset).r;
  float green = texture(uSource, vUv).g;
  float blue = texture(uSource, vUv - offset).b;
  outColour = vec4(red, green, blue, 1.0);
}
`;

const PIXELATE_BODY = `
uniform sampler2D uSource;
uniform float uPixelateAmount;

void main() {
  float blockSize = max(mix(1.0, 64.0, uPixelateAmount) * uResolution.y / 1080.0, 1.0);
  vec2 blockCentre = (floor(gl_FragCoord.xy / blockSize) + 0.5) * blockSize;
  vec2 blockUv = clamp(blockCentre / uResolution, 0.0, 1.0);
  outColour = vec4(texture(uSource, blockUv).rgb, 1.0);
}
`;

const HALFTONE_BODY = `
uniform sampler2D uSource;
uniform float uHalftoneAmount;

const float HALFTONE_ANGLE = 0.2618;

void main() {
  vec3 colour = texture(uSource, vUv).rgb;
  float cellSize = 10.0 * max(uResolution.y / 1080.0, 0.5);
  float cosine = cos(HALFTONE_ANGLE);
  float sine = sin(HALFTONE_ANGLE);
  mat2 toGrid = mat2(cosine, -sine, sine, cosine);
  mat2 toScreen = mat2(cosine, sine, -sine, cosine);
  vec2 gridPoint = toGrid * gl_FragCoord.xy;
  vec2 cellCentre = (floor(gridPoint / cellSize) + 0.5) * cellSize;
  vec2 cellUv = clamp((toScreen * cellCentre) / uResolution, 0.0, 1.0);
  vec3 cellColour = texture(uSource, cellUv).rgb;
  float dotRadius = sqrt(vjLuma(cellColour)) * 0.72 * cellSize;
  float dotDistance = length(gridPoint - cellCentre);
  float coverage = smoothstep(dotRadius + 0.75, dotRadius - 0.75, dotDistance);
  vec3 halftone = clamp(cellColour * 1.15, 0.0, 1.0) * coverage;
  outColour = vec4(mix(colour, halftone, uHalftoneAmount), 1.0);
}
`;

/**
 * Row blocks shift sideways while a burst runs and the channels split always.
 * The one mean-luminance change (one block row inverted) sits behind
 * uGlitchLumaShift, which the flash governor grants.
 */
const GLITCH_BODY = `
uniform sampler2D uSource;
uniform float uGlitchAmount;
uniform float uGlitchSeed;
uniform float uGlitchBurst;
uniform float uGlitchLumaShift;

void main() {
  float burstStrength = uGlitchAmount * uGlitchBurst;
  vec2 blocks = vec2(6.0, mix(12.0, 40.0, uGlitchAmount));
  vec2 blockCell = floor(vUv * blocks);
  float blockHash = vjHash12(blockCell + uGlitchSeed);
  float isShifted = step(0.55, vjHash12(blockCell.yx + uGlitchSeed * 1.37));
  float displacement = (blockHash - 0.5) * 0.2 * burstStrength * isShifted;
  vec2 glitchUv = vec2(fract(vUv.x + displacement), vUv.y);
  float channelOffset = 0.004 * uGlitchAmount + 0.02 * burstStrength;
  vec3 colour;
  colour.r = texture(uSource, glitchUv + vec2(channelOffset, 0.0)).r;
  colour.g = texture(uSource, glitchUv).g;
  colour.b = texture(uSource, glitchUv - vec2(channelOffset, 0.0)).b;
  float invertedRow = floor(vjHash12(vec2(uGlitchSeed, 3.7)) * blocks.y);
  float isInvertedRow = 1.0 - step(0.5, abs(blockCell.y - invertedRow));
  float rowInvert = uGlitchLumaShift * isInvertedRow * step(0.001, uGlitchBurst);
  colour = mix(colour, vec3(1.0) - colour, rowInvert);
  outColour = vec4(colour, 1.0);
}
`;

/** One axis of a 9-tap gaussian; uBlurRadius is in pixels of this target. */
const DREAM_BLUR_BODY = `
uniform sampler2D uSource;
uniform vec2 uBlurDirection;
uniform float uBlurRadius;

void main() {
  vec2 tapStep = uBlurDirection * (uBlurRadius / 4.0) / uResolution;
  vec3 colour = texture(uSource, vUv).rgb * 0.2270270;
  colour += texture(uSource, vUv + tapStep).rgb * 0.1945946;
  colour += texture(uSource, vUv - tapStep).rgb * 0.1945946;
  colour += texture(uSource, vUv + tapStep * 2.0).rgb * 0.1216216;
  colour += texture(uSource, vUv - tapStep * 2.0).rgb * 0.1216216;
  colour += texture(uSource, vUv + tapStep * 3.0).rgb * 0.0540541;
  colour += texture(uSource, vUv - tapStep * 3.0).rgb * 0.0540541;
  colour += texture(uSource, vUv + tapStep * 4.0).rgb * 0.0162162;
  colour += texture(uSource, vUv - tapStep * 4.0).rgb * 0.0162162;
  outColour = vec4(colour, 1.0);
}
`;

const DREAM_COMBINE_BODY = `
uniform sampler2D uSource;
uniform sampler2D uBlurred;
uniform float uDreamAmount;

void main() {
  vec3 source = texture(uSource, vUv).rgb;
  vec3 blurred = texture(uBlurred, vUv).rgb;
  vec3 softened = mix(source, blurred, 0.6 * uDreamAmount);
  vec3 brightPass = max(blurred - 0.6, 0.0) / 0.4;
  vec3 colour = softened + brightPass * 0.8 * uDreamAmount;
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

function neighbourProgram(
  programKey: VjProgramKey,
  body: string,
  uniforms: readonly string[],
  samplers: readonly string[] = ["uSource"],
): VjShaderSource {
  return { fragment: vjFragment(programKey, body), uniforms, samplers };
}

export const VJ_TEXTURE_NEIGHBOUR_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  "texture.crt": neighbourProgram("texture.crt", CRT_BODY, ["uCrtAmount"]),
  "texture.rgbSplit": neighbourProgram("texture.rgbSplit", RGB_SPLIT_BODY, [
    "uRgbSplitAmount",
    "uRgbSplitDrive",
  ]),
  "texture.pixelate": neighbourProgram("texture.pixelate", PIXELATE_BODY, [
    "uPixelateAmount",
  ]),
  "texture.halftone": neighbourProgram("texture.halftone", HALFTONE_BODY, [
    "uHalftoneAmount",
  ]),
  "texture.glitch": neighbourProgram("texture.glitch", GLITCH_BODY, [
    "uGlitchAmount",
    "uGlitchSeed",
    "uGlitchBurst",
    "uGlitchLumaShift",
  ]),
  "texture.dreamBlur": neighbourProgram("texture.dreamBlur", DREAM_BLUR_BODY, [
    "uBlurDirection",
    "uBlurRadius",
  ]),
  "texture.dreamCombine": neighbourProgram(
    "texture.dreamCombine",
    DREAM_COMBINE_BODY,
    ["uDreamAmount"],
    ["uSource", "uBlurred"],
  ),
};
