import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
} from "../../../shared/contracts/quizshow";
import { defaultRoundSettings, newQuestion } from "./quizshowDraft";
import { useQuizshowDraft } from "./useQuizshowDraft";

function storedQuestion(id: string, promptText: string): QuizshowQuestion {
  return {
    ...newQuestion("true_false", "quiz"),
    id,
    mediaUrl: null,
    prompt: { en: promptText, pt: promptText },
    answer: { isTrue: true },
  };
}

function storedRound(id: string, titleText: string): QuizshowRound {
  return {
    id,
    kind: "quiz",
    title: { en: titleText, pt: titleText },
    contentLabel: "none",
    settings: defaultRoundSettings(),
    questions: [storedQuestion(`${id}-question`, "Is it?")],
  };
}

function storedQuiz(title: string, updatedAt: string): QuizshowQuiz {
  return {
    title,
    languages: "both",
    screenLanguage: "en",
    starterPackKey: null,
    updatedAt,
    rounds: [storedRound("round-1", "First"), storedRound("round-2", "Second")],
  };
}

describe("useQuizshowDraft", () => {
  it("follows a newer server quiz while clean", () => {
    const { result, rerender } = renderHook(
      ({ quiz }) => useQuizshowDraft(quiz),
      {
        initialProps: {
          quiz: storedQuiz("Night", "2026-10-19T10:00:00.000Z"),
        },
      },
    );
    expect(result.current.draft.title).toBe("Night");
    expect(result.current.isDirty).toBe(false);

    rerender({ quiz: storedQuiz("Night, edited", "2026-10-19T11:00:00.000Z") });

    expect(result.current.draft.title).toBe("Night, edited");
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps local edits when a newer quiz arrives while dirty", () => {
    const { result, rerender } = renderHook(
      ({ quiz }) => useQuizshowDraft(quiz),
      {
        initialProps: {
          quiz: storedQuiz("Night", "2026-10-19T10:00:00.000Z"),
        },
      },
    );
    act(() => result.current.setQuizField("title", "My own title"));
    expect(result.current.isDirty).toBe(true);

    rerender({ quiz: storedQuiz("Their title", "2026-10-19T11:00:00.000Z") });

    expect(result.current.draft.title).toBe("My own title");
    expect(result.current.isDirty).toBe(true);
  });

  it("sees a move as a change and a move back as clean", () => {
    const { result } = renderHook(() =>
      useQuizshowDraft(storedQuiz("Night", "2026-10-19T10:00:00.000Z")),
    );
    expect(result.current.isDirty).toBe(false);

    act(() => result.current.moveRound(0, 1));
    expect(result.current.isDirty).toBe(true);
    expect(result.current.draft.rounds[0]?.title.en).toBe("Second");

    act(() => result.current.moveRound(1, 0));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draft.rounds[0]?.title.en).toBe("First");
  });
});

describe("useQuizshowDraft picked previews", () => {
  const stamp = "2026-10-19T10:00:00.000Z";
  const laterStamp = "2026-10-19T11:00:00.000Z";

  function renderDraft() {
    const view = renderHook(() => useQuizshowDraft(storedQuiz("Night", stamp)));
    const questionAt = (questionIndex: number) => {
      const draftQuestion =
        view.result.current.draft.rounds[0]?.questions[questionIndex];
      if (!draftQuestion) throw new Error("question missing");
      return draftQuestion.question;
    };
    const setPicture = (questionIndex: number, mediaRef: string | null) =>
      act(() =>
        view.result.current.updateQuestion(0, questionIndex, {
          ...questionAt(questionIndex),
          mediaRef,
        }),
      );
    setPicture(0, "picked-key");
    act(() =>
      view.result.current.rememberPickedPreview(
        "picked-key",
        "blob:draft-copy",
      ),
    );
    return { ...view, setPicture };
  }

  it("keeps a picked preview while a duplicate holds its key and revokes it once none does", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { result, setPicture } = renderDraft();
    expect(result.current.pickedPreviewUrls.get("picked-key")).toBe(
      "blob:draft-copy",
    );

    act(() => result.current.duplicateQuestion(0, 0));
    setPicture(0, null);
    expect(result.current.pickedPreviewUrls.get("picked-key")).toBe(
      "blob:draft-copy",
    );
    expect(revokeSpy).not.toHaveBeenCalledWith("blob:draft-copy");

    act(() => result.current.removeQuestion(0, 1));
    expect(result.current.pickedPreviewUrls.has("picked-key")).toBe(false);
    expect(revokeSpy).toHaveBeenCalledWith("blob:draft-copy");
    revokeSpy.mockRestore();
  });

  it("revokes a picked preview once a reset leaves its key out", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { result } = renderDraft();

    act(() => result.current.resetTo(storedQuiz("Night", laterStamp)));

    expect(result.current.pickedPreviewUrls.size).toBe(0);
    expect(revokeSpy).toHaveBeenCalledWith("blob:draft-copy");
    revokeSpy.mockRestore();
  });

  it("keeps a picked preview the saved quiz still holds after a save", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { result } = renderDraft();
    const savedQuiz = storedQuiz("Night", laterStamp);
    const savedQuestion = savedQuiz.rounds[0]?.questions[0];
    if (savedQuestion) savedQuestion.mediaRef = "picked-key";

    act(() => result.current.resetTo(savedQuiz));

    expect(result.current.pickedPreviewUrls.get("picked-key")).toBe(
      "blob:draft-copy",
    );
    expect(revokeSpy).not.toHaveBeenCalledWith("blob:draft-copy");
    revokeSpy.mockRestore();
  });

  it("revokes a copy at once when it arrives after every question dropped its key", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { result, setPicture } = renderDraft();
    setPicture(0, "later-key");
    setPicture(0, null);

    act(() =>
      result.current.rememberPickedPreview("later-key", "blob:late-copy"),
    );

    expect(result.current.pickedPreviewUrls.has("later-key")).toBe(false);
    expect(revokeSpy).toHaveBeenCalledWith("blob:late-copy");
    revokeSpy.mockRestore();
  });

  it("revokes every picked preview when the builder unmounts", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { unmount } = renderDraft();

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith("blob:draft-copy");
    revokeSpy.mockRestore();
  });
});
