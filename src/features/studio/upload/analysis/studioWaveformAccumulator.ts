import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";

const { waveformPeakCount, waveformPeakMax } = STUDIO_LISTENING_LIMITS;
const BUCKET_SECONDS = 0.02;

export interface WaveformAccumulator {
  push: (channels: readonly Float32Array[]) => void;
  /** `count` integers 0..255, the energy of each slice of the file scaled so
   *  the loudest slice is full height and quieter passages sit lower. */
  peaks: (count?: number) => number[];
  sampleCount: () => number;
}

/** Keeps one mean square per 20 ms across every channel (about 180,000
 *  numbers for an hour), so the final 200 values need no second pass over
 *  the audio. Energy keeps a mastered song from filling every slice, since
 *  its single loudest samples sit near full scale all the way through. */
export function createWaveformAccumulator(
  sampleRate: number,
): WaveformAccumulator {
  const bucketLength = Math.max(1, Math.round(sampleRate * BUCKET_SECONDS));
  const buckets: number[] = [];
  let bucketSquareSum = 0;
  let bucketValueCount = 0;
  let bucketFill = 0;
  let totalSamples = 0;
  const bucketMeanSquare = () =>
    bucketValueCount > 0 ? bucketSquareSum / bucketValueCount : 0;
  return {
    push(channels) {
      const length = channels[0]?.length ?? 0;
      for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
        for (const samples of channels) {
          const sample = samples[sampleIndex] ?? 0;
          bucketSquareSum += sample * sample;
          bucketValueCount += 1;
        }
        bucketFill += 1;
        totalSamples += 1;
        if (bucketFill === bucketLength) {
          buckets.push(bucketMeanSquare());
          bucketSquareSum = 0;
          bucketValueCount = 0;
          bucketFill = 0;
        }
      }
    },
    peaks(count = waveformPeakCount) {
      const all = bucketFill > 0 ? [...buckets, bucketMeanSquare()] : buckets;
      if (all.length === 0) return Array.from({ length: count }, () => 0);
      const slotEnergies = Array.from({ length: count }, (_value, index) => {
        const start = Math.floor((index * all.length) / count);
        const end = Math.max(
          start + 1,
          Math.floor(((index + 1) * all.length) / count),
        );
        let energySum = 0;
        for (let bucketIndex = start; bucketIndex < end; bucketIndex += 1)
          energySum += all[bucketIndex] ?? 0;
        return energySum / (end - start);
      });
      const loudestEnergy = Math.max(...slotEnergies);
      if (loudestEnergy <= 0) return Array.from({ length: count }, () => 0);
      return slotEnergies.map((energy) =>
        Math.round((energy / loudestEnergy) * waveformPeakMax),
      );
    },
    sampleCount: () => totalSamples,
  };
}
