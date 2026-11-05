import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { defaultRoundSettings, newQuestion } from "../builder/quizshowDraft";
import { useQuizshowAdultsDraft } from "../builder/useQuizshowAdultsDraft";
import { useQuizshowDraft } from "../builder/useQuizshowDraft";
import { gameScope } from "../quizshowScope";

function storedQuiz(promptText: string, updatedAt: string): QuizshowQuiz {
  const question: QuizshowQuestion = {
    ...newQuestion("true_false", "quiz"),
    id: "round-1-question-1",
    mediaUrl: null,
    prompt: { en: promptText, pt: promptText },
    answer: { isTrue: true },
  };
  return {
    title: "Pride trivia",
    languages: "en",
    screenLanguage: "en",
    sourceTemplateId: null,
    updatedAt,
    rounds: [
      {
        id: "round-1",
        kind: "quiz",
        title: { en: "History", pt: "História" },
        contentLabel: "none",
        settings: defaultRoundSettings(),
        questions: [question],
      },
    ],
  };
}

describe("a save answered while the host kept editing", () => {
  it("rebaseTo keeps a revert made in flight, and the newer quiz is not adopted", () => {
    const saved = storedQuiz(
      "Stonewall was in 1969",
      "2026-11-01T10:00:00.000Z",
    );
    const hook = renderHook(
      ({ quiz }: { quiz: QuizshowQuiz }) => useQuizshowDraft(quiz),
      { initialProps: { quiz: saved } },
    );
    const originalQuestion = hook.result.current.draft.rounds[0]?.questions[0];
    if (originalQuestion === undefined)
      throw new Error("fixture has no question");
    const draftKey = originalQuestion.draftKey;

    // The edit that goes out with the save.
    act(() => {
      hook.result.current.updateQuestion(0, 0, {
        ...originalQuestion.question,
        prompt: { en: "Stonewall was in 1970", pt: "Stonewall was in 1970" },
      });
    });
    expect(hook.result.current.isDirty).toBe(true);
    // The host reverts it while the request is in flight.
    act(() => {
      hook.result.current.updateQuestion(0, 0, originalQuestion.question);
    });

    // The server stored the edit; the response becomes the baseline only.
    const stored = storedQuiz(
      "Stonewall was in 1970",
      "2026-11-01T10:00:05.000Z",
    );
    act(() => {
      hook.result.current.rebaseTo?.(stored);
    });
    hook.rerender({ quiz: stored });

    const question = hook.result.current.draft.rounds[0]?.questions[0];
    expect(question?.question.prompt.en).toBe("Stonewall was in 1969");
    expect(question?.draftKey).toBe(draftKey);
    expect(hook.result.current.isDirty).toBe(true);
  });

  it("a refetch landing before the save's response does not adopt over a revert", () => {
    const saved = storedQuiz(
      "Stonewall was in 1969",
      "2026-11-01T10:00:00.000Z",
    );
    const hook = renderHook(
      ({
        quiz,
        isAdoptPaused,
      }: {
        quiz: QuizshowQuiz;
        isAdoptPaused: boolean;
      }) => useQuizshowDraft(quiz, { isAdoptPaused }),
      { initialProps: { quiz: saved, isAdoptPaused: false } },
    );
    const originalQuestion = hook.result.current.draft.rounds[0]?.questions[0];
    if (originalQuestion === undefined)
      throw new Error("fixture has no question");
    act(() => {
      hook.result.current.updateQuestion(0, 0, {
        ...originalQuestion.question,
        prompt: { en: "Stonewall was in 1970", pt: "Stonewall was in 1970" },
      });
    });
    // The save goes out, and the host reverts while it is in flight.
    hook.rerender({ quiz: saved, isAdoptPaused: true });
    act(() => {
      hook.result.current.updateQuestion(0, 0, originalQuestion.question);
    });
    expect(hook.result.current.isDirty).toBe(false);

    // The save's refetch lands first: the clean draft must not adopt it yet.
    const stored = storedQuiz(
      "Stonewall was in 1970",
      "2026-11-01T10:00:05.000Z",
    );
    hook.rerender({ quiz: stored, isAdoptPaused: true });
    expect(
      hook.result.current.draft.rounds[0]?.questions[0]?.question.prompt.en,
    ).toBe("Stonewall was in 1969");

    // Then the response rebases, and the pause lifts.
    act(() => {
      hook.result.current.rebaseTo?.(stored);
    });
    hook.rerender({ quiz: stored, isAdoptPaused: false });
    expect(
      hook.result.current.draft.rounds[0]?.questions[0]?.question.prompt.en,
    ).toBe("Stonewall was in 1969");
    expect(hook.result.current.isDirty).toBe(true);
    expect(hook.result.current.baselineStamp).toBe(stored.updatedAt);
  });

  it("the 18+ switch keeps a flip made in flight", () => {
    const savedResponse: QuizshowQuizResponse = {
      quiz: null,
      problems: [],
      isAdultsEvent: false,
      liveSession: null,
      hasResults: false,
    };
    const scope = gameScope("game-1");
    const draft = {
      title: "",
      languages: "en",
      screenLanguage: "en",
      rounds: [],
    } as const;
    const hook = renderHook(
      ({ data }: { data: QuizshowQuizResponse }) =>
        useQuizshowAdultsDraft({
          scope,
          data,
          draft: { ...draft, rounds: [] },
        }),
      { initialProps: { data: savedResponse } },
    );
    act(() => {
      hook.result.current.setIsAdultsOnly(true);
    });
    act(() => {
      hook.result.current.setIsAdultsOnly(false);
    });
    const storedResponse = { ...savedResponse, isAdultsEvent: true };
    act(() => {
      hook.result.current.rebaseTo(storedResponse);
    });
    hook.rerender({ data: storedResponse });

    expect(hook.result.current.isAdultsEvent).toBe(false);
    expect(hook.result.current.isUnsaved).toBe(true);
  });
});
