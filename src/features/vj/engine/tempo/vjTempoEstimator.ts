/**
 * Tempo estimation from onset strengths. Pure: it runs on the numbers the
 * mic input hands it.
 *
 * Input: onset strengths sampled at `VJ_TEMPO_RATE_HZ`, oldest first, the
 * last one at `endTimeSec` (so `strengths[index]` sits at
 * `endTimeSec - (strengths.length - 1 - index) / VJ_TEMPO_RATE_HZ`). Only
 * the last `VJ_TEMPO_WINDOW_SEC` count; under `VJ_TEMPO_MIN_DATA_SEC` answers
 * null.
 *
 * Steps:
 * 1. Remove the mean and smooth with a [1, 2, 1] / 4 kernel, so a click that
 *    lands between two samples still lines up with its neighbours.
 * 2. Autocorrelation `correlation[lag]`, unbiased and normalised by the
 *    zero-lag energy (1 at lag 0, near 0 for noise).
 * 3. The lag in the `bpmMin..bpmMax` range with the highest correlation
 *    weighted by a log-normal prior centred on 120 BPM (sigma half an
 *    octave).
 * 4. One parabolic refinement, then the octave check by comb sums: halve the lag when the odd teeth of the half
 *    lag (half, three halves) hold at least 75% of its even teeth (one, two),
 *    which means the faster pulse is really there; double it when its own odd
 *    teeth hold under half of its even teeth.
 * 5. Parabolic refinement at the lag, then at twice and four times the lag
 *    (each divided back), so the period is accurate to a few hundredths of a
 *    sample.
 * 6. Confidence `clamp01((peak - mean) / VJ_TEMPO_FULL_CONFIDENCE_CORRELATION)`
 *    with the correlation at the lag and the mean over the lag range.
 * 7. Phase: the comb of 4 teeth at the period, slid back over one period in
 *    quarter samples, whose summed smoothed strength is highest gives the
 *    latest beat.
 */
import { VJ_LIMITS } from "../../../../shared/contracts/vj";

export const VJ_TEMPO_RATE_HZ = 100;
export const VJ_TEMPO_WINDOW_SEC = 8;
export const VJ_TEMPO_MIN_DATA_SEC = 4;
/** Centre and width (in octaves) of the tempo prior. */
export const VJ_TEMPO_PRIOR_BPM = 120;
export const VJ_TEMPO_PRIOR_SIGMA_OCTAVES = 0.5;
/** A periodicity this far above the mean correlation reads as full confidence. */
export const VJ_TEMPO_FULL_CONFIDENCE_CORRELATION = 0.5;
/** Odd over even teeth of the half lag at or above this halves the lag. */
export const VJ_TEMPO_HALVE_RATIO = 0.75;
/** Odd over even teeth of the lag under this doubles the lag. */
export const VJ_TEMPO_DOUBLE_RATIO = 0.5;
/** Teeth of the phase comb. */
export const VJ_TEMPO_PHASE_BEATS = 4;

/** Phase search step, in samples. */
const PHASE_STEP_SAMPLES = 0.25;
const SECONDS_PER_MINUTE = 60;

export interface VjTempoEstimate {
  bpm: number;
  /** 0..1. */
  confidence: number;
  /** Time of the latest beat on the strengths' clock, at or before `endTimeSec`. */
  beatAtSec: number;
}

export interface VjTempoLimits {
  bpmMin: number;
  bpmMax: number;
}

interface VjLagRange {
  minLag: number;
  maxLag: number;
}

/** A typed array value; 0 past either end. */
function valueAt(values: Float32Array | Float64Array, index: number): number {
  return values[index] ?? 0;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Smoothed with [1, 2, 1] / 4 (edges repeat), with the mean removed when asked. */
export function smoothedVjStrengths(
  strengths: Float32Array,
  isMeanRemoved: boolean,
): Float32Array {
  const length = strengths.length;
  let mean = 0;
  if (isMeanRemoved) {
    for (let index = 0; index < length; index += 1)
      mean += valueAt(strengths, index);
    mean /= Math.max(1, length);
  }
  const smoothed = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const before = valueAt(strengths, Math.max(0, index - 1));
    const after = valueAt(strengths, Math.min(length - 1, index + 1));
    smoothed[index] =
      0.25 * before + 0.5 * valueAt(strengths, index) + 0.25 * after - mean;
  }
  return smoothed;
}

/** Unbiased autocorrelation over lags 0..maxLag, normalised so lag 0 is 1;
 *  null for a signal with no energy. */
export function vjAutocorrelation(
  signal: Float32Array,
  maxLag: number,
): Float64Array | null {
  const length = signal.length;
  let energy = 0;
  for (let index = 0; index < length; index += 1) {
    energy += valueAt(signal, index) ** 2;
  }
  if (!(energy > 1e-12)) return null;
  const meanEnergy = energy / length;
  const correlation = new Float64Array(maxLag + 1);
  for (let lag = 0; lag <= maxLag; lag += 1) {
    let sum = 0;
    for (let index = 0; index + lag < length; index += 1) {
      sum += valueAt(signal, index) * valueAt(signal, index + lag);
    }
    correlation[lag] = sum / (length - lag) / meanEnergy;
  }
  return correlation;
}

/** Linear interpolation at a fractional lag; null past the computed lags. */
function correlationAt(correlation: Float64Array, lag: number): number | null {
  if (!(lag >= 0)) return null;
  const lower = Math.floor(lag);
  if (lower + 1 >= correlation.length) {
    return lower === correlation.length - 1 && lag === lower
      ? valueAt(correlation, lower)
      : null;
  }
  const fraction = lag - lower;
  return (
    valueAt(correlation, lower) * (1 - fraction) +
    valueAt(correlation, lower + 1) * fraction
  );
}

/** Odd teeth (1, 3) over even teeth (2, 4) of the comb at `lag`; null when
 *  no even tooth fits in the computed lags or the even teeth are not positive. */
function oddEvenTeethRatio(
  correlation: Float64Array,
  lag: number,
): number | null {
  const teethOf = (multiples: readonly number[]): number[] =>
    multiples
      .map((multiple) => correlationAt(correlation, multiple * lag))
      .filter((tooth): tooth is number => tooth !== null);
  const oddTeeth = teethOf([1, 3]);
  const evenTeeth = teethOf([2, 4]);
  if (oddTeeth.length === 0 || evenTeeth.length === 0) return null;
  const oddMean =
    oddTeeth.reduce((sum, tooth) => sum + tooth, 0) / oddTeeth.length;
  const evenMean =
    evenTeeth.reduce((sum, tooth) => sum + tooth, 0) / evenTeeth.length;
  if (!(evenMean > 0)) return null;
  return Math.max(0, oddMean) / evenMean;
}

/** Log-normal prior on the tempo of a lag. */
function priorWeightOf(lag: number): number {
  const bpm = (SECONDS_PER_MINUTE * VJ_TEMPO_RATE_HZ) / lag;
  const octaves = Math.log2(bpm / VJ_TEMPO_PRIOR_BPM);
  const standardised = octaves / VJ_TEMPO_PRIOR_SIGMA_OCTAVES;
  return Math.exp(-0.5 * standardised * standardised);
}

function strongestWeightedLag(
  correlation: Float64Array,
  range: VjLagRange,
): number {
  let bestLag = range.minLag;
  let bestScore = -Infinity;
  for (let lag = range.minLag; lag <= range.maxLag; lag += 1) {
    const score = valueAt(correlation, lag) * priorWeightOf(lag);
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  return bestLag;
}

/** Halves or doubles the lag when the comb teeth say the other octave is the pulse. */
function octaveCheckedLag(
  correlation: Float64Array,
  lag: number,
  range: VjLagRange,
): number {
  let checkedLag = lag;
  const halfLag = checkedLag / 2;
  if (halfLag >= range.minLag) {
    const halfRatio = oddEvenTeethRatio(correlation, halfLag);
    if (halfRatio !== null && halfRatio >= VJ_TEMPO_HALVE_RATIO) {
      checkedLag = halfLag;
    }
  }
  if (checkedLag * 2 <= range.maxLag) {
    const ownRatio = oddEvenTeethRatio(correlation, checkedLag);
    if (ownRatio !== null && ownRatio < VJ_TEMPO_DOUBLE_RATIO) {
      checkedLag *= 2;
    }
  }
  return checkedLag;
}

/** The parabola peak near `centre` (within one sample), or null without a peak there. */
function parabolicPeakNear(
  correlation: Float64Array,
  centre: number,
): number | null {
  const rounded = Math.round(centre);
  let peakIndex = -1;
  let peakValue = -Infinity;
  for (let index = rounded - 1; index <= rounded + 1; index += 1) {
    if (index < 1 || index + 1 >= correlation.length) return null;
    if (valueAt(correlation, index) > peakValue) {
      peakValue = valueAt(correlation, index);
      peakIndex = index;
    }
  }
  const before = valueAt(correlation, peakIndex - 1);
  const after = valueAt(correlation, peakIndex + 1);
  const curvature = before - 2 * peakValue + after;
  if (!(curvature < 0)) return null;
  const offset = (0.5 * (before - after)) / curvature;
  return peakIndex + Math.max(-0.5, Math.min(0.5, offset));
}

/** Refines the period at the lag, then at its second and fourth teeth. */
function refinedLag(correlation: Float64Array, lag: number): number {
  let refined = lag;
  for (const multiple of [1, 2, 4]) {
    const peak = parabolicPeakNear(correlation, refined * multiple);
    if (peak !== null) refined = peak / multiple;
  }
  return refined;
}

/** Time of the latest beat: the comb of 4 teeth at `lag` with the highest
 *  summed strength, slid back over one period from the newest sample. */
function latestBeatTimeSec(
  strengths: Float32Array,
  lag: number,
  endTimeSec: number,
): number {
  const lastIndex = strengths.length - 1;
  let bestOffset = 0;
  let bestScore = -Infinity;
  for (let offset = 0; offset < lag; offset += PHASE_STEP_SAMPLES) {
    let score = 0;
    for (let beat = 0; beat < VJ_TEMPO_PHASE_BEATS; beat += 1) {
      const position = lastIndex - offset - beat * lag;
      if (position < 0) break;
      const lower = Math.floor(position);
      const fraction = position - lower;
      const upper = Math.min(lastIndex, lower + 1);
      score +=
        valueAt(strengths, lower) * (1 - fraction) +
        valueAt(strengths, upper) * fraction;
    }
    if (score > bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }
  return endTimeSec - bestOffset / VJ_TEMPO_RATE_HZ;
}

function meanCorrelation(correlation: Float64Array, range: VjLagRange): number {
  let sum = 0;
  for (let lag = range.minLag; lag <= range.maxLag; lag += 1) {
    sum += valueAt(correlation, lag);
  }
  return sum / (range.maxLag - range.minLag + 1);
}

function lagRangeOf(limits: VjTempoLimits): VjLagRange {
  const samplesPerMinute = SECONDS_PER_MINUTE * VJ_TEMPO_RATE_HZ;
  const minLag = Math.max(2, Math.floor(samplesPerMinute / limits.bpmMax));
  const maxLag = Math.max(minLag, Math.ceil(samplesPerMinute / limits.bpmMin));
  return { minLag, maxLag };
}

/** The tempo, confidence and latest beat of the strengths; null under 4 s
 *  of data or when the strengths hold no energy at all. */
export function estimateVjTempo(
  strengths: Float32Array,
  endTimeSec: number,
  limits: VjTempoLimits = {
    bpmMin: VJ_LIMITS.bpmMin,
    bpmMax: VJ_LIMITS.bpmMax,
  },
): VjTempoEstimate | null {
  const minSamples = VJ_TEMPO_MIN_DATA_SEC * VJ_TEMPO_RATE_HZ;
  if (strengths.length < minSamples || !Number.isFinite(endTimeSec)) {
    return null;
  }
  const windowSamples = VJ_TEMPO_WINDOW_SEC * VJ_TEMPO_RATE_HZ;
  const window = strengths.subarray(
    Math.max(0, strengths.length - windowSamples),
  );
  const range = lagRangeOf(limits);
  const maxComputedLag = Math.max(
    range.maxLag + 1,
    Math.floor(window.length / 2),
  );
  const correlation = vjAutocorrelation(
    smoothedVjStrengths(window, true),
    Math.min(maxComputedLag, window.length - 1),
  );
  if (correlation === null || correlation.length <= range.maxLag + 1) {
    return null;
  }
  const weightedLag = strongestWeightedLag(correlation, range);
  // Refine once before the octave check, so its teeth at three and four
  // times the lag do not drift off the peaks.
  const firstLag = parabolicPeakNear(correlation, weightedLag) ?? weightedLag;
  const lag = refinedLag(
    correlation,
    octaveCheckedLag(correlation, firstLag, range),
  );
  const peak =
    correlationAt(correlation, lag) ?? valueAt(correlation, weightedLag);
  const confidence = clampUnit(
    (peak - meanCorrelation(correlation, range)) /
      VJ_TEMPO_FULL_CONFIDENCE_CORRELATION,
  );
  const rawBpm = (SECONDS_PER_MINUTE * VJ_TEMPO_RATE_HZ) / lag;
  const bpm = Math.min(limits.bpmMax, Math.max(limits.bpmMin, rawBpm));
  const beatAtSec = latestBeatTimeSec(
    smoothedVjStrengths(window, false),
    lag,
    endTimeSec,
  );
  return { bpm, confidence, beatAtSec };
}
