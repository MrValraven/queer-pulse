/**
 * The fused `geometry` program (engine plan, Task E2): every geometry-group
 * effect of the catalog except the mask is a UV remap, chained in the order
 * kenBurns, zoomPulse, rotate, tile, mirror, kaleidoscope. The chain ends in
 * one texture fetch, then the mask cuts a shape out and paints the rest black.
 *
 * The chain works on centred coordinates (`uv - 0.5`); rotate, kaleidoscope
 * and the mask switch to aspect space (x scaled by width over height) so
 * circles stay round. Beat-locked motion reads `uBeats`, which keeps running
 * on the synced clock, so every screen turns in step.
 */

import { VJ_BEATS_PER_BAR } from "../../../../shared/contracts/vj";
import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

/** Beats in four bars: kaleidoscope turns up to once in this span. */
const KALEIDOSCOPE_TURN_BEATS = (VJ_BEATS_PER_BAR * 4).toFixed(1);

const GEOMETRY_UNIFORMS = [
  "uKenBurns",
  "uZoomPulse",
  "uRotate",
  "uTileCount",
  "uMirrorMode",
  "uKaleidoSegments",
  "uKaleidoAmount",
  "uMaskShape",
  "uMaskAmount",
] as const;

const GEOMETRY_DECLARATIONS = `
uniform sampler2D uSource;
uniform float uKenBurns;
uniform float uZoomPulse;
uniform float uRotate;
uniform int uTileCount;
uniform int uMirrorMode;
uniform int uKaleidoSegments;
uniform float uKaleidoAmount;
uniform int uMaskShape;
uniform float uMaskAmount;

float vjAspect() {
  return uResolution.x / max(uResolution.y, 1.0);
}
`;

/**
 * kenBurns eases from 1x to `1 + 0.3 * amount` over 16 beats and back over the
 * next 16, panning inside the margin the zoom opens so no edge shows.
 * zoomPulse scales by `1 + 0.15 * amount * uDrive`. rotate turns `amount * 2`
 * times per 16 beats and zooms just enough to cover the frame at each angle.
 */
const GEOMETRY_MOTION_FUNCTIONS = `
vec2 vjEffectKenBurns(vec2 centred, float amount) {
  float ease = 0.5 - 0.5 * cos(uBeats * VJ_TAU / 32.0);
  float zoom = 1.0 + 0.3 * amount * ease;
  float margin = 0.5 - 0.5 / zoom;
  vec2 drift = vec2(sin(uBeats * VJ_TAU / 64.0), cos(uBeats * VJ_TAU / 48.0));
  return centred / zoom + drift * margin;
}

vec2 vjEffectZoomPulse(vec2 centred, float amount) {
  return centred / (1.0 + 0.15 * amount * uDrive);
}

vec2 vjEffectRotate(vec2 centred, float amount) {
  float aspect = vjAspect();
  float angle = fract(uBeats * amount / 8.0) * VJ_TAU;
  float cosine = abs(cos(angle));
  float sine = abs(sin(angle));
  float cover = max((aspect * cosine + sine) / aspect, aspect * sine + cosine);
  vec2 aspectPoint = vjRotate2(angle) * (centred * vec2(aspect, 1.0)) / cover;
  return aspectPoint / vec2(aspect, 1.0);
}
`;

/**
 * tile repeats the frame in a `uTileCount` grid. mirror reflects the left half
 * onto the right (horizontal), the top onto the bottom (vertical; uv y is 1 at
 * the top), or both (quad). kaleidoscope folds the plane into wedges, turning
 * up to once per four bars by amount, and mixes with the plain coordinates by
 * amount; mirrored repeats keep folded points inside the frame.
 */
const GEOMETRY_FOLD_FUNCTIONS = `
vec2 vjEffectTile(vec2 centred, int tileCount) {
  return fract((centred + 0.5) * float(tileCount)) - 0.5;
}

vec2 vjEffectMirror(vec2 centred, int mirrorMode) {
  vec2 uv = centred + 0.5;
  if (mirrorMode == 1 || mirrorMode == 3) {
    uv.x = 0.5 - abs(uv.x - 0.5);
  }
  if (mirrorMode == 2 || mirrorMode == 3) {
    uv.y = 0.5 + abs(uv.y - 0.5);
  }
  return uv - 0.5;
}

vec2 vjMirrorRepeat(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 vjEffectKaleidoscope(vec2 centred, int segmentCount, float amount) {
  float aspect = vjAspect();
  vec2 aspectPoint = centred * vec2(aspect, 1.0);
  float wedge = VJ_TAU / float(segmentCount);
  float turn = fract(uBeats * amount / ${KALEIDOSCOPE_TURN_BEATS}) * VJ_TAU;
  float angle = mod(atan(aspectPoint.y, aspectPoint.x) + turn, wedge);
  angle = min(angle, wedge - angle);
  vec2 folded = length(aspectPoint) * vec2(cos(angle), sin(angle));
  vec2 foldedUv = vjMirrorRepeat(folded / vec2(aspect, 1.0) + 0.5);
  return mix(centred, foldedUv - 0.5, amount);
}
`;

/**
 * Mask shapes as signed distances in aspect space, negative inside. The shape
 * is `mix(0.3, 1.0, amount)` of the screen height tall. The heart and the
 * five-point star follow Inigo Quilez's 2D distance functions.
 */
const GEOMETRY_MASK_FUNCTIONS = `
float vjDot2(vec2 point) {
  return dot(point, point);
}

float vjHeartDistance(vec2 point) {
  point.x = abs(point.x);
  if (point.y + point.x > 1.0) {
    return sqrt(vjDot2(point - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  }
  float toTop = vjDot2(point - vec2(0.0, 1.0));
  float toEdge = vjDot2(point - 0.5 * max(point.x + point.y, 0.0));
  return sqrt(min(toTop, toEdge)) * sign(point.x - point.y);
}

float vjStarDistance(vec2 point, float outerRadius, float innerRatio) {
  vec2 edgeA = vec2(0.809016994375, -0.587785252292);
  vec2 edgeB = vec2(-edgeA.x, edgeA.y);
  point.x = abs(point.x);
  point -= 2.0 * max(dot(edgeA, point), 0.0) * edgeA;
  point -= 2.0 * max(dot(edgeB, point), 0.0) * edgeB;
  point.x = abs(point.x);
  point.y -= outerRadius;
  vec2 spoke = innerRatio * vec2(-edgeA.y, edgeA.x) - vec2(0.0, 1.0);
  float along = clamp(dot(point, spoke) / dot(spoke, spoke), 0.0, outerRadius);
  return length(point - spoke * along) * sign(point.y * spoke.x - point.x * spoke.y);
}

float vjMaskDistance(vec2 aspectPoint, int maskShape, float size) {
  if (maskShape == 2) {
    float heartHeight = 1.1036;
    vec2 heartPoint = aspectPoint / size * heartHeight + vec2(0.0, heartHeight * 0.5);
    return vjHeartDistance(heartPoint) * size / heartHeight;
  }
  if (maskShape == 3) {
    float outerRadius = size / 1.809017;
    vec2 starPoint = aspectPoint + vec2(0.0, 0.0955 * outerRadius);
    return vjStarDistance(starPoint, outerRadius, 0.5);
  }
  return length(aspectPoint) - size * 0.5;
}

float vjEffectMask(vec2 uv, int maskShape, float amount) {
  vec2 aspectPoint = (uv - 0.5) * vec2(vjAspect(), 1.0);
  float size = mix(0.3, 1.0, amount);
  float edge = 1.5 / max(uResolution.y, 1.0);
  return 1.0 - smoothstep(-edge, edge, vjMaskDistance(aspectPoint, maskShape, size));
}
`;

const GEOMETRY_MAIN = `
void main() {
  vec2 centred = vUv - 0.5;
  if (uKenBurns > 0.0) centred = vjEffectKenBurns(centred, uKenBurns);
  if (uZoomPulse > 0.0) centred = vjEffectZoomPulse(centred, uZoomPulse);
  if (uRotate > 0.0) centred = vjEffectRotate(centred, uRotate);
  if (uTileCount > 1) centred = vjEffectTile(centred, uTileCount);
  if (uMirrorMode > 0) centred = vjEffectMirror(centred, uMirrorMode);
  if (uKaleidoSegments > 0 && uKaleidoAmount > 0.0) {
    centred = vjEffectKaleidoscope(centred, uKaleidoSegments, uKaleidoAmount);
  }
  vec4 source = texture(uSource, centred + 0.5);
  if (uMaskShape > 0 && uMaskAmount > 0.0) {
    source.rgb *= vjEffectMask(vUv, uMaskShape, uMaskAmount);
  }
  outColour = source;
}
`;

const GEOMETRY_BODY = [
  GEOMETRY_DECLARATIONS,
  GEOMETRY_MOTION_FUNCTIONS,
  GEOMETRY_FOLD_FUNCTIONS,
  GEOMETRY_MASK_FUNCTIONS,
  GEOMETRY_MAIN,
].join("");

export const VJ_GEOMETRY_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  geometry: {
    fragment: vjFragment("geometry", GEOMETRY_BODY),
    uniforms: GEOMETRY_UNIFORMS,
    samplers: ["uSource"],
  },
};
