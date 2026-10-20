import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowPhase,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
} from "../../../shared/contracts/quizshow";
import { createBotState, planBotActions } from "./quizshowBots";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineAction,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import {
  QUIZSHOW_SIMULATED_PLAYERS,
  QUIZSHOW_SIMULATED_TEXTS,
} from "./quizshowSimulatedPlayers.data";

const questionShared = {
  prompt: { en: "Which one?", pt: "Qual?" },
  mediaRef: null,
  mediaUrl: null,
  timeLimitSeconds: null,
  points: 1000,
};

const multipleChoice: QuizshowQuestion = {
  ...questionShared,
  id: "question-mc",
  type: "multiple_choice",
  options: [
    { id: "a", text: { en: "A", pt: "A" } },
    { id: "b", text: { en: "B", pt: "B" } },
    { id: "c", text: { en: "C", pt: "C" } },
    { id: "d", text: { en: "D", pt: "D" } },
  ],
  answer: { correctIndex: 2 },
  acceptedAnswers: [],
};

const lieDetectorQuestion: QuizshowQuestion = {
  ...questionShared,
  id: "question-lie",
  type: "prompt",
  options: [],
  answer: { truth: { en: "The real one", pt: "A verdadeira" } },
  acceptedAnswers: [],
};

function roundOf(
  kind: QuizshowRound["kind"],
  questions: QuizshowQuestion[],
  isJokerAllowed = true,
): QuizshowRound {
  return {
    id: `round-${kind}`,
    kind,
    title: { en: "Round", pt: "Ronda" },
    contentLabel: "none",
    settings: {
      timeLimitSeconds: 20,
      isSpeedBonusOn: true,
      isJokerAllowed,
      writeSeconds: 60,
      voteSeconds: 30,
    },
    questions,
  };
}

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Fixture",
    languages: "en",
    screenLanguage: "en",
    starterPackKey: null,
    updatedAt: "2026-10-19T00:00:00.000Z",
    rounds,
  };
}

function lobbyEngine(playMode: "solo" | "teams", quiz: QuizshowQuiz) {
  return createQuizshowEngine({
    quiz,
    playMode,
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "fixture",
    eventTitle: "Fixture",
    joinCode: "QZ7KP4",
    sessionId: "session",
    seed: 7,
    now: 0,
  });
}

function enginePlayers(): QuizshowEnginePlayer[] {
  return QUIZSHOW_SIMULATED_PLAYERS.map((simulated, index) => ({
    playerId: `player-${index}`,
    memberKey: simulated.memberKey,
    screenName: simulated.screenName,
    teamId: null,
    isAvatarShown: false,
    hasExtraTime: simulated.hasExtraTime,
    isCohostPlayer: false,
    score: 0,
    streak: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: 0,
    isRemoved: false,
  }));
}

function cursorFor(
  phase: QuizshowPhase,
  roundCount: number,
  phaseStartedAt: number,
): QuizshowCursor {
  return {
    phaseId: "9",
    status: "running",
    phase,
    roundIndex: 0,
    questionIndex: 0,
    roundCount,
    phaseStartedAt,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
  };
}

function playOf(
  question: QuizshowQuestion,
  players: QuizshowEnginePlayer[],
): QuizshowEngineQuestionPlay {
  return {
    questionId: question.id,
    roundIndex: 0,
    questionIndex: 0,
    eligiblePlayerIds: players.map((player) => player.playerId),
    extraTimePlayerIds: [],
    answers: [],
    votes: [],
    voteOptions: null,
    favouriteOptionId: null,
    isScored: false,
    wasSkipped: false,
    pointsByPlayer: {},
    teamPoints: {},
    myReveals: {},
  };
}

function engineInPhase(
  phase: QuizshowPhase,
  quiz: QuizshowQuiz,
  question: QuizshowQuestion,
  phaseStartedAt = 10_000,
): QuizshowEngineState {
  const players = enginePlayers();
  return {
    ...lobbyEngine("solo", quiz),
    players,
    cursor: cursorFor(phase, quiz.rounds.length, phaseStartedAt),
    current: playOf(question, players),
  };
}

function submittedPayloads(actions: QuizshowEngineAction[]) {
  return actions.flatMap((action) =>
    action.type === "player" && action.name === "answer:submit"
      ? [{ memberKey: action.memberKey, payload: action.payload as never }]
      : [],
  );
}

function planAfter(engine: QuizshowEngineState, seed: number) {
  const first = planBotActions(createBotState(seed, 0), engine, 0);
  return first.botState;
}

describe("simulated players", () => {
  it("joins the twelve players one by one in the lobby", () => {
    let engine = lobbyEngine(
      "solo",
      quizOf([roundOf("quiz", [multipleChoice])]),
    );
    let botState = createBotState(3, 0);
    const earlyPlan = planBotActions(botState, engine, 699);
    expect(earlyPlan.actions).toEqual([]);
    for (let joinIndex = 0; joinIndex < 12; joinIndex += 1) {
      const now = 700 * (joinIndex + 1);
      const planned = planBotActions(botState, engine, now);
      botState = planned.botState;
      expect(planned.actions).toHaveLength(1);
      const [action] = planned.actions;
      if (!action) throw new Error("expected one join");
      expect(action).toMatchObject({
        type: "player",
        name: "lobby:join",
        memberKey: QUIZSHOW_SIMULATED_PLAYERS[joinIndex]?.memberKey,
      });
      engine = reduceQuizshowEngine(engine, action).state;
    }
    expect(engine.players).toHaveLength(12);
    expect(planBotActions(botState, engine, 20_000).actions).toEqual([]);
  });

  it("creates the four simulated teams first and sends the rest to theirs in teams mode", () => {
    let engine = lobbyEngine(
      "teams",
      quizOf([roundOf("quiz", [multipleChoice])]),
    );
    const botState = createBotState(3, 0);
    for (let joinIndex = 0; joinIndex < 12; joinIndex += 1) {
      const planned = planBotActions(botState, engine, 700 * (joinIndex + 1));
      const [action] = planned.actions;
      if (!action) throw new Error("expected one join");
      const payload = (action as { payload: { team: object | null } }).payload;
      if (joinIndex < 4) expect(payload.team).toHaveProperty("newTeam");
      else expect(payload.team).toHaveProperty("teamId");
      engine = reduceQuizshowEngine(engine, action).state;
    }
    expect(engine.teams.map((team) => team.name)).toEqual([
      "Quizzly Bears",
      "Spill the Tea",
      "Disco Inferno",
      "Queens of Trivia",
    ]);
  });

  it("answers every open question before its deadline", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("open", quiz, multipleChoice, 10_000);
    for (let seed = 1; seed <= 30; seed += 1) {
      const { botState } = planBotActions(
        createBotState(seed, 0),
        engine,
        10_000,
      );
      expect(botState.plans).toHaveLength(12);
      for (const plan of botState.plans) {
        expect(plan.dueAt).toBeGreaterThanOrEqual(10_000 + 1_200);
        expect(plan.dueAt).toBeLessThanOrEqual(10_000 + 0.95 * 20_000);
      }
    }
  });

  it("answers right about as often as each player's skill", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("open", quiz, multipleChoice);
    const skilledIndex = QUIZSHOW_SIMULATED_PLAYERS.findIndex(
      (simulated) => simulated.skill === 0.8,
    );
    const skilled = QUIZSHOW_SIMULATED_PLAYERS[skilledIndex];
    expect(skilled).toBeDefined();
    let rightCount = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      const planned = planBotActions(createBotState(seed, 0), engine, 10_000);
      const own = planned.botState.plans.find(
        (plan) =>
          plan.action.type === "player" &&
          plan.action.memberKey === skilled?.memberKey,
      );
      const payload = (
        own?.action as { payload: { payload: { optionIndex: number } } }
      ).payload.payload;
      if (payload.optionIndex === 2) rightCount += 1;
    }
    expect(rightCount / 200).toBeGreaterThanOrEqual(0.7);
    expect(rightCount / 200).toBeLessThanOrEqual(0.9);
  });

  it("never votes for its own answer", () => {
    const quiz = quizOf([roundOf("lie_detector", [lieDetectorQuestion])]);
    const base = engineInPhase("vote", quiz, lieDetectorQuestion);
    const current = base.current;
    if (!current) throw new Error("expected a question in play");
    const answers = base.players.map((player, index) => ({
      answerId: `answer-${index}`,
      playerId: player.playerId,
      questionId: lieDetectorQuestion.id,
      phaseId: "8",
      payload: { type: "prompt" as const, text: `fake ${index}` },
      receivedAt: 11_000,
      isHidden: false,
      pointsAwarded: 0,
    }));
    const voteOptions = [
      ...answers.map((answer, index) => ({
        optionId: `option-${index}`,
        answerId: answer.answerId,
        isTruth: false,
        text: answer.payload.text,
      })),
      { optionId: "option-truth", answerId: null, isTruth: true, text: "real" },
    ];
    const engine = { ...base, current: { ...current, answers, voteOptions } };
    for (let seed = 1; seed <= 40; seed += 1) {
      const { botState } = planBotActions(
        createBotState(seed, 0),
        engine,
        10_000,
      );
      expect(botState.plans).toHaveLength(12);
      for (const plan of botState.plans) {
        if (plan.action.type !== "player") continue;
        const own = answers.find(
          (answer) =>
            answer.playerId ===
            engine.players.find(
              (player) =>
                player.memberKey ===
                (plan.action as { memberKey: string }).memberKey,
            )?.playerId,
        );
        const ownOption = voteOptions.find(
          (option) => option.answerId === own?.answerId,
        );
        const chosen = (plan.action.payload as { optionId: string }).optionId;
        expect(chosen).not.toBe(ownOption?.optionId);
      }
    }
  });

  it("writes distinct party answers from the simulated lists", () => {
    const quiz = quizOf([roundOf("lie_detector", [lieDetectorQuestion])]);
    const engine = engineInPhase("write", quiz, lieDetectorQuestion);
    const { botState } = planBotActions(createBotState(5, 0), engine, 10_000);
    const texts = submittedPayloads(
      botState.plans.map((plan) => plan.action),
    ).map(
      (entry) => (entry.payload as { payload: { text: string } }).payload.text,
    );
    expect(texts).toHaveLength(12);
    expect(new Set(texts).size).toBe(12);
    for (const text of texts) {
      expect(QUIZSHOW_SIMULATED_TEXTS.lieDetectorFakes).toContain(text);
    }
  });

  it("plays a joker at a round intro when the player wants one", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("round_intro", quiz, multipleChoice);
    const { botState } = planBotActions(createBotState(2, 0), engine, 10_000);
    const jokerKeys = botState.plans.flatMap((plan) =>
      plan.action.type === "player" && plan.action.name === "joker:play"
        ? [plan.action.memberKey]
        : [],
    );
    const wantingKeys = QUIZSHOW_SIMULATED_PLAYERS.filter(
      (simulated) => simulated.willPlayJoker,
    ).map((simulated) => simulated.memberKey);
    expect(wantingKeys).toHaveLength(3);
    expect([...jokerKeys].sort()).toEqual([...wantingKeys].sort());
  });

  it("moves planned answers forward when a resume shifts the phase start", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("open", quiz, multipleChoice, 10_000);
    const planned = planBotActions(createBotState(4, 0), engine, 10_000);
    const resumed: QuizshowEngineState = {
      ...engine,
      cursor: { ...engine.cursor, phaseStartedAt: 70_000 },
    };
    const afterResume = planBotActions(planned.botState, resumed, 70_000);
    expect(afterResume.actions).toEqual([]);
    expect(afterResume.botState.plans.map((plan) => plan.dueAt)).toEqual(
      planned.botState.plans.map((plan) => plan.dueAt + 60_000),
    );
  });

  it("plans the same actions for the same seed", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("open", quiz, multipleChoice);
    expect(planAfter(engine, 11)).toEqual(planAfter(engine, 11));
    expect(planAfter(engine, 11)).not.toEqual(planAfter(engine, 12));
  });
});
