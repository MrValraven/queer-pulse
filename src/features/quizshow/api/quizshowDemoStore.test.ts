import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_LIMITS,
  type QuizshowContentLabel,
  type QuizshowOpenSessionInput,
  type QuizshowQuestionInput,
  type QuizshowQuizInput,
  type QuizshowRematch,
  type QuizshowRoundInput,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_GAME_SESSION_PREFIX,
  QUIZSHOW_DEMO_SESSION_ID,
} from "../quizshow.constants";
import { wheelSliceRoundIndexes } from "../quizshowWheel";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import { normaliseStoredQuizShape } from "../quizshowNormalise";
import {
  onDemoLobbyRefreshed,
  onDemoRematch,
  type QuizshowDemoLobbyRefreshed,
} from "./quizshowDemoBus";
import { demoGetGame } from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import {
  demoEndSession,
  demoEventLiveSession,
  demoGetQuiz,
  demoImportQuiz,
  demoImportSources,
  demoJoin,
  demoJoinPreview,
  demoOpenSession,
  demoPutQuiz,
  demoQuizFor,
  demoRefreshLobby,
  demoResults,
  resetQuizshowDemoStore,
} from "./quizshowDemoStore";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "./quizshowDemoStore.data";

const OPEN_INPUT: QuizshowOpenSessionInput = {
  playMode: "solo",
  maxTeamSize: null,
  isReviewOn: true,
  notifyGuests: true,
  shouldReplaceResults: false,
  isPractice: false,
  rematchOfSessionId: null,
};

function prideSeedInput(): QuizshowQuizInput {
  const seed = templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
  return {
    ...normaliseStoredQuizShape(structuredClone(seed.quiz)),
    expectedUpdatedAt: null,
  };
}

const WHEEL_TEST_SETTINGS: QuizshowRoundSettings = {
  timeLimitSeconds: 20,
  isSpeedBonusOn: true,
  isJokerAllowed: true,
  writeSeconds: 60,
  voteSeconds: 30,
  wheelBonus: 0,
  wheelPick: "round",
  sliceCount: null,
  isWarmUp: false,
  talkSeconds: 0,
};

function trueFalseQuestion(promptText: string): QuizshowQuestionInput {
  return {
    type: "true_false",
    prompt: { en: promptText, pt: promptText },
    options: [],
    answer: { isTrue: true },
    acceptedAnswers: [],
    mediaRef: null,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    revealNote: { en: "", pt: "" },
    numberUnit: { en: "", pt: "" },
    timeLimitSeconds: null,
    points: 1000,
  };
}

function wheelTestRound(
  title: string,
  kind: QuizshowRoundKind,
  overrides: Partial<QuizshowRoundSettings> = {},
  contentLabel: QuizshowContentLabel = "none",
): QuizshowRoundInput {
  const isWheelRow = kind === "wheel";
  return {
    kind,
    title: { en: title, pt: title },
    contentLabel,
    settings: { ...WHEEL_TEST_SETTINGS, ...overrides },
    questions: isWheelRow
      ? []
      : [
          {
            ...trueFalseQuestion(`${title} question`),
            prompt: { en: `${title} question`, pt: `${title} pergunta` },
          },
        ],
  };
}

function wheelNightInput(rounds: QuizshowRoundInput[]): QuizshowQuizInput {
  return {
    expectedUpdatedAt: null,
    title: "Wheel night",
    languages: "both",
    screenLanguage: "en",
    rounds,
  };
}

function refusalOf(action: () => unknown): ApiError {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected a refusal");
}

function dataOf(error: ApiError): Record<string, unknown> {
  return error.data as Record<string, unknown>;
}

describe("quizshow demo store", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("starts the demo event with no quiz", () => {
    const response = demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(response.quiz).toBeNull();
    expect(response.problems).toEqual([]);
    expect(response.liveSession).toBeNull();
  });

  it("imports a template as a fresh quiz with new ids and the template id", () => {
    const response = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    });
    const quiz = response.quiz;
    expect(quiz?.sourceTemplateId).toBe(QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision);
    const questionIds = quiz?.rounds.flatMap((round) =>
      round.questions.map((question) => question.id),
    );
    expect(questionIds).toHaveLength(15);
    const everyId = [
      ...(quiz?.rounds.map((round) => round.id) ?? []),
      ...(questionIds ?? []),
    ];
    expect(everyId.every((id) => id !== "")).toBe(true);
    expect(new Set(everyId).size).toBe(everyId.length);
  });

  it("refuses a save over a newer version with quiz_changed", () => {
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, prideSeedInput());
    const stored = demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).quiz?.updatedAt;
    const error = refusalOf(() =>
      demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, prideSeedInput()),
    );
    expect(error.status).toBe(409);
    expect(dataOf(error).code).toBe("quizshow_quiz_changed");
    expect(dataOf(error).updatedAt).toBe(stored);
    expect(dataOf(error).updatedByName).toBe("You");
  });

  it("refuses an adults round on an event without 18+", () => {
    const input = prideSeedInput();
    const firstRound = input.rounds[0];
    if (!firstRound) throw new Error("no round");
    input.rounds[0] = { ...firstRound, contentLabel: "adults" };
    const error = refusalOf(() => demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, input));
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_adults_round_needs_adults_event");
  });

  it("lists completeness problems on a draft save", () => {
    const response = demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      ...prideSeedInput(),
      title: "",
    });
    expect(response.problems.map((problem) => problem.code)).toContain(
      "title_missing",
    );
  });

  it("asks before opening over kept results", () => {
    demoPutQuiz(QUIZSHOW_DEMO_RESULTS_SLUG, prideSeedInput());
    const error = refusalOf(() =>
      demoOpenSession(QUIZSHOW_DEMO_RESULTS_SLUG, OPEN_INPUT),
    );
    expect(error.status).toBe(409);
    expect(dataOf(error).code).toBe("quizshow_results_exist");
    const opened = demoOpenSession(QUIZSHOW_DEMO_RESULTS_SLUG, {
      ...OPEN_INPUT,
      shouldReplaceResults: true,
    });
    expect(opened.joinCode).toBe("QZ7KP4");
  });

  it("joins the demo game with any code shaped like one and refuses others", () => {
    const join = demoJoin({ code: "qz7-kp4" });
    expect(join.eventSlug).toBe(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(join.kind).toBe("event");
    expect(join.host).toBeNull();
    expect(join.isAdultsOnly).toBe(false);
    expect(join.quizTitle).toBe(demoQuizFor(QUIZSHOW_DEMO_LIVE_SLUG).title);
    expect(join.quizTitle).toBe("Pride and queer history");
    const error = refusalOf(() => demoJoin({ code: "ABC" }));
    expect(error.status).toBe(404);
    expect(dataOf(error).code).toBe("quizshow_join_code_not_found");
  });

  it("keeps the source template id when a template quiz is saved", () => {
    const imported = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    });
    const saved = demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      ...prideSeedInput(),
      expectedUpdatedAt: imported.quiz?.updatedAt ?? null,
    });
    expect(saved.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
  });

  it("plays the Pride history template when the event has no saved quiz", () => {
    const quiz = demoQuizFor(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(quiz.sourceTemplateId).toBe(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    expect(quiz.rounds.length).toBeGreaterThan(0);
  });

  it("lists the demo games among an event's import sources", () => {
    const items = demoImportSources(QUIZSHOW_DEMO_LIVE_SLUG).items;
    const eventSources = items.filter((source) => source.kind === "event");
    const gameSources = items.filter((source) => source.kind === "game");
    expect(eventSources.map((source) => source.eventSlug)).toEqual([
      "coop-info-night",
      "open-clinic-night",
    ]);
    expect(gameSources.map((source) => source.gameId)).toEqual([
      QUIZSHOW_DEMO_GAME_IDS.wheelNight,
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    ]);
    const sourceKinds = items.map((source) => source.kind);
    expect(sourceKinds.indexOf("game")).toBeGreaterThan(
      sourceKinds.lastIndexOf("event"),
    );
    const flatQuizSource = gameSources[2];
    expect(flatQuizSource).toMatchObject({
      eventSlug: null,
      eventTitle: null,
      startAt: null,
      quizTitle: "Friday flat quiz",
      hasAdultsRounds: false,
      isSameSeries: false,
    });
  });

  it("copies a game into an event", () => {
    const response = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "game",
      gameId: QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    });
    const game = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
    expect(response.quiz?.title).toBe("Friday flat quiz");
    expect(response.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
    expect(response.quiz?.rounds.length).toBe(game.quiz?.rounds.length);
    const eventQuestionIds = response.quiz?.rounds.flatMap((round) =>
      round.questions.map((question) => question.id),
    );
    const gameQuestionIds = new Set(
      game.quiz?.rounds.flatMap((round) =>
        round.questions.map((question) => question.id),
      ),
    );
    expect(
      eventQuestionIds?.some((questionId) => gameQuestionIds.has(questionId)),
    ).toBe(false);
    const adultsError = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
        from: "game",
        gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
      }),
    );
    expect(dataOf(adultsError).code).toBe(
      "quizshow_adults_round_needs_adults_event",
    );
    const unknownError = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
        from: "game",
        gameId: "demo-game-unknown",
      }),
    );
    expect(unknownError.status).toBe(404);
    expect(dataOf(unknownError).code).toBe("quizshow_import_source_not_found");
  });
});

describe("quizshow demo store wheel saves", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("normalises wheel rows on save", () => {
    const response = demoPutQuiz(
      QUIZSHOW_DEMO_LIVE_SLUG,
      wheelNightInput([
        wheelTestRound("Opener", "quiz", { wheelBonus: 500 }),
        wheelTestRound("Spin", "wheel", {}, "spicy"),
        wheelTestRound("Slice one", "quiz", { wheelBonus: 500 }),
        wheelTestRound("Slice two", "quiz"),
      ]),
    );
    const stored = demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).quiz;
    expect(response.quiz?.rounds).toEqual(stored?.rounds);
    expect(stored?.rounds.map((round) => round.settings.wheelBonus)).toEqual([
      0, 0, 500, 0,
    ]);
    expect(stored?.rounds[1]?.contentLabel).toBe("none");
    expect(stored?.rounds[1]?.settings).toMatchObject({
      wheelPick: "round",
      sliceCount: null,
    });
  });

  it("defaults settings saved without the wheel fields", () => {
    const plainRound = wheelTestRound("Plain", "quiz");
    const legacySettings = {
      timeLimitSeconds: 20,
      isSpeedBonusOn: true,
      isJokerAllowed: true,
      writeSeconds: 60,
      voteSeconds: 30,
    } as unknown as QuizshowRoundSettings;
    demoPutQuiz(
      QUIZSHOW_DEMO_LIVE_SLUG,
      wheelNightInput([{ ...plainRound, settings: legacySettings }]),
    );
    const settings = demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).quiz?.rounds[0]
      ?.settings;
    expect(settings).toMatchObject({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
  });
});

function roundOfQuestions(
  title: string,
  questionCount: number,
): QuizshowRoundInput {
  return {
    ...wheelTestRound(title, "quiz"),
    questions: Array.from({ length: questionCount }, (_unused, index) =>
      trueFalseQuestion(`${title} ${index + 1}`),
    ),
  };
}

function storedUpdatedAtOf(slug: string): string | null {
  return demoGetQuiz(slug).quiz?.updatedAt ?? null;
}

describe("quizshow demo store v2 responses", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("seeds the clinic event with a Eurovision copy that has an update and a Both screen", () => {
    const response = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG);
    expect(response.quiz?.title).toBe("Eurovision night");
    expect(response.problems).toEqual([]);
    expect(response.lastOpenSettings).toBeNull();
    expect(response.quiz?.sourceTemplate).toMatchObject({
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      copiedAt: "2026-10-25T00:00:00.000Z",
      hasUpdate: true,
    });
    expect(response.quiz?.sourceTemplate?.changeNote).toBeDefined();
    expect(demoQuizFor(QUIZSHOW_DEMO_LIVE_SLUG).screenLanguage).toBe("both");
  });

  it("reads every stored question through the C2.4 normaliser", () => {
    const questions =
      demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).quiz?.rounds.flatMap(
        (round) => round.questions,
      ) ?? [];
    expect(questions.length).toBeGreaterThan(0);
    for (const question of questions) {
      expect(question.mediaAlt).toBeDefined();
      expect(question.mediaReveal).toBeDefined();
      expect(question.revealNote).toBeDefined();
      expect(question.numberUnit).toBeDefined();
      if (question.type === "multiple_choice" && question.answer) {
        expect(Array.isArray(question.answer.correctIndexes)).toBe(true);
      }
      if (question.type === "closest_number" && question.answer) {
        expect(question.answer.tolerance).toBeDefined();
      }
    }
  });

  it("names the saver in PT when the app is in Portuguese", () => {
    window.localStorage.setItem("qp.lang", "pt");
    try {
      const error = refusalOf(() =>
        demoPutQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, prideSeedInput()),
      );
      expect(dataOf(error).code).toBe("quizshow_quiz_changed");
      expect(dataOf(error).updatedByName).toBe("Tu");
    } finally {
      window.localStorage.removeItem("qp.lang");
    }
  });

  it("lists event sources with their rounds", () => {
    const clinicSource = demoImportSources(QUIZSHOW_DEMO_LIVE_SLUG).items.find(
      (source) => source.eventSlug === QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
    );
    expect(clinicSource?.quizTitle).toBe("Eurovision night");
    expect(clinicSource?.rounds.map((round) => round.roundIndex)).toEqual([
      0, 1, 2,
    ]);
    expect(clinicSource?.questionCount).toBe(15);
  });
});

describe("quizshow demo practice lobbies and rematches", () => {
  const rematches: QuizshowRematch[] = [];
  let unsubscribe: () => void = () => undefined;

  beforeEach(() => {
    resetQuizshowDemoStore();
    rematches.length = 0;
    unsubscribe = onDemoRematch((rematch) => rematches.push(rematch));
  });

  afterEach(() => {
    unsubscribe();
  });

  it("opens a practice lobby over kept results without replacing them or notifying guests", () => {
    demoPutQuiz(QUIZSHOW_DEMO_RESULTS_SLUG, prideSeedInput());
    const opened = demoOpenSession(QUIZSHOW_DEMO_RESULTS_SLUG, {
      ...OPEN_INPUT,
      playMode: "teams",
      maxTeamSize: 4,
      isPractice: true,
    });
    expect(opened.isGuestPushSent).toBe(false);
    const response = demoGetQuiz(QUIZSHOW_DEMO_RESULTS_SLUG);
    expect(response.hasResults).toBe(true);
    expect(demoResults(QUIZSHOW_DEMO_RESULTS_SLUG).podium.length).toBe(3);
    expect(response.liveSession).toMatchObject({
      isPractice: true,
      isBehindQuiz: false,
    });
    expect(response.lastOpenSettings).toEqual({
      playMode: "teams",
      maxTeamSize: 4,
      isReviewOn: true,
    });
    expect(demoEventLiveSession(QUIZSHOW_DEMO_RESULTS_SLUG)).toMatchObject({
      sessionId: QUIZSHOW_DEMO_SESSION_ID,
      isPractice: true,
    });
    expect(demoEventLiveSession(QUIZSHOW_DEMO_LIVE_SLUG)).toBeNull();
  });

  it("carries standings and the corrected question on the demo recap", () => {
    const recap = demoResults(QUIZSHOW_DEMO_RESULTS_SLUG).recap;
    expect(recap?.standings.slice(0, 3).map((row) => row.name)).toEqual([
      "Rita",
      "Nuno",
      "Bea",
    ]);
    const ranks = recap?.standings.map((row) => row.rank) ?? [];
    expect([...ranks].sort((first, second) => first - second)).toEqual(ranks);
    expect(
      recap?.questions.filter((question) => question.wasCorrected),
    ).toHaveLength(1);
    expect(recap?.questions.every((question) => !question.isWarmUp)).toBe(true);
  });

  it("refuses a rematch of another session with rematch_not_found", () => {
    const error = refusalOf(() =>
      demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        ...OPEN_INPUT,
        shouldReplaceResults: true,
        rematchOfSessionId: "demo-quizshow-other-session",
      }),
    );
    expect(error.status).toBe(404);
    expect(dataOf(error).code).toBe("quizshow_rematch_not_found");
    expect(rematches).toEqual([]);
  });

  it("refuses a rematch after the window with rematch_expired", () => {
    demoEndSession(
      QUIZSHOW_DEMO_SESSION_ID,
      Date.now() - QUIZSHOW_LIMITS.rematchWindowMs - 1000,
    );
    const error = refusalOf(() =>
      demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        ...OPEN_INPUT,
        shouldReplaceResults: true,
        rematchOfSessionId: QUIZSHOW_DEMO_SESSION_ID,
      }),
    );
    expect(error.status).toBe(409);
    expect(dataOf(error).code).toBe("quizshow_rematch_expired");
    expect(rematches).toEqual([]);
  });

  it("reopens a finished session with the same id, a new code and a bus event", () => {
    const first = demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      shouldReplaceResults: true,
    });
    demoEndSession(first.sessionId);
    const rematch = demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      playMode: "teams",
      rematchOfSessionId: first.sessionId,
    });
    expect(rematch.sessionId).toBe(first.sessionId);
    expect(rematch.joinCode).not.toBe(first.joinCode);
    expect(rematches).toEqual([
      {
        fromSessionId: first.sessionId,
        sessionId: first.sessionId,
        joinCode: rematch.joinCode,
        playMode: "teams",
      },
    ]);
    expect(demoJoinPreview(rematch.joinCode)).toEqual({
      quizTitle: "Eurovision night",
      status: "lobby",
    });
    unsubscribe();
    demoEndSession(rematch.sessionId);
    demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      rematchOfSessionId: rematch.sessionId,
    });
    expect(rematches).toHaveLength(1);
  });
});

describe("quizshow demo lobby refresh", () => {
  const refreshes: QuizshowDemoLobbyRefreshed[] = [];
  let unsubscribe: () => void = () => undefined;

  beforeEach(() => {
    resetQuizshowDemoStore();
    refreshes.length = 0;
    unsubscribe = onDemoLobbyRefreshed((event) => refreshes.push(event));
  });

  afterEach(() => {
    unsubscribe();
  });

  it("refuses a refresh with no open lobby with session_not_found", () => {
    const error = refusalOf(() =>
      demoRefreshLobby(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
    );
    expect(error.status).toBe(404);
    expect(dataOf(error).code).toBe("quizshow_session_not_found");
  });

  it("answers a no-op while the lobby is current, then swaps in the latest edits", () => {
    demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      isPractice: true,
    });
    expect(demoRefreshLobby(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG)).toEqual({
      isNoop: true,
    });
    expect(refreshes).toEqual([]);
    const stored = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).quiz;
    if (!stored) throw new Error("no quiz");
    demoPutQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      expectedUpdatedAt: "2026-10-25T00:00:00.000Z",
      title: "Eurovision night, edited",
      languages: stored.languages,
      screenLanguage: stored.screenLanguage,
      rounds: stored.rounds,
    });
    const behind = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG);
    expect(behind.liveSession?.isBehindQuiz).toBe(true);
    expect(demoRefreshLobby(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG)).toEqual({
      isNoop: false,
    });
    expect(refreshes).toHaveLength(1);
    expect(refreshes[0]).toMatchObject({
      sessionId: QUIZSHOW_DEMO_SESSION_ID,
      sourceUpdatedAt: behind.quiz?.updatedAt,
    });
    expect(refreshes[0]?.quiz.title).toBe("Eurovision night, edited");
    expect(
      demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).liveSession?.isBehindQuiz,
    ).toBe(false);
  });

  it("refuses latest edits with problems with refresh_quiz_incomplete", () => {
    demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      isPractice: true,
    });
    const stored = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).quiz;
    if (!stored) throw new Error("no quiz");
    demoPutQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      expectedUpdatedAt: stored.updatedAt,
      title: "",
      languages: stored.languages,
      screenLanguage: stored.screenLanguage,
      rounds: stored.rounds,
    });
    const error = refusalOf(() =>
      demoRefreshLobby(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_refresh_quiz_incomplete");
    expect(refreshes).toEqual([]);
  });
});

describe("quizshow demo append import", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("refuses a stale token with quiz_changed naming the saver", () => {
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
        mode: "append",
        roundIndexes: [0],
        expectedUpdatedAt: null,
      }),
    );
    expect(error.status).toBe(409);
    expect(dataOf(error)).toMatchObject({
      code: "quizshow_quiz_changed",
      updatedAt: "2026-10-25T00:00:00.000Z",
      updatedByName: "You",
    });
  });

  it("refuses a row the source does not have with import_round_not_found", () => {
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
        mode: "append",
        roundIndexes: [99],
        expectedUpdatedAt: storedUpdatedAtOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
      }),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_import_round_not_found");
  });

  it("refuses an empty row choice with import_round_not_found and writes nothing", () => {
    const before = storedUpdatedAtOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG);
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
        mode: "append",
        roundIndexes: [],
        expectedUpdatedAt: before,
      }),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_import_round_not_found");
    expect(storedUpdatedAtOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG)).toBe(before);
  });

  it("pins a trailing wheel to its slices so appended rows land after its range", () => {
    demoPutQuiz(
      QUIZSHOW_DEMO_LIVE_SLUG,
      wheelNightInput([
        wheelTestRound("Opener", "quiz"),
        wheelTestRound("Spin", "wheel"),
        wheelTestRound("Slice one", "quiz"),
        wheelTestRound("Slice two", "quiz"),
      ]),
    );
    const appended = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      mode: "append",
      roundIndexes: [0],
      expectedUpdatedAt: storedUpdatedAtOf(QUIZSHOW_DEMO_LIVE_SLUG),
    }).quiz;
    const rounds = appended?.rounds ?? [];
    expect(rounds).toHaveLength(5);
    expect(rounds[1]?.settings.sliceCount).toBe(2);
    expect(wheelSliceRoundIndexes(rounds, 1)).toEqual([2, 3]);
  });

  it("refuses an append past 10 rounds with import_too_many_rounds", () => {
    const appendEveryRow = () =>
      demoImportQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
        mode: "append",
        roundIndexes: null,
        expectedUpdatedAt: storedUpdatedAtOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
      });
    appendEveryRow();
    appendEveryRow();
    const error = refusalOf(appendEveryRow);
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_import_too_many_rounds");
  });

  it("refuses an append past 100 questions with import_too_many_questions", () => {
    demoPutQuiz(
      QUIZSHOW_DEMO_LIVE_SLUG,
      wheelNightInput(
        [1, 2, 3, 4, 5].map((roundNumber) =>
          roundOfQuestions(`Round ${roundNumber}`, 20),
        ),
      ),
    );
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
        mode: "append",
        roundIndexes: [0],
        expectedUpdatedAt: storedUpdatedAtOf(QUIZSHOW_DEMO_LIVE_SLUG),
      }),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_import_too_many_questions");
  });

  it("brings a chosen wheel's slice rows along", () => {
    const appended = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "game",
      gameId: QUIZSHOW_DEMO_GAME_IDS.wheelNight,
      mode: "append",
      roundIndexes: [0],
      expectedUpdatedAt: null,
    }).quiz;
    expect(appended?.rounds.map((round) => round.kind === "wheel")).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  it("refuses an append past 3 wheels with import_too_many_wheels", () => {
    demoPutQuiz(
      QUIZSHOW_DEMO_LIVE_SLUG,
      wheelNightInput(
        ["A", "B", "C"].flatMap((wheelName) => [
          wheelTestRound(`Wheel ${wheelName}`, "wheel"),
          wheelTestRound(`Slice ${wheelName} one`, "quiz"),
          wheelTestRound(`Slice ${wheelName} two`, "quiz"),
        ]),
      ),
    );
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
        from: "game",
        gameId: QUIZSHOW_DEMO_GAME_IDS.wheelNight,
        mode: "append",
        roundIndexes: [0],
        expectedUpdatedAt: storedUpdatedAtOf(QUIZSHOW_DEMO_LIVE_SLUG),
      }),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_import_too_many_wheels");
  });

  it("appends the chosen rows with fresh ids and keeps the quiz's own template", () => {
    const before = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).quiz;
    const appended = demoImportQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
      mode: "append",
      roundIndexes: [0],
      expectedUpdatedAt: before?.updatedAt ?? null,
    }).quiz;
    expect(appended?.title).toBe("Eurovision night");
    expect(appended?.rounds).toHaveLength((before?.rounds.length ?? 0) + 1);
    expect(appended?.rounds.at(-1)?.title.en).toBe("Where it started");
    expect(appended?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
    expect(appended?.sourceTemplate?.copiedAt).toBe("2026-10-25T00:00:00.000Z");
    const beforeIds = new Set(before?.rounds.map((round) => round.id));
    expect(appended?.rounds.some((round) => beforeIds.has(round.id))).toBe(
      false,
    );
  });

  it("names the template on an append into an event with no quiz", () => {
    const appended = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      mode: "append",
      roundIndexes: [1],
      expectedUpdatedAt: null,
    }).quiz;
    expect(appended?.rounds).toHaveLength(1);
    expect(appended?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
    expect(appended?.sourceTemplate?.hasUpdate).toBe(false);
  });
});

describe("quizshow demo join preview after the end", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("answers session_finished for a code whose lobby ended, then forgets it after the memory window", () => {
    const sessionId =
      QUIZSHOW_DEMO_GAME_SESSION_PREFIX + QUIZSHOW_DEMO_GAME_IDS.afterDark;
    demoEndSession(sessionId);
    const finished = refusalOf(() => demoJoinPreview("QG4MW8"));
    expect(finished.status).toBe(410);
    expect(dataOf(finished).code).toBe("quizshow_session_finished");
    resetQuizshowDemoStore();
    demoEndSession(
      sessionId,
      Date.now() - QUIZSHOW_LIMITS.finishedCodeMemoryHours * 3_600_000 - 1000,
    );
    const forgotten = refusalOf(() => demoJoinPreview("QG4MW8"));
    expect(forgotten.status).toBe(404);
    expect(dataOf(forgotten).code).toBe("quizshow_join_code_not_found");
  });
});

describe("quizshow demo join preview", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("previews the demo event code, then a game code, and refuses others", () => {
    expect(demoJoinPreview("qz7-kp4")).toEqual({
      quizTitle: "Pride and queer history",
      status: "lobby",
    });
    expect(demoJoinPreview("QG4MW8")).toEqual({
      quizTitle: "After dark trivia",
      status: "lobby",
    });
    const opened = demoOpenSession(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      ...OPEN_INPUT,
      isPractice: true,
    });
    const stored = demoGetQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG).quiz;
    if (!stored) throw new Error("no quiz");
    demoPutQuiz(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG, {
      expectedUpdatedAt: stored.updatedAt,
      title: "Renamed after the open",
      languages: stored.languages,
      screenLanguage: stored.screenLanguage,
      rounds: stored.rounds,
    });
    expect(demoJoinPreview(opened.joinCode).quizTitle).toBe("Eurovision night");
    for (const code of ["ABCDEF", "abc"]) {
      const error = refusalOf(() => demoJoinPreview(code));
      expect(error.status).toBe(404);
      expect(dataOf(error).code).toBe("quizshow_join_code_not_found");
    }
  });
});
