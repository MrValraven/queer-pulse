import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowCursor,
  type QuizshowPhase,
  type QuizshowPodiumEntry,
  type QuizshowQuestion,
  type QuizshowQuiz,
} from "../../../shared/contracts/quizshow";
import {
  createWheelState,
  emptyWheelProgress,
  wheelViewForCursor,
  type QuizshowWheelBonusAward,
} from "../quizshowWheel";
import { createQuizshowEngine } from "./quizshowEngine";
import { normaliseAnswerText } from "./quizshowScoring";
import type {
  QuizshowEngineAnswer,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import {
  PICK_ROUND_NIGHT,
  wheelTestEngineOptions,
} from "./quizshowWheelTestFixtures";
import {
  buildMyScores,
  buildPhaseChange,
  buildPodiumFrame,
  buildReveal,
  buildScores,
  engineFramesFor,
  engineSessionStateFor,
  framesForViewer,
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

const BLANK_TEXT = { en: "", pt: "" };
const FUN_FACT = {
  en: "She played the role on stage first",
  pt: "Ela fez o papel em palco primeiro",
};

const TYPED_QUESTION: QuizshowQuestion = {
  id: "question-typed",
  type: "type_answer",
  prompt: { en: "Who sang it first?", pt: "Quem cantou primeiro?" },
  options: [],
  answer: { text: { en: "Madonna", pt: "Madonna" } },
  acceptedAnswers: [],
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: BLANK_TEXT,
  mediaReveal: "instant",
  revealNote: FUN_FACT,
  numberUnit: BLANK_TEXT,
  timeLimitSeconds: null,
  points: 1000,
};

function typedQuiz(question: QuizshowQuestion): QuizshowQuiz {
  return {
    title: "Views night",
    languages: "en",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
    updatedAt: "2026-11-24T00:00:00.000Z",
    rounds: [
      {
        id: "round-quiz",
        kind: "quiz",
        title: { en: "Pop", pt: "Pop" },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
          isWarmUp: false,
          talkSeconds: 0,
        },
        questions: [question],
      },
    ],
  };
}

function viewsPlayer(index: number, score: number): QuizshowEnginePlayer {
  return {
    playerId: `player-${index}`,
    memberKey: `member-${index}`,
    screenName: `Player ${index}`,
    teamId: null,
    isAvatarShown: false,
    hasExtraTime: false,
    isCohostPlayer: false,
    score,
    streak: index,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: index,
    isRemoved: false,
    leftAt: null,
    disconnectedAt: null,
  };
}

function typedPlay(playerIds: string[]): QuizshowEngineQuestionPlay {
  return {
    questionId: TYPED_QUESTION.id,
    roundIndex: 0,
    questionIndex: 0,
    eligiblePlayerIds: playerIds,
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

/** Four solo players (scores 400, 300, 200, 100) on the typed question, in the given phase. */
function viewsStateIn(
  phase: QuizshowPhase,
  question: QuizshowQuestion = TYPED_QUESTION,
): QuizshowEngineState {
  const state = createQuizshowEngine({
    quiz: typedQuiz(question),
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "views-night",
    eventTitle: "Views night",
    joinCode: "QZ7KP4",
    sessionId: "views-session",
    seed: 3,
    now: 0,
  });
  state.players = [1, 2, 3, 4].map((index) =>
    viewsPlayer(index, 500 - index * 100),
  );
  state.current = typedPlay(state.players.map((player) => player.playerId));
  state.cursor = {
    ...state.cursor,
    status: "running",
    phase,
    phaseId: "9",
    phaseStartedAt: 0,
    roundIndex: 0,
    questionIndex: 0,
  };
  return state;
}

function typedAnswer(
  playerIndex: number,
  text: string,
  receivedAt: number,
): QuizshowEngineAnswer {
  return {
    answerId: `answer-${playerIndex}`,
    playerId: `player-${playerIndex}`,
    questionId: TYPED_QUESTION.id,
    phaseId: "8",
    payload: { type: "type_answer", text },
    receivedAt,
    elapsedMs: receivedAt,
    isHidden: false,
    pointsAwarded: 0,
  };
}

function judge(
  play: QuizshowEngineQuestionPlay,
  playerIndex: number,
  isCorrect: boolean,
): void {
  play.myReveals[`player-${playerIndex}`] = {
    questionId: TYPED_QUESTION.id,
    hasAnswered: true,
    isCorrect,
    correctPositions: null,
    pointsAwarded: isCorrect ? 1000 : 0,
    streakBonus: 0,
    isJokerActive: false,
    streak: 0,
  };
}

/** The podium phase with places 1 to 3 held by players 1 to 3 and `revealedCount` places shown. */
function podiumStateWith(revealedCount: number): QuizshowEngineState {
  const state = viewsStateIn("podium");
  state.current = null;
  state.podium = ([1, 2, 3] as const).map((place): QuizshowPodiumEntry => ({
    place,
    kind: "player",
    entrantId: `player-${place}`,
    name: `Player ${place}`,
    colorKey: null,
    score: 500 - place * 100,
  }));
  state.cursor = {
    ...state.cursor,
    roundIndex: null,
    questionIndex: null,
    podiumRevealedCount: revealedCount,
  };
  return state;
}

describe("engine views withhold the podium (contract 6.7)", () => {
  it("shows the public only the places revealed so far and hosts every place", () => {
    const state = podiumStateWith(1);
    const publicPodium = buildPodiumFrame(state, "public");
    expect(publicPodium?.entries.map((entry) => entry.place)).toEqual([3]);
    expect(publicPodium?.revealedCount).toBe(1);
    expect(buildPodiumFrame(state, "hosts")?.entries).toHaveLength(3);
    expect(
      engineSessionStateFor(state, { role: "screen" }).podium,
    ).toHaveLength(1);
    expect(engineSessionStateFor(state, { role: "host" }).podium).toHaveLength(
      3,
    );
  });

  it("drops unrevealed ranks from the public scores and keeps the entrant count", () => {
    const state = podiumStateWith(1);
    const publicScores = buildScores(state);
    expect(publicScores?.entries.map((entry) => entry.rank)).toEqual([3, 4]);
    expect(publicScores?.entrantCount).toBe(4);
    expect(
      buildScores(state, undefined, "hosts")?.entries.map(
        (entry) => entry.rank,
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  it("sends no own scores to a player whose place is still hidden", () => {
    const state = podiumStateWith(1);
    expect(buildMyScores(state, "player-1")).toBeNull();
    expect(buildMyScores(state, "player-2")).toBeNull();
    expect(buildMyScores(state, "player-3")?.rank).toBe(3);
    const ownScoresAudiences = engineFramesFor(state, [
      { kind: "scores_shown" },
    ])
      .filter(({ frame }) => frame.event === "scores:mine")
      .map(({ audience }) => audience);
    expect(ownScoresAudiences).toEqual([
      { playerId: "player-3" },
      { playerId: "player-4" },
    ]);
    const firstPlace = engineSessionStateFor(state, {
      role: "player",
      memberKey: "member-1",
      suggestedScreenName: "Player 1",
    });
    expect(firstPlace.role === "player" && firstPlace.myScores).toBeNull();
  });

  it("withholds nothing once every place is shown", () => {
    const state = podiumStateWith(3);
    expect(buildPodiumFrame(state, "public")?.entries).toHaveLength(3);
    expect(buildScores(state)?.entries).toHaveLength(4);
    expect(buildMyScores(state, "player-1")?.rank).toBe(1);
  });

  it("carries each entrant's streak on the leaderboard (contract 6.18)", () => {
    const state = podiumStateWith(3);
    expect(buildScores(state)?.entries.map((entry) => entry.streak)).toEqual([
      1, 2, 3, 4,
    ]);
  });
});

describe("engine views reveal note and typed answers", () => {
  it("gives hosts the note from the question's first phase and the public only from reveal on", () => {
    const openState = viewsStateIn("open");
    const publicQuestion = buildPhaseChange(openState, "public").question;
    const hostState = engineSessionStateFor(openState, { role: "host" });
    expect(publicQuestion).not.toBeNull();
    expect(publicQuestion).not.toHaveProperty("revealNote");
    expect(
      hostState.role === "host" ? hostState.question?.revealNote : null,
    ).toEqual(FUN_FACT);
    expect(buildReveal(openState)).toBeNull();
    expect(buildReveal(viewsStateIn("reveal"))?.note).toEqual(FUN_FACT);
  });

  it("reveals no note when both languages are blank", () => {
    const quietQuestion = { ...TYPED_QUESTION, revealNote: BLANK_TEXT };
    expect(buildReveal(viewsStateIn("reveal", quietQuestion))?.note).toBeNull();
  });

  it("groups the wrong typed answers for hosts, most written first", () => {
    const state = viewsStateIn("reveal");
    const play = state.current;
    expect(play).not.toBeNull();
    if (play === null) return;
    play.answers = [
      typedAnswer(1, "Cher", 100),
      typedAnswer(2, "Bowie", 200),
      typedAnswer(3, "cher!", 300),
      typedAnswer(4, "Madonna", 400),
    ];
    judge(play, 1, false);
    judge(play, 2, false);
    judge(play, 3, false);
    judge(play, 4, true);
    const frames = engineFramesFor(state, [{ kind: "revealed" }]);
    const typedFrames = frames.filter(
      ({ frame }) => frame.event === "typed:answers",
    );
    expect(typedFrames.map(({ audience }) => audience)).toEqual(["hosts"]);
    expect(typedFrames[0]?.frame.payload).toEqual({
      phaseId: "9",
      questionId: TYPED_QUESTION.id,
      groups: [
        {
          normalisedText: normaliseAnswerText("Cher"),
          sampleText: "Cher",
          count: 2,
        },
        {
          normalisedText: normaliseAnswerText("Bowie"),
          sampleText: "Bowie",
          count: 1,
        },
      ],
    });
    const changedFrames = engineFramesFor(state, [
      { kind: "typed_answers_changed" },
    ]);
    expect(changedFrames.map(({ frame }) => frame.event)).toEqual([
      "typed:answers",
    ]);
  });

  it("leaves typed answers that normalise to nothing out of every group", () => {
    const state = viewsStateIn("reveal");
    const play = state.current;
    expect(play).not.toBeNull();
    if (play === null) return;
    play.answers = [
      typedAnswer(1, "?!", 100),
      typedAnswer(2, "Bowie", 200),
      typedAnswer(3, "...", 300),
    ];
    judge(play, 1, false);
    judge(play, 2, false);
    judge(play, 3, false);
    const frames = engineFramesFor(state, [{ kind: "revealed" }]);
    const typedFrame = frames.find(
      ({ frame }) => frame.event === "typed:answers",
    );
    expect(typedFrame?.frame.payload).toMatchObject({
      groups: [
        {
          normalisedText: normaliseAnswerText("Bowie"),
          sampleText: "Bowie",
          count: 1,
        },
      ],
    });
  });
});

describe("engine views for phones and flags", () => {
  it("sends the answer count to players too (contract 6.21)", () => {
    const state = viewsStateIn("open");
    state.current?.answers.push(typedAnswer(2, "Cher", 100));
    const frames = engineFramesFor(state, [{ kind: "answer_count_changed" }]);
    const phoneFrames = framesForViewer(frames, {
      role: "player",
      playerId: "player-1",
    });
    expect(phoneFrames).toEqual([
      { event: "answer:count", payload: { phaseId: "9", count: 1, total: 4 } },
    ]);
    const phoneState = engineSessionStateFor(state, {
      role: "player",
      memberKey: "member-1",
      suggestedScreenName: "Player 1",
    });
    expect(phoneState.answerCount).toEqual({ count: 1, total: 4 });
  });

  it("sends the players room team cards and a head count only (W2)", () => {
    const state = viewsStateIn("lobby");
    const frames = engineFramesFor(state, [{ kind: "lobby_changed" }]);
    const phoneLobby = framesForViewer(frames, {
      role: "player",
      playerId: null,
    })[0];
    expect(phoneLobby).toEqual({
      event: "lobby:update",
      payload: { teams: [], playerCount: 4 },
    });
  });

  it("sends session flags to every room", () => {
    const state = viewsStateIn("lobby");
    state.isJoinLocked = true;
    const frames = engineFramesFor(state, [{ kind: "flags_changed" }]);
    expect(frames).toEqual(
      (["screen", "players", "hosts"] as const).map((audience) => ({
        audience,
        frame: {
          event: "session:flags",
          payload: { isJoinLocked: true, isAutoAdvanceOn: false },
        },
      })),
    );
  });

  it("gives solo play round cards no talk time", () => {
    const state = viewsStateIn("lobby");
    const round = state.quiz.rounds[0];
    expect(round).toBeDefined();
    if (round === undefined) return;
    const talkingRound = {
      ...round,
      settings: { ...round.settings, talkSeconds: 20 as const },
    };
    expect(toRoundCard(talkingRound, 0, "solo").talkSeconds).toBe(0);
    expect(toRoundCard(talkingRound, 0, "teams").talkSeconds).toBe(20);
  });
});
