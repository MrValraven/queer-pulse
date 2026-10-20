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
import type { QuizshowCue } from "./quizshowCues";
import { useQuizshowCues } from "./useQuizshowCues";

const cueMock = vi.hoisted(() => ({ playQuizshowCue: vi.fn() }));
vi.mock("./quizshowCues", () => ({
  playQuizshowCue: cueMock.playQuizshowCue,
}));

const NOW_MS = Date.parse("2026-10-19T20:00:00Z");
const ALL_CUES: readonly QuizshowCue[] = [
  "playerJoined",
  "questionOpens",
  "timeAlmostUp",
  "reveal",
  "podium",
];

interface StateOptions {
  phaseId: string;
  phase: QuizshowPhase;
  playerCount?: number;
  deadline?: number | null;
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
});
