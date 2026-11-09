import { createElement, useRef, type ReactNode } from "react";
import type { QuizshowRoundKind } from "../../../shared/contracts/quizshow";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowSaveConflictDialog } from "../builder/QuizshowSaveConflictDialog";
import {
  isStructuralProblem,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";
import type {
  QuizshowSaveOutcome,
  useQuizshowSave,
} from "../builder/useQuizshowSave";
import { QuizshowScopeContext, type QuizshowScope } from "../quizshowScope";
import type { QuizshowStudioSave } from "./QuizshowStudioContext";
import { QuizshowStudioDarkStamp } from "./QuizshowStudioDarkStamp";
import { studioProblemCopyOf } from "./quizshowStudioProblemCopy";
import {
  STUDIO_SAVE_FAILED_KEY,
  STUDIO_SAVE_REFUSED_KEY,
  useStudioAutosave,
} from "./useStudioAutosave";

/** A blank title on a game or a template: the server refuses that save too. */
const TITLE_MISSING_PROBLEM: QuizshowLocalProblem = {
  code: "title_missing",
  roundIndex: null,
  questionIndex: null,
  language: null,
};

/** The studio's top-bar status, reason and Save action from the hook's state and the save's own. */
function shownStatusOf(input: {
  autosave: ReturnType<typeof useStudioAutosave>;
  saving: ReturnType<typeof useQuizshowSave>;
  structuralProblem: QuizshowLocalProblem | null;
  scope: QuizshowScope;
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>;
  isExplicit: boolean;
  isUnsaved: boolean;
}): Pick<QuizshowStudioSave, "status" | "reasonKey" | "reasonValues"> {
  const { autosave, saving, structuralProblem, scope, rounds } = input;
  if (saving.isSaving) {
    return { status: "saving", reasonKey: null, reasonValues: null };
  }
  if (saving.isConflictPending) {
    return { status: "conflict", reasonKey: null, reasonValues: null };
  }
  if (autosave.status === "failed") {
    return {
      status: "failed",
      reasonKey: saving.lastErrorKey ?? autosave.reasonKey,
      reasonValues: null,
    };
  }
  if (
    autosave.status === "held" &&
    autosave.reasonKey !== STUDIO_SAVE_REFUSED_KEY &&
    structuralProblem !== null
  ) {
    const copy = studioProblemCopyOf(structuralProblem, scope.kind, rounds);
    return { status: "held", reasonKey: copy.key, reasonValues: copy.values };
  }
  // An explicit save that failed keeps its reason until a save goes through.
  if (
    input.isExplicit &&
    input.isUnsaved &&
    autosave.status === "unsaved" &&
    saving.lastErrorKey !== null
  ) {
    return {
      status: "failed",
      reasonKey: saving.lastErrorKey,
      reasonValues: null,
    };
  }
  return {
    status: autosave.status,
    reasonKey: autosave.reasonKey,
    reasonValues: null,
  };
}

type Translate = ReturnType<typeof useTranslation>["t"];

/**
 * The copy naming why a save left the draft unstored; null once it is
 * stored. `errorKey` is the save's own reason (no access, a co-host playing,
 * offline), read from the save that just answered.
 */
function refusalCopyOf(
  outcome: QuizshowSaveOutcome,
  errorKey: string | null,
  t: Translate,
): string | null {
  switch (outcome) {
    case "saved":
      return null;
    case "conflict":
      return t("quizshow:studio.save.conflict");
    case "refused":
      return t(errorKey ?? STUDIO_SAVE_REFUSED_KEY);
    default:
      return t(errorKey ?? STUDIO_SAVE_FAILED_KEY);
  }
}

/** A structural problem's sentence, the way the save status words it. */
function problemSentenceOf(
  problem: QuizshowLocalProblem,
  scope: QuizshowScope,
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>,
  t: Translate,
): string {
  const copy = studioProblemCopyOf(problem, scope.kind, rounds);
  return t(copy.key, {
    ...copy.values,
    language: copy.languageTagKey ? t(copy.languageTagKey) : "",
  });
}

/**
 * Saving in the studio: rationed silent autosave on an event or a game, an
 * explicit Save on a template, the leave guard for the moment between an
 * edit and its save, and the conflict dialog.
 */
export function useStudioSave(input: {
  scope: QuizshowScope;
  /** The draft's rows, so a problem sentence numbers rounds and wheels the way the rail does. */
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>;
  saving: ReturnType<typeof useQuizshowSave>;
  problems: readonly QuizshowLocalProblem[];
  isUnsaved: boolean;
  isTitleBlank: boolean;
  /** Changes identity on every edit. */
  editKey: unknown;
}): {
  save: Omit<QuizshowStudioSave, "discard">;
  conflictDialog: ReactNode;
} {
  const { scope, rounds, saving, problems, isUnsaved, isTitleBlank, editKey } =
    input;
  const { t } = useTranslation();
  const isExplicit = scope.kind === "template";
  const structuralProblem =
    problems.find((problem) => isStructuralProblem(problem.code)) ??
    (isTitleBlank ? TITLE_MISSING_PROBLEM : null);
  const isSaveBlocked = structuralProblem !== null;
  // Why the last autosave left the draft unstored, as copy; saveFirst reads it.
  const lastRefusalRef = useRef<string | null>(null);

  const autosave = useStudioAutosave({
    isEnabled: !isExplicit,
    isDirty: isUnsaved,
    structuralProblem,
    saveNow: async (): Promise<QuizshowSaveOutcome> => {
      if (structuralProblem !== null) {
        lastRefusalRef.current = problemSentenceOf(
          structuralProblem,
          scope,
          rounds,
          t,
        );
        return "refused";
      }
      const outcome = await saving.saveWithOutcome({
        isSilent: true,
        shouldKeepNewerEdits: true,
      });
      lastRefusalRef.current = refusalCopyOf(
        outcome,
        saving.readLastErrorKey(),
        t,
      );
      return outcome;
    },
    isConflictResolved: !saving.isConflictPending,
    editKey,
    isSaveInFlight: saving.isSaving,
  });

  // An event or a game saves through the autosave queue, so leaving never
  // races an autosave; a template saves as the builder did.
  const saveAndLeaveOf = (): (() => Promise<boolean>) | undefined => {
    if (isSaveBlocked) return undefined;
    if (!isExplicit) return autosave.saveAndWait;
    return saving.isSaving ? undefined : saving.saveNow;
  };
  useUnsavedChangesGuard({
    active: isUnsaved,
    confirmMessage: t("quizshow:save.leaveConfirm"),
    onSaveAndLeave: saveAndLeaveOf(),
  });

  const saveNow = () => {
    if (saving.isConflictPending) {
      saving.reopenConflict();
      return;
    }
    if (!isExplicit) {
      autosave.flush();
      return;
    }
    if (saving.isSaving || isSaveBlocked || !isUnsaved) return;
    // Cmd+S makes "save and keep typing" the rhythm: edits typed while the
    // save is out stay in the draft, and the keys stay so the rail's rows stay put.
    void saving.saveWithOutcome({
      shouldKeepKeys: true,
      shouldKeepNewerEdits: true,
    });
  };

  // Duplicate game and Replace work from the saved quiz, so the autosave lands first.
  const saveFirst = async (): Promise<string | null> => {
    if (isExplicit) return isUnsaved ? t("quizshow:save.unsaved") : null;
    // A held draft would only record a refusal and restart the autosave's
    // gap, so the problem that holds it is the answer, with no save.
    if (structuralProblem !== null) {
      return problemSentenceOf(structuralProblem, scope, rounds, t);
    }
    lastRefusalRef.current = null;
    if (await autosave.saveAndWait()) return null;
    // No save ran: a conflict still waits for the host's pick.
    return lastRefusalRef.current ?? t("quizshow:studio.save.conflict");
  };

  const conflictDialog = createElement(
    QuizshowScopeContext.Provider,
    { value: scope },
    createElement(QuizshowSaveConflictDialog, {
      isOpen: saving.isConflictOpen,
      onLoadTheirs: () => void saving.loadTheirs(),
      onSaveMine: () => saving.saveMine({ shouldKeepKeys: true }),
      onClose: saving.closeConflict,
      // The dialog portals to the body; the stamp keeps it in the studio's dark.
      children: createElement(QuizshowStudioDarkStamp),
    }),
  );

  return {
    save: {
      ...shownStatusOf({
        autosave,
        saving,
        structuralProblem,
        scope,
        rounds,
        isExplicit,
        isUnsaved,
      }),
      saveNow,
      isExplicit,
      isSaving: saving.isSaving,
      isSaveBlocked,
      isUnsaved,
      reviewConflict: saving.reopenConflict,
      saveFirst,
    },
    conflictDialog,
  };
}
