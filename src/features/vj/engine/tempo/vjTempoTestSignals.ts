/**
 * Synthetic microphone envelopes for the tempo tests: seeded click trains
 * with timing jitter over a quiet noise floor, and steady noise. Each hop
 * matches what the mic worklet posts (`VjEnvelopeSample`): RMS of the hop and
 * the mean square of its low band, at the middle of the hop.
 *
 * A click is a burst whose amplitude decays exponentially; its energy is
 * integrated over each hop it overlaps, so a click that lands late in a hop
 * shows as a small rise there and the rest in the next hop, the way a real
 * hop would. The noise floor wanders by `noiseDepth` per hop (uniform), so
 * consecutive hops differ by at most `2 * ln((1 + depth) / (1 - depth))` in
 * log energy.
 */
import {
  createVjOnsetDetector,
  pushVjEnvelope,
  type VjEnvelopeSample,
} from "./vjOnsetDetector";

export interface VjClickTrainOptions {
  bpm: number;
  durationSec: number;
  /** Hops per second; 100 matches `VJ_TEMPO_RATE_HZ`. */
  rateHz?: number;
  /** Each click moves by up to this many ms either way. */
  jitterMs?: number;
  seed?: number;
  firstClickSec?: number;
  clickAmplitude?: number;
  /** The amplitude falls by e over this many ms. */
  decayMs?: number;
  noiseAmplitude?: number;
  noiseDepth?: number;
}

export interface VjNoiseOptions {
  durationSec: number;
  rateHz?: number;
  amplitude?: number;
  /** The hop RMS wanders by up to this fraction either way. */
  depth?: number;
  seed?: number;
}

export interface VjClickTrainSignal {
  samples: VjEnvelopeSample[];
  /** True click times in seconds, jitter included. */
  clickTimesSec: number[];
}

export interface VjDetectedStrengths {
  strengths: Float32Array;
  onsetsSec: number[];
  /** Time of the last strength. */
  endTimeSec: number;
}

/** Share of the burst energy in the low band, and of the noise floor. */
const CLICK_LOW_SHARE = 0.5;
const NOISE_LOW_SHARE = 0.3;
/** Clicks older than this many decay times add nothing worth counting. */
const CLICK_REACH_DECAYS = 12;
/** No click starts this close to the end, so each one is confirmed. */
const CLICK_END_MARGIN_SEC = 0.2;

/** Deterministic uniform numbers in [0, 1) (mulberry32). */
export function createVjSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function wanderingAmplitude(
  amplitude: number,
  depth: number,
  random: () => number,
): number {
  return amplitude * (1 + depth * (2 * random() - 1));
}

function clickTimesOf(
  options: VjClickTrainOptions,
  random: () => number,
): number[] {
  const beatSec = 60 / options.bpm;
  const jitterSec = (options.jitterMs ?? 0) / 1000;
  const clickTimes: number[] = [];
  const lastStartSec = options.durationSec - CLICK_END_MARGIN_SEC;
  for (
    let beatTimeSec = options.firstClickSec ?? 0.25;
    beatTimeSec < lastStartSec;
    beatTimeSec += beatSec
  ) {
    clickTimes.push(beatTimeSec + jitterSec * (2 * random() - 1));
  }
  return clickTimes;
}

/** Mean burst energy of every click over the hop [startSec, endSec). */
function clickEnergyInHop(
  clickTimes: readonly number[],
  startSec: number,
  endSec: number,
  amplitude: number,
  decaySec: number,
): number {
  const energyDecaySec = decaySec / 2;
  let energy = 0;
  for (const clickSec of clickTimes) {
    if (clickSec >= endSec) break;
    if (endSec - clickSec > CLICK_REACH_DECAYS * decaySec) continue;
    const fromSec = Math.max(startSec, clickSec);
    energy +=
      amplitude *
      amplitude *
      energyDecaySec *
      (Math.exp(-(fromSec - clickSec) / energyDecaySec) -
        Math.exp(-(endSec - clickSec) / energyDecaySec));
  }
  return energy / (endSec - startSec);
}

/** A click train envelope with its true click times. */
export function vjClickTrainEnvelope(
  options: VjClickTrainOptions,
): VjClickTrainSignal {
  const random = createVjSeededRandom(options.seed ?? 1);
  const rateHz = options.rateHz ?? 100;
  const clickTimesSec = clickTimesOf(options, random);
  const hopCount = Math.round(options.durationSec * rateHz);
  const samples: VjEnvelopeSample[] = [];
  for (let hopIndex = 0; hopIndex < hopCount; hopIndex += 1) {
    const startSec = hopIndex / rateHz;
    const endSec = (hopIndex + 1) / rateHz;
    const clickEnergy = clickEnergyInHop(
      clickTimesSec,
      startSec,
      endSec,
      options.clickAmplitude ?? 0.5,
      (options.decayMs ?? 40) / 1000,
    );
    const noiseAmplitude = options.noiseAmplitude ?? 0.01;
    const noiseDepth = options.noiseDepth ?? 0.05;
    const noiseRms = wanderingAmplitude(noiseAmplitude, noiseDepth, random);
    const lowNoiseRms = wanderingAmplitude(noiseAmplitude, noiseDepth, random);
    samples.push({
      timeSec: (hopIndex + 0.5) / rateHz,
      rms: Math.sqrt(noiseRms * noiseRms + clickEnergy),
      lowEnergy:
        NOISE_LOW_SHARE * lowNoiseRms * lowNoiseRms +
        CLICK_LOW_SHARE * clickEnergy,
    });
  }
  return { samples, clickTimesSec };
}

/** Steady noise: every hop at about the same level, independent of the others. */
export function vjNoiseEnvelope(options: VjNoiseOptions): VjEnvelopeSample[] {
  const random = createVjSeededRandom(options.seed ?? 1);
  const rateHz = options.rateHz ?? 100;
  const amplitude = options.amplitude ?? 0.1;
  const depth = options.depth ?? 0.05;
  const hopCount = Math.round(options.durationSec * rateHz);
  const samples: VjEnvelopeSample[] = [];
  for (let hopIndex = 0; hopIndex < hopCount; hopIndex += 1) {
    const rms = wanderingAmplitude(amplitude, depth, random);
    const lowRms = wanderingAmplitude(amplitude, depth, random);
    samples.push({
      timeSec: (hopIndex + 0.5) / rateHz,
      rms,
      lowEnergy: NOISE_LOW_SHARE * lowRms * lowRms,
    });
  }
  return samples;
}

/** Runs an envelope through a fresh onset detector. */
export function vjStrengthsOf(
  samples: readonly VjEnvelopeSample[],
): VjDetectedStrengths {
  const detector = createVjOnsetDetector();
  const strengths = new Float32Array(samples.length);
  const onsetsSec: number[] = [];
  samples.forEach((sample, index) => {
    const result = pushVjEnvelope(detector, sample);
    strengths[index] = result.strength;
    if (result.onsetAtSec !== null) onsetsSec.push(result.onsetAtSec);
  });
  const endTimeSec = samples.at(-1)?.timeSec ?? 0;
  return { strengths, onsetsSec, endTimeSec };
}
