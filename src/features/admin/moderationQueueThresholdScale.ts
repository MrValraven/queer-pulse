import type { ModerationQueueThresholdBandDTO } from "./api/moderationHealth.api";

/**
 * The maths behind one threshold meter on the queue-health cards (TS-04).
 *
 * The scale runs a quarter past the critical level, so a figure already past
 * critical visibly overflows the critical tick and a figure sitting exactly on
 * it does not fill the whole track. Both levels come off `entry.thresholds`,
 * so the meter moves with the policy the server judged the queue by.
 */
const SCALE_HEADROOM = 1.25;

/** The smallest fill drawn for a value above zero, so "one item" still shows. */
const MINIMUM_VISIBLE_FRACTION = 0.03;

/** Which band a figure sits in: under the warning level, between, or past. */
export type ThresholdMeterLevel = "calm" | "warning" | "critical";

export interface ThresholdMeterReading {
  /** How much of the track the fill covers, from 0 to 1. */
  fillFraction: number;
  /** Where the warning tick sits along the track, from 0 to 1. */
  warningPosition: number;
  /** Where the critical tick sits along the track, from 0 to 1. */
  criticalPosition: number;
  level: ThresholdMeterLevel;
}

function clampFraction(fraction: number): number {
  return Math.min(1, Math.max(0, fraction));
}

export function thresholdMeterLevel(
  value: number,
  band: ModerationQueueThresholdBandDTO,
): ThresholdMeterLevel {
  if (value >= band.critical) return "critical";
  if (value >= band.warning) return "warning";
  return "calm";
}

export function readThresholdMeter(
  value: number,
  band: ModerationQueueThresholdBandDTO,
): ThresholdMeterReading {
  const scaleMax = band.critical * SCALE_HEADROOM;
  const level = thresholdMeterLevel(value, band);
  if (scaleMax <= 0) {
    // A band at zero trips on anything, so the track is either empty or full.
    return {
      fillFraction: value > 0 ? 1 : 0,
      warningPosition: 0,
      criticalPosition: 0,
      level,
    };
  }
  const rawFraction = clampFraction(value / scaleMax);
  return {
    fillFraction:
      value > 0 ? Math.max(rawFraction, MINIMUM_VISIBLE_FRACTION) : 0,
    warningPosition: clampFraction(band.warning / scaleMax),
    criticalPosition: clampFraction(band.critical / scaleMax),
    level,
  };
}
