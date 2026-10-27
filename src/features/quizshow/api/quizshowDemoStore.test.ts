import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowOpenSessionInput,
  QuizshowQuizInput,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import { demoGetGame } from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import {
  demoGetQuiz,
  demoImportQuiz,
  demoImportSources,
  demoJoin,
  demoOpenSession,
  demoPutQuiz,
  demoQuizFor,
  resetQuizshowDemoStore,
} from "./quizshowDemoStore";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";

const OPEN_INPUT: QuizshowOpenSessionInput = {
  playMode: "solo",
  maxTeamSize: null,
  isReviewOn: true,
  notifyGuests: true,
  shouldReplaceResults: false,
};

function prideSeedInput(): QuizshowQuizInput {
  const seed = templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
  return { ...structuredClone(seed.quiz), expectedUpdatedAt: null };
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
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    ]);
    const sourceKinds = items.map((source) => source.kind);
    expect(sourceKinds.indexOf("game")).toBeGreaterThan(
      sourceKinds.lastIndexOf("event"),
    );
    const flatQuizSource = gameSources[1];
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
