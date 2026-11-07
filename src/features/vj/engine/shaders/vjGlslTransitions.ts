/**
 * Transition programs (engine plan, Task E4; contract 3.3): one program per
 * `VjTransitionId` except `cut`, which promotes the incoming source at once and
 * draws no pass. Each reads the outgoing source as `uFrom` and the incoming
 * one as `uTo` (both upright render targets) and runs `uProgress` from 0 (all
 * outgoing) to 1 (all incoming). `uSeed` changes per transition so the glitch
 * blocks differ each time.
 *
 * `dipWhite` and `glitch` are flash-capable; when the flash governor denies
 * them, the engine draws `transition.fade` instead, so neither program checks
 * the governor itself.
 */

import type { VjTransitionId } from "../../../../shared/contracts/vj";
import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const TRANSITION_UNIFORMS_GLSL = `
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;
uniform float uSeed;
const float VJ_WIPE_SOFT_EDGE = 0.02;
`;

const FADE_BODY = `
void main() {
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  outColour = vec4(mix(outgoing, incoming, uProgress), 1.0);
}
`;

/** First half from the outgoing source to the dip colour, second half from it to the incoming one. */
function dipBody(dipColour: "vec3(0.0)" | "vec3(1.0)"): string {
  return `
void main() {
  vec3 dipColour = ${dipColour};
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  vec3 colour = uProgress < 0.5
    ? mix(outgoing, dipColour, uProgress * 2.0)
    : mix(dipColour, incoming, uProgress * 2.0 - 1.0);
  outColour = vec4(colour, 1.0);
}
`;
}

/**
 * A straight wipe with a soft edge. `wipeLeft` moves the edge from the right
 * side to the left, uncovering the incoming source behind it; `wipeRight`
 * moves it from the left side to the right. The edge starts and ends just
 * outside the frame, so progress 0 and 1 show one source only.
 */
function wipeBody(direction: "left" | "right"): string {
  const incomingWeight =
    direction === "left"
      ? "smoothstep(edge - VJ_WIPE_SOFT_EDGE, edge + VJ_WIPE_SOFT_EDGE, vUv.x)"
      : "1.0 - smoothstep(edge - VJ_WIPE_SOFT_EDGE, edge + VJ_WIPE_SOFT_EDGE, vUv.x)";
  const edgeTravel =
    direction === "left"
      ? "mix(1.0 + VJ_WIPE_SOFT_EDGE, -VJ_WIPE_SOFT_EDGE, uProgress)"
      : "mix(-VJ_WIPE_SOFT_EDGE, 1.0 + VJ_WIPE_SOFT_EDGE, uProgress)";
  return `
void main() {
  float edge = ${edgeTravel};
  float incomingWeight = ${incomingWeight};
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  outColour = vec4(mix(outgoing, incoming, incomingWeight), 1.0);
}
`;
}

/** A clock hand sweeping clockwise from 12 o'clock, aspect correct around the centre. */
const WIPE_RADIAL_BODY = `
void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 centred = (vUv - 0.5) * vec2(aspect, 1.0);
  float sweep = fract(atan(centred.x, centred.y + 1.0e-6) / VJ_TAU);
  float edge = mix(-VJ_WIPE_SOFT_EDGE, 1.0 + VJ_WIPE_SOFT_EDGE, uProgress);
  float incomingWeight = 1.0 - smoothstep(edge - VJ_WIPE_SOFT_EDGE, edge + VJ_WIPE_SOFT_EDGE, sweep);
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  outColour = vec4(mix(outgoing, incoming, incomingWeight), 1.0);
}
`;

/** A circle growing from the centre, round on any screen shape, until it covers the corners. */
const IRIS_BODY = `
void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 centred = (vUv - 0.5) * vec2(aspect, 1.0);
  float cornerDistance = length(vec2(aspect, 1.0) * 0.5);
  float radius = uProgress * (cornerDistance + VJ_WIPE_SOFT_EDGE);
  float incomingWeight = 1.0 - smoothstep(radius - VJ_WIPE_SOFT_EDGE, radius, length(centred));
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  outColour = vec4(mix(outgoing, incoming, incomingWeight), 1.0);
}
`;

/**
 * Radial zoom blur, 8 taps per source. The outgoing source magnifies from 1x
 * toward 1.6x, the incoming one settles from 1.6x back to 1x, and the blur
 * spread peaks halfway, where the crossfade happens.
 */
const ZOOM_BLUR_BODY = `
const int VJ_ZOOM_BLUR_TAPS = 8;

vec3 vjZoomBlurred(sampler2D image, float magnification, float spread) {
  vec2 centred = vUv - 0.5;
  vec3 total = vec3(0.0);
  for (int tap = 0; tap < VJ_ZOOM_BLUR_TAPS; tap++) {
    float tapPosition = float(tap) / float(VJ_ZOOM_BLUR_TAPS - 1);
    float tapMagnification = magnification * (1.0 + spread * tapPosition);
    total += texture(image, 0.5 + centred / tapMagnification).rgb;
  }
  return total / float(VJ_ZOOM_BLUR_TAPS);
}

void main() {
  float spread = sin(uProgress * VJ_TAU * 0.5) * 0.25;
  vec3 outgoing = vjZoomBlurred(uFrom, 1.0 + uProgress * 0.6, spread);
  vec3 incoming = vjZoomBlurred(uTo, 1.0 + (1.0 - uProgress) * 0.6, spread);
  outColour = vec4(mix(outgoing, incoming, smoothstep(0.3, 0.7, uProgress)), 1.0);
}
`;

/**
 * Blocks flip from the outgoing to the incoming source in hashed order, rows
 * slide sideways (strongest at the halfway point) with a small channel split,
 * and a brief brightness spike lands at 0.5. The spike is the flash the
 * governor budgets; a denied glitch draws `transition.fade`.
 */
const GLITCH_BODY = `
const vec2 VJ_GLITCH_BLOCKS = vec2(16.0, 9.0);
const float VJ_GLITCH_ROWS = 36.0;

void main() {
  float peak = 1.0 - abs(uProgress * 2.0 - 1.0);
  float row = floor(vUv.y * VJ_GLITCH_ROWS);
  float isRowShifted = step(0.55, vjHash12(vec2(row + 7.0, uSeed)));
  float rowShift = (vjHash12(vec2(row, uSeed * 13.0)) - 0.5) * 0.12 * peak * peak * isRowShifted;
  vec2 shiftedUv = vec2(fract(vUv.x + rowShift), vUv.y);
  vec2 block = floor(shiftedUv * VJ_GLITCH_BLOCKS);
  float isIncoming = vjHash12(block + uSeed) < uProgress ? 1.0 : 0.0;
  vec2 splitUv = shiftedUv + vec2(0.006 * peak, 0.0);
  vec3 outgoing = vec3(texture(uFrom, splitUv).r, texture(uFrom, shiftedUv).gb);
  vec3 incoming = vec3(texture(uTo, splitUv).r, texture(uTo, shiftedUv).gb);
  vec3 colour = mix(outgoing, incoming, isIncoming);
  float spikeOffset = (uProgress - 0.5) / 0.035;
  colour += exp(-spikeOffset * spikeOffset) * 0.5;
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

/** The incoming source shows first where the outgoing one is darkest, with a 0.1 luma band. */
const LUMA_FADE_BODY = `
const float VJ_LUMA_FADE_BAND = 0.1;

void main() {
  vec3 outgoing = texture(uFrom, vUv).rgb;
  vec3 incoming = texture(uTo, vUv).rgb;
  float edge = uProgress * (1.0 + VJ_LUMA_FADE_BAND);
  float incomingWeight = 1.0 - smoothstep(edge - VJ_LUMA_FADE_BAND, edge, vjLuma(outgoing));
  outColour = vec4(mix(outgoing, incoming, incomingWeight), 1.0);
}
`;

type VjDrawnTransitionId = Exclude<VjTransitionId, "cut">;

const TRANSITION_BODIES: Readonly<Record<VjDrawnTransitionId, string>> = {
  fade: FADE_BODY,
  dipBlack: dipBody("vec3(0.0)"),
  dipWhite: dipBody("vec3(1.0)"),
  wipeLeft: wipeBody("left"),
  wipeRight: wipeBody("right"),
  wipeRadial: WIPE_RADIAL_BODY,
  iris: IRIS_BODY,
  zoomBlur: ZOOM_BLUR_BODY,
  glitch: GLITCH_BODY,
  lumaFade: LUMA_FADE_BODY,
};

function transitionProgram(transitionId: VjDrawnTransitionId): VjShaderSource {
  const programKey: VjProgramKey = `transition.${transitionId}`;
  return {
    fragment: vjFragment(
      programKey,
      TRANSITION_UNIFORMS_GLSL + TRANSITION_BODIES[transitionId],
    ),
    uniforms: ["uProgress", "uSeed"],
    samplers: ["uFrom", "uTo"],
  };
}

export const VJ_TRANSITION_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = Object.fromEntries(
  (Object.keys(TRANSITION_BODIES) as VjDrawnTransitionId[]).map(
    (transitionId) => [
      `transition.${transitionId}`,
      transitionProgram(transitionId),
    ],
  ),
);
