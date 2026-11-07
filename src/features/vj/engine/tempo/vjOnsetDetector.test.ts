import { describe, expect, it } from "vitest";
import {
  createVjOnsetDetector,
  pushVjEnvelope,
  VJ_ONSET_MIN_GAP_SEC,
} from "./vjOnsetDetector";
import {
  vjClickTrainEnvelope,
  vjNoiseEnvelope,
  vjStrengthsOf,
} from "./vjTempoTestSignals";

/** A click lands in a 10 ms hop and may show in the next one. */
const ONSET_TOLERANCE_SEC = 0.02;

describe("vjOnsetDetector", () => {
  it("finds every click of a 124 BPM click train", () => {
    const signal = vjClickTrainEnvelope({
      bpm: 124,
      durationSec: 6,
      jitterMs: 5,
      seed: 7,
    });
    const { onsetsSec } = vjStrengthsOf(signal.samples);
    expect(onsetsSec).toHaveLength(signal.clickTimesSec.length);
    signal.clickTimesSec.forEach((clickSec, index) => {
      expect(
        Math.abs((onsetsSec[index] ?? Number.NaN) - clickSec),
      ).toBeLessThanOrEqual(ONSET_TOLERANCE_SEC);
    });
  });

  it("keeps 100 ms between onsets", () => {
    const signal = vjClickTrainEnvelope({
      bpm: 1200,
      durationSec: 3,
      seed: 3,
    });
    const { onsetsSec } = vjStrengthsOf(signal.samples);
    expect(onsetsSec.length).toBeGreaterThanOrEqual(10);
    for (let index = 1; index < onsetsSec.length; index += 1) {
      expect(
        (onsetsSec[index] ?? 0) - (onsetsSec[index - 1] ?? 0),
      ).toBeGreaterThanOrEqual(VJ_ONSET_MIN_GAP_SEC - 1e-6);
    }
  });

  it("finds no onsets in steady noise", () => {
    const { onsetsSec } = vjStrengthsOf(
      vjNoiseEnvelope({ durationSec: 5, depth: 0.05, seed: 11 }),
    );
    expect(onsetsSec).toEqual([]);
  });

  it("answers zero strength for the first hop and a hop with no time", () => {
    const detector = createVjOnsetDetector();
    expect(
      pushVjEnvelope(detector, { timeSec: 0.005, rms: 0.5, lowEnergy: 0.1 }),
    ).toEqual({ strength: 0, onsetAtSec: null });
    expect(
      pushVjEnvelope(detector, {
        timeSec: Number.NaN,
        rms: 0.9,
        lowEnergy: 0.4,
      }),
    ).toEqual({ strength: 0, onsetAtSec: null });
  });
});
