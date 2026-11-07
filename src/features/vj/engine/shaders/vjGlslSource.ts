/**
 * Source programs (engine plan, Task E4): the passes that bring a clip into the
 * engine. `source.clip` draws a 2D texture (a video frame or a GIF frame),
 * `source.ring` draws one layer of the reverse frame ring, and
 * `source.backdrop` draws the dimmed copy that sits behind a `fit` clip.
 *
 * Frames upload top row first (`UNPACK_FLIP_Y_WEBGL` false), so these passes
 * flip v once and every later pass reads an upright image. The runner redraws
 * the backdrop into a 64 px wide target every 500 ms (the v1 cadence); the clip
 * passes sample that target as `uBackdrop` with the plain `vUv`.
 */

import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const FIT_UNIFORM_NAMES = [
  "uSourceSize",
  "uFitMode",
  "uHasBackdrop",
  "uIsPixelated",
] as const;

/**
 * Fit rules shared by both clip passes. `fill` covers (the larger ratio, a
 * centred crop); `fit` contains (the smaller ratio) and shows the backdrop, or
 * black, around the clip. Declares `uBackdrop`, so callers declare only their
 * own source sampler.
 */
const SOURCE_FIT_GLSL = `
uniform sampler2D uBackdrop;
uniform vec2 uSourceSize;
uniform int uFitMode;
uniform float uHasBackdrop;
uniform int uIsPixelated;

vec2 vjSourceUv() {
  vec2 sourceSize = max(uSourceSize, vec2(1.0));
  vec2 ratios = uResolution / sourceSize;
  float scale = uFitMode == 0 ? max(ratios.x, ratios.y) : min(ratios.x, ratios.y);
  vec2 drawnSize = sourceSize * scale;
  vec2 sourceUv = (vUv * uResolution - (uResolution - drawnSize) * 0.5) / drawnSize;
  return vec2(sourceUv.x, 1.0 - sourceUv.y);
}

float vjInsideSource(vec2 sourceUv) {
  vec2 inside = step(vec2(0.0), sourceUv) * step(sourceUv, vec2(1.0));
  return inside.x * inside.y;
}

ivec2 vjNearestTexel(vec2 sourceUv, ivec2 texelCount) {
  vec2 clampedUv = clamp(sourceUv, 0.0, 1.0);
  return clamp(ivec2(floor(clampedUv * vec2(texelCount))), ivec2(0), texelCount - 1);
}

vec3 vjBehindSource() {
  return uHasBackdrop > 0.5 ? texture(uBackdrop, vUv).rgb : vec3(0.0);
}
`;

const SOURCE_CLIP_BODY = `
uniform sampler2D uSource;
${SOURCE_FIT_GLSL}
void main() {
  vec2 sourceUv = vjSourceUv();
  vec3 colour;
  if (uIsPixelated == 1) {
    ivec2 texel = vjNearestTexel(sourceUv, textureSize(uSource, 0));
    colour = texelFetch(uSource, texel, 0).rgb;
  } else {
    colour = texture(uSource, sourceUv).rgb;
  }
  colour = mix(vjBehindSource(), colour, vjInsideSource(sourceUv));
  outColour = vec4(colour, 1.0);
}
`;

const SOURCE_RING_BODY = `
uniform sampler2DArray uRing;
uniform float uRingLayer;
${SOURCE_FIT_GLSL}
void main() {
  vec2 sourceUv = vjSourceUv();
  vec3 colour;
  if (uIsPixelated == 1) {
    ivec2 texel = vjNearestTexel(sourceUv, textureSize(uRing, 0).xy);
    colour = texelFetch(uRing, ivec3(texel, int(uRingLayer + 0.5)), 0).rgb;
  } else {
    colour = texture(uRing, vec3(sourceUv, uRingLayer)).rgb;
  }
  colour = mix(vjBehindSource(), colour, vjInsideSource(sourceUv));
  outColour = vec4(colour, 1.0);
}
`;

/**
 * Covers the small backdrop target with the source, flipped upright, and dims
 * it. Five taps over each target pixel's footprint keep the downscale from
 * shimmering between redraws.
 */
const SOURCE_BACKDROP_BODY = `
uniform sampler2D uSource;
uniform float uDim;

void main() {
  vec2 sourceSize = max(vec2(textureSize(uSource, 0)), vec2(1.0));
  vec2 ratios = uResolution / sourceSize;
  float scale = max(ratios.x, ratios.y);
  vec2 drawnSize = sourceSize * scale;
  vec2 sourceUv = (vUv * uResolution - (uResolution - drawnSize) * 0.5) / drawnSize;
  sourceUv.y = 1.0 - sourceUv.y;
  vec2 footprint = 0.35 / drawnSize;
  vec3 colour = texture(uSource, sourceUv).rgb;
  colour += texture(uSource, sourceUv + vec2(footprint.x, footprint.y)).rgb;
  colour += texture(uSource, sourceUv + vec2(-footprint.x, footprint.y)).rgb;
  colour += texture(uSource, sourceUv + vec2(footprint.x, -footprint.y)).rgb;
  colour += texture(uSource, sourceUv + vec2(-footprint.x, -footprint.y)).rgb;
  outColour = vec4(colour * 0.2 * uDim, 1.0);
}
`;

function sourceProgram(
  programKey: VjProgramKey,
  body: string,
  uniforms: readonly string[],
  samplers: readonly string[],
): VjShaderSource {
  return { fragment: vjFragment(programKey, body), uniforms, samplers };
}

export const VJ_SOURCE_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  "source.clip": sourceProgram(
    "source.clip",
    SOURCE_CLIP_BODY,
    FIT_UNIFORM_NAMES,
    ["uSource", "uBackdrop"],
  ),
  "source.ring": sourceProgram(
    "source.ring",
    SOURCE_RING_BODY,
    ["uRingLayer", ...FIT_UNIFORM_NAMES],
    ["uRing", "uBackdrop"],
  ),
  "source.backdrop": sourceProgram(
    "source.backdrop",
    SOURCE_BACKDROP_BODY,
    ["uDim"],
    ["uSource"],
  ),
};
