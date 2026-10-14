import { kWeightingCoefficients, runBiquad } from "./studioKWeighting";

/** 400 ms blocks overlapping by 75% step every 100 ms: one block is four hops. */
const HOP_SECONDS = 0.1;
const HOPS_PER_BLOCK = 4;
const ABSOLUTE_GATE_LUFS = -70;
const RELATIVE_GATE_LU = -10;
const LOUDNESS_OFFSET = -0.691;

export interface LoudnessMeter {
  push: (channels: readonly Float32Array[]) => void;
  /** Integrated loudness in LUFS; null when no block clears -70 LUFS. */
  integratedLufs: () => number | null;
}

const loudnessOf = (meanSquare: number) =>
  LOUDNESS_OFFSET + 10 * Math.log10(meanSquare);

const meanOf = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/** BS.1770 weights in decodeAudioData's channel order (L, R, C, LFE, Ls,
 *  Rs): the LFE is left out and the surrounds weigh 1.41. */
function channelWeight(channelIndex: number, channelCount: number): number {
  if (channelCount < 6) return 1;
  if (channelIndex === 3) return 0;
  return channelIndex >= 4 ? 1.41 : 1;
}

/** Gated integration over 100 ms hop mean squares (BS.1770-4 section 2.8). */
export function integrateHops(
  hopMeanSquares: readonly number[],
): number | null {
  const blocks: number[] = [];
  for (
    let blockEnd = HOPS_PER_BLOCK - 1;
    blockEnd < hopMeanSquares.length;
    blockEnd += 1
  ) {
    let sum = 0;
    for (let offset = 0; offset < HOPS_PER_BLOCK; offset += 1)
      sum += hopMeanSquares[blockEnd - offset] ?? 0;
    blocks.push(sum / HOPS_PER_BLOCK);
  }
  const aboveAbsolute = blocks.filter(
    (block) => block > 0 && loudnessOf(block) > ABSOLUTE_GATE_LUFS,
  );
  if (aboveAbsolute.length === 0) return null;
  const relativeGate = loudnessOf(meanOf(aboveAbsolute)) + RELATIVE_GATE_LU;
  const gated = aboveAbsolute.filter(
    (block) => loudnessOf(block) > relativeGate,
  );
  return gated.length === 0 ? null : loudnessOf(meanOf(gated));
}

/** A streaming BS.1770 meter: push decoded chunks in order, read the
 *  integrated loudness at the end. Filter state crosses chunk edges, so
 *  any chunking gives the same answer. */
export function createLoudnessMeter(
  sampleRate: number,
  channelCount: number,
): LoudnessMeter {
  const { shelf, highPass } = kWeightingCoefficients(sampleRate);
  const states = Array.from({ length: channelCount }, () => ({
    shelf: { first: 0, second: 0 },
    highPass: { first: 0, second: 0 },
  }));
  const hopLength = Math.max(1, Math.round(sampleRate * HOP_SECONDS));
  const hopMeanSquares: number[] = [];
  let hopSum = 0;
  let hopFill = 0;
  let shelfOutput = new Float64Array(0);
  let weightedOutput = new Float64Array(0);
  let energy = new Float64Array(0);

  function filterInto(channels: readonly Float32Array[], length: number) {
    energy.fill(0, 0, length);
    states.forEach((state, channelIndex) => {
      const samples = channels[channelIndex];
      const weight = channelWeight(channelIndex, channelCount);
      if (!samples || weight === 0) return;
      runBiquad(shelf, state.shelf, samples, shelfOutput, length);
      runBiquad(highPass, state.highPass, shelfOutput, weightedOutput, length);
      for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
        const value = weightedOutput[sampleIndex] ?? 0;
        energy[sampleIndex] =
          (energy[sampleIndex] ?? 0) + weight * value * value;
      }
    });
  }

  return {
    push(channels) {
      const length = channels[0]?.length ?? 0;
      if (length === 0) return;
      if (energy.length < length) {
        shelfOutput = new Float64Array(length);
        weightedOutput = new Float64Array(length);
        energy = new Float64Array(length);
      }
      filterInto(channels, length);
      for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
        hopSum += energy[sampleIndex] ?? 0;
        hopFill += 1;
        if (hopFill === hopLength) {
          hopMeanSquares.push(hopSum / hopLength);
          hopSum = 0;
          hopFill = 0;
        }
      }
    },
    integratedLufs: () => integrateHops(hopMeanSquares),
  };
}
