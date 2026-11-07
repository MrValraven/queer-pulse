import { describe, expect, it } from "vitest";
import {
  VJ_LIMITS,
  createVjStageState,
  type VjStageState,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { vjClockReaderOf, vjEngineLookOf } from "./vjEngineLook";
import {
  createVjFrameUniformValues,
  writeVjFrameUniforms,
} from "./vjFrameUniforms";

function stageAt120(overrides: Partial<VjStageState> = {}): VjStageState {
  const state = createVjStageState("epoch-1", 0);
  return {
    ...state,
    revision: 12,
    tempo: { ...state.tempo, bpm: 120, downbeatAt: 0 },
    ...overrides,
  };
}

const TEMPO_120: VjTempo = {
  bpm: 120,
  downbeatAt: 0,
  quantize: "off",
  source: "manual",
};

describe("vjEngineLookOf", () => {
  it("builds the version key from epoch and revision", () => {
    const look = vjEngineLookOf(stageAt120(), { isStrobeEnabled: true });
    expect(look.versionKey).toBe("epoch-1|12");
  });

  it("uses vjBlackoutFadeMs for the blackout", () => {
    const fourBeats = vjEngineLookOf(
      stageAt120({
        transition: { mode: "fade", length: { unit: "beats", value: 4 } },
      }),
      { isStrobeEnabled: false },
    );
    expect(fourBeats.blackoutFadeMs).toBe(2000);

    const sixteenBeats = vjEngineLookOf(
      stageAt120({
        transition: { mode: "fade", length: { unit: "beats", value: 16 } },
      }),
      { isStrobeEnabled: false },
    );
    expect(sixteenBeats.blackoutFadeMs).toBe(VJ_LIMITS.fadeMsMax);
  });

  it("resolves a beat-length transition at the stage tempo", () => {
    const look = vjEngineLookOf(
      stageAt120({
        transition: { mode: "iris", length: { unit: "beats", value: 2 } },
      }),
      { isStrobeEnabled: true },
    );
    expect(look.transition).toEqual({ mode: "iris", durationMs: 1000 });
  });

  it("copies effects, mix and strobe with the screen's strobe permission", () => {
    const state = stageAt120();
    const look = vjEngineLookOf(
      {
        ...state,
        effects: {
          ...state.effects,
          isStrobing: true,
          isBlackout: true,
          speed: 2,
        },
        mix: { clipId: "clip-9", amount: 0.4, blendMode: "screen" },
      },
      { isStrobeEnabled: false },
    );
    expect(look.strobe).toEqual({ isStrobing: true, isEnabled: false });
    expect(look.isBlackout).toBe(true);
    expect(look.speed).toBe(2);
    expect(look.mix).toEqual({ amount: 0.4, blendMode: "screen" });
  });
});

describe("vjClockReaderOf", () => {
  it("answers performance.now() time for a server time the shared clock maps to vjLocalNow time", () => {
    const offsetMs = 5000;
    const source = {
      serverNow: () => performance.timeOrigin + performance.now() + offsetMs,
      toLocalTime: (serverMs: number) => serverMs - offsetMs,
    };
    const reader = vjClockReaderOf(source);
    const serverMs = performance.timeOrigin + 10_000 + offsetMs;
    expect(reader.toLocalTime(serverMs)).toBeCloseTo(10_000, 6);
  });

  it("passes serverNow through unchanged", () => {
    const reader = vjClockReaderOf({
      serverNow: () => 1_700_000_000_000,
      toLocalTime: (serverMs) => serverMs,
    });
    expect(reader.serverNow()).toBe(1_700_000_000_000);
  });

  it("reads the source on every call, so a slewed offset shows at once", () => {
    let offsetMs = 100;
    const reader = vjClockReaderOf({
      serverNow: () => 0,
      toLocalTime: (serverMs) => serverMs - offsetMs,
    });
    const before = reader.toLocalTime(1000);
    offsetMs = 150;
    expect(reader.toLocalTime(1000)).toBeCloseTo(before - 50, 6);
  });
});

describe("writeVjFrameUniforms", () => {
  it("writes beat, bar and pulse values on the synced clock", () => {
    const values = createVjFrameUniformValues();
    writeVjFrameUniforms(values, {
      engineTimeMs: 0,
      speed: 1,
      serverNowMs: 1250,
      tempo: TEMPO_120,
      micLevel: null,
      width: 1920,
      height: 1080,
    });
    expect(values.uResolution).toEqual([1920, 1080]);
    expect(values.beatIndex).toBe(2);
    expect(values.beatPeriodMs).toBe(500);
    expect(values.uBeats).toBeCloseTo(2.5);
    expect(values.uBeatPhase).toBeCloseTo(0.5);
    expect(values.uBarPhase).toBeCloseTo(2.5 / 4);
    expect(values.uBeatPulse).toBeCloseTo(Math.exp(-3));
    expect(values.uDrive).toBeCloseTo(values.uBeatPulse);
  });

  it("drives from the mic level when the mic is on", () => {
    const values = createVjFrameUniformValues();
    writeVjFrameUniforms(values, {
      engineTimeMs: 0,
      speed: 1,
      serverNowMs: 0,
      tempo: TEMPO_120,
      micLevel: 0.25,
      width: 1,
      height: 1,
    });
    expect(values.uDrive).toBe(0.25);
  });

  it("advances uTime at the stage speed with no jump when the speed changes", () => {
    const values = createVjFrameUniformValues();
    const frame = {
      serverNowMs: 0,
      tempo: TEMPO_120,
      micLevel: null,
      width: 1,
      height: 1,
    };
    writeVjFrameUniforms(values, { ...frame, engineTimeMs: 1000, speed: 1 });
    expect(values.uTime).toBeCloseTo(1);
    writeVjFrameUniforms(values, { ...frame, engineTimeMs: 1100, speed: 2 });
    expect(values.uTime).toBeCloseTo(1.2);
    writeVjFrameUniforms(values, { ...frame, engineTimeMs: 1200, speed: 0.5 });
    expect(values.uTime).toBeCloseTo(1.25);
  });
});
