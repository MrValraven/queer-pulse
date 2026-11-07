/**
 * Adaptive render scale and the projector canvas size (plan decision 15).
 *
 * The engine draws into a backing store of at most 1920x1080 worth of
 * pixels, and drops to 0.75 then 0.5 of that when the frame rate stays low
 * with effects on. Pure: the compositor keeps the timers and asks here.
 */

export const VJ_RENDER_SCALES = [1, 0.75, 0.5] as const;
export type VjRenderScale = (typeof VJ_RENDER_SCALES)[number];

export const VJ_ENGINE_MAX_PIXELS = 1920 * 1080;

/** Below this share of the refresh rate the frame rate counts as low. */
const LOW_FPS_SHARE = 0.9;
/** At or above this share of the refresh rate the frame rate is on target. */
const TARGET_FPS_SHARE = 0.98;
const STEP_DOWN_AFTER_MS = 3000;
const STEP_UP_AFTER_MS = 10_000;
/** No two scale changes within this long. */
const MIN_MS_BETWEEN_CHANGES = 3000;

export interface VjRenderScaleSample {
  fps: number;
  refreshHz: number;
  activeEffectCount: number;
  /** How long fps has stayed under 90% of the refresh rate, without a break. */
  msBelowTarget: number;
  /** How long fps has stayed at 98% of the refresh rate or more, without a break. */
  msAtTarget: number;
  msSinceChange: number;
}

export function nextVjRenderScale(
  current: VjRenderScale,
  sample: VjRenderScaleSample,
): VjRenderScale {
  const { fps, refreshHz } = sample;
  if (!Number.isFinite(fps) || !Number.isFinite(refreshHz) || refreshHz <= 0) {
    return current;
  }
  if (sample.msSinceChange < MIN_MS_BETWEEN_CHANGES) return current;

  const scaleIndex = VJ_RENDER_SCALES.indexOf(current);
  const isLow = fps < refreshHz * LOW_FPS_SHARE;
  const isOnTarget = fps >= refreshHz * TARGET_FPS_SHARE;

  if (
    isLow &&
    sample.activeEffectCount > 0 &&
    sample.msBelowTarget >= STEP_DOWN_AFTER_MS
  ) {
    return VJ_RENDER_SCALES[scaleIndex + 1] ?? current;
  }
  if (isOnTarget && sample.msAtTarget >= STEP_UP_AFTER_MS && scaleIndex > 0) {
    return VJ_RENDER_SCALES[scaleIndex - 1] ?? current;
  }
  return current;
}

/**
 * Backing store size for a canvas laid out at `cssWidth` x `cssHeight`:
 * CSS pixels times the device pixel ratio, scaled down evenly so the area
 * stays within `VJ_ENGINE_MAX_PIXELS`. A 4K projector gets a 1080p canvas
 * that the browser upscales.
 */
export function vjCanvasSize(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): { width: number; height: number } {
  const pixelRatio =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? devicePixelRatio
      : 1;
  const deviceWidth = Math.max(1, finiteOrZero(cssWidth) * pixelRatio);
  const deviceHeight = Math.max(1, finiteOrZero(cssHeight) * pixelRatio);
  const area = deviceWidth * deviceHeight;
  const shrink =
    area > VJ_ENGINE_MAX_PIXELS ? Math.sqrt(VJ_ENGINE_MAX_PIXELS / area) : 1;
  return {
    width: Math.max(1, Math.floor(deviceWidth * shrink)),
    height: Math.max(1, Math.floor(deviceHeight * shrink)),
  };
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
