import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjShuffle,
  type VjTempo,
  type VjTransition,
} from "./vj.state";
import {
  type VjClockSample,
  vjBeatPositionAt,
  vjBlackoutFadeMs,
  vjClockOffsetMs,
  vjLastDownbeatAt,
  vjNextBoundaryAt,
  vjQuantizedApplyAt,
  vjShuffleIntervalMs,
  vjTransitionLengthMs,
  writeVjBeatPositionAt,
} from "./vj.tempo";

/** 120 BPM gives a 500 ms beat and a 2000 ms bar. */
function tempoAt(overrides: Partial<VjTempo> = {}): VjTempo {
  return {
    ...createVjStageState("epoch-1", 10_000).tempo,
    bpm: 120,
    ...overrides,
  };
}

function transitionOf(
  mode: VjTransition["mode"],
  unit: VjTransition["length"]["unit"],
  value: number,
): VjTransition {
  return { mode, length: { unit, value } };
}

/** A clock sample with the given round trip and offset, sent at local 1000 ms. */
function sampleWith(roundTripMs: number, offsetMs: number): VjClockSample {
  const sentAt = 1000;
  const receivedAt = sentAt + roundTripMs;
  return {
    sentAt,
    receivedAt,
    serverNow: (sentAt + receivedAt) / 2 + offsetMs,
  };
}

describe("vj tempo helpers", () => {
  it("vjBeatPositionAt counts beats, bars and phase after the downbeat", () => {
    expect(vjBeatPositionAt(tempoAt(), 10_000 + 5 * 500 + 250)).toEqual({
      beatIndex: 5,
      barIndex: 1,
      beatInBar: 1,
      phase: 0.5,
    });
    expect(vjBeatPositionAt(tempoAt(), 10_000)).toEqual({
      beatIndex: 0,
      barIndex: 0,
      beatInBar: 0,
      phase: 0,
    });
  });

  it("vjBeatPositionAt is negative and wraps beatInBar before the downbeat", () => {
    const position = vjBeatPositionAt(tempoAt(), 10_000 - 500);
    expect(position.beatIndex).toBe(-1);
    expect(position.barIndex).toBe(-1);
    expect(position.beatInBar).toBe(3);
    expect(position.phase).toBe(0);
    const earlier = vjBeatPositionAt(tempoAt(), 10_000 - 5 * 500 - 250);
    expect(earlier.beatIndex).toBe(-6);
    expect(earlier.barIndex).toBe(-2);
    expect(earlier.beatInBar).toBe(2);
    expect(earlier.phase).toBeCloseTo(0.5);
  });

  it("writeVjBeatPositionAt fills the object it is given with vjBeatPositionAt's answer", () => {
    const out = { beatIndex: 9, barIndex: 9, beatInBar: 9, phase: 9 };
    for (const serverTime of [10_000 + 5 * 500 + 250, 10_000, 10_000 - 2750]) {
      const answer = writeVjBeatPositionAt(out, tempoAt(), serverTime);
      expect(answer).toBe(out);
      expect(out).toEqual(vjBeatPositionAt(tempoAt(), serverTime));
    }
  });

  it("vjNextBoundaryAt returns the boundary itself when earliest sits on it", () => {
    expect(vjNextBoundaryAt(tempoAt(), "beat", 12_000)).toBe(12_000);
    expect(vjNextBoundaryAt(tempoAt(), "bar", 12_000)).toBe(12_000);
    expect(vjNextBoundaryAt(tempoAt(), "beat", 12_001)).toBe(12_500);
    expect(vjNextBoundaryAt(tempoAt(), "bar", 12_001)).toBe(14_000);
  });

  it("vjNextBoundaryAt rounds to an integer ms at 124 BPM", () => {
    const tempo = tempoAt({ bpm: 124, downbeatAt: 0 });
    const nextBeat = vjNextBoundaryAt(tempo, "beat", 1);
    const nextBar = vjNextBoundaryAt(tempo, "bar", 1);
    expect(Number.isInteger(nextBeat)).toBe(true);
    expect(Number.isInteger(nextBar)).toBe(true);
    expect(nextBeat).toBe(484);
    expect(nextBar).toBe(1935);
  });

  it("a boundary returned at 124 BPM answers itself when fed back", () => {
    const tempo = tempoAt({ bpm: 124, downbeatAt: 0 });
    expect(vjNextBoundaryAt(tempo, "bar", 3871)).toBe(3871);
    expect(vjNextBoundaryAt(tempo, "bar", 3872)).toBe(5806);
    expect(vjNextBoundaryAt(tempo, "beat", 1935)).toBe(1935);
    let earliestBar = 1;
    let earliestBeat = 1;
    for (let step = 0; step < 16; step += 1) {
      const bar = vjNextBoundaryAt(tempo, "bar", earliestBar);
      expect(vjNextBoundaryAt(tempo, "bar", bar)).toBe(bar);
      const beat = vjNextBoundaryAt(tempo, "beat", earliestBeat);
      expect(vjNextBoundaryAt(tempo, "beat", beat)).toBe(beat);
      earliestBar = bar + 1;
      earliestBeat = beat + 1;
    }
  });

  it("vjLastDownbeatAt on a 124 BPM bar boundary returns that boundary", () => {
    const tempo = tempoAt({ bpm: 124, downbeatAt: 0 });
    expect(vjLastDownbeatAt(tempo, 1935)).toBe(1935);
    expect(vjLastDownbeatAt(tempo, 1934)).toBe(0);
    expect(vjLastDownbeatAt(tempo, 3871)).toBe(3871);
    let earliestBar = 1;
    for (let step = 0; step < 16; step += 1) {
      const bar = vjNextBoundaryAt(tempo, "bar", earliestBar);
      expect(vjLastDownbeatAt(tempo, bar)).toBe(bar);
      earliestBar = bar + 1;
    }
  });

  it("vjBeatPositionAt reads beat 0 of a bar on a 124 BPM bar boundary", () => {
    const tempo = tempoAt({ bpm: 124, downbeatAt: 0 });
    expect(vjBeatPositionAt(tempo, 1935)).toEqual({
      beatIndex: 4,
      barIndex: 1,
      beatInBar: 0,
      phase: 0,
    });
    let earliestBar = 1;
    for (let step = 1; step <= 16; step += 1) {
      const bar = vjNextBoundaryAt(tempo, "bar", earliestBar);
      const position = vjBeatPositionAt(tempo, bar);
      expect(position.barIndex).toBe(step);
      expect(position.beatInBar).toBe(0);
      expect(position.phase).toBeGreaterThanOrEqual(0);
      expect(position.phase).toBeLessThan(0.01);
      earliestBar = bar + 1;
    }
  });

  it("vjLastDownbeatAt finds the last 1 at or before the time", () => {
    expect(vjLastDownbeatAt(tempoAt(), 13_999)).toBe(12_000);
    expect(vjLastDownbeatAt(tempoAt(), 12_000)).toBe(12_000);
    expect(vjLastDownbeatAt(tempoAt(), 9999)).toBe(8000);
  });

  it("vjQuantizedApplyAt is null with quantize off and lands at least 150 ms ahead on beat and bar", () => {
    expect(vjQuantizedApplyAt(tempoAt({ downbeatAt: 0 }), 1000)).toBeNull();
    const onBeat = tempoAt({ downbeatAt: 0, quantize: "beat" });
    const onBar = tempoAt({ downbeatAt: 0, quantize: "bar" });
    expect(vjQuantizedApplyAt(onBeat, 1000)).toBe(1500);
    expect(vjQuantizedApplyAt(onBeat, 1400)).toBe(2000);
    expect(vjQuantizedApplyAt(onBeat, 1350)).toBe(1500);
    expect(vjQuantizedApplyAt(onBar, 1000)).toBe(2000);
    expect(vjQuantizedApplyAt(onBar, 1900)).toBe(4000);
  });

  it("vjTransitionLengthMs reads ms, beats at the tempo, and 0 for cut", () => {
    expect(
      vjTransitionLengthMs(transitionOf("fade", "ms", 800), tempoAt()),
    ).toBe(800);
    expect(
      vjTransitionLengthMs(transitionOf("wipeLeft", "beats", 4), tempoAt()),
    ).toBe(2000);
    expect(
      vjTransitionLengthMs(
        transitionOf("fade", "beats", 4),
        tempoAt({ bpm: 124 }),
      ),
    ).toBe(1935);
    expect(
      vjTransitionLengthMs(transitionOf("cut", "ms", 800), tempoAt()),
    ).toBe(0);
  });

  it("vjBlackoutFadeMs caps at 4000", () => {
    expect(
      vjBlackoutFadeMs(transitionOf("fade", "beats", 16), tempoAt({ bpm: 60 })),
    ).toBe(4000);
    expect(vjBlackoutFadeMs(transitionOf("fade", "ms", 800), tempoAt())).toBe(
      800,
    );
    expect(vjBlackoutFadeMs(transitionOf("cut", "ms", 800), tempoAt())).toBe(0);
  });

  it("vjShuffleIntervalMs reads tempo.bpm for beats", () => {
    const shuffle: VjShuffle = {
      ...createVjStageState("epoch-1", 0).shuffle,
      intervalKind: "beats",
      intervalValue: 8,
    };
    expect(vjShuffleIntervalMs(shuffle, tempoAt({ bpm: 124 }))).toBe(3871);
    expect(vjShuffleIntervalMs(shuffle, tempoAt({ bpm: 120 }))).toBe(4000);
    expect(
      vjShuffleIntervalMs(
        { ...shuffle, intervalKind: "seconds" },
        tempoAt({ bpm: 124 }),
      ),
    ).toBe(8000);
  });
});

describe("vj clock offset", () => {
  it("vjClockOffsetMs takes the median of the five fastest of the last nine", () => {
    const droppedAsOldest = [sampleWith(2, -1000), sampleWith(3, -1000)];
    const lastNine = [
      sampleWith(90, 500),
      sampleWith(30, 102),
      sampleWith(70, 500),
      sampleWith(10, 100),
      sampleWith(50, 104),
      sampleWith(80, 500),
      sampleWith(20, 101),
      sampleWith(60, 500),
      sampleWith(40, 103),
    ];
    expect(vjClockOffsetMs([...droppedAsOldest, ...lastNine])).toBe(102);
  });

  it("vjClockOffsetMs averages the two middle offsets for an even count", () => {
    expect(
      vjClockOffsetMs([
        sampleWith(40, 40),
        sampleWith(10, 10),
        sampleWith(30, 30),
        sampleWith(20, 20),
      ]),
    ).toBe(25);
  });

  it("vjClockOffsetMs drops round trips over one second and negative ones", () => {
    expect(
      vjClockOffsetMs([
        sampleWith(1001, 999),
        sampleWith(-5, 999),
        sampleWith(1000, 7),
      ]),
    ).toBe(7);
  });

  it("vjClockOffsetMs is null with no usable sample", () => {
    expect(vjClockOffsetMs([])).toBeNull();
    expect(
      vjClockOffsetMs([
        sampleWith(1500, 10),
        sampleWith(-1, 10),
        { sentAt: 0, receivedAt: Number.NaN, serverNow: 10 },
      ]),
    ).toBeNull();
  });
});
