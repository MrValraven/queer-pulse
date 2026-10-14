import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";
import { roundToTenth } from "../../api/studioListeningRules";
import { createLoudnessMeter } from "./studioLoudnessMeter";
import { clampTo, createPeakMeter } from "./studioPeakMeter";
import { createWaveformAccumulator } from "./studioWaveformAccumulator";

/** What an upload sends with PATCH /studio/tracks/:id (contract A.5). */
export interface StudioAudioAnalysis {
  waveformPeaks: number[];
  loudnessLufs: number;
  peakDb: number;
}

export interface AnalysisAccumulator {
  push: (channels: readonly Float32Array[]) => void;
  /** Null when no audio arrived at all. */
  finish: () => StudioAudioAnalysis | null;
}

const { loudnessLufsMin, loudnessLufsMax } = STUDIO_LISTENING_LIMITS;

export function createAnalysisAccumulator(
  sampleRate: number,
  channelCount: number,
): AnalysisAccumulator {
  const loudness = createLoudnessMeter(sampleRate, channelCount);
  const peak = createPeakMeter();
  const waveform = createWaveformAccumulator(sampleRate);
  return {
    push(channels) {
      loudness.push(channels);
      peak.push(channels);
      waveform.push(channels);
    },
    finish() {
      if (waveform.sampleCount() === 0) return null;
      const integrated = loudness.integratedLufs() ?? loudnessLufsMin;
      return {
        waveformPeaks: waveform.peaks(),
        loudnessLufs: clampTo(
          roundToTenth(integrated),
          loudnessLufsMin,
          loudnessLufsMax,
        ),
        peakDb: peak.peakDb(),
      };
    },
  };
}
