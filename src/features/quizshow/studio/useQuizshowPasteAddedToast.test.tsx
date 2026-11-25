import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import {
  useQuizshowPasteAddedToast,
  type QuizshowPasteAdded,
} from "./useQuizshowPasteAddedToast";

const showToast = vi.fn();
const dismissToast = vi.fn();
const undoIfLatest = vi.fn();
const draftBefore = { title: "before" } as unknown as QuizshowDraft;

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast, dismissToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});
vi.mock("./QuizshowStudioContext", () => ({
  useQuizshowStudio: () => ({
    controller: { undoIfLatest, latestUndoTarget: draftBefore },
  }),
}));

/** An add whose draft update has run (`ranDraft`) or returned the draft unchanged. */
function addedOf(hasChangedDraft: boolean): QuizshowPasteAdded {
  return {
    questionCount: 3,
    draftBeforeOf: () => (hasChangedDraft ? draftBefore : null),
  };
}

describe("useQuizshowPasteAddedToast", () => {
  beforeEach(() => {
    showToast.mockReset().mockReturnValue(7);
    dismissToast.mockReset();
    undoIfLatest.mockReset();
  });

  it("raises no toast when the update returned the draft unchanged", () => {
    const { result, rerender } = renderHook(() => useQuizshowPasteAddedToast());
    act(() => result.current(addedOf(false)));
    rerender();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("raises one toast per add, whatever re-renders follow", () => {
    const { result, rerender } = renderHook(() => useQuizshowPasteAddedToast());
    act(() => result.current(addedOf(true)));
    rerender();
    rerender();
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]?.[0]).toBe("quizshow:studio.paste.added");
    act(() => result.current(addedOf(true)));
    expect(showToast).toHaveBeenCalledTimes(2);
    expect(dismissToast).toHaveBeenCalledWith(7);
  });

  it("offers an Undo that takes back the add", () => {
    const { result } = renderHook(() => useQuizshowPasteAddedToast());
    act(() => result.current(addedOf(true)));
    const action = showToast.mock.calls[0]?.[3] as { onClick: () => void };
    action.onClick();
    expect(undoIfLatest).toHaveBeenCalledWith(draftBefore);
  });
});
