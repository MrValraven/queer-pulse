/** One second-order IIR section, normalised so a0 is 1. */
export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/** The two delay values a filter carries from one chunk to the next. */
export interface BiquadState {
  first: number;
  second: number;
}

const SHELF_FREQUENCY = 1681.974450955533;
const SHELF_GAIN_DB = 3.999843853973347;
const SHELF_Q = 0.7071752369554196;
const HIGH_PASS_FREQUENCY = 38.13547087602444;
const HIGH_PASS_Q = 0.5003270373238773;

/**
 * The K-weighting of ITU-R BS.1770-4: a high shelf for the head, then the
 * RLB high-pass. The standard tabulates 48 kHz only, so both stages are
 * derived from their analogue prototypes for the buffer's real sample rate
 * (the libebur128 derivation), which reproduces the table exactly at 48 kHz.
 */
export function kWeightingCoefficients(sampleRate: number): {
  shelf: BiquadCoefficients;
  highPass: BiquadCoefficients;
} {
  const shelfK = Math.tan((Math.PI * SHELF_FREQUENCY) / sampleRate);
  const shelfKSquared = shelfK * shelfK;
  const highGain = 10 ** (SHELF_GAIN_DB / 20);
  const bandGain = highGain ** 0.4996667741545416;
  const shelfNorm = 1 + shelfK / SHELF_Q + shelfKSquared;
  const highPassK = Math.tan((Math.PI * HIGH_PASS_FREQUENCY) / sampleRate);
  const highPassKSquared = highPassK * highPassK;
  const highPassNorm = 1 + highPassK / HIGH_PASS_Q + highPassKSquared;
  return {
    shelf: {
      b0:
        (highGain + (bandGain * shelfK) / SHELF_Q + shelfKSquared) / shelfNorm,
      b1: (2 * (shelfKSquared - highGain)) / shelfNorm,
      b2:
        (highGain - (bandGain * shelfK) / SHELF_Q + shelfKSquared) / shelfNorm,
      a1: (2 * (shelfKSquared - 1)) / shelfNorm,
      a2: (1 - shelfK / SHELF_Q + shelfKSquared) / shelfNorm,
    },
    highPass: {
      b0: 1,
      b1: -2,
      b2: 1,
      a1: (2 * (highPassKSquared - 1)) / highPassNorm,
      a2: (1 - highPassK / HIGH_PASS_Q + highPassKSquared) / highPassNorm,
    },
  };
}

/** Filters `length` samples of `input` into `output` (transposed direct
 *  form II) and keeps the delay state for the next chunk. */
export function runBiquad(
  coefficients: BiquadCoefficients,
  state: BiquadState,
  input: Float32Array | Float64Array,
  output: Float64Array,
  length: number,
): void {
  let first = state.first;
  let second = state.second;
  for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
    const sample = input[sampleIndex] ?? 0;
    const filtered = coefficients.b0 * sample + first;
    first = coefficients.b1 * sample - coefficients.a1 * filtered + second;
    second = coefficients.b2 * sample - coefficients.a2 * filtered;
    output[sampleIndex] = filtered;
  }
  state.first = first;
  state.second = second;
}
