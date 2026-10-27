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
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import { eventScope, gameScope, templateScope } from "../quizshowScope";
import { quizshowKeys } from "./quizshowKeys";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";
import { demoPutQuiz, resetQuizshowDemoStore } from "./quizshowDemoStore";
import { demoGetGame, demoListGames } from "./quizshowDemoGames";
import {
  demoGetTemplate,
  demoListTemplates,
  demoPutTemplate,
  demoTemplateCards,
} from "./quizshowDemoTemplates";
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

// The template demo branch calls the template store; the spy reads its body.
vi.mock("./quizshowDemoTemplates", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./quizshowDemoTemplates")>();
  return { ...actual, demoPutTemplate: vi.fn(actual.demoPutTemplate) };
});

/** The Pride template's quiz, the fixture every event save starts from. */
const PRIDE_QUIZ = templateSeedById(
  QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
).quiz;

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
    vi.mocked(demoPutTemplate).mockClear();
  });

  it("puts the saved quiz in the cache", async () => {
    const body: QuizshowQuizInput = { ...PRIDE_QUIZ, expectedUpdatedAt: null };
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

  it("saves an event quiz without isAdultsOnly or template fields", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
      { wrapper },
    );

    await result.current.mutateAsync({
      ...PRIDE_QUIZ,
      expectedUpdatedAt: null,
      isAdultsOnly: true,
      templateFields: {
        card: templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory).card,
        staffNotes: "",
      },
    });

    expect(vi.mocked(demoPutQuiz)).toHaveBeenCalledTimes(1);
    const [sentSlug, sentBody] = vi.mocked(demoPutQuiz).mock.calls[0] ?? [];
    expect(sentSlug).toBe(QUIZSHOW_DEMO_LIVE_SLUG);
    expect(sentBody).toBeDefined();
    expect(sentBody).not.toHaveProperty("isAdultsOnly");
    expect(sentBody).not.toHaveProperty("templateFields");
  });

  it("saves a template with its card, staff notes and quiz in one PUT", async () => {
    const templateId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const detail = demoGetTemplate(templateId);
    const card = {
      title: { en: "Pride through the years", pt: "Pride ao longo dos anos" },
      description: detail.card.description,
    };
    const staffNotes = "Round 1, question 1: checked against the archive";
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(templateScope(templateId)),
      { wrapper },
    );

    const response = await result.current.mutateAsync({
      ...demoBodyOf(detail.quiz),
      expectedUpdatedAt: detail.quiz.updatedAt,
      isAdultsOnly: true,
      templateFields: { card, staffNotes },
    });

    expect(vi.mocked(demoPutTemplate)).toHaveBeenCalledTimes(1);
    const [sentId, sentBody] = vi.mocked(demoPutTemplate).mock.calls[0] ?? [];
    expect(sentId).toBe(templateId);
    expect(Object.keys(sentBody ?? {}).sort()).toEqual([
      "card",
      "quiz",
      "staffNotes",
    ]);
    expect(sentBody?.card).toEqual(card);
    expect(sentBody?.staffNotes).toBe(staffNotes);
    expect(sentBody?.quiz.expectedUpdatedAt).toBe(detail.quiz.updatedAt);
    expect(sentBody?.quiz).not.toHaveProperty("isAdultsOnly");
    expect(sentBody?.quiz).not.toHaveProperty("templateFields");
    expect(
      queryClient.getQueryData(quizshowKeys.template(templateId, true)),
    ).toEqual(response);
    expect(response.isAdultsEvent).toBe(true);
  });

  it("refreshes the template lists after a template save", async () => {
    const templateId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const detail = demoGetTemplate(templateId);
    const { queryClient, wrapper } = setup();
    const rowsKey = quizshowKeys.templateRows(true);
    const cardsKey = quizshowKeys.templateCards(true);
    queryClient.setQueryData(rowsKey, demoListTemplates());
    queryClient.setQueryData(cardsKey, demoTemplateCards());
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(templateScope(templateId)),
      { wrapper },
    );

    await result.current.mutateAsync({
      ...demoBodyOf(detail.quiz),
      title: "Pride history, revised",
      expectedUpdatedAt: detail.quiz.updatedAt,
      templateFields: { card: detail.card, staffNotes: detail.staffNotes },
    });

    expect(queryClient.getQueryState(rowsKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(cardsKey)?.isInvalidated).toBe(true);
  });

  it("refuses a template save without its card and staff notes", async () => {
    const templateId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const detail = demoGetTemplate(templateId);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useSaveQuizshowQuiz(templateScope(templateId)),
      { wrapper },
    );

    await expect(
      result.current.mutateAsync({
        ...demoBodyOf(detail.quiz),
        expectedUpdatedAt: detail.quiz.updatedAt,
      }),
    ).rejects.toThrow("A template save needs its card and staff notes");
    expect(vi.mocked(demoPutTemplate)).not.toHaveBeenCalled();
  });
});
