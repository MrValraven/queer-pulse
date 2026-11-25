import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_REACTION_IDS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowClosestTolerance,
  type QuizshowCursor,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
} from "../../../shared/contracts/quizshow";
import { foldNameKey } from "../quizshowNormalise";
import { createBotState, planBotActions } from "./quizshowBots";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineAction,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineTeam,
} from "./quizshowEngineTypes";
import { closestNumberOutcomes } from "./quizshowScoring";
import {
  QUIZSHOW_SIMULATED_PLAYERS,
  QUIZSHOW_SIMULATED_TEXTS,
} from "./quizshowSimulatedPlayers.data";

const questionShared = {
  prompt: { en: "Which one?", pt: "Qual?" },
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant" as const,
  revealNote: { en: "", pt: "" },
  numberUnit: { en: "", pt: "" },
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
  answer: { correctIndexes: [2] },
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
      ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
      isWarmUp: false,
      talkSeconds: 0,
    },
    questions,
  };
}

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Fixture",
    languages: "en",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
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
    leftAt: null,
    disconnectedAt: null,
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
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
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
    awayPlayerIds: [],
    readMs: 4_000,
    streakBeforeByPlayer: {},
    keyOverride: null,
    acceptedTexts: [],
    wasCorrected: false,
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

function joinActionsOf(actions: QuizshowEngineAction[]) {
  return actions.filter(
    (action) => action.type === "player" && action.name === "lobby:join",
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
      // Bots that joined already may react in the lobby too.
      const joins = joinActionsOf(planned.actions);
      expect(joins).toHaveLength(1);
      const [action] = joins;
      if (!action) throw new Error("expected one join");
      expect(action).toMatchObject({
        type: "player",
        name: "lobby:join",
        memberKey: QUIZSHOW_SIMULATED_PLAYERS[joinIndex]?.memberKey,
      });
      engine = reduceQuizshowEngine(engine, action).state;
    }
    expect(engine.players).toHaveLength(12);
    expect(
      joinActionsOf(planBotActions(botState, engine, 20_000).actions),
    ).toEqual([]);
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

describe("simulated players around the wheel", () => {
  it("reads joker odds from the rounds left after the current round number", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("round_intro", quiz, multipleChoice);
    const lastRoundEngine = {
      ...engine,
      cursor: { ...engine.cursor, roundCount: 5, roundNumber: 5 },
    };
    const { botState } = planBotActions(
      createBotState(2, 0),
      lastRoundEngine,
      10_000,
    );
    const jokerKeys = botState.plans.flatMap((plan) =>
      plan.action.type === "player" && plan.action.name === "joker:play"
        ? [plan.action.memberKey]
        : [],
    );
    const wantingKeys = QUIZSHOW_SIMULATED_PLAYERS.filter(
      (simulated) => simulated.willPlayJoker,
    ).map((simulated) => simulated.memberKey);
    expect([...jokerKeys].sort()).toEqual([...wantingKeys].sort());
  });

  it("plans nothing in the wheel phase", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const engine = engineInPhase("wheel", quiz, multipleChoice);
    const { botState, actions } = planBotActions(
      createBotState(2, 0),
      engine,
      10_000,
    );
    expect(botState.plans).toEqual([]);
    expect(actions).toEqual([]);
  });
});

function plannedPayloads(engine: QuizshowEngineState, seed: number) {
  const { botState } = planBotActions(createBotState(seed, 0), engine, 10_000);
  return botState.plans.flatMap((plan) =>
    plan.action.type === "player" && plan.action.name === "answer:submit"
      ? [(plan.action.payload as { payload: Record<string, unknown> }).payload]
      : [],
  );
}

function tableTeam(
  index: number,
  colorKey: QuizshowEngineTeam["colorKey"],
  isHostMade = false,
): QuizshowEngineTeam {
  return {
    teamId: `table-${index}`,
    name: `Table ${index + 1}`,
    colorKey,
    score: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    isHostMade,
  };
}

describe("simulated players on version 2 questions", () => {
  it("picks among the correct indexes when right", () => {
    const twoCorrect: QuizshowQuestion = {
      ...questionShared,
      id: "question-two-correct",
      type: "multiple_choice",
      options: multipleChoice.options,
      answer: { correctIndexes: [1, 3] },
      acceptedAnswers: [],
    };
    const quiz = quizOf([roundOf("quiz", [twoCorrect])]);
    const engine = engineInPhase("open", quiz, twoCorrect);
    const pickedIndexes: number[] = [];
    for (let seed = 1; seed <= 60; seed += 1) {
      for (const payload of plannedPayloads(engine, seed)) {
        pickedIndexes.push(payload.optionIndex as number);
      }
    }
    expect(pickedIndexes).toContain(1);
    expect(pickedIndexes).toContain(3);
    const rightShare =
      pickedIndexes.filter((optionIndex) => [1, 3].includes(optionIndex))
        .length / pickedIndexes.length;
    expect(rightShare).toBeGreaterThan(0.5);
  });

  it("answers a poll with any of its options", () => {
    const poll: QuizshowQuestion = {
      ...questionShared,
      id: "question-poll",
      type: "poll",
      options: [
        { id: "a", text: { en: "A", pt: "A" } },
        { id: "b", text: { en: "B", pt: "B" } },
        { id: "c", text: { en: "C", pt: "C" } },
      ],
      answer: null,
      acceptedAnswers: [],
    };
    const quiz = quizOf([roundOf("quiz", [poll])]);
    const engine = engineInPhase("open", quiz, poll);
    const pickedIndexes = new Set<number>();
    for (let seed = 1; seed <= 10; seed += 1) {
      const payloads = plannedPayloads(engine, seed);
      expect(payloads).toHaveLength(12);
      for (const payload of payloads) {
        expect(payload.type).toBe("poll");
        pickedIndexes.add(payload.optionIndex as number);
      }
    }
    expect([...pickedIndexes].sort()).toEqual([0, 1, 2]);
  });

  it("spreads closest guesses so each tolerance shows both outcomes", () => {
    const tolerances: QuizshowClosestTolerance[] = [
      { mode: "exact", amount: 0 },
      { mode: "absolute", amount: 10 },
      { mode: "percent", amount: 10 },
    ];
    for (const tolerance of tolerances) {
      const closest: QuizshowQuestion = {
        ...questionShared,
        id: `question-closest-${tolerance.mode}`,
        type: "closest_number",
        options: [],
        answer: { value: 1969, tolerance },
        acceptedAnswers: [],
      };
      const quiz = quizOf([roundOf("quiz", [closest])]);
      const engine = engineInPhase("open", quiz, closest);
      for (let seed = 1; seed <= 20; seed += 1) {
        const guesses = plannedPayloads(engine, seed).map((payload, index) => ({
          playerId: `player-${index}`,
          value: payload.value as number,
        }));
        const outcomes = [
          ...closestNumberOutcomes(1969, tolerance, guesses).values(),
        ];
        const bandCount = outcomes.filter(
          (outcome) => outcome.isWithinBand && !outcome.isClosest,
        ).length;
        const missCount = outcomes.filter(
          (outcome) => !outcome.isWithinBand && !outcome.isClosest,
        ).length;
        expect(outcomes.some((outcome) => outcome.isClosest)).toBe(true);
        expect(missCount).toBeGreaterThan(0);
        if (tolerance.mode !== "exact") expect(bandCount).toBeGreaterThan(0);
      }
    }
  });

  it("spreads the bots over the 24 keys, tier 1 first", () => {
    let engine = lobbyEngine(
      "teams",
      quizOf([roundOf("quiz", [multipleChoice])]),
    );
    let botState = createBotState(3, 0, { teamCount: 12 });
    for (let joinIndex = 0; joinIndex < 12; joinIndex += 1) {
      const planned = planBotActions(botState, engine, 700 * (joinIndex + 1));
      botState = planned.botState;
      const [action] = joinActionsOf(planned.actions);
      if (!action) throw new Error("expected one join");
      engine = reduceQuizshowEngine(engine, action).state;
    }
    expect(engine.teams.map((team) => team.colorKey)).toEqual([
      "circle",
      "triangle",
      "star",
      "moon",
      "square",
      "diamond",
      "hexagon",
      "heart",
      "circle_2",
      "triangle_2",
      "square_2",
      "diamond_2",
    ]);
    const nameKeys = engine.teams.map((team) => foldNameKey(team.name));
    expect(new Set(nameKeys).size).toBe(12);
  });

  it("takes the first free tier-3 keys beside other teams and joins one when all 24 are used", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const sixteenTables = QUIZSHOW_TEAM_COLOR_KEYS.slice(0, 16).map(
      (colorKey, index) => tableTeam(index, colorKey),
    );
    const withTables = { ...lobbyEngine("teams", quiz), teams: sixteenTables };
    const firstJoin = joinActionsOf(
      planBotActions(createBotState(3, 0), withTables, 700).actions,
    )[0];
    expect(firstJoin).toMatchObject({
      payload: {
        team: { newTeam: { name: "Quizzly Bears", colorKey: "circle_3" } },
      },
    });
    const everyKeyUsed = {
      ...withTables,
      teams: QUIZSHOW_TEAM_COLOR_KEYS.map((colorKey, index) =>
        tableTeam(index, colorKey),
      ),
    };
    const fullJoin = joinActionsOf(
      planBotActions(createBotState(3, 0), everyKeyUsed, 700).actions,
    )[0];
    expect(fullJoin).toMatchObject({
      payload: { team: { teamId: "table-0" } },
    });
  });

  it("joins an empty host-made table before founding a team", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const tables = [tableTeam(0, "square", true), tableTeam(1, "heart", true)];
    const withTables = { ...lobbyEngine("teams", quiz), teams: tables };
    const firstJoin = joinActionsOf(
      planBotActions(createBotState(3, 0), withTables, 700).actions,
    )[0];
    expect(firstJoin).toMatchObject({
      payload: { team: { teamId: "table-0" } },
    });
    const [seated] = enginePlayers();
    if (!seated) throw new Error("expected a player");
    const firstTableTaken = {
      ...withTables,
      players: [{ ...seated, memberKey: "member-self", teamId: "table-0" }],
    };
    const secondJoin = joinActionsOf(
      planBotActions(createBotState(3, 0), firstTableTaken, 700).actions,
    )[0];
    expect(secondJoin).toMatchObject({
      payload: { team: { teamId: "table-1" } },
    });
  });
});

describe("simulated player names and reactions", () => {
  it("passes over a bot whose join was refused", () => {
    const engine = lobbyEngine(
      "solo",
      quizOf([roundOf("quiz", [multipleChoice])]),
    );
    const first = planBotActions(createBotState(3, 0), engine, 700);
    expect(joinActionsOf(first.actions)[0]).toMatchObject({
      memberKey: QUIZSHOW_SIMULATED_PLAYERS[0]?.memberKey,
    });
    // The join is never applied, as after a refusal.
    const second = planBotActions(first.botState, engine, 1_400);
    expect(joinActionsOf(second.actions)[0]).toMatchObject({
      memberKey: QUIZSHOW_SIMULATED_PLAYERS[1]?.memberKey,
    });
  });

  it("answers the same after a long stay in the lobby", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const lobby = { ...lobbyEngine("solo", quiz), players: enginePlayers() };
    const open = engineInPhase("open", quiz, multipleChoice, 70_000);
    let stayedBotState = createBotState(5, 0);
    for (let now = 0; now <= 60_000; now += 250) {
      stayedBotState = planBotActions(stayedBotState, lobby, now).botState;
    }
    expect(stayedBotState.reactionRandomState).not.toBe(
      createBotState(5, 0).reactionRandomState,
    );
    const afterStay = planBotActions(stayedBotState, open, 70_000);
    const straightIn = planBotActions(createBotState(5, 0), open, 70_000);
    expect(afterStay.botState.plans).toEqual(straightIn.botState.plans);
  });

  it("keeps bot names unique by foldNameKey", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const [firstPlayer] = enginePlayers();
    if (!firstPlayer) throw new Error("expected a player");
    const engine = {
      ...lobbyEngine("solo", quiz),
      players: [
        {
          ...firstPlayer,
          playerId: "player-self",
          memberKey: "member-self",
          screenName: "RÍTA ",
        },
      ],
    };
    const [join] = joinActionsOf(
      planBotActions(createBotState(3, 0), engine, 700).actions,
    );
    expect(join).toMatchObject({
      memberKey: QUIZSHOW_SIMULATED_PLAYERS[0]?.memberKey,
      payload: { screenName: "Rita 2" },
    });
  });

  it("reacts in the lobby at most once per bot every 3 s and never while a question is open", () => {
    const quiz = quizOf([roundOf("quiz", [multipleChoice])]);
    const lobby = { ...lobbyEngine("solo", quiz), players: enginePlayers() };
    let botState = createBotState(9, 0);
    const sentAtByMemberKey = new Map<string, number[]>();
    for (let now = 0; now <= 60_000; now += 250) {
      const planned = planBotActions(botState, lobby, now);
      botState = planned.botState;
      for (const action of planned.actions) {
        if (action.type !== "player" || action.name !== "reaction:send") {
          continue;
        }
        const { reactionId } = action.payload as { reactionId: string };
        expect(QUIZSHOW_REACTION_IDS).toContain(reactionId);
        sentAtByMemberKey.set(action.memberKey, [
          ...(sentAtByMemberKey.get(action.memberKey) ?? []),
          action.now,
        ]);
      }
    }
    expect(sentAtByMemberKey.size).toBe(12);
    for (const sentAts of sentAtByMemberKey.values()) {
      sentAts.forEach((sentAt, index) => {
        const previous = sentAts[index - 1];
        if (previous !== undefined) {
          expect(sentAt - previous).toBeGreaterThanOrEqual(3_000);
        }
      });
    }

    const open = engineInPhase("open", quiz, multipleChoice, 0);
    let openBotState = createBotState(9, 0);
    for (let now = 0; now <= 20_000; now += 250) {
      const planned = planBotActions(openBotState, open, now);
      openBotState = planned.botState;
      expect(
        planned.actions.filter(
          (action) =>
            action.type === "player" && action.name === "reaction:send",
        ),
      ).toEqual([]);
    }
  });
});
