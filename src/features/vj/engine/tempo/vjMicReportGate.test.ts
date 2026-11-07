import { describe, expect, it } from "vitest";
import {
  createVjMicReportGate,
  vjMicReportOf,
  type VjMicReportGate,
} from "./vjMicReportGate";

interface FedEstimate {
  atMs: number;
  bpm: number;
  confidence?: number;
}

/** Feeds estimates in order; answers the gate and every report. */
function feed(estimates: readonly FedEstimate[], start?: VjMicReportGate) {
  let gate = start ?? createVjMicReportGate();
  const reports = estimates.map((estimate) => {
    const result = vjMicReportOf(gate, {
      level: 0.5,
      estimate: {
        bpm: estimate.bpm,
        confidence: estimate.confidence ?? 0.9,
        beatAtSec: estimate.atMs / 1000,
      },
      nowMs: estimate.atMs,
      beatAtServerMs: 1_000_000 + estimate.atMs + 0.4,
    });
    gate = result.gate;
    return result.report;
  });
  return { gate, reports };
}

/** One estimate a second from `fromMs` to `toMs`, all at `bpm`. */
function steady(bpm: number, fromMs: number, toMs: number): FedEstimate[] {
  const estimates: FedEstimate[] = [];
  for (let atMs = fromMs; atMs <= toMs; atMs += 1000) {
    estimates.push({ atMs, bpm });
  }
  return estimates;
}

describe("vjMicReportOf", () => {
  it("keeps bpm and beatAt null until 4 s of stable confident estimates", () => {
    const { reports } = feed(steady(124, 0, 4000));
    reports.slice(0, 4).forEach((report) => {
      expect(report.bpm).toBeNull();
      expect(report.beatAt).toBeNull();
      expect(report.confidence).toBe(0.9);
    });
    expect(reports[4]).toEqual({
      level: 0.5,
      bpm: 124,
      confidence: 0.9,
      beatAt: 1_004_000,
    });
  });

  it("keeps bpm null while confidence sits under the server's 0.6", () => {
    const { reports } = feed(
      steady(124, 0, 8000).map((estimate) => ({
        ...estimate,
        confidence: 0.59,
      })),
    );
    reports.forEach((report) => {
      expect(report.bpm).toBeNull();
      expect(report.confidence).toBe(0.59);
    });
  });

  it("reports bpm rounded to one decimal and clamped to the limits", () => {
    expect(feed(steady(123.456, 0, 4000)).reports[4]?.bpm).toBe(123.5);
    expect(feed(steady(203.2, 0, 4000)).reports[4]?.bpm).toBe(200);
    expect(feed(steady(58, 0, 4000)).reports[4]?.bpm).toBe(60);
  });

  it("drops back to null when the estimate wanders more than 1.5 BPM", () => {
    const { reports } = feed([
      ...steady(124, 0, 4000),
      { atMs: 5000, bpm: 126 },
    ]);
    expect(reports[4]?.bpm).toBe(124);
    expect(reports[5]?.bpm).toBeNull();
    expect(reports[5]?.beatAt).toBeNull();
  });

  it("reports the mean of the stable estimates of the last 4 s", () => {
    const { reports } = feed([
      ...steady(124, 0, 4000),
      { atMs: 5000, bpm: 124.4 },
      ...steady(125.2, 6000, 10_000),
    ]);
    // 1000 to 5000: four at 124 and one at 124.4.
    expect(reports[5]?.bpm).toBe(124.1);
    // 2000 to 6000: three at 124, 124.4 and 125.2.
    expect(reports[6]?.bpm).toBe(124.3);
    expect(reports.at(-1)?.bpm).toBe(125.2);
  });

  it("always reports the level with two decimals", () => {
    const withoutEstimate = vjMicReportOf(createVjMicReportGate(), {
      level: 0.123456,
      estimate: null,
      nowMs: 0,
      beatAtServerMs: null,
    });
    expect(withoutEstimate.report).toEqual({
      level: 0.12,
      bpm: null,
      confidence: 0,
      beatAt: null,
    });
    const { gate } = feed(steady(124, 0, 4000));
    const stable = vjMicReportOf(gate, {
      level: 0.987,
      estimate: { bpm: 124, confidence: 0.912, beatAtSec: 5 },
      nowMs: 5000,
      beatAtServerMs: null,
    });
    expect(stable.report).toEqual({
      level: 0.99,
      bpm: 124,
      confidence: 0.91,
      beatAt: null,
    });
  });
});
