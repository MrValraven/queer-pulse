import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizshowScreenState,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
} from "../../../shared/contracts/quizshow";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowCue } from "./quizshowCues";
import { useQuizshowWheelCues } from "./useQuizshowWheelCues";

const cueMock = vi.hoisted(() => ({ playQuizshowCue: vi.fn() }));
vi.mock("./quizshowCues", () => ({
  playQuizshowCue: cueMock.playQuizshowCue,
}));

const NOW_MS = Date.parse("2026-11-09T20:00:00Z");
const SPIN_MS = 5500;
const WHEEL_CUES: readonly QuizshowCue[] = ["wheelTick", "wheelLand"];

function sliceOf(roundIndex: number): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: `Round ${roundIndex}`, pt: `Ronda ${roundIndex}` },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 3,
    isPlayed: false,
  };
}

function spinStartedAt(startedAt: number): QuizshowWheelSpin {
  return {
    landedSliceIndex: 1,
    startedAt,
    durationMs: SPIN_MS,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
  };
}

function stateWithSpin(spin: QuizshowWheelSpin | null): QuizshowClientState {
  const session = {
    role: "screen",
    wheel: {
      wheelRoundIndex: 0,
      pick: "round",
      slices: [sliceOf(1), sliceOf(2), sliceOf(3), sliceOf(4)],
      spinNumber: 1,
      spinTotal: 1,
      spin,
      playingRoundIndex: null,
    },
    wheelBonus: null,
  } as unknown as QuizshowScreenState;
  return { ...createQuizshowClientState("screen"), session };
}

interface RenderOptions {
  isMuted?: boolean;
  isReducedMotion?: boolean;
  cues?: readonly QuizshowCue[];
}

function renderWheelCues(
  initial: QuizshowClientState,
  options: RenderOptions = {},
) {
  const {
    isMuted = false,
    isReducedMotion = false,
    cues = WHEEL_CUES,
  } = options;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ReducedMotionContext.Provider value={isReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
  return renderHook(
    (props: { state: QuizshowClientState }) =>
      useQuizshowWheelCues(props.state, { isMuted, clockOffsetMs: 0, cues }),
    { initialProps: { state: initial }, wrapper },
  );
}

function playedCues(): string[] {
  return cueMock.playQuizshowCue.mock.calls.map((call) => String(call[0]));
}

function countOf(cue: QuizshowCue): number {
  return playedCues().filter((playedCue) => playedCue === cue).length;
}

function runFrames(totalMs: number): void {
  act(() => {
    vi.advanceTimersByTime(totalMs);
  });
}

describe("useQuizshowWheelCues", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    vi.setSystemTime(NOW_MS);
    cueMock.playQuizshowCue.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("plays ticks then one landing cue for a spin seen in the air", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - 1000)));
    runFrames(SPIN_MS);
    expect(countOf("wheelTick")).toBeGreaterThan(0);
    expect(countOf("wheelLand")).toBe(1);
    expect(playedCues().at(-1)).toBe("wheelLand");
    runFrames(2000);
    expect(countOf("wheelLand")).toBe(1);
  });

  it("plays nothing for a spin that landed before it was seen", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - SPIN_MS - 500)));
    runFrames(SPIN_MS);
    expect(playedCues()).toEqual([]);
  });

  it("skips the landing cue when the tab wakes long after the stop", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - 1000)));
    act(() => {
      vi.setSystemTime(NOW_MS + SPIN_MS);
      vi.advanceTimersByTime(50);
    });
    expect(countOf("wheelLand")).toBe(0);
  });

  it("plays the landing cue without ticks under reduced motion", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - 1000)), {
      isReducedMotion: true,
    });
    runFrames(SPIN_MS);
    expect(playedCues()).toEqual(["wheelLand"]);
  });

  it("stays silent while muted", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - 1000)), {
      isMuted: true,
    });
    runFrames(SPIN_MS);
    expect(playedCues()).toEqual([]);
  });

  it("stays silent when the cue list leaves the wheel cues out", () => {
    renderWheelCues(stateWithSpin(spinStartedAt(NOW_MS - 1000)), {
      cues: ["playerJoined", "reveal"],
    });
    runFrames(SPIN_MS);
    expect(playedCues()).toEqual([]);
  });

  it("does not replay the landing for the same spin re-sent", () => {
    const spin = spinStartedAt(NOW_MS - 1000);
    const view = renderWheelCues(stateWithSpin(spin));
    runFrames(SPIN_MS);
    expect(countOf("wheelLand")).toBe(1);
    const tickCount = countOf("wheelTick");
    view.rerender({ state: stateWithSpin({ ...spin }) });
    runFrames(SPIN_MS);
    expect(countOf("wheelLand")).toBe(1);
    expect(countOf("wheelTick")).toBe(tickCount);
  });
});
