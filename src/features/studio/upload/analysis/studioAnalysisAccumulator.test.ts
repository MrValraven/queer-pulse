import { describe, expect, it } from "vitest";
import { createAnalysisAccumulator } from "./studioAnalysisAccumulator";
import { createPeakMeter } from "./studioPeakMeter";
import { createWaveformAccumulator } from "./studioWaveformAccumulator";
import {
  joinChannels,
  silenceChannel,
  sineChannel,
} from "./studioAnalysisTestSignals";

describe("createPeakMeter", () => {
  function peakOf(values: number[]): number {
    const meter = createPeakMeter();
    meter.push([Float32Array.from(values)]);
    return meter.peakDb();
  }

  it("adds half a decibel to the sample peak and rounds to one decimal", () => {
    expect(peakOf([0.1, -0.5, 0.25])).toBe(-5.5);
    expect(peakOf([1.2])).toBe(2.1);
  });

  it("clamps to the contract range", () => {
    expect(peakOf([0, 0, 0])).toBe(-60);
    expect(peakOf([0.0001])).toBe(-60);
    expect(peakOf([2.5])).toBe(3);
  });
});

describe("createWaveformAccumulator", () => {
  it("answers 200 integers between 0 and 255", () => {
    const waveform = createWaveformAccumulator(48000);
    const tone = sineChannel({
      frequency: 440,
      amplitudeDbfs: -6,
      seconds: 30,
      sampleRate: 48000,
    });
    waveform.push([tone]);
    const peaks = waveform.peaks();
    expect(peaks).toHaveLength(200);
    expect(
      peaks.every((peak) => Number.isInteger(peak) && peak >= 0 && peak <= 255),
    ).toBe(true);
  });

  it("draws a steady tone at full height whatever its level", () => {
    for (const amplitudeDbfs of [-30, -6, 0]) {
      const waveform = createWaveformAccumulator(48000);
      waveform.push([
        sineChannel({
          frequency: 440,
          amplitudeDbfs,
          seconds: 30,
          sampleRate: 48000,
        }),
      ]);
      const peaks = waveform.peaks();
      expect(Math.max(...peaks)).toBe(255);
      expect(Math.min(...peaks)).toBeGreaterThanOrEqual(250);
    }
  });

  it("draws a quiet second half clearly lower than a loud first half", () => {
    const waveform = createWaveformAccumulator(48000);
    const loudHalf = sineChannel({
      frequency: 440,
      amplitudeDbfs: -1,
      seconds: 10,
      sampleRate: 48000,
    });
    const quietHalf = sineChannel({
      frequency: 440,
      amplitudeDbfs: -21,
      seconds: 10,
      sampleRate: 48000,
    });
    waveform.push([joinChannels(loudHalf, quietHalf)]);
    const peaks = waveform.peaks();
    const firstHalf = peaks.slice(0, 95);
    const secondHalf = peaks.slice(105);
    expect(Math.min(...firstHalf)).toBeGreaterThanOrEqual(250);
    expect(Math.max(...secondHalf)).toBeLessThan(Math.min(...firstHalf) / 4);
  });

  it("answers all zeros for silence", () => {
    const waveform = createWaveformAccumulator(48000);
    waveform.push([silenceChannel(3, 48000), silenceChannel(3, 48000)]);
    const peaks = waveform.peaks();
    expect(peaks).toHaveLength(200);
    expect(peaks.every((peak) => peak === 0)).toBe(true);
  });

  it("follows a rising level from left to right", () => {
    const waveform = createWaveformAccumulator(8000);
    const ramp = new Float32Array(8000 * 20);
    for (let sampleIndex = 0; sampleIndex < ramp.length; sampleIndex += 1)
      ramp[sampleIndex] = sampleIndex / ramp.length;
    waveform.push([ramp]);
    const peaks = waveform.peaks();
    for (let index = 1; index < peaks.length; index += 1)
      expect(peaks[index] ?? 0).toBeGreaterThanOrEqual(peaks[index - 1] ?? 0);
  });

  it("still answers 200 values for a one-second file", () => {
    const waveform = createWaveformAccumulator(48000);
    waveform.push([
      sineChannel({
        frequency: 440,
        amplitudeDbfs: 0,
        seconds: 1,
        sampleRate: 48000,
      }),
    ]);
    expect(waveform.peaks()).toHaveLength(200);
  });
});

describe("createAnalysisAccumulator", () => {
  it("answers the three contract fields", () => {
    const accumulator = createAnalysisAccumulator(48000, 2);
    const tone = sineChannel({
      frequency: 997,
      amplitudeDbfs: -23,
      seconds: 10,
      sampleRate: 48000,
    });
    accumulator.push([tone, tone]);
    const analysis = accumulator.finish();
    expect(analysis?.waveformPeaks).toHaveLength(200);
    expect(analysis?.loudnessLufs).toBe(-23);
    expect(analysis?.peakDb).toBe(-22.5);
  });

  it("reports a silent file at the -70 LUFS floor", () => {
    const accumulator = createAnalysisAccumulator(48000, 1);
    accumulator.push([silenceChannel(3, 48000)]);
    expect(accumulator.finish()).toMatchObject({
      loudnessLufs: -70,
      peakDb: -60,
    });
  });

  it("answers null when no sample arrived", () => {
    expect(createAnalysisAccumulator(48000, 2).finish()).toBeNull();
  });
});
