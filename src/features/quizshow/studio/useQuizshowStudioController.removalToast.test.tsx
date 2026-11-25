import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import type { QuizshowDraftController } from "../builder/useQuizshowDraft";
import type { QuizshowStudioActions } from "./QuizshowStudioContext";
import { useStudioHistoryActions } from "./useQuizshowStudioController";

const showToast = vi.fn();
const dismissToast = vi.fn();

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast, dismissToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

const draftBefore = {
  rounds: [{ kind: "multiple_choice", questions: [{}] }],
} as unknown as QuizshowDraft;
const laterDraft = { rounds: [] } as unknown as QuizshowDraft;

function controllerWith(latestUndoTarget: QuizshowDraft | null) {
  return {
    draft: draftBefore,
    undoIfLatest: vi.fn(),
    latestUndoTarget,
  } as unknown as QuizshowDraftController;
}

const actions = {
  removeQuestion: vi.fn(),
  removeRound: vi.fn(),
} as unknown as QuizshowStudioActions;

describe("the removal toast", () => {
  beforeEach(() => {
    showToast.mockReset().mockReturnValue(11);
    dismissToast.mockReset();
  });

  it("stays while its removal is the latest change", () => {
    const { result, rerender } = renderHook(
      ({ controller }) => useStudioHistoryActions(controller, actions, vi.fn()),
      { initialProps: { controller: controllerWith(null) } },
    );
    result.current.actions.removeQuestion(0, 0);
    expect(showToast).toHaveBeenCalledTimes(1);
    // The removal's render: the history now ends at the draft the removal started from.
    rerender({ controller: controllerWith(draftBefore) });
    expect(dismissToast).not.toHaveBeenCalled();
  });

  it("goes once another change lands after the removal", () => {
    const { result, rerender } = renderHook(
      ({ controller }) => useStudioHistoryActions(controller, actions, vi.fn()),
      { initialProps: { controller: controllerWith(null) } },
    );
    result.current.actions.removeQuestion(0, 0);
    rerender({ controller: controllerWith(draftBefore) });
    rerender({ controller: controllerWith(laterDraft) });
    expect(dismissToast).toHaveBeenCalledWith(11);
  });

  it("goes once, and stays gone on later renders", () => {
    const { result, rerender } = renderHook(
      ({ controller }) => useStudioHistoryActions(controller, actions, vi.fn()),
      { initialProps: { controller: controllerWith(null) } },
    );
    result.current.actions.removeRound(0);
    rerender({ controller: controllerWith(draftBefore) });
    rerender({ controller: controllerWith(laterDraft) });
    rerender({ controller: controllerWith(laterDraft) });
    expect(dismissToast).toHaveBeenCalledTimes(1);
  });
});
