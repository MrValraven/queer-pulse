import { describe, expect, it } from "vitest";
import {
  createVjMicLevel,
  updateVjMicLevel,
  type VjMicLevel,
} from "./vjMicLevel";

const STEP_MS = 10;

/** Feeds the same RMS for `durationMs` in 10 ms steps. */
function hold(state: VjMicLevel, rms: number, durationMs: number): VjMicLevel {
  let next = state;
  for (let elapsedMs = 0; elapsedMs < durationMs; elapsedMs += STEP_MS) {
    next = updateVjMicLevel(next, rms, STEP_MS);
  }
  return next;
}

describe("vjMicLevel", () => {
  it("rises within 30 ms and falls over 250 ms", () => {
    const risen = hold(createVjMicLevel(), 0.5, 30);
    expect(risen.level).toBeGreaterThanOrEqual(0.9);

    const settled = hold(risen, 0.5, 1000);
    const shortlyAfter = hold(settled, 0, 50);
    expect(shortlyAfter.level).toBeGreaterThan(0.4);
    const released = hold(shortlyAfter, 0, 200);
    expect(released.level).toBeLessThan(0.06);
  });

  it("reads silence as 0 and a full-scale tone as 1", () => {
    expect(hold(createVjMicLevel(), 0, 1000).level).toBe(0);
    expect(hold(createVjMicLevel(), Math.SQRT1_2, 1000).level).toBeCloseTo(
      1,
      3,
    );
  });

  it("adapts to a quiet room within 10 s", () => {
    const loud = hold(createVjMicLevel(), 0.5, 2000);
    const quietRms = 0.01;
    const oneSecondLater = hold(loud, quietRms, 1000);
    expect(oneSecondLater.level).toBeLessThan(0.5);
    const tenSecondsLater = hold(oneSecondLater, quietRms, 9000);
    expect(tenSecondsLater.level).toBeGreaterThan(0.95);
    expect(tenSecondsLater.peakDb).toBeCloseTo(-40, 1);
  });

  it("reads a missing or broken step as no time passing", () => {
    const state = hold(createVjMicLevel(), 0.5, 100);
    const unchanged = updateVjMicLevel(state, 0, Number.NaN);
    expect(unchanged.level).toBe(state.level);
    expect(updateVjMicLevel(state, Number.NaN, STEP_MS).level).toBeLessThan(
      state.level,
    );
  });
});
