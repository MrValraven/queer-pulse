import { describe, expect, it } from "vitest";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import {
  createWheelState,
  emptyWheelProgress,
  wheelViewForCursor,
  type QuizshowWheelBonusAward,
} from "../quizshowWheel";
import { createQuizshowEngine } from "./quizshowEngine";
import type { QuizshowEngineState } from "./quizshowEngineTypes";
import {
  PICK_ROUND_NIGHT,
  wheelTestEngineOptions,
} from "./quizshowWheelTestFixtures";
import {
  buildPhaseChange,
  engineSessionStateFor,
  toRoundCard,
} from "./quizshowEngineViews";

const WHEEL_ROW_INDEX = 1;
const SLICE_ROW_INDEXES = [2, 3, 4];

/** A wheel night parked in a phase, with the wheel at row 1 open over its three slices. */
function stateInPhase(
  phase: QuizshowCursor["phase"],
  phaseId = "7",
): QuizshowEngineState {
  const state = createQuizshowEngine(wheelTestEngineOptions(PICK_ROUND_NIGHT));
  state.cursor = {
    ...state.cursor,
    phase,
    phaseId,
    roundIndex: WHEEL_ROW_INDEX,
    questionIndex: null,
  };
  state.wheelProgress = {
    ...emptyWheelProgress(),
    wheel: createWheelState(
      state.quiz.rounds,
      WHEEL_ROW_INDEX,
      SLICE_ROW_INDEXES,
    ),
  };
  return state;
}

function awardFor(phaseId: string): QuizshowWheelBonusAward {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 2,
    sliceTitle: { en: "Music", pt: "Music" },
    winners: [
      {
        entrantId: "player-1",
        kind: "player",
        name: "Ana",
        colorKey: null,
      },
    ],
    phaseId,
  };
}

describe("engine views carry the wheel", () => {
  it("sends the same wheel view to every audience in the wheel phase", () => {
    const state = stateInPhase("wheel");
    const publicFrame = buildPhaseChange(state, "public");
    const hostFrame = buildPhaseChange(state, "host");
    expect(publicFrame.wheel).not.toBeNull();
    expect(publicFrame.wheel).toEqual(hostFrame.wheel);
    expect(publicFrame.wheel).toEqual(
      wheelViewForCursor(state.quiz.rounds, state.wheelProgress, state.cursor),
    );
  });

  it("sends no round card in the wheel phase", () => {
    const state = stateInPhase("wheel");
    expect(state.cursor.roundIndex).toBe(WHEEL_ROW_INDEX);
    expect(buildPhaseChange(state, "public").round).toBeNull();
    expect(buildPhaseChange(state, "host").round).toBeNull();
  });

  it("carries the wheel on every role's session state", () => {
    const state = stateInPhase("wheel");
    const expectedWheel = wheelViewForCursor(
      state.quiz.rounds,
      state.wheelProgress,
      state.cursor,
    );
    expect(expectedWheel).not.toBeNull();
    const screenState = engineSessionStateFor(state, { role: "screen" });
    const playerState = engineSessionStateFor(state, {
      role: "player",
      memberKey: "member-ana",
      suggestedScreenName: "Ana",
    });
    const hostState = engineSessionStateFor(state, { role: "host" });
    expect(screenState.wheel).toEqual(expectedWheel);
    expect(playerState.wheel).toEqual(expectedWheel);
    expect(hostState.wheel).toEqual(expectedWheel);
  });

  it("sends the bonus only while its phase is current", () => {
    const state = stateInPhase("round_intro", "7");
    state.wheelProgress.wheelBonusAward = awardFor("7");
    const shownFrame = buildPhaseChange(state, "public");
    expect(shownFrame.wheelBonus).toEqual({
      points: 500,
      pick: "round",
      sliceRoundIndex: 2,
      sliceTitle: { en: "Music", pt: "Music" },
      winners: awardFor("7").winners,
    });
    expect(shownFrame.wheelBonus).not.toHaveProperty("phaseId");
    expect(engineSessionStateFor(state, { role: "host" }).wheelBonus).toEqual(
      shownFrame.wheelBonus,
    );
    state.cursor = { ...state.cursor, phaseId: "8" };
    expect(buildPhaseChange(state, "public").wheelBonus).toBeNull();
    expect(
      engineSessionStateFor(state, { role: "screen" }).wheelBonus,
    ).toBeNull();
  });

  it("marks a wheel row's round card as joker free", () => {
    const state = createQuizshowEngine(
      wheelTestEngineOptions(PICK_ROUND_NIGHT),
    );
    const wheelRow = state.quiz.rounds[WHEEL_ROW_INDEX];
    expect(wheelRow).toBeDefined();
    if (wheelRow === undefined) return;
    const wheelCard = toRoundCard(wheelRow, WHEEL_ROW_INDEX);
    expect(wheelCard.kind).toBe("wheel");
    expect(wheelCard.contentLabel).toBe("none");
    expect(wheelCard.questionCount).toBe(0);
    expect(wheelCard.isJokerAllowed).toBe(false);
    const screenState = engineSessionStateFor(state, { role: "screen" });
    expect(screenState.rounds).toHaveLength(state.quiz.rounds.length);
    expect(screenState.rounds[WHEEL_ROW_INDEX]?.roundIndex).toBe(
      WHEEL_ROW_INDEX,
    );
    expect(screenState.rounds[0]?.isJokerAllowed).toBe(true);
  });

  it("shows no label and no count on a wheel row that still holds draft content", () => {
    const state = createQuizshowEngine(
      wheelTestEngineOptions(PICK_ROUND_NIGHT),
    );
    const wheelRow = state.quiz.rounds[WHEEL_ROW_INDEX];
    const quizRow = state.quiz.rounds[0];
    expect(wheelRow).toBeDefined();
    expect(quizRow).toBeDefined();
    if (wheelRow === undefined || quizRow === undefined) return;
    const draftWheelRow = {
      ...wheelRow,
      contentLabel: "spicy" as const,
      questions: [...quizRow.questions.slice(0, 1)],
    };
    const wheelCard = toRoundCard(draftWheelRow, WHEEL_ROW_INDEX);
    expect(wheelCard.kind).toBe("wheel");
    expect(wheelCard.contentLabel).toBe("none");
    expect(wheelCard.questionCount).toBe(0);
    expect(wheelCard.isJokerAllowed).toBe(false);
  });

  it("sends no wheel outside the wheel and wheel questions", () => {
    const state = stateInPhase("leaderboard");
    expect(buildPhaseChange(state, "public").wheel).toBeNull();
    expect(buildPhaseChange(state, "host").wheel).toBeNull();
    expect(engineSessionStateFor(state, { role: "screen" }).wheel).toBeNull();
    expect(engineSessionStateFor(state, { role: "host" }).wheel).toBeNull();
  });
});
