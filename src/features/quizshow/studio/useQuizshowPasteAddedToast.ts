import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import { useQuizshowStudio } from "./QuizshowStudioContext";

const ADDED_TOAST_MS = 6000;

/** What "Add these questions" did, for the toast that offers Undo. */
export interface QuizshowPasteAdded {
  questionCount: number;
  /** The draft the import started from; null until the draft update has run. */
  draftBeforeOf: () => QuizshowDraft | null;
}

/**
 * The "Added N questions" toast with Undo. Mount it where it outlives the
 * dialog (the More menu) and pass `showAddedToast` as the dialog's
 * `onAdded`: a Cmd/Ctrl+Z or any later change takes the toast down, so its
 * Undo never acts on a draft that moved on.
 *
 * The toast shows once the draft update has run, after the render that
 * applies it: the update re-checks the limits when it runs, and one that
 * adds nothing (a save adopted since the last render left no room) raises
 * no toast.
 */
export function useQuizshowPasteAddedToast(): (
  added: QuizshowPasteAdded,
) => void {
  const { t } = useTranslation();
  const { showToast, dismissToast } = useToast();
  const { controller } = useQuizshowStudio();
  const [pendingAdded, setPendingAdded] = useState<QuizshowPasteAdded | null>(
    null,
  );
  const handledAddedRef = useRef<QuizshowPasteAdded | null>(null);
  const shownRef = useRef<{
    toastId: number;
    added: QuizshowPasteAdded;
  } | null>(null);
  const { undoIfLatest } = controller;
  const latestUndoTarget = controller.latestUndoTarget ?? null;
  useEffect(() => {
    const shown = shownRef.current;
    if (shown === null) return;
    const draftBefore = shown.added.draftBeforeOf();
    if (draftBefore !== null && latestUndoTarget !== draftBefore) {
      dismissToast(shown.toastId);
      shownRef.current = null;
    }
  }, [latestUndoTarget, dismissToast]);
  useEffect(() => {
    if (pendingAdded === null || handledAddedRef.current === pendingAdded) {
      return;
    }
    handledAddedRef.current = pendingAdded;
    // The update has run by now; null means it returned the draft unchanged.
    if (pendingAdded.draftBeforeOf() === null) return;
    if (shownRef.current !== null) dismissToast(shownRef.current.toastId);
    const toastId = showToast(
      t("quizshow:studio.paste.added", { count: pendingAdded.questionCount }),
      "success",
      ADDED_TOAST_MS,
      undoIfLatest === undefined
        ? undefined
        : {
            label: t("quizshow:studio.removed.undo"),
            onClick: () => {
              const draftBefore = pendingAdded.draftBeforeOf();
              if (draftBefore !== null) undoIfLatest(draftBefore);
            },
          },
    );
    shownRef.current = { toastId, added: pendingAdded };
  }, [pendingAdded, showToast, dismissToast, undoIfLatest, t]);
  return setPendingAdded;
}
