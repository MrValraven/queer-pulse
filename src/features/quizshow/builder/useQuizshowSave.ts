import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import type {
  QuizshowQuizProblem,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ApiError } from "../../../shared/api/client";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowProblemsOf,
} from "../api/quizshowErrors";
import {
  useSaveQuizshowQuiz,
  type QuizshowSaveInput,
} from "../api/useQuizshowMutations";
import type { QuizshowScope } from "../quizshowScope";
import { draftToInput } from "./quizshowDraft";
import { quizshowProblemsFromServer } from "./quizshowValidation";
import type { QuizshowDraftController } from "./useQuizshowDraft";

export function conflictUpdatedAtOf(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  const { updatedAt } = data as { updatedAt?: unknown };
  return typeof updatedAt === "string" ? updatedAt : null;
}

/**
 * Saves the draft for an event or a game. `isAdultsOnly` is the game's 18+
 * switch, and null on an event, whose body goes out exactly as before.
 * `onReset` hears every response the draft is reset to (a save, or their
 * version), so the 18+ draft can follow it.
 */
export function useQuizshowSave(options: {
  scope: QuizshowScope;
  data: QuizshowQuizResponse;
  controller: QuizshowDraftController;
  refetch: () => Promise<QuizshowQuizResponse | null>;
  isAdultsOnly: boolean | null;
  onReset?: (response: QuizshowQuizResponse | null) => void;
}) {
  const { scope, data, controller, refetch, isAdultsOnly, onReset } = options;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const saveQuiz = useSaveQuizshowQuiz(scope);
  const [conflictUpdatedAt, setConflictUpdatedAt] = useState<string | null>(
    null,
  );
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  // The server's refusal belongs to the draft it answered; any edit makes a
  // new draft object, which retires the list without an effect.
  const [rejected, setRejected] = useState<{
    draft: QuizshowDraftController["draft"];
    problems: QuizshowQuizProblem[];
  } | null>(null);

  function saveBodyOf(
    sentDraft: QuizshowDraftController["draft"],
    expectedUpdatedAt: string | null,
  ): QuizshowSaveInput {
    const quizInput = draftToInput(sentDraft, expectedUpdatedAt);
    return isAdultsOnly === null ? quizInput : { ...quizInput, isAdultsOnly };
  }

  async function save(expectedUpdatedAt: string | null): Promise<boolean> {
    const sentDraft = controller.draft;
    try {
      const response = await saveQuiz.mutateAsync(
        saveBodyOf(sentDraft, expectedUpdatedAt),
      );
      showToast(t("quizshow:save.saved"), "success");
      controller.resetTo(response.quiz);
      onReset?.(response);
      setRejected(null);
      return true;
    } catch (error) {
      const code = quizshowErrorCodeOf(error);
      if (code === "quizshow_quiz_changed") {
        setConflictUpdatedAt(conflictUpdatedAtOf(error));
        setIsConflictOpen(true);
      } else if (code === "quizshow_quiz_invalid") {
        setRejected({ draft: sentDraft, problems: quizshowProblemsOf(error) });
        showToast(t("quizshow:save.invalid"), "error");
      } else {
        showToast(t(quizshowErrorKeyOf(code)), "error");
      }
      return false;
    }
  }

  const rejectedProblems =
    rejected && rejected.draft === controller.draft
      ? quizshowProblemsFromServer(rejected.problems)
      : [];

  return {
    isSaving: saveQuiz.isPending,
    isConflictOpen,
    rejectedProblems,
    saveNow: () => save(data.quiz?.updatedAt ?? null),
    saveMine: () => {
      setIsConflictOpen(false);
      void save(conflictUpdatedAt);
    },
    loadTheirs: async () => {
      setIsConflictOpen(false);
      const fresh = await refetch();
      controller.resetTo(fresh?.quiz ?? null);
      onReset?.(fresh);
      setRejected(null);
    },
    closeConflict: () => setIsConflictOpen(false),
  };
}
