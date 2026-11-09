import {
  QUIZSHOW_LIMITS,
  type QuizshowWheelSpin,
} from "../../../shared/contracts/quizshow";
import {
  wheelAngleModulo,
  wheelSpinEndAngle,
  wheelSpinLandsAt,
} from "../quizshowWheel";

/** Contract 7.3: the TV shows the landed panel this long after the stop. */
export const QUIZSHOW_WHEEL_PANEL_DELAY_MS = 250;
/** Contract 8.4: the landed panel cross-fade. */
export const QUIZSHOW_WHEEL_PANEL_FADE_MS = 450;
/** The approved mockup: the dim of the unlanded slices fades over this long. */
export const QUIZSHOW_WHEEL_DIM_FADE_MS = 500;
/** The approved mockup: one pointer kick lasts this long. */
export const QUIZSHOW_WHEEL_KICK_MS = 160;
/** The approved mockup: the pointer swings back this far, at 35% of the kick. */
export const QUIZSHOW_WHEEL_KICK_DEGREES = -16;

const FULL_TURN_DEGREES = 360;

/** Quartic ease out, clamped to the 0 to 1 range. */
export function wheelEaseOut(progress: number): number {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return 1 - (1 - clampedProgress) ** 4;
}

/**
 * Contract 7.2 and 7.4. Normal: progress from startedAt over durationMs.
 * Reduced motion: holds at startAngle until landsAt - wheelSpinReducedMotionMs,
 * then turns over min(wheelSpinReducedMotionMs, durationMs) with the same ease,
 * ending at landsAt. That short turn travels under one full turn: it starts
 * from the angle that matches startAngle on the disc and sits within 360
 * degrees of the end, so the held disc looks the same before and after.
 * A spin with no duration shows its end angle.
 */
export function wheelRotationAt(
  spin: QuizshowWheelSpin,
  drawnCount: number,
  serverNowMs: number,
  isReducedMotion: boolean,
): number {
  const endAngle = wheelSpinEndAngle(spin, drawnCount);
  if (spin.durationMs <= 0) return endAngle;
  if (!isReducedMotion) {
    const progress = (serverNowMs - spin.startedAt) / spin.durationMs;
    return (
      spin.startAngle + (endAngle - spin.startAngle) * wheelEaseOut(progress)
    );
  }
  const turnMs = Math.min(
    QUIZSHOW_LIMITS.wheelSpinReducedMotionMs,
    spin.durationMs,
  );
  const progress = (serverNowMs - (wheelSpinLandsAt(spin) - turnMs)) / turnMs;
  if (progress <= 0) return spin.startAngle;
  const turnStartAngle =
    endAngle - wheelAngleModulo(endAngle - spin.startAngle, FULL_TURN_DEGREES);
  return turnStartAngle + (endAngle - turnStartAngle) * wheelEaseOut(progress);
}

/** How many pegs have crossed the pointer at this rotation: floor((rotation - wheelPointerAngle) / (360 / drawnCount)). */
export function wheelPegCount(
  rotationDegrees: number,
  drawnCount: number,
): number {
  const sweepDegrees = FULL_TURN_DEGREES / drawnCount;
  return Math.floor(
    (rotationDegrees - QUIZSHOW_LIMITS.wheelPointerAngle) / sweepDegrees,
  );
}
