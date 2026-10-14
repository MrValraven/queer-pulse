import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";

const { waveformPeakCount, waveformPeakMax } = STUDIO_LISTENING_LIMITS;
const BUCKET_SECONDS = 0.02;

export interface WaveformAccumulator {
  push: (channels: readonly Float32Array[]) => void;
  /** `count` integers 0..255, the loudest sample of each slice of the file. */
  peaks: (count?: number) => number[];
  sampleCount: () => number;
}

/** Keeps one maximum per 20 ms (about 180,000 numbers for an hour), so the
 *  final 200 peaks need no second pass over the audio. */
export function createWaveformAccumulator(
  sampleRate: number,
): WaveformAccumulator {
  const bucketLength = Math.max(1, Math.round(sampleRate * BUCKET_SECONDS));
  const buckets: number[] = [];
  let bucketMaximum = 0;
  let bucketFill = 0;
  let totalSamples = 0;
  return {
    push(channels) {
      const length = channels[0]?.length ?? 0;
      for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
        for (const samples of channels) {
          const magnitude = Math.abs(samples[sampleIndex] ?? 0);
          if (magnitude > bucketMaximum) bucketMaximum = magnitude;
        }
        bucketFill += 1;
        totalSamples += 1;
        if (bucketFill === bucketLength) {
          buckets.push(bucketMaximum);
          bucketMaximum = 0;
          bucketFill = 0;
        }
      }
    },
    peaks(count = waveformPeakCount) {
      const all = bucketFill > 0 ? [...buckets, bucketMaximum] : buckets;
      if (all.length === 0) return Array.from({ length: count }, () => 0);
      return Array.from({ length: count }, (_value, index) => {
        const start = Math.floor((index * all.length) / count);
        const end = Math.max(
          start + 1,
          Math.floor(((index + 1) * all.length) / count),
        );
        let largest = 0;
        for (let bucketIndex = start; bucketIndex < end; bucketIndex += 1)
          largest = Math.max(largest, all[bucketIndex] ?? 0);
        return Math.round(Math.min(1, largest) * waveformPeakMax);
      });
    },
    sampleCount: () => totalSamples,
  };
}
