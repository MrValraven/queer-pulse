import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowQuizInput,
  QuizshowQuizResponse,
  QuizshowResultsResponse,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { eventScope, gameScope } from "../quizshowScope";
import { quizshowKeys } from "./quizshowKeys";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";
import { demoPutQuiz, resetQuizshowDemoStore } from "./quizshowDemoStore";
import { demoGetGame, demoListGames } from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import { demoBodyOf } from "./quizshowDemoQuizzes";
import {
  useDeleteQuizshowResults,
  useSaveQuizshowQuiz,
} from "./useQuizshowMutations";

// The event demo branch keeps calling the event store; the spy reads its body.
vi.mock("./quizshowDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./quizshowDemoStore")>();
  return { ...actual, demoPutQuiz: vi.fn(actual.demoPutQuiz) };
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

describe("quizshow mutations in demo mode", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPutQuiz).mockClear();
  });

  it("puts the saved quiz in the cache", async () => {
    const pack = QUIZSHOW_STARTER_PACKS[0];
    if (!pack) throw new Error("no starter pack");
    const body: QuizshowQuizInput = { ...pack.quiz, expectedUpdatedAt: null };
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
      { wrapper },
    );

    const response = await result.current.mutateAsync(body);

    await waitFor(() =>
      expect(
        queryClient.getQueryData<QuizshowQuizResponse>(
          quizshowKeys.quiz(QUIZSHOW_DEMO_LIVE_SLUG, true),
        ),
      ).toEqual(response),
    );
  });

  it("drops the results from the cache after a delete", async () => {
    const { queryClient, wrapper } = setup();
    const resultsKey = quizshowKeys.results(QUIZSHOW_DEMO_RESULTS_SLUG, true);
    queryClient.setQueryData<QuizshowResultsResponse>(
      resultsKey,
      QUIZSHOW_DEMO_RESULTS,
    );
    const { result } = renderHook(
      () => useDeleteQuizshowResults(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG)),
      { wrapper },
    );

    await result.current.mutateAsync();

    await waitFor(() =>
      expect(queryClient.getQueryData(resultsKey)).toBeUndefined(),
    );
  });

  it("refreshes My games after a game save", async () => {
    const gameId = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
    const quiz = demoGetGame(gameId).quiz;
    if (!quiz) throw new Error("the demo game has no quiz");
    const { queryClient, wrapper } = setup();
    const gamesKey = quizshowKeys.games(true);
    queryClient.setQueryData(gamesKey, demoListGames());
    const sourcesKey = quizshowKeys.gameImportSources(
      QUIZSHOW_DEMO_GAME_IDS.afterDark,
      true,
    );
    queryClient.setQueryData(sourcesKey, { items: [] });
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(gameScope(gameId)),
      { wrapper },
    );

    const response = await result.current.mutateAsync({
      ...demoBodyOf(quiz),
      title: "Friday flat quiz, second round",
      expectedUpdatedAt: quiz.updatedAt,
      isAdultsOnly: false,
    });

    expect(queryClient.getQueryState(gamesKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(sourcesKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryData(quizshowKeys.game(gameId, true))).toEqual(
      response,
    );
    expect(response.quiz?.title).toBe("Friday flat quiz, second round");
  });

  it("saves an event quiz without isAdultsOnly", async () => {
    const pack = QUIZSHOW_STARTER_PACKS[0];
    if (!pack) throw new Error("no starter pack");
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
      { wrapper },
    );

    await result.current.mutateAsync({
      ...pack.quiz,
      expectedUpdatedAt: null,
      isAdultsOnly: true,
    });

    expect(vi.mocked(demoPutQuiz)).toHaveBeenCalledTimes(1);
    const [sentSlug, sentBody] = vi.mocked(demoPutQuiz).mock.calls[0] ?? [];
    expect(sentSlug).toBe(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(sentBody).toBeDefined();
    expect(sentBody).not.toHaveProperty("isAdultsOnly");
  });
});
