/**
 * Onset detection on the microphone envelope. Pure: it runs on the numbers
 * the mic input hands it.
 *
 * Each envelope sample gives an onset strength: the half-wave rectified rise
 * of log energy since the previous sample, `0.6 * low band + 0.4 * full
 * band`. A sample is an onset when it is a local maximum, sits above the
 * adaptive threshold (median of the last 1.5 s of strengths plus 1.5 times
 * their median absolute deviation, at least `VJ_ONSET_MIN_STRENGTH`) and
 * comes at least `VJ_ONSET_MIN_GAP_SEC` after the previous onset. The local
 * maximum test needs the next sample, so an onset is reported one sample
 * late with its own time.
 *
 * The detector keeps strengths and times only; audio never leaves the device
 * and nothing is stored. Its buffers are allocated once.
 */

/** One hop of the microphone envelope. */
export interface VjEnvelopeSample {
  /** Audio clock time in seconds at the middle of the hop. */
  timeSec: number;
  /** RMS of the hop, full scale 1. */
  rms: number;
  /** Mean square of the low band (one-pole 150 Hz low-pass) over the hop. */
  lowEnergy: number;
}

export interface VjOnsetDetector {
  /** Natural log of the previous hop's full band energy; null before the first hop. */
  previousLogEnergy: number | null;
  /** Natural log of the previous hop's low band energy; null before the first hop. */
  previousLogLowEnergy: number | null;
  /** Ring of the recent strengths and their times (the 1.5 s threshold history). */
  readonly historyTimesSec: Float64Array;
  readonly historyStrengths: Float32Array;
  historyWriteIndex: number;
  historyCount: number;
  /** The previous sample: the onset candidate once the next sample arrives. */
  previousStrength: number;
  previousTimeSec: number;
  /** The sample before the previous one. */
  beforePreviousStrength: number;
  /** Samples seen so far, capped at 2 (the local maximum test needs two). */
  seenCount: number;
  lastOnsetSec: number | null;
  /** Sort buffer for the median and deviation. */
  readonly scratch: Float32Array;
}

export interface VjOnsetResult {
  /** The newest sample's onset strength (0 or more). */
  strength: number;
  /** The time of an onset confirmed by this sample, or null. */
  onsetAtSec: number | null;
}

export const VJ_ONSET_MIN_GAP_SEC = 0.1;
export const VJ_ONSET_HISTORY_SEC = 1.5;
/** The threshold never sinks under this, so steady noise makes no onsets
 *  (a rise of about 1.3 dB in both bands). */
export const VJ_ONSET_MIN_STRENGTH = 0.3;
export const VJ_ONSET_LOW_WEIGHT = 0.6;
export const VJ_ONSET_FULL_WEIGHT = 0.4;
/** How many median absolute deviations above the median the threshold sits. */
export const VJ_ONSET_DEVIATION_FACTOR = 1.5;

/** Energy of the -60 dBFS floor; quieter hops read as the floor. */
const ENERGY_FLOOR = 1e-6;
/** 1.5 s of hops at up to about 340 hops per second. */
const HISTORY_CAPACITY = 512;
/** Float tolerance on the gap between onsets. */
const GAP_TOLERANCE_SEC = 1e-6;

export function createVjOnsetDetector(): VjOnsetDetector {
  return {
    previousLogEnergy: null,
    previousLogLowEnergy: null,
    historyTimesSec: new Float64Array(HISTORY_CAPACITY),
    historyStrengths: new Float32Array(HISTORY_CAPACITY),
    historyWriteIndex: 0,
    historyCount: 0,
    previousStrength: 0,
    previousTimeSec: 0,
    beforePreviousStrength: 0,
    seenCount: 0,
    lastOnsetSec: null,
    scratch: new Float32Array(HISTORY_CAPACITY),
  };
}

function logEnergyOf(energy: number): number {
  const safeEnergy = Number.isFinite(energy) ? Math.abs(energy) : 0;
  return Math.log(Math.max(ENERGY_FLOOR, safeEnergy));
}

function recordHistory(
  detector: VjOnsetDetector,
  timeSec: number,
  strength: number,
): void {
  detector.historyTimesSec[detector.historyWriteIndex] = timeSec;
  detector.historyStrengths[detector.historyWriteIndex] = strength;
  detector.historyWriteIndex =
    (detector.historyWriteIndex + 1) % HISTORY_CAPACITY;
  if (detector.historyCount < HISTORY_CAPACITY) detector.historyCount += 1;
}

/** Median of the first `count` values of `values`, sorting them in place. */
function sortedMedian(values: Float32Array, count: number): number {
  const sorted = values.subarray(0, count).sort();
  const middle = Math.floor(count / 2);
  const upper = sorted[middle] ?? 0;
  return count % 2 === 1 ? upper : ((sorted[middle - 1] ?? 0) + upper) / 2;
}

/** Median plus 1.5 median absolute deviations of the strengths in the last
 *  1.5 s before `nowSec`, at least the minimum strength. */
export function vjOnsetThreshold(
  detector: VjOnsetDetector,
  nowSec: number,
): number {
  let count = 0;
  for (let offset = 0; offset < detector.historyCount; offset += 1) {
    const index =
      (detector.historyWriteIndex - 1 - offset + HISTORY_CAPACITY) %
      HISTORY_CAPACITY;
    const timeSec = detector.historyTimesSec[index] ?? 0;
    if (nowSec - timeSec > VJ_ONSET_HISTORY_SEC) break;
    detector.scratch[count] = detector.historyStrengths[index] ?? 0;
    count += 1;
  }
  if (count === 0) return VJ_ONSET_MIN_STRENGTH;
  const median = sortedMedian(detector.scratch, count);
  for (let index = 0; index < count; index += 1) {
    detector.scratch[index] = Math.abs((detector.scratch[index] ?? 0) - median);
  }
  const deviation = sortedMedian(detector.scratch, count);
  return Math.max(
    VJ_ONSET_MIN_STRENGTH,
    median + VJ_ONSET_DEVIATION_FACTOR * deviation,
  );
}

/** Whether the previous sample is an onset, now that `strength` follows it. */
function isPreviousSampleOnset(
  detector: VjOnsetDetector,
  strength: number,
  nowSec: number,
): boolean {
  if (detector.seenCount < 2) return false;
  const candidate = detector.previousStrength;
  const isLocalMaximum =
    candidate > detector.beforePreviousStrength && candidate >= strength;
  if (!isLocalMaximum) return false;
  const isSpaced =
    detector.lastOnsetSec === null ||
    detector.previousTimeSec - detector.lastOnsetSec >=
      VJ_ONSET_MIN_GAP_SEC - GAP_TOLERANCE_SEC;
  if (!isSpaced) return false;
  return candidate > vjOnsetThreshold(detector, nowSec);
}

/** Feeds one envelope sample; mutates the detector. */
export function pushVjEnvelope(
  detector: VjOnsetDetector,
  sample: VjEnvelopeSample,
): VjOnsetResult {
  if (!Number.isFinite(sample.timeSec)) {
    return { strength: 0, onsetAtSec: null };
  }
  const safeRms = Number.isFinite(sample.rms) ? sample.rms : 0;
  const logEnergy = logEnergyOf(safeRms * safeRms);
  const logLowEnergy = logEnergyOf(sample.lowEnergy);
  let strength = 0;
  if (
    detector.previousLogEnergy !== null &&
    detector.previousLogLowEnergy !== null
  ) {
    strength =
      VJ_ONSET_LOW_WEIGHT *
        Math.max(0, logLowEnergy - detector.previousLogLowEnergy) +
      VJ_ONSET_FULL_WEIGHT *
        Math.max(0, logEnergy - detector.previousLogEnergy);
  }
  detector.previousLogEnergy = logEnergy;
  detector.previousLogLowEnergy = logLowEnergy;
  recordHistory(detector, sample.timeSec, strength);

  let onsetAtSec: number | null = null;
  if (isPreviousSampleOnset(detector, strength, sample.timeSec)) {
    onsetAtSec = detector.previousTimeSec;
    detector.lastOnsetSec = onsetAtSec;
  }
  detector.beforePreviousStrength = detector.previousStrength;
  detector.previousStrength = strength;
  detector.previousTimeSec = sample.timeSec;
  if (detector.seenCount < 2) detector.seenCount += 1;
  return { strength, onsetAtSec };
}
