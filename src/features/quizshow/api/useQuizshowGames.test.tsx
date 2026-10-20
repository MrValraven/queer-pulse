import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowGameListResponse,
  QuizshowGameResponse,
  QuizshowGameSummary,
} from "../../../shared/contracts/quizshow";
import { quizshowKeys } from "./quizshowKeys";
import { resetQuizshowDemoStore } from "./quizshowDemoStore";
import {
  demoGameImportSources,
  demoGameResults,
  demoGetGame,
  demoListGames,
} from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import {
  gameSummaryOf,
  useCreateQuizshowGame,
  useDeleteQuizshowGame,
  useDuplicateQuizshowGame,
  useQuizshowGames,
} from "./useQuizshowGames";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

/** A row only the cache holds: a refetch would drop it, a patch keeps it. */
const CACHED_ONLY_ROW: QuizshowGameSummary = {
  id: "cached-only-game",
  title: "Cached only",
  roundCount: 1,
  questionCount: 4,
  isAdultsOnly: false,
  liveSession: null,
  hasResults: false,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function cachedGameIds(queryClient: QueryClient): string[] {
  const list = queryClient.getQueryData<QuizshowGameListResponse>(
    quizshowKeys.games(true),
  );
  return list?.games.map((game) => game.id) ?? [];
}

function isCached(queryClient: QueryClient, queryKey: readonly unknown[]) {
  return (
    queryClient.getQueryCache().find({ queryKey, exact: true }) !== undefined
  );
}

describe("quizshow games in demo mode", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("lists the two demo games newest first", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useQuizshowGames({ isEnabled: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const games = result.current.data?.games ?? [];
    expect(games.map((game) => game.id).sort()).toEqual(
      [
        QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
        QUIZSHOW_DEMO_GAME_IDS.afterDark,
      ].sort(),
    );
    const updatedTimes = games.map((game) => Date.parse(game.updatedAt));
    expect(updatedTimes).toEqual(
      [...updatedTimes].sort((left, right) => right - left),
    );
  });

  it("puts a created or duplicated game at the top of My games", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData<QuizshowGameListResponse>(
      quizshowKeys.games(true),
      { games: [CACHED_ONLY_ROW], limit: 50 },
    );
    const eventSourcesKey = quizshowKeys.importSources("pride-brunch", true);
    const gameSourcesKey = quizshowKeys.gameImportSources(
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      true,
    );
    queryClient.setQueryData(eventSourcesKey, { items: [] });
    queryClient.setQueryData(gameSourcesKey, { items: [] });
    const { result } = renderHook(
      () => ({
        create: useCreateQuizshowGame(),
        duplicate: useDuplicateQuizshowGame(),
      }),
      { wrapper },
    );

    const created = await result.current.create.mutateAsync({
      title: "Pub quiz",
      source: null,
    });

    expect(cachedGameIds(queryClient)).toEqual([
      created.gameId,
      CACHED_ONLY_ROW.id,
    ]);
    expect(
      queryClient.getQueryData(quizshowKeys.game(created.gameId, true)),
    ).toEqual(created);
    expect(queryClient.getQueryState(eventSourcesKey)?.isInvalidated).toBe(
      true,
    );
    expect(queryClient.getQueryState(gameSourcesKey)?.isInvalidated).toBe(true);

    const duplicated = await result.current.duplicate.mutateAsync(
      QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    );

    expect(duplicated.gameId).not.toBe(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
    expect(cachedGameIds(queryClient)).toEqual([
      duplicated.gameId,
      created.gameId,
      CACHED_ONLY_ROW.id,
    ]);
    expect(
      queryClient.getQueryData(quizshowKeys.game(duplicated.gameId, true)),
    ).toEqual(duplicated);
  });

  it("drops a deleted game from My games at once", async () => {
    const gameId = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(quizshowKeys.games(true), demoListGames());
    queryClient.setQueryData(
      quizshowKeys.game(gameId, true),
      demoGetGame(gameId),
    );
    queryClient.setQueryData(
      quizshowKeys.gameResults(gameId, true),
      demoGameResults(gameId),
    );
    queryClient.setQueryData(
      quizshowKeys.gameImportSources(gameId, true),
      demoGameImportSources(gameId),
    );
    const otherSourcesKey = quizshowKeys.gameImportSources(
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      true,
    );
    queryClient.setQueryData(
      otherSourcesKey,
      demoGameImportSources(QUIZSHOW_DEMO_GAME_IDS.afterDark),
    );
    const { result } = renderHook(() => useDeleteQuizshowGame(), { wrapper });

    await result.current.mutateAsync(gameId);

    // The deleted game drops off every other game's list of sources.
    expect(queryClient.getQueryState(otherSourcesKey)?.isInvalidated).toBe(
      true,
    );

    expect(cachedGameIds(queryClient)).toEqual([
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
    ]);
    expect(isCached(queryClient, quizshowKeys.game(gameId, true))).toBe(false);
    expect(isCached(queryClient, quizshowKeys.gameResults(gameId, true))).toBe(
      false,
    );
    expect(
      isCached(queryClient, quizshowKeys.gameImportSources(gameId, true)),
    ).toBe(false);
  });

  it("builds a summary from a game response", () => {
    const demoGame = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    const quiz = demoGame.quiz;
    const [firstRound, secondRound] = quiz?.rounds ?? [];
    if (!quiz || !firstRound || !secondRound) {
      throw new Error("the 18+ demo game has fewer than two rounds");
    }
    const response: QuizshowGameResponse = {
      ...demoGame,
      gameId: "summary-game",
      isAdultsOnly: true,
      hasResults: true,
      liveSession: {
        sessionId: "summary-session",
        joinCode: "QG4MW8",
        status: "lobby",
        playMode: "solo",
        playerCount: 3,
        startedAt: "2026-10-20T19:00:00.000Z",
      },
      quiz: {
        ...quiz,
        rounds: [
          { ...firstRound, questions: firstRound.questions.slice(0, 2) },
          { ...secondRound, questions: secondRound.questions.slice(0, 3) },
        ],
      },
    };

    expect(gameSummaryOf(response)).toEqual({
      id: "summary-game",
      title: quiz.title,
      roundCount: 2,
      questionCount: 5,
      isAdultsOnly: true,
      liveSession: response.liveSession,
      hasResults: true,
      updatedAt: quiz.updatedAt,
    });
  });
});
