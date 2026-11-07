import { describe, expect, it } from "vitest";
import { VJ_LIMITS } from "../../../../shared/contracts/vj";
import {
  estimateVjTempo,
  VJ_TEMPO_RATE_HZ,
  VJ_TEMPO_WINDOW_SEC,
} from "./vjTempoEstimator";
import {
  vjClickTrainEnvelope,
  vjNoiseEnvelope,
  vjStrengthsOf,
} from "./vjTempoTestSignals";

/** Strengths of the first 8 s of a click train through the onset detector.
 *  The train runs on past the window, so it has a click within one beat of
 *  the window's end, the way live music does. */
function clickTrainStrengths(bpm: number, seed: number) {
  const signal = vjClickTrainEnvelope({
    bpm,
    durationSec: VJ_TEMPO_WINDOW_SEC + 1,
    jitterMs: 5,
    seed,
  });
  const windowSamples = signal.samples.slice(
    0,
    VJ_TEMPO_WINDOW_SEC * VJ_TEMPO_RATE_HZ,
  );
  return { signal, detected: vjStrengthsOf(windowSamples) };
}

describe("estimateVjTempo", () => {
  it("finds 124 BPM within 0.5 from a click train with 5 ms jitter", () => {
    const { detected } = clickTrainStrengths(124, 5);
    const estimate = estimateVjTempo(detected.strengths, detected.endTimeSec);
    expect(estimate).not.toBeNull();
    expect(Math.abs((estimate?.bpm ?? 0) - 124)).toBeLessThanOrEqual(0.5);
    expect(estimate?.confidence ?? 0).toBeGreaterThanOrEqual(
      VJ_LIMITS.micConfidenceMin,
    );
  });

  it("finds 90, 100 and 174 BPM without halving or doubling", () => {
    // 174 is the halving trap: the prior favours 87 over 174. 90 and 100
    // would double to 180 and 200, both inside the range.
    [90, 100, 174].forEach((bpm, index) => {
      const { detected } = clickTrainStrengths(bpm, 20 + index);
      const estimate = estimateVjTempo(detected.strengths, detected.endTimeSec);
      expect(Math.abs((estimate?.bpm ?? 0) - bpm)).toBeLessThanOrEqual(1);
      expect(estimate?.confidence ?? 0).toBeGreaterThanOrEqual(
        VJ_LIMITS.micConfidenceMin,
      );
    });
  });

  it("finds 70 BPM where the prior leans to the doubled 140", () => {
    const { detected } = clickTrainStrengths(70, 31);
    const estimate = estimateVjTempo(detected.strengths, detected.endTimeSec);
    expect(Math.abs((estimate?.bpm ?? 0) - 70)).toBeLessThanOrEqual(1);
  });

  it("places the beat within 15 ms of a click", () => {
    const { signal, detected } = clickTrainStrengths(124, 9);
    const estimate = estimateVjTempo(detected.strengths, detected.endTimeSec);
    const beatAtSec = estimate?.beatAtSec ?? Number.NaN;
    expect(beatAtSec).toBeLessThanOrEqual(detected.endTimeSec);
    const nearestGapSec = Math.min(
      ...signal.clickTimesSec.map((clickSec) => Math.abs(clickSec - beatAtSec)),
    );
    expect(nearestGapSec).toBeLessThanOrEqual(0.015);
    // The latest click inside the window (a click lands in a 10 ms hop).
    const lastClickSec = Math.max(
      ...signal.clickTimesSec.filter(
        (clickSec) => clickSec <= detected.endTimeSec + 0.005,
      ),
    );
    expect(Math.abs(beatAtSec - lastClickSec)).toBeLessThanOrEqual(0.015);
  });

  it("answers low confidence for white noise", () => {
    const detected = vjStrengthsOf(
      vjNoiseEnvelope({ durationSec: 8, depth: 0.5, seed: 13 }),
    );
    const estimate = estimateVjTempo(detected.strengths, detected.endTimeSec);
    expect(estimate).not.toBeNull();
    expect(estimate?.confidence ?? 1).toBeLessThan(VJ_LIMITS.micConfidenceMin);
  });

  it("answers null with under 4 s of data", () => {
    const { detected } = clickTrainStrengths(124, 5);
    const shortStrengths = detected.strengths.slice(
      -(4 * VJ_TEMPO_RATE_HZ - 1),
    );
    expect(estimateVjTempo(shortStrengths, detected.endTimeSec)).toBeNull();
    expect(
      estimateVjTempo(detected.strengths.slice(-4 * VJ_TEMPO_RATE_HZ), 8),
    ).not.toBeNull();
  });

  it("answers null for strengths with no energy", () => {
    expect(
      estimateVjTempo(new Float32Array(8 * VJ_TEMPO_RATE_HZ), 8),
    ).toBeNull();
  });
});
