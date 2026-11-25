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
    sourceTemplateId: null,
    sourceTemplate: null,
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

describe("useQuizshowDraft wheel rows", () => {
  function renderWithWheel() {
    const rendered = renderHook(() =>
      useQuizshowDraft(storedQuiz("Night", "2026-10-19T10:00:00.000Z")),
    );
    act(() => rendered.result.current.addWheel());
    const wheelRowIndex = rendered.result.current.draft.rounds.length - 1;
    return { result: rendered.result, wheelRowIndex };
  }

  it("adds a wheel row with addWheel", () => {
    const { result, wheelRowIndex } = renderWithWheel();
    expect(result.current.draft.rounds[wheelRowIndex]?.kind).toBe("wheel");
    expect(result.current.isDirty).toBe(true);
  });

  it("leaves a wheel row with no questions when a question is added", () => {
    const { result, wheelRowIndex } = renderWithWheel();
    act(() => result.current.addQuestion(wheelRowIndex));
    expect(result.current.draft.rounds[wheelRowIndex]?.questions).toHaveLength(
      0,
    );
  });

  it("keeps a wheel row's kind when asked to change it", () => {
    const { result, wheelRowIndex } = renderWithWheel();
    act(() => result.current.changeRoundKind(wheelRowIndex, "quiz"));
    expect(result.current.draft.rounds[wheelRowIndex]?.kind).toBe("wheel");
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

  it("keeps a picked preview while a duplicate or the undo history holds its key and revokes it once none does", () => {
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

    // The removal can be undone, so the history still holds the key.
    act(() => result.current.removeQuestion(0, 1));
    expect(result.current.pickedPreviewUrls.get("picked-key")).toBe(
      "blob:draft-copy",
    );
    expect(revokeSpy).not.toHaveBeenCalledWith("blob:draft-copy");

    // A reset clears the history, and nothing holds the key any more.
    act(() => result.current.resetTo(storedQuiz("Night", stamp)));
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
    // A frozen clock: every setPicture lands in one coalesced undo step, so no
    // draft in the history holds "later-key" however slow the run is.
    const clockSpy = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { result, setPicture } = renderDraft();
      setPicture(0, "later-key");
      setPicture(0, null);

      act(() =>
        result.current.rememberPickedPreview("later-key", "blob:late-copy"),
      );

      expect(result.current.pickedPreviewUrls.has("later-key")).toBe(false);
      expect(revokeSpy).toHaveBeenCalledWith("blob:late-copy");
    } finally {
      clockSpy.mockRestore();
      revokeSpy.mockRestore();
    }
  });

  it("revokes every picked preview when the builder unmounts", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const { unmount } = renderDraft();

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith("blob:draft-copy");
    revokeSpy.mockRestore();
  });
});

describe("useQuizshowDraft undo and redo", () => {
  const stamp = "2026-10-19T10:00:00.000Z";

  function renderDraft() {
    return renderHook(() => useQuizshowDraft(storedQuiz("Night", stamp)));
  }

  /** Pins Date.now, so the coalesce window is under the test's control. */
  function pinClock(startsAt: number) {
    let now = startsAt;
    const spy = vi.spyOn(Date, "now").mockImplementation(() => now);
    return {
      advance: (milliseconds: number) => {
        now += milliseconds;
      },
      restore: () => spy.mockRestore(),
    };
  }

  it("undoes typing in one field as one step and redoes it", () => {
    const clock = pinClock(1_000);
    const { result } = renderDraft();
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.setQuizField("title", "N"));
    clock.advance(300);
    act(() => result.current.setQuizField("title", "Ni"));
    clock.advance(300);
    act(() => result.current.setQuizField("title", "Nig"));
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo?.());
    expect(result.current.draft.title).toBe("Night");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo?.());
    expect(result.current.draft.title).toBe("Nig");
    expect(result.current.canRedo).toBe(false);
    clock.restore();
  });

  it("keeps a pause past the coalesce window and another field as steps of their own", () => {
    const clock = pinClock(1_000);
    const { result } = renderDraft();

    act(() => result.current.setQuizField("title", "One"));
    clock.advance(900);
    act(() => result.current.setQuizField("title", "Two"));
    act(() => result.current.setQuizField("languages", "en"));

    act(() => result.current.undo?.());
    expect(result.current.draft.languages).toBe("both");
    expect(result.current.draft.title).toBe("Two");
    act(() => result.current.undo?.());
    expect(result.current.draft.title).toBe("One");
    act(() => result.current.undo?.());
    expect(result.current.draft.title).toBe("Night");
    clock.restore();
  });

  it("clears what is left to redo on a new change", () => {
    const { result } = renderDraft();
    act(() => result.current.removeRound(1));
    act(() => result.current.undo?.());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.addWheel());

    expect(result.current.canRedo).toBe(false);
  });

  it("clears the history on a reset and keeps it on a rebase or a key-keeping reset", () => {
    const { result } = renderDraft();
    act(() => result.current.removeRound(1));
    act(() => result.current.rebaseTo?.(storedQuiz("Night", stamp)));
    expect(result.current.canUndo).toBe(true);
    act(() =>
      result.current.resetTo(storedQuiz("Night", stamp), {
        shouldKeepKeys: true,
      }),
    );
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.resetTo(storedQuiz("Night", stamp)));

    expect(result.current.canUndo).toBe(false);
  });

  it("moves a question to the end of another round and undoes the move", () => {
    const { result } = renderDraft();
    const movedKey = result.current.draft.rounds[0]?.questions[0]?.draftKey;

    act(() => result.current.moveQuestionToRound?.(0, 0, 1));

    expect(result.current.draft.rounds[0]?.questions).toHaveLength(0);
    expect(result.current.draft.rounds[1]?.questions).toHaveLength(2);
    expect(result.current.draft.rounds[1]?.questions[1]?.draftKey).toBe(
      movedKey,
    );

    act(() => result.current.undo?.());

    expect(result.current.draft.rounds[0]?.questions[0]?.draftKey).toBe(
      movedKey,
    );
    expect(result.current.draft.rounds[1]?.questions).toHaveLength(1);
  });

  it("clears the warm-up on the row a move takes off the top", () => {
    const { result } = renderDraft();
    const firstSettings = result.current.draft.rounds[0]?.settings;
    if (!firstSettings) throw new Error("round missing");
    act(() =>
      result.current.updateRound(0, {
        settings: { ...firstSettings, isWarmUp: true },
      }),
    );

    act(() => result.current.moveRound(0, 1));

    expect(result.current.draft.rounds[1]?.title.en).toBe("First");
    expect(result.current.draft.rounds[1]?.settings.isWarmUp).toBe(false);
  });
});

describe("useQuizshowDraft history guards", () => {
  const stamp = "2026-10-19T10:00:00.000Z";

  function renderDraft() {
    return renderHook(() => useQuizshowDraft(storedQuiz("Night", stamp)));
  }

  it("records no step and keeps the redo for an edit that changes nothing", () => {
    const { result } = renderDraft();
    act(() => result.current.setQuizField("title", "Night"));
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.removeRound(1));
    act(() => result.current.undo?.());
    act(() => result.current.setQuizField("title", "Night"));

    expect(result.current.canRedo).toBe(true);
  });

  it("undoes a removal through undoIfLatest while it is the latest change", () => {
    const { result } = renderDraft();
    const draftBefore = result.current.draft;
    act(() => result.current.removeRound(1));

    const onUndone = vi.fn();
    act(() => result.current.undoIfLatest?.(draftBefore, onUndone));

    expect(onUndone).toHaveBeenCalledTimes(1);
    expect(result.current.draft.rounds).toHaveLength(2);
  });

  it("leaves a later change alone when undoIfLatest no longer matches", () => {
    const { result } = renderDraft();
    const draftBefore = result.current.draft;
    act(() => result.current.removeRound(1));
    act(() => result.current.setQuizField("title", "Later edit"));

    const onUndone = vi.fn();
    act(() => result.current.undoIfLatest?.(draftBefore, onUndone));

    expect(onUndone).not.toHaveBeenCalled();
    expect(result.current.draft.title).toBe("Later edit");
    expect(result.current.draft.rounds).toHaveLength(1);
  });

  it("adds a question mid-round as one undo step", () => {
    const { result } = renderDraft();
    const firstKey = result.current.draft.rounds[1]?.questions[0]?.draftKey;

    act(() => result.current.addQuestionAt?.(1, 0));

    const questions = result.current.draft.rounds[1]?.questions ?? [];
    expect(questions).toHaveLength(2);
    expect(questions[1]?.draftKey).toBe(firstKey);
    expect(questions[0]?.draftKey).not.toBe(firstKey);

    act(() => result.current.undo?.());

    expect(result.current.draft.rounds[1]?.questions).toHaveLength(1);
    expect(result.current.canUndo).toBe(false);
  });
});
