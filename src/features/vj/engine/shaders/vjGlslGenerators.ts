/**
 * Generator programs (engine plan, Task E4; contract 3.3): sources a screen
 * draws without a clip. They read no texture. Colours arrive as uniforms from
 * the palette tokens (`readVjPalette()`, Task E9): `uPalette` holds four
 * palette colours and `uFlagColours` the stripes of the chosen pride flag, top
 * to bottom, `uFlagStripeCount` of them. `uVariant` is the index in the
 * generator's catalog variants (the flag for `prideFlagWave`).
 *
 * `uTime` already runs at the stage speed; `uBeatPulse` is 1 on each beat and
 * decays, so beat-synced generators bump on it.
 */

import { VJ_PRIDE_FLAGS } from "../../../../shared/contracts/vj";
import { VJ_GLSL_MAX_FLAG_STRIPES, vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

/** How many palette colours `uPalette` holds. */
const GENERATOR_PALETTE_SIZE = 4;

/** The progress flag's chevron colours, the last five of its stripes (Task E9 tokens). */
const PROGRESS_CHEVRON_STRIPES = 5;

const GENERATOR_UNIFORMS = [
  "uVariant",
  "uPalette",
  "uFlagColours",
  "uFlagStripeCount",
] as const;

const GENERATOR_COMMON_GLSL = `
const int VJ_PALETTE_SIZE = ${GENERATOR_PALETTE_SIZE};
uniform int uVariant;
uniform vec3 uPalette[${GENERATOR_PALETTE_SIZE}];
uniform vec3 uFlagColours[${VJ_GLSL_MAX_FLAG_STRIPES}];
uniform int uFlagStripeCount;

float vjAspect() {
  return uResolution.x / max(uResolution.y, 1.0);
}

vec2 vjCentredPoint() {
  return (vUv - 0.5) * vec2(vjAspect(), 1.0);
}

/** A cyclic ramp through the four palette colours with cosine easing between neighbours. */
vec3 vjPaletteAt(float position) {
  float scaled = fract(position) * float(VJ_PALETTE_SIZE);
  int index = int(floor(scaled));
  float blend = 0.5 - 0.5 * cos(fract(scaled) * VJ_TAU * 0.5);
  return mix(uPalette[index], uPalette[(index + 1) % VJ_PALETTE_SIZE], blend);
}
`;

/** Four palette points drifting on slow orbits, blended by inverse squared distance. */
const GRADIENT_FIELD_BODY = `
void main() {
  vec2 point = vjCentredPoint();
  vec3 total = vec3(0.0);
  float weightSum = 0.0;
  for (int index = 0; index < VJ_PALETTE_SIZE; index++) {
    float order = float(index);
    float phase = order * 1.7;
    vec2 anchor = vec2(
      sin(uTime * (0.11 + 0.03 * order) + phase) * 0.45 * vjAspect(),
      cos(uTime * (0.09 + 0.02 * order) + phase * 1.3) * 0.4
    );
    vec2 offset = point - anchor;
    float weight = 1.0 / (dot(offset, offset) + 0.02);
    total += uPalette[index] * weight;
    weightSum += weight;
  }
  outColour = vec4(total / weightSum, 1.0);
}
`;

/** The sum of four sines, read through the palette ramp. */
const PLASMA_BODY = `
void main() {
  vec2 point = vjCentredPoint() * 3.0;
  float time = uTime * 0.6;
  vec2 wander = vec2(sin(time * 0.5), cos(time * 0.4));
  float field = sin(point.x * 1.3 + time);
  field += sin(point.y * 1.7 - time * 1.2);
  field += sin((point.x + point.y) * 1.1 + time * 0.7);
  field += sin(length(point + wander) * 2.2 - time);
  outColour = vec4(vjPaletteAt(field * 0.125 + 0.5 + uTime * 0.02), 1.0);
}
`;

/**
 * Three hashed star layers, each flying outward from the centre as its depth
 * grows and fading in and out at the ends of its cycle. Stars swell and
 * brighten on the beat.
 */
const STARFIELD_BODY = `
const float VJ_STAR_LAYERS = 3.0;

vec3 vjStarLayer(vec2 point, float layerIndex) {
  float depth = fract(uTime * 0.08 + layerIndex / VJ_STAR_LAYERS);
  vec2 grid = point * mix(18.0, 1.5, depth) + layerIndex * 17.0;
  vec2 cell = floor(grid);
  vec2 local = fract(grid) - 0.5;
  float seed = vjHash12(cell + layerIndex * 31.0);
  vec2 starOffset = vec2(vjHash12(cell + 11.0), vjHash12(cell + 23.0)) - 0.5;
  float size = mix(0.03, 0.07, seed) * (1.0 + 0.4 * uBeatPulse);
  float star = 1.0 - smoothstep(0.0, size, length(local - starOffset * 0.7));
  star *= step(0.65, seed);
  float fade = smoothstep(0.0, 0.3, depth) * (1.0 - smoothstep(0.85, 1.0, depth));
  vec3 tint = mix(vjPaletteAt(seed * 3.0), vec3(1.0), 0.55);
  return tint * star * fade;
}

void main() {
  vec2 point = vjCentredPoint();
  vec3 colour = vec3(0.0);
  for (float layerIndex = 0.0; layerIndex < VJ_STAR_LAYERS; layerIndex += 1.0) {
    colour += vjStarLayer(point, layerIndex);
  }
  colour *= 1.0 + 0.8 * uBeatPulse;
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

/**
 * The flag's stripes, rippled by a travelling sine and shaded along the wave.
 * The progress flag lays its last five colours as a chevron at the hoist
 * (white innermost) over its first stripes.
 */
const PRIDE_FLAG_WAVE_BODY = `
const int VJ_PROGRESS_FLAG_VARIANT = ${VJ_PRIDE_FLAGS.indexOf("progress")};
const int VJ_PROGRESS_CHEVRON_STRIPES = ${PROGRESS_CHEVRON_STRIPES};
const float VJ_PROGRESS_CHEVRON_BAND = 0.1;

vec3 vjFlagStripe(float fromTop, int stripeCount) {
  int stripe = clamp(int(floor(fromTop * float(stripeCount))), 0, stripeCount - 1);
  return uFlagColours[stripe];
}

void main() {
  float wavePhase = vUv.x * VJ_TAU * 1.25 - uTime * 2.2;
  float amplitude = 0.025 + 0.015 * uBeatPulse;
  vec2 flagPoint = vec2(vUv.x, vUv.y + sin(wavePhase) * amplitude);
  float fromTop = clamp(1.0 - flagPoint.y, 0.0, 1.0);
  bool isProgress = uVariant == VJ_PROGRESS_FLAG_VARIANT
    && uFlagStripeCount > VJ_PROGRESS_CHEVRON_STRIPES;
  int stripeCount = isProgress ? uFlagStripeCount - VJ_PROGRESS_CHEVRON_STRIPES : uFlagStripeCount;
  vec3 colour = vjFlagStripe(fromTop, max(stripeCount, 1));
  if (isProgress) {
    float chevron = flagPoint.x * vjAspect() + abs(fromTop - 0.5);
    int band = int(floor(chevron / VJ_PROGRESS_CHEVRON_BAND));
    if (band < VJ_PROGRESS_CHEVRON_STRIPES) {
      colour = uFlagColours[uFlagStripeCount - 1 - band];
    }
  }
  float shade = 0.84 + 0.16 * cos(wavePhase);
  outColour = vec4(colour * shade, 1.0);
}
`;

/**
 * A polar tunnel: depth runs as 1 / r, palette stripes spiral along it and
 * turn slowly, the centre falls into shadow and a ring flares on each beat.
 */
const TUNNEL_BODY = `
void main() {
  vec2 point = vjCentredPoint();
  float radius = max(length(point), 1.0e-3);
  float turn = atan(point.y, point.x + 1.0e-6) / VJ_TAU + uTime * 0.03;
  float depth = 0.35 / radius + uTime * 0.6;
  vec3 colour = vjPaletteAt(depth * 0.375 + turn);
  float segment = step(0.5, fract(turn * 8.0 + depth * 0.5));
  colour *= 0.75 + 0.25 * segment;
  float ring = 1.0 - smoothstep(0.0, 0.08, abs(fract(depth * 0.5) - 0.5));
  colour += colour * ring * uBeatPulse * 0.6;
  colour *= smoothstep(0.0, 0.25, radius);
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

function generatorProgram(
  programKey: VjProgramKey,
  body: string,
): VjShaderSource {
  return {
    fragment: vjFragment(programKey, GENERATOR_COMMON_GLSL + body),
    uniforms: GENERATOR_UNIFORMS,
    samplers: [],
  };
}

export const VJ_GENERATOR_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  "generator.gradientField": generatorProgram(
    "generator.gradientField",
    GRADIENT_FIELD_BODY,
  ),
  "generator.plasma": generatorProgram("generator.plasma", PLASMA_BODY),
  "generator.starfield": generatorProgram(
    "generator.starfield",
    STARFIELD_BODY,
  ),
  "generator.prideFlagWave": generatorProgram(
    "generator.prideFlagWave",
    PRIDE_FLAG_WAVE_BODY,
  ),
  "generator.tunnel": generatorProgram("generator.tunnel", TUNNEL_BODY),
};
