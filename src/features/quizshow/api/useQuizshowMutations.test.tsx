import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowQuizInput,
  QuizshowQuizResponse,
  QuizshowResultsResponse,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { quizshowKeys } from "./quizshowKeys";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";
import { resetQuizshowDemoStore } from "./quizshowDemoStore";
import {
  useDeleteQuizshowResults,
  useSaveQuizshowQuiz,
} from "./useQuizshowMutations";

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
  });

  it("puts the saved quiz in the cache", async () => {
    const pack = QUIZSHOW_STARTER_PACKS[0];
    if (!pack) throw new Error("no starter pack");
    const body: QuizshowQuizInput = { ...pack.quiz, expectedUpdatedAt: null };
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(QUIZSHOW_DEMO_LIVE_SLUG),
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
      () => useDeleteQuizshowResults(QUIZSHOW_DEMO_RESULTS_SLUG),
      { wrapper },
    );

    await result.current.mutateAsync();

    await waitFor(() =>
      expect(queryClient.getQueryData(resultsKey)).toBeUndefined(),
    );
  });
});
