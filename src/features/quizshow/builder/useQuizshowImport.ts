import { createElement, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowImportInput,
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useImportQuizshowQuiz } from "../api/useQuizshowMutations";
import type { QuizshowScope } from "../quizshowScope";

interface QuizshowImportApi {
  /** Confirms first when a quiz exists, then imports. */
  requestImport: (input: QuizshowImportInput) => void;
  confirmDialog: ReactNode;
  isPending: boolean;
}

/** The import body for a listed source, or null when its id field is missing. */
export function importInputOf(
  source: QuizshowImportSource,
): QuizshowImportInput | null {
  if (source.kind === "game") {
    return source.gameId === null
      ? null
      : { from: "game", gameId: source.gameId };
  }
  return source.eventSlug === null
    ? null
    : { from: "event", eventSlug: source.eventSlug };
}

export function useQuizshowImport(
  scope: QuizshowScope,
  options: {
    hasQuiz: boolean;
    /** Called with the server response after a successful import. */
    onImported?: (response: QuizshowQuizResponse) => void;
  },
): QuizshowImportApi {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const importMutation = useImportQuizshowQuiz(scope);
  const [pendingInput, setPendingInput] = useState<QuizshowImportInput | null>(
    null,
  );

  // mutateAsync awaits here because the empty state unmounts the moment the
  // quiz lands in the cache, and per-call callbacks of an unmounted caller
  // never run, so the toast would be lost.
  async function runImport(input: QuizshowImportInput): Promise<void> {
    try {
      const response = await importMutation.mutateAsync(input);
      options.onImported?.(response);
      showToast(t("quizshow:import.done"), "success");
    } catch (error) {
      const errorKey = quizshowErrorKeyOf(quizshowErrorCodeOf(error));
      showToast(t(errorKey), "error");
    }
  }

  function requestImport(input: QuizshowImportInput): void {
    if (importMutation.isPending) return;
    if (options.hasQuiz) {
      setPendingInput(input);
      return;
    }
    void runImport(input);
  }

  function confirmImport(): void {
    const input = pendingInput;
    setPendingInput(null);
    if (input) void runImport(input);
  }

  const confirmDialog = createElement(
    AnimatePresence,
    null,
    pendingInput
      ? createElement(ConfirmDialog, {
          key: "quizshow-import-confirm",
          open: true,
          tone: "destructive",
          title: t("quizshow:import.confirmTitle"),
          description: t("quizshow:import.confirmBody"),
          confirmLabel: t("quizshow:import.confirmCta"),
          cancelLabel: t("quizshow:common.cancel"),
          onClose: () => setPendingInput(null),
          onConfirm: confirmImport,
        })
      : null,
  );

  return {
    requestImport,
    confirmDialog,
    isPending: importMutation.isPending,
  };
}
