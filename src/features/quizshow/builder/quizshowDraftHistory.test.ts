import { describe, expect, it } from "vitest";
import { blankDraft, type QuizshowDraft } from "./quizshowDraft";
import {
  EMPTY_DRAFT_HISTORY,
  QUIZSHOW_DRAFT_COALESCE_MS,
  QUIZSHOW_DRAFT_HISTORY_LIMIT,
  recordDraftChange,
  redoDraft,
  undoDraft,
  type QuizshowDraftHistory,
} from "./quizshowDraftHistory";

function draftTitled(title: string): QuizshowDraft {
  return { ...blankDraft(), title };
}

/** Records `titles` in order as separate steps (no key, so none coalesce). */
function historyOf(titles: readonly string[]): QuizshowDraftHistory {
  return titles.reduce(
    (history, title, index) =>
      recordDraftChange(history, draftTitled(title), null, index * 10_000),
    EMPTY_DRAFT_HISTORY,
  );
}

describe("recordDraftChange", () => {
  it("joins changes with the same key inside the coalesce window into one step", () => {
    const first = recordDraftChange(
      EMPTY_DRAFT_HISTORY,
      draftTitled("before"),
      "setQuizField.title::",
      1_000,
    );
    const second = recordDraftChange(
      first,
      draftTitled("b"),
      "setQuizField.title::",
      1_000 + QUIZSHOW_DRAFT_COALESCE_MS,
    );

    expect(second.past.map((draft) => draft.title)).toEqual(["before"]);
  });

  it("starts a new step after the window, for another key, or for no key", () => {
    const first = recordDraftChange(
      EMPTY_DRAFT_HISTORY,
      draftTitled("one"),
      "updateQuestion:0:0",
      1_000,
    );
    const late = recordDraftChange(
      first,
      draftTitled("two"),
      "updateQuestion:0:0",
      1_000 + QUIZSHOW_DRAFT_COALESCE_MS + 1,
    );
    const otherKey = recordDraftChange(
      late,
      draftTitled("three"),
      "updateQuestion:0:1",
      1_000 + QUIZSHOW_DRAFT_COALESCE_MS + 2,
    );
    const noKey = recordDraftChange(
      otherKey,
      draftTitled("four"),
      null,
      1_000 + QUIZSHOW_DRAFT_COALESCE_MS + 3,
    );
    const afterNoKey = recordDraftChange(
      noKey,
      draftTitled("five"),
      null,
      1_000 + QUIZSHOW_DRAFT_COALESCE_MS + 4,
    );

    expect(afterNoKey.past.map((draft) => draft.title)).toEqual([
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
  });

  it("never keeps more than the limit, dropping the oldest steps", () => {
    const titles = Array.from(
      { length: QUIZSHOW_DRAFT_HISTORY_LIMIT + 7 },
      (_unused, index) => `step ${index}`,
    );

    const history = historyOf(titles);

    expect(history.past).toHaveLength(QUIZSHOW_DRAFT_HISTORY_LIMIT);
    expect(history.past[0]?.title).toBe("step 7");
    expect(history.past.at(-1)?.title).toBe(
      `step ${QUIZSHOW_DRAFT_HISTORY_LIMIT + 6}`,
    );
  });

  it("clears the redo stack on a new change", () => {
    const undone = undoDraft(historyOf(["one", "two"]), draftTitled("three"));
    if (undone === null) throw new Error("nothing to undo");
    expect(undone.history.future).toHaveLength(1);

    const changed = recordDraftChange(
      undone.history,
      undone.draft,
      null,
      99_000,
    );

    expect(changed.future).toEqual([]);
  });
});

describe("undoDraft and redoDraft", () => {
  it("steps back and forward through the drafts", () => {
    const history = historyOf(["one", "two"]);

    const back = undoDraft(history, draftTitled("three"));
    if (back === null) throw new Error("nothing to undo");
    expect(back.draft.title).toBe("two");

    const backAgain = undoDraft(back.history, back.draft);
    if (backAgain === null) throw new Error("nothing to undo");
    expect(backAgain.draft.title).toBe("one");
    expect(undoDraft(backAgain.history, backAgain.draft)).toBeNull();

    const forward = redoDraft(backAgain.history, backAgain.draft);
    if (forward === null) throw new Error("nothing to redo");
    expect(forward.draft.title).toBe("two");

    const forwardAgain = redoDraft(forward.history, forward.draft);
    if (forwardAgain === null) throw new Error("nothing to redo");
    expect(forwardAgain.draft.title).toBe("three");
    expect(redoDraft(forwardAgain.history, forwardAgain.draft)).toBeNull();
  });

  it("does not coalesce the first change after an undo into the step before it", () => {
    const typed = recordDraftChange(
      EMPTY_DRAFT_HISTORY,
      draftTitled("start"),
      "setQuizField.title::",
      1_000,
    );
    const undone = undoDraft(typed, draftTitled("typed"));
    if (undone === null) throw new Error("nothing to undo");

    const retyped = recordDraftChange(
      undone.history,
      undone.draft,
      "setQuizField.title::",
      1_100,
    );

    expect(retyped.past.map((draft) => draft.title)).toEqual(["start"]);
  });
});
