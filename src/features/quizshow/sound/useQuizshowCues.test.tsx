import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizshowPhase,
  QuizshowScreenState,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPodiumEntry,
} from "../../../shared/contracts/quizshow";
import type { QuizshowCue } from "./quizshowCues";
import { useQuizshowCues, useQuizshowSoundLevel } from "./useQuizshowCues";

const cueMock = vi.hoisted(() => ({
  playQuizshowCue: vi.fn(),
  isAudioRunning: false,
  applySoundLevel: vi.fn(),
  resumeQuizshowAudio: vi.fn(),
  storedLevel: "normal",
}));
vi.mock("./quizshowCues", () => ({
  playQuizshowCue: cueMock.playQuizshowCue,
  isQuizshowAudioRunning: () => cueMock.isAudioRunning,
  resumeQuizshowAudio: cueMock.resumeQuizshowAudio,
  applySoundLevel: cueMock.applySoundLevel,
  readStoredSoundLevel: () => cueMock.storedLevel,
  saveSoundLevel: (level: string) => {
    cueMock.storedLevel = level;
  },
}));

const NOW_MS = Date.parse("2026-10-19T20:00:00Z");
const ALL_CUES: readonly QuizshowCue[] = [
  "playerJoined",
  "questionOpens",
  "timeAlmostUp",
  "reveal",
  "podium",
  "podiumDrum",
];

interface StateOptions {
  phaseId: string;
  phase: QuizshowPhase;
  playerCount?: number;
  deadline?: number | null;
  /** The podium places shown so far (screen role: revealed ones only). */
  podiumPlaces?: number[];
}

function podiumOf(places: readonly number[]): QuizshowPodiumEntry[] {
  return places.map(
    (place) =>
      ({
        entrantId: `entrant-${place}`,
        place,
        name: `Place ${place}`,
        score: 100 * (4 - place),
        colorKey: null,
      }) as unknown as QuizshowPodiumEntry,
  );
}

function stateWith(options: StateOptions): QuizshowClientState {
  const session = {
    role: "screen",
    isScreenMuted: false,
    lobby: {
      players: [],
      teams: [],
      playerCount: options.playerCount ?? 0,
    },
    cursor: {
      phaseId: options.phaseId,
      phase: options.phase,
      deadline: options.deadline ?? null,
      extraTimeDeadline: null,
    },
    podium:
      options.podiumPlaces === undefined
        ? null
        : podiumOf(options.podiumPlaces),
  } as unknown as QuizshowScreenState;
  return { ...createQuizshowClientState("screen"), session };
}

function renderCues(
  initial: QuizshowClientState,
  isMuted = false,
  cues: readonly QuizshowCue[] = ALL_CUES,
) {
  return renderHook(
    (props: { state: QuizshowClientState; isMuted: boolean }) =>
      useQuizshowCues(props.state, {
        isMuted: props.isMuted,
        clockOffsetMs: 0,
        cues,
      }),
    { initialProps: { state: initial, isMuted } },
  );
}

function playedCues(): string[] {
  return cueMock.playQuizshowCue.mock.calls.map((call) => String(call[0]));
}

describe("useQuizshowCues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
    cueMock.playQuizshowCue.mockReset();
    cueMock.applySoundLevel.mockReset();
    cueMock.resumeQuizshowAudio.mockReset();
    cueMock.isAudioRunning = false;
    cueMock.storedLevel = "normal";
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("chimes once when the lobby grows, at most once a second", () => {
    const view = renderCues(stateWith({ phaseId: "1", phase: "lobby" }));
    view.rerender({
      state: stateWith({ phaseId: "1", phase: "lobby", playerCount: 1 }),
      isMuted: false,
    });
    view.rerender({
      state: stateWith({ phaseId: "1", phase: "lobby", playerCount: 2 }),
      isMuted: false,
    });
    expect(playedCues()).toEqual(["playerJoined"]);
    vi.advanceTimersByTime(1100);
    view.rerender({
      state: stateWith({ phaseId: "1", phase: "lobby", playerCount: 3 }),
      isMuted: false,
    });
    expect(playedCues()).toEqual(["playerJoined", "playerJoined"]);
  });

  it("plays the question cue when open or write starts", () => {
    const view = renderCues(stateWith({ phaseId: "1", phase: "read" }));
    view.rerender({
      state: stateWith({ phaseId: "2", phase: "open" }),
      isMuted: false,
    });
    view.rerender({
      state: stateWith({ phaseId: "3", phase: "write" }),
      isMuted: false,
    });
    expect(playedCues()).toEqual(["questionOpens", "questionOpens"]);
  });

  it("ticks once when five seconds are left", () => {
    renderCues(
      stateWith({ phaseId: "2", phase: "open", deadline: NOW_MS + 6000 }),
      false,
      ["timeAlmostUp"],
    );
    expect(playedCues()).toEqual([]);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(playedCues()).toEqual(["timeAlmostUp"]);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(playedCues()).toEqual(["timeAlmostUp"]);
  });

  it("plays nothing when the screen loads with under five seconds left", () => {
    renderCues(
      stateWith({ phaseId: "2", phase: "open", deadline: NOW_MS + 3000 }),
      false,
      ["timeAlmostUp"],
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(playedCues()).toEqual([]);
  });

  it("plays the reveal and the podium cue", () => {
    const view = renderCues(stateWith({ phaseId: "2", phase: "open" }));
    view.rerender({
      state: stateWith({ phaseId: "3", phase: "reveal" }),
      isMuted: false,
    });
    view.rerender({
      state: stateWith({ phaseId: "4", phase: "podium" }),
      isMuted: false,
    });
    expect(playedCues()).toEqual(["reveal", "podium"]);
  });

  it("stays silent while muted", () => {
    const view = renderCues(stateWith({ phaseId: "2", phase: "open" }), true);
    view.rerender({
      state: stateWith({ phaseId: "3", phase: "reveal" }),
      isMuted: true,
    });
    view.rerender({
      state: stateWith({ phaseId: "4", phase: "podium" }),
      isMuted: true,
    });
    expect(playedCues()).toEqual([]);
  });

  it("plays only the cues it is given", () => {
    const view = renderCues(stateWith({ phaseId: "2", phase: "open" }), false, [
      "timeAlmostUp",
    ]);
    view.rerender({
      state: stateWith({ phaseId: "3", phase: "reveal" }),
      isMuted: false,
    });
    expect(playedCues()).toEqual([]);
  });

  it("plays the podium cue per place, then the drum on the beat before the winner", () => {
    const view = renderCues(stateWith({ phaseId: "8", phase: "leaderboard" }));
    const podiumStep = (phaseId: string, places: number[]) => {
      view.rerender({
        state: stateWith({ phaseId, phase: "podium", podiumPlaces: places }),
        isMuted: false,
      });
    };
    podiumStep("9", []);
    expect(playedCues()).toEqual(["podium"]);
    vi.advanceTimersByTime(400);
    podiumStep("10", [3]);
    expect(playedCues()).toEqual(["podium", "podium"]);
    vi.advanceTimersByTime(400);
    podiumStep("11", [3, 2]);
    expect(playedCues()).toEqual(["podium", "podium", "podium"]);
    // The step's phase arrives before its podium frame: nothing yet.
    podiumStep("12", [3, 2]);
    expect(playedCues()).toHaveLength(3);
    podiumStep("12", [3, 2, 1]);
    expect(playedCues()).toEqual(["podium", "podium", "podium", "podiumDrum"]);
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_LIMITS.podiumWinnerHoldMs - 1);
    });
    expect(playedCues()).toHaveLength(4);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(playedCues()).toEqual([
      "podium",
      "podium",
      "podium",
      "podiumDrum",
      "podium",
    ]);
  });

  it("plays no drum when the screen loads with the winner already shown", () => {
    const view = renderCues(
      stateWith({ phaseId: "12", phase: "podium", podiumPlaces: [3, 2, 1] }),
    );
    view.rerender({
      state: stateWith({
        phaseId: "12",
        phase: "podium",
        podiumPlaces: [3, 2, 1],
      }),
      isMuted: false,
    });
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_LIMITS.podiumWinnerHoldMs);
    });
    expect(playedCues()).toEqual([]);
  });

  it("says when audio runs and asks for it on a tap", () => {
    const view = renderCues(stateWith({ phaseId: "1", phase: "lobby" }));
    expect(view.result.current.isAudioRunning).toBe(false);
    cueMock.isAudioRunning = true;
    act(() => {
      view.result.current.resumeAudio();
    });
    expect(cueMock.resumeQuizshowAudio).toHaveBeenCalledTimes(1);
    expect(view.result.current.isAudioRunning).toBe(true);
    cueMock.isAudioRunning = false;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(view.result.current.isAudioRunning).toBe(false);
  });
});

describe("useQuizshowSoundLevel", () => {
  beforeEach(() => {
    cueMock.applySoundLevel.mockReset();
    cueMock.storedLevel = "venue";
  });

  it("starts from the stored level, keeps a change and goes back to Normal on unmount", () => {
    const view = renderHook(() => useQuizshowSoundLevel());
    expect(view.result.current.soundLevel).toBe("venue");
    expect(cueMock.applySoundLevel).toHaveBeenLastCalledWith("venue");
    act(() => {
      view.result.current.changeSoundLevel("quiet");
    });
    expect(view.result.current.soundLevel).toBe("quiet");
    expect(cueMock.storedLevel).toBe("quiet");
    expect(cueMock.applySoundLevel).toHaveBeenLastCalledWith("quiet");
    view.unmount();
    expect(cueMock.applySoundLevel).toHaveBeenLastCalledWith("normal");
  });
});
