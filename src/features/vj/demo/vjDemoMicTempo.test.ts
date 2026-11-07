import { describe, expect, it } from "vitest";
import {
  vjBeatMs,
  type VjScreenMicReport,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { adoptVjDemoMicTempo } from "./vjDemoMicTempo";

const NOW = 1_800_000_000_000;

/** A mic-following grid with a "1" on NOW at 120 BPM (500 ms beats, 2000 ms bars). */
const MIC_TEMPO: VjTempo = {
  bpm: 120,
  downbeatAt: NOW,
  quantize: "off",
  source: "mic",
};

function micReport(fields: Partial<VjScreenMicReport> = {}): VjScreenMicReport {
  return { level: 0.5, bpm: 128, confidence: 0.9, beatAt: NOW, ...fields };
}

function adopt(
  mic: VjScreenMicReport,
  options: {
    now?: number;
    lastAdoptionAt?: number | null;
    tempo?: VjTempo;
  } = {},
): VjTempo | null {
  return adoptVjDemoMicTempo({
    tempo: options.tempo ?? MIC_TEMPO,
    mic,
    now: options.now ?? NOW,
    lastAdoptionAt: options.lastAdoptionAt ?? null,
  });
}

describe("adoptVjDemoMicTempo", () => {
  it("adopts a confident tempo and keeps the bar position", () => {
    const beatOnThree = NOW + 4 * 2000 + 2 * 500;
    expect(
      adopt(micReport({ bpm: 125.04, beatAt: beatOnThree }), {
        now: beatOnThree + 100,
      }),
    ).toEqual({
      bpm: 125,
      downbeatAt: Math.round(beatOnThree - 2 * vjBeatMs(125)),
      quantize: "off",
      source: "mic",
    });
  });

  it("moves to the next beat when the phase is half or more", () => {
    const lateInBeatFour = NOW + 3 * 500 + 300;
    expect(
      adopt(micReport({ bpm: 120, beatAt: lateInBeatFour }))?.downbeatAt,
    ).toBe(lateInBeatFour);
    const earlyInBeatTwo = NOW + 500 + 100;
    expect(
      adopt(micReport({ bpm: 120, beatAt: earlyInBeatTwo }))?.downbeatAt,
    ).toBe(earlyInBeatTwo - 500);
  });

  it("keeps the quantize mode of the current tempo", () => {
    expect(
      adopt(micReport(), { tempo: { ...MIC_TEMPO, quantize: "bar" } })
        ?.quantize,
    ).toBe("bar");
  });

  it("ignores a low confidence", () => {
    const offBeat = NOW + 100;
    expect(adopt(micReport({ confidence: 0.59, beatAt: offBeat }))).toBeNull();
    expect(
      adopt(micReport({ confidence: 0.6, beatAt: offBeat })),
    ).not.toBeNull();
  });

  it("waits 2 s between adoptions", () => {
    const offBeat = NOW + 100;
    expect(
      adopt(micReport({ beatAt: offBeat }), { lastAdoptionAt: NOW - 1999 }),
    ).toBeNull();
    expect(
      adopt(micReport({ beatAt: offBeat }), { lastAdoptionAt: NOW - 2000 }),
    ).not.toBeNull();
  });

  it("ignores a change under 0.5 BPM and 40 ms", () => {
    expect(adopt(micReport({ bpm: 120.4, beatAt: NOW + 500 + 39 }))).toBeNull();
    expect(adopt(micReport({ bpm: 120.4, beatAt: NOW + 500 - 39 }))).toBeNull();
    expect(adopt(micReport({ bpm: 120.5, beatAt: NOW + 500 }))).not.toBeNull();
  });

  it("adopts a 40 ms phase drift at the same bpm", () => {
    const driftedBeat = NOW + 500 + 40;
    expect(adopt(micReport({ bpm: 120, beatAt: driftedBeat }))).toEqual({
      bpm: 120,
      downbeatAt: driftedBeat - 500,
      quantize: "off",
      source: "mic",
    });
  });

  it("follows the mic only while the source is mic and the report has a bpm and a beat", () => {
    const report = micReport({ bpm: 130, beatAt: NOW + 100 });
    for (const source of ["manual", "tap"] as const) {
      expect(adopt(report, { tempo: { ...MIC_TEMPO, source } })).toBeNull();
    }
    expect(adopt(micReport({ bpm: null }))).toBeNull();
    expect(adopt(micReport({ beatAt: null }))).toBeNull();
  });
});
