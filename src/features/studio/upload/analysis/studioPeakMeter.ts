import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";
import { roundToTenth } from "../../api/studioListeningRules";

const PEAK_HEADROOM_DB = 0.5;
const { peakDbMin, peakDbMax } = STUDIO_LISTENING_LIMITS;

export interface PeakMeter {
  push: (channels: readonly Float32Array[]) => void;
  /** Sample peak plus 0.5 dB, one decimal, clamped to the contract range. */
  peakDb: () => number;
}

export const clampTo = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function createPeakMeter(): PeakMeter {
  let largestMagnitude = 0;
  return {
    push(channels) {
      for (const samples of channels) {
        for (
          let sampleIndex = 0;
          sampleIndex < samples.length;
          sampleIndex += 1
        ) {
          const magnitude = Math.abs(samples[sampleIndex] ?? 0);
          if (magnitude > largestMagnitude) largestMagnitude = magnitude;
        }
      }
    },
    peakDb() {
      if (largestMagnitude === 0) return peakDbMin;
      const decibels = 20 * Math.log10(largestMagnitude) + PEAK_HEADROOM_DB;
      return clampTo(roundToTenth(decibels), peakDbMin, peakDbMax);
    },
  };
}
