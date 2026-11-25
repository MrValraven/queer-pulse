import { createElement, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowImportInput,
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowQuizChangedDetailsOf,
} from "../api/quizshowErrors";
import { quizshowKeys } from "../api/quizshowKeys";
import { useImportQuizshowQuiz } from "../api/useQuizshowMutations";
import type { QuizshowSessionScope } from "../quizshowScope";

type Translate = ReturnType<typeof useTranslation>["t"];

interface QuizshowImportApi {
  /** Confirms first when a quiz exists, then imports. */
  requestImport: (input: QuizshowImportInput) => void;
  /**
   * Item 23 (C6.28): adds the chosen source rows after the quiz's own rows,
   * with no confirm, since nothing is replaced. Sends `mode: "append"`, the
   * row indexes and the quiz's `updatedAt` as `expectedUpdatedAt`. Resolves
   * true once the rounds are added, false on a refusal or a held save, so a
   * picker stays open (its submit held while `isPending`) until it settles.
   */
  requestAppend: (
    input: QuizshowImportInput,
    roundIndexes: number[],
  ) => Promise<boolean>;
  confirmDialog: ReactNode;
  isPending: boolean;
}

/** The body of an append: the source, the chosen rows and the stamp the server checks. */
export function appendInputOf(
  input: QuizshowImportInput,
  roundIndexes: readonly number[],
  expectedUpdatedAt: string | null,
): QuizshowImportInput {
  return {
    ...input,
    mode: "append",
    roundIndexes: [...roundIndexes],
    expectedUpdatedAt,
  };
}

/**
 * An append's 409 (C6.28, item 54), said once the newer quiz is loaded: who
 * saved it and when when the server names them, else the plain sentence. A
 * game has one owner, so the name would be the viewer's.
 */
function appendConflictCopyOf(
  error: unknown,
  scope: QuizshowSessionScope,
  t: Translate,
  formatTime: (value: Date) => string,
): string {
  const details = quizshowQuizChangedDetailsOf(error);
  const name = details?.updatedByName?.trim() ?? "";
  const updatedAt = details?.updatedAt ?? null;
  if (scope.kind === "game" || name === "" || updatedAt === null) {
    return t("quizshow:importSources.appendConflict");
  }
  return t("quizshow:importSources.appendConflictBy", {
    name,
    time: formatTime(new Date(updatedAt)),
  });
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
  scope: QuizshowSessionScope,
  options: {
    hasQuiz: boolean;
    /** Called with the server response after a successful import. */
    onImported?: (response: QuizshowQuizResponse) => void;
    /** Additive. Rendered inside the replace confirm (the studio stamps it dark). */
    confirmChildren?: ReactNode;
    /**
     * Additive. Awaited before the import goes out: the studio lands its
     * autosave, so the import never races our own save into a conflict. A
     * replace ignores its result, since it replaces the quiz either way; an
     * append keeps the quiz, so a string result (the sentence naming why the
     * save is held) shows as the error and stops the append.
     */
    beforeImport?: () => Promise<unknown>;
    /**
     * Additive. The `expectedUpdatedAt` an append sends, read after
     * `beforeImport` lands. Left out, the cached quiz's `updatedAt` is read.
     */
    readExpectedUpdatedAt?: () => string | null;
  },
): QuizshowImportApi {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const importMutation = useImportQuizshowQuiz(scope);
  const [pendingInput, setPendingInput] = useState<QuizshowImportInput | null>(
    null,
  );
  // True while `beforeImport` runs; it counts as pending, so a second pick never imports twice.
  const [isPreparing, setIsPreparing] = useState(false);
  const isPending = isPreparing || importMutation.isPending;

  // mutateAsync awaits here because the empty state unmounts the moment the
  // quiz lands in the cache, and per-call callbacks of an unmounted caller
  // never run, so the toast would be lost.
  async function runImport(input: QuizshowImportInput): Promise<void> {
    if (options.beforeImport) {
      setIsPreparing(true);
      try {
        await options.beforeImport();
      } finally {
        setIsPreparing(false);
      }
    }
    try {
      const response = await importMutation.mutateAsync(input);
      options.onImported?.(response);
      showToast(t("quizshow:import.done"), "success");
    } catch (error) {
      showImportFailure(error);
    }
  }

  // Each refusal names its own reason: the four append limits and a missing
  // row read their codes' copy through `quizshowErrorKeyOf`.
  function showImportFailure(error: unknown): void {
    const errorCode = quizshowErrorCodeOf(error);
    if (errorCode === "quizshow_template_not_found") {
      // Unpublished or deleted since the picker loaded, so its card leaves the picker.
      void queryClient.invalidateQueries({
        queryKey: quizshowKeys.templateCards(demoMode),
      });
    }
    showToast(t(quizshowErrorKeyOf(errorCode)), "error");
  }

  // The conflict path: the quiz is read again and a clean draft follows the
  // newer version on its own, so the toast can say it is loaded and the next
  // append sends the new stamp.
  async function showAppendConflict(error: unknown): Promise<void> {
    await queryClient.invalidateQueries({
      queryKey: quizshowKeys.quizFor(scope, demoMode),
    });
    showToast(
      appendConflictCopyOf(error, scope, t, (value) => format.time(value)),
      "error",
    );
  }

  async function runAppend(
    input: QuizshowImportInput,
    roundIndexes: number[],
  ): Promise<boolean> {
    if (options.beforeImport) {
      setIsPreparing(true);
      let refusal: unknown;
      try {
        refusal = await options.beforeImport();
      } catch (error) {
        // The save before the append failed outright: its code's copy when it
        // has one, else the sentence that says the save failed.
        const errorCode = quizshowErrorCodeOf(error);
        showToast(
          t(
            errorCode === null
              ? "quizshow:importSources.saveFailed"
              : quizshowErrorKeyOf(errorCode),
          ),
          "error",
        );
        return false;
      } finally {
        setIsPreparing(false);
      }
      // An append keeps the quiz, so edits the save could not store would be
      // lost under the merged quiz: the sentence naming why stops it here.
      if (typeof refusal === "string") {
        showToast(refusal, "error");
        return false;
      }
    }
    // Read after the save above lands: the stamp of the quiz the draft now stands on.
    const expectedUpdatedAt = options.readExpectedUpdatedAt
      ? options.readExpectedUpdatedAt()
      : (queryClient.getQueryData<QuizshowQuizResponse>(
          quizshowKeys.quizFor(scope, demoMode),
        )?.quiz?.updatedAt ?? null);
    try {
      const response = await importMutation.mutateAsync(
        appendInputOf(input, roundIndexes, expectedUpdatedAt),
      );
      options.onImported?.(response);
      showToast(t("quizshow:importSources.roundsAdded"), "success");
      return true;
    } catch (error) {
      if (quizshowErrorCodeOf(error) === "quizshow_quiz_changed") {
        // The submit stays held while the newer quiz loads.
        setIsPreparing(true);
        try {
          await showAppendConflict(error);
        } finally {
          setIsPreparing(false);
        }
      } else {
        showImportFailure(error);
      }
      return false;
    }
  }

  async function requestAppend(
    input: QuizshowImportInput,
    roundIndexes: number[],
  ): Promise<boolean> {
    if (isPending) return false;
    return runAppend(input, roundIndexes);
  }

  function requestImport(input: QuizshowImportInput): void {
    if (isPending) return;
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
          children: options.confirmChildren,
        })
      : null,
  );

  return {
    requestImport,
    requestAppend,
    confirmDialog,
    isPending,
  };
}
