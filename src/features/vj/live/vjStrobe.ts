/**
 * Strobe timing. Safety rule: at most 3 visible flash starts in any one-second
 * window at any tempo. The contract helper caps the rate; this file adds a
 * local floor on the period so a bad bpm can never shorten it. The floor sits
 * well above 1000 / 3 because a flash only shows on the next painted frame:
 * four starts 400 ms apart span 1200 ms, so even with a frame of delay on the
 * first one and none on the last a fourth never fits in one second.
 */
import {
  VJ_LIMITS,
  vjStrobeFlashesPerSecond,
} from "../../../shared/contracts/vj";

/** 2.5 flashes a second at most: a wide safety margin under the 3 a second limit. */
export const VJ_STROBE_MIN_PERIOD_MS = 400;
/** How long each white flash stays up. */
export const VJ_STROBE_FLASH_MS = 60;

/** A usable tempo: anything that is not a finite positive number reads as the default tempo. */
function strobeTempoOf(bpm: number): number {
  return Number.isFinite(bpm) && bpm > 0 ? bpm : VJ_LIMITS.bpmDefault;
}

/** Time from one flash start to the next: at least VJ_STROBE_MIN_PERIOD_MS. */
export function vjStrobePeriodMs(bpm: number): number {
  const flashesPerSecond = vjStrobeFlashesPerSecond(strobeTempoOf(bpm));
  const beatPeriodMs = Math.ceil(1000 / flashesPerSecond);
  if (!Number.isFinite(beatPeriodMs)) return VJ_STROBE_MIN_PERIOD_MS;
  return Math.max(VJ_STROBE_MIN_PERIOD_MS, beatPeriodMs);
}

/** Every flash start from 0 within durationMs, for tests and the flash hook. */
export function vjStrobeFlashStartsMs(
  bpm: number,
  durationMs: number,
): number[] {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return [];
  const periodMs = vjStrobePeriodMs(bpm);
  const flashStartsMs: number[] = [];
  for (
    let flashStartMs = 0;
    flashStartMs < durationMs;
    flashStartMs += periodMs
  ) {
    flashStartsMs.push(flashStartMs);
  }
  return flashStartsMs;
}
