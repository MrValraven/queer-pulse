import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjShuffle,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import { vjMirrorRingOf, type VjMirrorRingInput } from "./vjMirrorRing";

const DEFAULT_STATE = createVjStageState("epoch-1", 0);
const TEMPO_120: VjTempo = { ...DEFAULT_STATE.tempo, bpm: 120 };
const SHUFFLE_OFF: VjShuffle = { ...DEFAULT_STATE.shuffle, isOn: false };
const SHUFFLE_EIGHT_BEATS: VjShuffle = {
  ...DEFAULT_STATE.shuffle,
  isOn: true,
  intervalKind: "beats",
  intervalValue: 8,
};
const SHUFFLE_TEN_SECONDS: VjShuffle = {
  ...DEFAULT_STATE.shuffle,
  isOn: true,
  intervalKind: "seconds",
  intervalValue: 10,
};

function inputWith(overrides: Partial<VjMirrorRingInput>): VjMirrorRingInput {
  return {
    serverNowMs: 10_000,
    nextApplyAt: null,
    frameReceivedAt: null,
    shuffle: SHUFFLE_OFF,
    tempo: TEMPO_120,
    liveSince: null,
    ...overrides,
  };
}

describe("vjMirrorRingOf", () => {
  it("a queued frame wins over shuffle", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 10_500,
        frameReceivedAt: 10_000,
        nextApplyAt: 12_000,
        shuffle: SHUFFLE_TEN_SECONDS,
        liveSince: 9_000,
      }),
    );
    expect(ring).toEqual({ kind: "applyAt", progress: 0.25, msLeft: 1_500 });
  });

  it("a queued frame with no receipt time starts empty", () => {
    const ring = vjMirrorRingOf(
      inputWith({ serverNowMs: 10_000, nextApplyAt: 11_000 }),
    );
    expect(ring).toEqual({ kind: "applyAt", progress: 0, msLeft: 1_000 });
  });

  it("shuffle progress reads beats at the stage tempo", () => {
    // 8 beats at 120 BPM is 4000 ms; 1000 ms in is a quarter of the way.
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 11_000,
        shuffle: SHUFFLE_EIGHT_BEATS,
        liveSince: 10_000,
      }),
    );
    expect(ring).toEqual({ kind: "shuffle", progress: 0.25, msLeft: 3_000 });
  });

  it("clamps to 1 after the interval", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 25_000,
        shuffle: SHUFFLE_TEN_SECONDS,
        liveSince: 10_000,
      }),
    );
    expect(ring).toEqual({ kind: "shuffle", progress: 1, msLeft: 0 });
  });

  it("reads none with shuffle off or nothing live", () => {
    expect(vjMirrorRingOf(inputWith({ liveSince: 9_000 }))).toEqual({
      kind: "none",
    });
    expect(vjMirrorRingOf(inputWith({ shuffle: SHUFFLE_TEN_SECONDS }))).toEqual(
      { kind: "none" },
    );
  });
});
