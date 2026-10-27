import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowGameInput,
  type QuizshowGameResponse,
  type QuizshowOpenSessionInput,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_GAME_JOIN_CODE,
  QUIZSHOW_DEMO_GAME_SESSION_PREFIX,
} from "../quizshow.constants";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import {
  demoCreateGame,
  demoDeleteGame,
  demoDuplicateGame,
  demoGameIdForSession,
  demoGameImportSources,
  demoGameQuizFor,
  demoGameResults,
  demoGetGame,
  demoImportGame,
  demoJoinGame,
  demoListGames,
  demoOpenGameSession,
  demoPutGame,
  resetQuizshowDemoGames,
} from "./quizshowDemoGames";
import {
  QUIZSHOW_DEMO_GAME_HOST,
  QUIZSHOW_DEMO_GAME_IDS,
} from "./quizshowDemoGames.data";
import { hasAdultsRound } from "./quizshowDemoQuizzes";
import { demoJoin, resetQuizshowDemoStore } from "./quizshowDemoStore";
import { demoGetTemplate, demoPutTemplate } from "./quizshowDemoTemplates";

const OPEN_INPUT: QuizshowOpenSessionInput = {
  playMode: "solo",
  maxTeamSize: null,
  isReviewOn: true,
  notifyGuests: false,
  shouldReplaceResults: false,
};

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

function putInputOf(
  response: QuizshowGameResponse,
  isAdultsOnly: boolean,
): QuizshowGameInput {
  const quiz = response.quiz;
  if (!quiz) throw new Error("no quiz");
  return {
    expectedUpdatedAt: quiz.updatedAt,
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds,
    isAdultsOnly,
  };
}

describe("quizshow demo games store", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("seeds two demo games, one 18+ with an open lobby and one with kept results", () => {
    const list = demoListGames();
    expect(list.limit).toBe(QUIZSHOW_GAMES_PER_MEMBER_MAX);
    expect(list.games.map((game) => game.id)).toEqual([
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    ]);

    const flatQuiz = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
    expect(flatQuiz.quiz?.title).toBe("Friday flat quiz");
    expect(flatQuiz.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
    expect(flatQuiz.hasResults).toBe(true);
    expect(flatQuiz.liveSession).toBeNull();
    expect(flatQuiz.isAdultsOnly).toBe(false);
    expect(flatQuiz.problems).toEqual([]);
    expect(
      demoGameResults(QUIZSHOW_DEMO_GAME_IDS.flatQuiz).podium.length,
    ).toBeGreaterThan(0);

    const afterDark = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    expect(afterDark.quiz?.title).toBe("After dark trivia");
    expect(afterDark.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory,
    );
    expect(
      afterDark.quiz?.rounds.map((round) => round.contentLabel === "adults"),
    ).toEqual([false, true, false]);
    expect(afterDark.isAdultsOnly).toBe(true);
    expect(afterDark.isAdultsEvent).toBe(true);
    expect(afterDark.hasResults).toBe(false);
    expect(afterDark.liveSession).toMatchObject({
      sessionId:
        QUIZSHOW_DEMO_GAME_SESSION_PREFIX + QUIZSHOW_DEMO_GAME_IDS.afterDark,
      joinCode: QUIZSHOW_DEMO_GAME_JOIN_CODE,
      status: "lobby",
    });
    expect(QUIZSHOW_DEMO_GAME_JOIN_CODE).toBe("QG4MW8");
  });

  it("starts a blank game with both languages, an English screen and no rounds", () => {
    const created = demoCreateGame({
      title: "  Board game night  ",
      source: null,
    });
    expect(created.quiz).not.toBeNull();
    expect(created.quiz?.title).toBe("Board game night");
    expect(created.quiz?.languages).toBe("both");
    expect(created.quiz?.screenLanguage).toBe("en");
    expect(created.quiz?.rounds).toEqual([]);
    expect(created.quiz?.sourceTemplateId).toBeNull();
    expect(created.isAdultsOnly).toBe(false);
    expect(created.liveSession).toBeNull();
    expect(created.hasResults).toBe(false);
    expect(demoListGames().games[0]?.id).toBe(created.gameId);
    const blankError = refusalOf(() =>
      demoCreateGame({ title: "   ", source: null }),
    );
    expect(blankError.status).toBe(400);
  });

  it("starts a game from a source with an adults round with 18+ on", () => {
    const created = demoCreateGame({
      title: "Late copy",
      source: { from: "game", gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark },
    });
    expect(created.quiz?.title).toBe("Late copy");
    expect(created.quiz && hasAdultsRound(created.quiz)).toBe(true);
    expect(created.isAdultsOnly).toBe(true);
    const fromTemplate = demoCreateGame({
      title: "Template copy",
      source: {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      },
    });
    expect(fromTemplate.isAdultsOnly).toBe(false);
    expect(fromTemplate.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
    );
  });

  it("creates a game from a template with the switch on for an adults round", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const pride = demoGetTemplate(prideId);
    const prideQuiz = structuredClone(templateSeedById(prideId).quiz);
    const firstRound = prideQuiz.rounds[0];
    if (!firstRound) throw new Error("no round");
    prideQuiz.rounds[0] = { ...firstRound, contentLabel: "adults" };
    demoPutTemplate(prideId, {
      card: pride.card,
      staffNotes: pride.staffNotes,
      quiz: { ...prideQuiz, expectedUpdatedAt: pride.quiz.updatedAt },
    });
    const created = demoCreateGame({
      title: "Pride after dark",
      source: { from: "template", templateId: prideId },
    });
    expect(created.isAdultsOnly).toBe(true);
    expect(created.isAdultsEvent).toBe(true);
    expect(created.quiz && hasAdultsRound(created.quiz)).toBe(true);
    expect(created.quiz?.rounds[0]?.contentLabel).toBe("adults");
    expect(created.quiz?.sourceTemplateId).toBe(prideId);
  });

  it("refuses an adults round while the switch is off with game_adults_rounds_need_switch", () => {
    const afterDark = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    const error = refusalOf(() =>
      demoPutGame(
        QUIZSHOW_DEMO_GAME_IDS.afterDark,
        putInputOf(afterDark, false),
      ),
    );
    expect(error.status).toBe(403);
    expect(dataOf(error).code).toBe("quizshow_game_adults_rounds_need_switch");
    const importError = refusalOf(() =>
      demoImportGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz, {
        from: "game",
        gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
      }),
    );
    expect(importError.status).toBe(403);
    expect(dataOf(importError).code).toBe(
      "quizshow_game_adults_rounds_need_switch",
    );
    const saved = demoPutGame(
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      putInputOf(afterDark, true),
    );
    expect(saved.isAdultsOnly).toBe(true);
  });

  it("duplicates a game with the same title, the switch, and no results or lobby", () => {
    const duplicated = demoDuplicateGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    expect(duplicated.gameId).not.toBe(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    expect(duplicated.quiz?.title).toBe("After dark trivia");
    expect(duplicated.isAdultsOnly).toBe(true);
    expect(duplicated.liveSession).toBeNull();
    expect(duplicated.hasResults).toBe(false);
    const fromResults = demoDuplicateGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
    expect(fromResults.hasResults).toBe(false);
    expect(fromResults.isAdultsOnly).toBe(false);
    expect(demoListGames().games).toHaveLength(4);
  });

  it("refuses a 51st game with game_limit_reached", () => {
    const seededCount = demoListGames().games.length;
    for (
      let gameIndex = seededCount;
      gameIndex < QUIZSHOW_GAMES_PER_MEMBER_MAX;
      gameIndex += 1
    ) {
      demoCreateGame({ title: `Game ${gameIndex}`, source: null });
    }
    expect(demoListGames().games).toHaveLength(QUIZSHOW_GAMES_PER_MEMBER_MAX);
    const createError = refusalOf(() =>
      demoCreateGame({ title: "One too many", source: null }),
    );
    expect(createError.status).toBe(403);
    expect(dataOf(createError).code).toBe("quizshow_game_limit_reached");
    const duplicateError = refusalOf(() =>
      demoDuplicateGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz),
    );
    expect(dataOf(duplicateError).code).toBe("quizshow_game_limit_reached");
  });
});

describe("quizshow demo game lobbies, sources and joins", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("refuses a lobby with notifyGuests on", () => {
    const error = refusalOf(() =>
      demoOpenGameSession(QUIZSHOW_DEMO_GAME_IDS.flatQuiz, {
        ...OPEN_INPUT,
        notifyGuests: true,
      }),
    );
    expect(error.status).toBe(400);
    const opened = demoOpenGameSession(QUIZSHOW_DEMO_GAME_IDS.flatQuiz, {
      ...OPEN_INPUT,
      shouldReplaceResults: true,
    });
    expect(opened.isGuestPushSent).toBe(false);
    expect(opened.sessionId).toBe(
      QUIZSHOW_DEMO_GAME_SESSION_PREFIX + QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    );
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test(opened.joinCode)).toBe(true);
    expect(opened.joinCode).not.toBe(QUIZSHOW_DEMO_GAME_JOIN_CODE);
    expect(demoGameIdForSession(opened.sessionId)).toBe(
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    );
  });

  it("lists the other games and the demo events as sources for a game, events first", () => {
    const items = demoGameImportSources(QUIZSHOW_DEMO_GAME_IDS.flatQuiz).items;
    expect(items.map((source) => source.kind)).toEqual([
      "event",
      "event",
      "game",
    ]);
    expect(items[2]).toMatchObject({
      gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
      quizTitle: "After dark trivia",
      hasAdultsRounds: true,
      eventSlug: null,
      isSameSeries: false,
    });
    expect(items.every((source) => source.isSameSeries === false)).toBe(true);
    expect(
      items.some((source) => source.gameId === QUIZSHOW_DEMO_GAME_IDS.flatQuiz),
    ).toBe(false);
  });

  it("joins the 18+ demo game by its code with the host and isAdultsOnly", () => {
    const gameJoin = demoJoinGame(QUIZSHOW_DEMO_GAME_JOIN_CODE);
    expect(gameJoin).toEqual({
      sessionId:
        QUIZSHOW_DEMO_GAME_SESSION_PREFIX + QUIZSHOW_DEMO_GAME_IDS.afterDark,
      kind: "game",
      eventSlug: null,
      eventTitle: null,
      quizTitle: "After dark trivia",
      isAdultsOnly: true,
      host: QUIZSHOW_DEMO_GAME_HOST,
      status: "lobby",
      isRejoin: false,
    });
    expect(demoJoin({ code: "qg4-mw8" }).kind).toBe("game");
  });

  it("ends the lobby when a game is deleted, so its code stops joining", () => {
    demoDeleteGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    expect(demoJoinGame(QUIZSHOW_DEMO_GAME_JOIN_CODE)).toBeNull();
    expect(demoListGames().games.map((game) => game.id)).toEqual([
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    ]);
    expect(demoJoin({ code: QUIZSHOW_DEMO_GAME_JOIN_CODE }).kind).toBe("event");
  });

  it("answers game_not_found for an unknown id", () => {
    const unknownId = "demo-game-unknown";
    const actions: Array<() => unknown> = [
      () => demoGetGame(unknownId),
      () => demoDeleteGame(unknownId),
      () => demoDuplicateGame(unknownId),
      () => demoGameResults(unknownId),
      () => demoGameImportSources(unknownId),
      () => demoOpenGameSession(unknownId, OPEN_INPUT),
    ];
    for (const action of actions) {
      const error = refusalOf(action);
      expect(error.status).toBe(404);
      expect(dataOf(error).code).toBe("quizshow_game_not_found");
    }
    expect(demoGameQuizFor(unknownId).rounds.length).toBeGreaterThan(0);
  });

  it("keeps the game's title when importing into it", () => {
    const imported = demoImportGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz, {
      from: "template",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
    });
    expect(imported.quiz?.title).toBe("Friday flat quiz");
    expect(imported.quiz?.sourceTemplateId).toBe(
      QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
    );
    expect(imported.quiz?.languages).toBe("both");
    expect(imported.quiz?.rounds[0]?.title.en).toBe("Where it started");
    expect(demoListGames().games[0]).toMatchObject({
      id: QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
      title: "Friday flat quiz",
    });
  });

  it("clears added games on reset", () => {
    demoCreateGame({ title: "Gone after reset", source: null });
    resetQuizshowDemoGames();
    expect(demoListGames().games).toHaveLength(2);
  });
});
