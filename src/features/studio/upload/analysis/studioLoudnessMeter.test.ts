import { describe, expect, it } from "vitest";
import { createLoudnessMeter, integrateHops } from "./studioLoudnessMeter";
import {
  joinChannels,
  silenceChannel,
  sineChannel,
} from "./studioAnalysisTestSignals";

const TONE = { frequency: 997 };

function measure(channels: Float32Array[], sampleRate: number): number | null {
  const meter = createLoudnessMeter(sampleRate, channels.length);
  meter.push(channels);
  return meter.integratedLufs();
}

function expectWithinTenth(value: number | null, expected: number) {
  expect(value).not.toBeNull();
  expect(Math.abs((value ?? 0) - expected)).toBeLessThan(0.1);
}

describe("createLoudnessMeter", () => {
  it("reads a stereo -23 dBFS 997 Hz tone at 48 kHz as -23 LUFS", () => {
    const tone = sineChannel({
      ...TONE,
      amplitudeDbfs: -23,
      seconds: 10,
      sampleRate: 48000,
    });
    expectWithinTenth(measure([tone, tone], 48000), -23);
  });

  it("reads the same tone at 44.1 kHz as -23 LUFS", () => {
    const tone = sineChannel({
      ...TONE,
      amplitudeDbfs: -23,
      seconds: 10,
      sampleRate: 44100,
    });
    expectWithinTenth(measure([tone, tone], 44100), -23);
  });

  it("reads a mono -23 dBFS tone as -26 LUFS", () => {
    const tone = sineChannel({
      ...TONE,
      amplitudeDbfs: -23,
      seconds: 10,
      sampleRate: 48000,
    });
    expectWithinTenth(measure([tone], 48000), -26);
  });

  it("drops quiet passages through the relative gate", () => {
    const quiet = sineChannel({
      ...TONE,
      amplitudeDbfs: -36,
      seconds: 2,
      sampleRate: 48000,
    });
    const loud = sineChannel({
      ...TONE,
      amplitudeDbfs: -23,
      seconds: 20,
      sampleRate: 48000,
    });
    const channel = joinChannels(quiet, loud, quiet);
    expectWithinTenth(measure([channel, channel], 48000), -23);
  });

  it("drops silence through the absolute gate", () => {
    const channel = joinChannels(
      silenceChannel(5, 48000),
      sineChannel({
        ...TONE,
        amplitudeDbfs: -23,
        seconds: 10,
        sampleRate: 48000,
      }),
    );
    expectWithinTenth(measure([channel, channel], 48000), -23);
  });

  it("answers null when nothing clears -70 LUFS", () => {
    const tone = sineChannel({
      ...TONE,
      amplitudeDbfs: -80,
      seconds: 3,
      sampleRate: 48000,
    });
    expect(measure([tone, tone], 48000)).toBeNull();
    expect(measure([silenceChannel(3, 48000)], 48000)).toBeNull();
  });

  it("gives the same answer for one push and for uneven chunks", () => {
    const tone = sineChannel({
      ...TONE,
      amplitudeDbfs: -18,
      seconds: 4,
      sampleRate: 48000,
    });
    const whole = measure([tone, tone], 48000);
    const chunked = createLoudnessMeter(48000, 2);
    for (const [start, end] of [
      [0, 1000],
      [1000, 34333],
      [34333, tone.length],
    ] as const) {
      const part = tone.subarray(start, end);
      chunked.push([part, part]);
    }
    expect(chunked.integratedLufs()).toBeCloseTo(whole ?? 0, 9);
  });
});

describe("integrateHops", () => {
  it("needs four hops for one block", () => {
    expect(integrateHops([1, 1, 1])).toBeNull();
    expect(integrateHops([1, 1, 1, 1])).toBeCloseTo(-0.691, 6);
  });
});
