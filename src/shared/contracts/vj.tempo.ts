/**
 * VJ wire contract (C 3), frontend mirror of `queerpulse-backend/src/vj/vj.contract.ts`
 * and `vj-response.ts`. Names and values match it; edit both together.
 * Tempo, transition timing and clock sync helpers (C 3.6), pure on both sides.
 */

import { VJ_BEATS_PER_BAR, VJ_LIMITS } from "./vj.lists";
import type {
  VjShuffle,
  VjStepDuration,
  VjTempo,
  VjTransition,
} from "./vj.state";

/** Rounds an amount to the 0.01 step. */
export function roundVjAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Milliseconds of one beat. */
export function vjBeatMs(bpm: number): number {
  return 60000 / bpm;
}

export interface VjBeatPosition {
  /** Whole beats since tempo.downbeatAt; negative before it. */
  beatIndex: number;
  barIndex: number;
  /** 0..3; 0 is the "1". */
  beatInBar: number;
  /** 0 (on the beat) up to but excluding 1. */
  phase: number;
}

/** Half a millisecond: boundaries are rounded to whole ms, so a time within
 *  this of a fractional boundary counts as on it. */
const VJ_BOUNDARY_TOLERANCE_MS = 0.5;

/** The beat, bar and phase of `serverTime` on the tempo grid; a time within
 *  half a millisecond of a beat reads as on that beat. */
export function vjBeatPositionAt(
  tempo: VjTempo,
  serverTime: number,
): VjBeatPosition {
  return writeVjBeatPositionAt(
    { beatIndex: 0, barIndex: 0, beatInBar: 0, phase: 0 },
    tempo,
    serverTime,
  );
}

/** vjBeatPositionAt written into `out` (and answered), so a frame loop
 *  reuses one object and allocates nothing. */
export function writeVjBeatPositionAt(
  out: VjBeatPosition,
  tempo: VjTempo,
  serverTime: number,
): VjBeatPosition {
  const beatMs = vjBeatMs(tempo.bpm);
  const msSinceDownbeat = serverTime - tempo.downbeatAt;
  const beatIndex = Math.floor(
    (msSinceDownbeat + VJ_BOUNDARY_TOLERANCE_MS) / beatMs,
  );
  out.beatIndex = beatIndex;
  out.barIndex = Math.floor(beatIndex / VJ_BEATS_PER_BAR);
  out.beatInBar =
    ((beatIndex % VJ_BEATS_PER_BAR) + VJ_BEATS_PER_BAR) % VJ_BEATS_PER_BAR;
  out.phase = Math.max(0, msSinceDownbeat / beatMs - beatIndex);
  return out;
}

/** The first beat (or bar) boundary at or after `earliest`, integer server ms.
 *  A boundary this returns, fed back as `earliest`, answers itself. */
export function vjNextBoundaryAt(
  tempo: VjTempo,
  unit: "beat" | "bar",
  earliest: number,
): number {
  const unitMs = vjBeatMs(tempo.bpm) * (unit === "bar" ? VJ_BEATS_PER_BAR : 1);
  const unitsAhead = Math.ceil(
    (earliest - tempo.downbeatAt - VJ_BOUNDARY_TOLERANCE_MS) / unitMs,
  );
  return Math.round(tempo.downbeatAt + unitsAhead * unitMs);
}

/** The last "1" at or before `serverTime`, integer server ms. A bar boundary
 *  this returns answers itself. */
export function vjLastDownbeatAt(tempo: VjTempo, serverTime: number): number {
  const barMs = vjBeatMs(tempo.bpm) * VJ_BEATS_PER_BAR;
  const barsSinceDownbeat = Math.floor(
    (serverTime - tempo.downbeatAt + VJ_BOUNDARY_TOLERANCE_MS) / barMs,
  );
  return Math.round(tempo.downbeatAt + barsSinceDownbeat * barMs);
}

/** Where a quantized change lands when the server receives it at `now`; null when quantize is off. */
export function vjQuantizedApplyAt(tempo: VjTempo, now: number): number | null {
  if (tempo.quantize === "off") return null;
  return vjNextBoundaryAt(
    tempo,
    tempo.quantize,
    now + VJ_LIMITS.quantizeMinLeadMs,
  );
}

/** A transition's length in ms; beats use tempo.bpm; "cut" is 0. */
export function vjTransitionLengthMs(
  transition: VjTransition,
  tempo: VjTempo,
): number {
  if (transition.mode === "cut") return 0;
  if (transition.length.unit === "ms") return transition.length.value;
  return Math.round(transition.length.value * vjBeatMs(tempo.bpm));
}

/** Blackout fades over the transition length, capped at 4000 ms. */
export function vjBlackoutFadeMs(
  transition: VjTransition,
  tempo: VjTempo,
): number {
  return Math.min(VJ_LIMITS.fadeMsMax, vjTransitionLengthMs(transition, tempo));
}

/** Shuffle interval in milliseconds, computed identically on screen, remote and demo; beats read tempo.bpm. */
export function vjShuffleIntervalMs(
  shuffle: VjShuffle,
  tempo: VjTempo,
): number {
  if (shuffle.intervalKind === "seconds") return shuffle.intervalValue * 1000;
  return Math.round((shuffle.intervalValue * 60000) / tempo.bpm);
}

/** A step length in ms with the tempo at the moment the step starts:
 *  seconds give value * 1000, beats give Math.round(value * 60000 / tempo.bpm). */
export function vjStepDurationMs(
  duration: VjStepDuration,
  tempo: VjTempo,
): number {
  if (duration.kind === "seconds") {
    return duration.value * 1000;
  }
  return Math.round((duration.value * 60000) / tempo.bpm);
}

/** One flash per beat, capped at 3 per second at any tempo. Callers pass tempo.bpm. */
export function vjStrobeFlashesPerSecond(bpm: number): number {
  return Math.min(VJ_LIMITS.strobeMaxFlashesPerSecond, bpm / 60);
}

// Clock sync (C 3.6). The local clock is performance.timeOrigin + performance.now().

export interface VjClockSample {
  /** Local ms when the frame was emitted. */
  sentAt: number;
  /** Local ms when its ack arrived. */
  receivedAt: number;
  /** The ack's serverNow. */
  serverNow: number;
}

export const VJ_CLOCK_SAMPLES_KEPT = 9;
export const VJ_CLOCK_BEST_SAMPLES = 5;
export const VJ_CLOCK_MAX_ROUND_TRIP_MS = 1000;

/**
 * serverNow minus the local midpoint, as the median over the 5 fastest of
 * the last 9 samples (round trip at most 1000 ms); null with no usable sample.
 * Synced server time is local time plus this offset.
 */
export function vjClockOffsetMs(
  samples: readonly VjClockSample[],
): number | null {
  const sortedOffsets = samples
    .slice(-VJ_CLOCK_SAMPLES_KEPT)
    .map((sample) => ({
      roundTripMs: sample.receivedAt - sample.sentAt,
      offsetMs: sample.serverNow - (sample.sentAt + sample.receivedAt) / 2,
    }))
    .filter(
      (measurement) =>
        Number.isFinite(measurement.roundTripMs) &&
        Number.isFinite(measurement.offsetMs) &&
        measurement.roundTripMs >= 0 &&
        measurement.roundTripMs <= VJ_CLOCK_MAX_ROUND_TRIP_MS,
    )
    .sort((first, second) => first.roundTripMs - second.roundTripMs)
    .slice(0, VJ_CLOCK_BEST_SAMPLES)
    .map((measurement) => measurement.offsetMs)
    .sort((first, second) => first - second);
  const middleIndex = Math.floor(sortedOffsets.length / 2);
  const upperMiddle = sortedOffsets[middleIndex];
  if (upperMiddle === undefined) return null;
  if (sortedOffsets.length % 2 === 1) return upperMiddle;
  const lowerMiddle = sortedOffsets[middleIndex - 1] ?? upperMiddle;
  return (lowerMiddle + upperMiddle) / 2;
}
