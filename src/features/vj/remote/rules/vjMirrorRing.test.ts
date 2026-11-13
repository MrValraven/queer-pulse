import { describe, expect, it } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  type VjSetlistPlayback,
  type VjShuffle,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import {
  isVjMirrorRingCounting,
  vjMirrorRingOf,
  type VjMirrorRingInput,
} from "./vjMirrorRing";

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
const IDLE_PLAYBACK = createVjSetlistPlayback(false);
const PLAYING_PLAYBACK: VjSetlistPlayback = {
  ...IDLE_PLAYBACK,
  status: "playing",
  itemId: "item-2",
  stepStartedAt: 10_000,
  stepEndsAt: 18_000,
  stepDurationMs: 8_000,
};
const PAUSED_PLAYBACK: VjSetlistPlayback = {
  ...IDLE_PLAYBACK,
  status: "paused",
  itemId: "item-2",
  stepDurationMs: 8_000,
  pausedRemainingMs: 6_000,
};

function inputWith(overrides: Partial<VjMirrorRingInput>): VjMirrorRingInput {
  return {
    serverNowMs: 10_000,
    nextApplyAt: null,
    frameReceivedAt: null,
    shuffle: SHUFFLE_OFF,
    tempo: TEMPO_120,
    liveSince: null,
    setlistPlayback: IDLE_PLAYBACK,
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

  it("a playing sequence wins over the timer's own queued frame", () => {
    // The step timer queues its frame 300 ms before the step ends.
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 17_800,
        frameReceivedAt: 17_700,
        nextApplyAt: 18_000,
        setlistPlayback: PLAYING_PLAYBACK,
      }),
    );
    expect(ring).toEqual({
      kind: "setlist",
      progress: 0.975,
      msLeft: 200,
      isPaused: false,
    });
  });

  it("a queued frame wins over a paused sequence", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 10_500,
        frameReceivedAt: 10_000,
        nextApplyAt: 12_000,
        setlistPlayback: PAUSED_PLAYBACK,
      }),
    );
    expect(ring).toEqual({ kind: "applyAt", progress: 0.25, msLeft: 1_500 });
  });

  it("a playing sequence fills from stepStartedAt to stepEndsAt and wins over shuffle", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        serverNowMs: 12_000,
        shuffle: SHUFFLE_TEN_SECONDS,
        liveSince: 9_000,
        setlistPlayback: PLAYING_PLAYBACK,
      }),
    );
    expect(ring).toEqual({
      kind: "setlist",
      progress: 0.25,
      msLeft: 6_000,
      isPaused: false,
    });
  });

  it("a playing step past its end reads full with nothing left", () => {
    const ring = vjMirrorRingOf(
      inputWith({ serverNowMs: 19_000, setlistPlayback: PLAYING_PLAYBACK }),
    );
    expect(ring).toEqual({
      kind: "setlist",
      progress: 1,
      msLeft: 0,
      isPaused: false,
    });
  });

  it("a paused sequence holds the share its step had run", () => {
    const early = vjMirrorRingOf(
      inputWith({ serverNowMs: 12_000, setlistPlayback: PAUSED_PLAYBACK }),
    );
    const later = vjMirrorRingOf(
      inputWith({ serverNowMs: 90_000, setlistPlayback: PAUSED_PLAYBACK }),
    );
    expect(early).toEqual({
      kind: "setlist",
      progress: 0.25,
      msLeft: 6_000,
      isPaused: true,
    });
    expect(later).toEqual(early);
  });

  it("a paused clock with a zero length reads full", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        setlistPlayback: {
          ...PAUSED_PLAYBACK,
          stepDurationMs: 0,
          pausedRemainingMs: 0,
        },
      }),
    );
    expect(ring).toEqual({
      kind: "setlist",
      progress: 1,
      msLeft: 0,
      isPaused: true,
    });
  });

  it("other statuses leave the ring to shuffle", () => {
    for (const status of [
      "manual",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const ring = vjMirrorRingOf(
        inputWith({
          serverNowMs: 11_000,
          shuffle: SHUFFLE_EIGHT_BEATS,
          liveSince: 10_000,
          setlistPlayback: { ...IDLE_PLAYBACK, status, stepDurationMs: 8_000 },
        }),
      );
      expect(ring.kind).toBe("shuffle");
    }
  });

  it("a playing status with no clock shows no ring", () => {
    const ring = vjMirrorRingOf(
      inputWith({
        setlistPlayback: { ...PLAYING_PLAYBACK, stepEndsAt: null },
      }),
    );
    expect(ring).toEqual({ kind: "none" });
  });
});

describe("isVjMirrorRingCounting", () => {
  it("ticks while a frame waits, a sequence plays or shuffle runs", () => {
    const base = {
      nextApplyAt: null,
      shuffle: SHUFFLE_OFF,
      setlistPlayback: IDLE_PLAYBACK,
    };
    expect(isVjMirrorRingCounting(base)).toBe(false);
    expect(isVjMirrorRingCounting({ ...base, nextApplyAt: 5 })).toBe(true);
    expect(
      isVjMirrorRingCounting({ ...base, setlistPlayback: PLAYING_PLAYBACK }),
    ).toBe(true);
    expect(
      isVjMirrorRingCounting({ ...base, setlistPlayback: PAUSED_PLAYBACK }),
    ).toBe(false);
    expect(
      isVjMirrorRingCounting({ ...base, shuffle: SHUFFLE_TEN_SECONDS }),
    ).toBe(true);
  });
});
