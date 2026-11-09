import { describe, expect, it } from "vitest";
import type { QuizshowLobbyJoinInput } from "../../../shared/contracts/quizshow";
import type { QuizshowWheelState } from "../quizshowWheel";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import { applyWheelBonus } from "./quizshowEngineScoringStep";
import type {
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import {
  PICK_QUESTION_NIGHT,
  PICK_ROUND_NIGHT,
  wheelTestEngineOptions,
} from "./quizshowWheelTestFixtures";

function joinPayload(
  screenName: string,
  team: QuizshowLobbyJoinInput["team"] = null,
): QuizshowLobbyJoinInput {
  return { screenName, isAvatarShown: false, hasExtraTime: false, team };
}

/** Two players joined (Ana, Bruno); in teams play each leads a team of its own. */
function joinedEngine(
  quiz: typeof PICK_ROUND_NIGHT,
  playMode: "solo" | "teams" = "solo",
): QuizshowEngineState {
  let state = createQuizshowEngine(
    wheelTestEngineOptions(quiz, {
      playMode,
      maxTeamSize: playMode === "teams" ? 4 : null,
    }),
  );
  const members = [
    {
      memberKey: "member-ana",
      screenName: "Ana",
      teamName: "Circles",
      colorKey: "circle",
    },
    {
      memberKey: "member-bruno",
      screenName: "Bruno",
      teamName: "Triangles",
      colorKey: "triangle",
    },
  ] as const;
  for (const member of members) {
    state = reduceQuizshowEngine(state, {
      type: "player",
      memberKey: member.memberKey,
      name: "lobby:join",
      payload: joinPayload(
        member.screenName,
        playMode === "teams"
          ? { newTeam: { name: member.teamName, colorKey: member.colorKey } }
          : null,
      ),
      now: 0,
    }).state;
  }
  return state;
}

function wheelStateOf(
  pick: "round" | "question",
  baselineByEntrant: Record<string, number> | null,
): QuizshowWheelState {
  return {
    wheelRoundIndex: 1,
    pick,
    sliceRoundIndexes: [2, 3, 4],
    askedCounts: [0, 0, 0],
    pickedCount: 1,
    spinTotal: 3,
    spin: null,
    restAngle: 0,
    playingRoundIndex: 2,
    baselineByEntrant,
  };
}

function questionPlay(
  pointsByPlayer: Record<string, number>,
  teamPoints: Record<string, number>,
): QuizshowEngineQuestionPlay {
  return {
    questionId: "r2-q0",
    roundIndex: 2,
    questionIndex: 0,
    eligiblePlayerIds: Object.keys(pointsByPlayer),
    extraTimePlayerIds: [],
    answers: [],
    votes: [],
    voteOptions: null,
    favouriteOptionId: null,
    isScored: true,
    wasSkipped: false,
    pointsByPlayer,
    teamPoints,
    myReveals: {},
  };
}

function withOpenWheel(
  state: QuizshowEngineState,
  wheel: QuizshowWheelState | null,
): QuizshowEngineState {
  const copy = structuredClone(state);
  copy.wheelProgress = { ...copy.wheelProgress, wheel };
  return copy;
}

function playerNamed(state: QuizshowEngineState, screenName: string) {
  const player = state.players.find(
    (candidate) => candidate.screenName === screenName,
  );
  if (player === undefined) throw new Error(`No player named ${screenName}.`);
  return player;
}

/** Ana and Bruno with the given totals, and a pick-a-round wheel open on slice row 2. */
function pickRoundState(
  anaTotal: number,
  brunoTotal: number,
  baselineByName: { ana: number; bruno: number } | null,
): { state: QuizshowEngineState; anaId: string; brunoId: string } {
  const joined = structuredClone(joinedEngine(PICK_ROUND_NIGHT));
  const anaId = playerNamed(joined, "Ana").playerId;
  const brunoId = playerNamed(joined, "Bruno").playerId;
  playerNamed(joined, "Ana").score = anaTotal;
  playerNamed(joined, "Bruno").score = brunoTotal;
  const baseline =
    baselineByName === null
      ? null
      : { [anaId]: baselineByName.ana, [brunoId]: baselineByName.bruno };
  return {
    state: withOpenWheel(joined, wheelStateOf("round", baseline)),
    anaId,
    brunoId,
  };
}

describe("applyWheelBonus", () => {
  it("returns null for a slice with no bonus", () => {
    const { state } = pickRoundState(2500, 2400, { ana: 1000, bruno: 2000 });
    expect(applyWheelBonus(state, 3)).toBeNull();
    expect(playerNamed(state, "Ana").score).toBe(2500);
    expect(playerNamed(state, "Bruno").score).toBe(2400);
  });

  it("pays the round's best scorer since the baseline", () => {
    const { state, anaId } = pickRoundState(2500, 2400, {
      ana: 1000,
      bruno: 2000,
    });
    expect(applyWheelBonus(state, 2)).toEqual({
      points: 500,
      pick: "round",
      sliceRoundIndex: 2,
      sliceTitle: { en: "Music", pt: "Music" },
      winners: [
        { entrantId: anaId, kind: "player", name: "Ana", colorKey: null },
      ],
    });
    expect(playerNamed(state, "Ana").score).toBe(3000);
    expect(playerNamed(state, "Bruno").score).toBe(2400);
  });

  it("pays every tie the full bonus", () => {
    const { state, anaId, brunoId } = pickRoundState(1600, 2600, {
      ana: 1000,
      bruno: 2000,
    });
    const view = applyWheelBonus(state, 2);
    expect(view?.winners.map((winner) => winner.entrantId)).toEqual([
      anaId,
      brunoId,
    ]);
    expect(playerNamed(state, "Ana").score).toBe(2100);
    expect(playerNamed(state, "Bruno").score).toBe(3100);
  });

  it("pays nobody when the best is zero", () => {
    const { state } = pickRoundState(1000, 2000, { ana: 1000, bruno: 2000 });
    expect(applyWheelBonus(state, 2)).toBeNull();
    expect(playerNamed(state, "Ana").score).toBe(1000);
    expect(playerNamed(state, "Bruno").score).toBe(2000);
  });

  it("leaves out a player removed during the round", () => {
    const { state, brunoId } = pickRoundState(3000, 2400, {
      ana: 1000,
      bruno: 2000,
    });
    playerNamed(state, "Ana").isRemoved = true;
    const view = applyWheelBonus(state, 2);
    expect(view?.winners.map((winner) => winner.entrantId)).toEqual([brunoId]);
    expect(playerNamed(state, "Bruno").score).toBe(2900);
    expect(playerNamed(state, "Ana").score).toBe(3000);
  });

  it("counts a late joiner from zero", () => {
    const joined = structuredClone(joinedEngine(PICK_ROUND_NIGHT));
    const anaId = playerNamed(joined, "Ana").playerId;
    const brunoId = playerNamed(joined, "Bruno").playerId;
    playerNamed(joined, "Ana").score = 1400;
    playerNamed(joined, "Bruno").score = 700;
    const state = withOpenWheel(
      joined,
      wheelStateOf("round", { [anaId]: 1000 }),
    );
    const view = applyWheelBonus(state, 2);
    expect(view?.winners.map((winner) => winner.entrantId)).toEqual([brunoId]);
    expect(playerNamed(state, "Bruno").score).toBe(1200);
    expect(playerNamed(state, "Ana").score).toBe(1400);
  });

  it("pays a pick-a-question winner from the question's points", () => {
    const joined = structuredClone(joinedEngine(PICK_QUESTION_NIGHT));
    const anaId = playerNamed(joined, "Ana").playerId;
    const brunoId = playerNamed(joined, "Bruno").playerId;
    playerNamed(joined, "Ana").score = 5000;
    playerNamed(joined, "Bruno").score = 100;
    const state = withOpenWheel(joined, wheelStateOf("question", null));
    state.current = questionPlay({ [anaId]: 0, [brunoId]: 800 }, {});
    const view = applyWheelBonus(state, 2);
    expect(view).toMatchObject({
      points: 500,
      pick: "question",
      sliceRoundIndex: 2,
    });
    expect(view?.winners.map((winner) => winner.entrantId)).toEqual([brunoId]);
    expect(playerNamed(state, "Bruno").score).toBe(600);
    expect(playerNamed(state, "Ana").score).toBe(5000);
  });

  it("pays nobody on a pick-a-question wheel without a question in play", () => {
    const joined = structuredClone(joinedEngine(PICK_QUESTION_NIGHT));
    const state = withOpenWheel(joined, wheelStateOf("question", null));
    state.current = null;
    expect(applyWheelBonus(state, 2)).toBeNull();
  });

  it("pays the team in teams mode and keeps members' own scores", () => {
    const joined = structuredClone(joinedEngine(PICK_QUESTION_NIGHT, "teams"));
    const anaId = playerNamed(joined, "Ana").playerId;
    const brunoId = playerNamed(joined, "Bruno").playerId;
    const circleTeam = joined.teams.find((team) => team.name === "Circles");
    const triangleTeam = joined.teams.find((team) => team.name === "Triangles");
    if (circleTeam === undefined || triangleTeam === undefined) {
      throw new Error("Both teams should exist.");
    }
    circleTeam.score = 1000;
    triangleTeam.score = 900;
    playerNamed(joined, "Ana").score = 1000;
    playerNamed(joined, "Bruno").score = 900;
    const state = withOpenWheel(joined, wheelStateOf("question", null));
    state.current = questionPlay(
      { [anaId]: 600, [brunoId]: 0 },
      { [circleTeam.teamId]: 600, [triangleTeam.teamId]: 0 },
    );
    const view = applyWheelBonus(state, 2);
    expect(view?.winners).toEqual([
      {
        entrantId: circleTeam.teamId,
        kind: "team",
        name: "Circles",
        colorKey: "circle",
      },
    ]);
    const circleAfter = state.teams.find(
      (team) => team.teamId === circleTeam.teamId,
    );
    expect(circleAfter?.score).toBe(1500);
    expect(
      state.teams.find((team) => team.teamId === triangleTeam.teamId)?.score,
    ).toBe(900);
    expect(playerNamed(state, "Ana").score).toBe(1000);
    expect(playerNamed(state, "Bruno").score).toBe(900);
  });

  it("returns null without an open wheel", () => {
    const joined = structuredClone(joinedEngine(PICK_ROUND_NIGHT));
    playerNamed(joined, "Ana").score = 2500;
    const state = withOpenWheel(joined, null);
    expect(applyWheelBonus(state, 2)).toBeNull();
    expect(playerNamed(state, "Ana").score).toBe(2500);
  });
});
