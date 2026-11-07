/**
 * The compositor's health (engine plan, Task E21; contract 3.8): frame
 * statistics, the adaptive render scale and the idle target sweep.
 *
 * - Every frame is recorded in a VjFrameStats ring (no allocation).
 * - Once a second the render scale steps through `nextVjRenderScale`; this
 *   module keeps the timers it needs (time below target, time at target,
 *   time since the last change). Scale drops only with effects on.
 * - Every 10 s the target pool frees targets no pass used in that time
 *   (echo, dream and history targets come back on first use).
 * `read` builds the report `readHealth` answers; it runs every 2 s, so it may
 * allocate.
 */
import {
  VJ_EFFECT_IDS,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import type { VjTargetPool } from "./gl/vjGlTargets";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import { vjEffectAmountOf } from "./vjEffectRegistry";
import { VjFrameStats } from "./vjFrameStats";
import { nextVjRenderScale, type VjRenderScale } from "./vjRenderScale";

export interface VjEngineHealth {
  fps: number;
  droppedFrames: number;
  refreshIntervalMs: number;
  renderScale: VjRenderScale;
  /** True while the render scale is under 1 (`screen:status` health). */
  isEffectLoadHigh: boolean;
  gpuBytes: number;
  failedProgramKeys: readonly VjProgramKey[];
  flashGuard: {
    isSmoothing: boolean;
    generalFlashesLastSecond: number;
    redFlashesLastSecond: number;
    /** Flash grants the governor holds right now (at most 3). */
    grantsHeld: number;
  };
  /** Frame rings the GPU memory budget refused since start (those clips play forward). */
  ringRefusals: number;
  /** GIFs the shared decoded-frame budget refused since start. */
  gifRefusals: number;
}

export const VJ_SCALE_STEP_MS = 1000;
export const VJ_IDLE_TARGET_MS = 10_000;
/** Below this share of the refresh rate the frame rate counts as low (vjRenderScale). */
const LOW_FPS_SHARE = 0.9;
/** At or above this share the frame rate is on target (vjRenderScale). */
const TARGET_FPS_SHARE = 0.98;

/** Effects on with an amount above 0, counted in place without allocating. */
export function vjActiveEffectCount(settings: VjEffectSettings): number {
  let count = 0;
  for (let index = 0; index < VJ_EFFECT_IDS.length; index += 1) {
    const effectId = VJ_EFFECT_IDS[index];
    if (effectId !== undefined && vjEffectAmountOf(settings, effectId) > 0) {
      count += 1;
    }
  }
  return count;
}

export interface VjHealthReadInput {
  nowMs: number;
  failedProgramKeys: readonly VjProgramKey[];
  gpuBytes: number;
  flashGuard: VjEngineHealth["flashGuard"];
  ringRefusals: number;
  gifRefusals: number;
}

export class VjCompositorHealth {
  readonly stats = new VjFrameStats();
  renderScale: VjRenderScale = 1;
  private lastScaleStepMs: number | null = null;
  private lastIdleSweepMs: number | null = null;
  private msBelowTarget = 0;
  private msAtTarget = 0;
  private msSinceChange = 0;

  /** Records the frame, steps the render scale once a second and sweeps idle targets every 10 s. */
  stepFrame(
    nowMs: number,
    settings: VjEffectSettings,
    pool: VjTargetPool,
  ): void {
    this.stats.record(nowMs);
    if (this.lastScaleStepMs === null || this.lastIdleSweepMs === null) {
      this.lastScaleStepMs = nowMs;
      this.lastIdleSweepMs = nowMs;
      return;
    }
    if (nowMs - this.lastScaleStepMs >= VJ_SCALE_STEP_MS) {
      this.stepScale(nowMs, nowMs - this.lastScaleStepMs, settings);
      this.lastScaleStepMs = nowMs;
    }
    if (nowMs - this.lastIdleSweepMs >= VJ_IDLE_TARGET_MS) {
      pool.releaseIdle(nowMs, VJ_IDLE_TARGET_MS);
      this.lastIdleSweepMs = nowMs;
    }
  }

  /** After a context restore: the gap is no dropped frame, and the timers start over. */
  reset(): void {
    this.stats.reset();
    this.lastScaleStepMs = null;
    this.lastIdleSweepMs = null;
    this.msBelowTarget = 0;
    this.msAtTarget = 0;
  }

  read(input: VjHealthReadInput): VjEngineHealth {
    const reading = this.stats.read(input.nowMs);
    return {
      fps: reading.fps,
      droppedFrames: reading.droppedFrames,
      refreshIntervalMs: reading.refreshIntervalMs,
      renderScale: this.renderScale,
      isEffectLoadHigh: this.renderScale < 1,
      gpuBytes: input.gpuBytes,
      failedProgramKeys: input.failedProgramKeys,
      flashGuard: input.flashGuard,
      ringRefusals: input.ringRefusals,
      gifRefusals: input.gifRefusals,
    };
  }

  private stepScale(
    nowMs: number,
    elapsedMs: number,
    settings: VjEffectSettings,
  ): void {
    const reading = this.stats.read(nowMs);
    const refreshHz =
      reading.refreshIntervalMs > 0 ? 1000 / reading.refreshIntervalMs : 0;
    const isLow = refreshHz > 0 && reading.fps < refreshHz * LOW_FPS_SHARE;
    const isOnTarget =
      refreshHz > 0 && reading.fps >= refreshHz * TARGET_FPS_SHARE;
    this.msBelowTarget = isLow ? this.msBelowTarget + elapsedMs : 0;
    this.msAtTarget = isOnTarget ? this.msAtTarget + elapsedMs : 0;
    this.msSinceChange += elapsedMs;
    const nextScale = nextVjRenderScale(this.renderScale, {
      fps: reading.fps,
      refreshHz,
      activeEffectCount: vjActiveEffectCount(settings),
      msBelowTarget: this.msBelowTarget,
      msAtTarget: this.msAtTarget,
      msSinceChange: this.msSinceChange,
    });
    if (nextScale === this.renderScale) return;
    this.renderScale = nextScale;
    this.msSinceChange = 0;
    this.msBelowTarget = 0;
    this.msAtTarget = 0;
  }
}
