import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  QuizshowLanguage,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import { useQuizshowAdultsDraft } from "../builder/useQuizshowAdultsDraft";
import { useQuizshowBuilderProblems } from "../builder/useQuizshowBuilderProblems";
import {
  changeQuestionType,
  type QuizshowDraft,
} from "../builder/quizshowDraft";
import {
  useQuizshowDraft,
  type QuizshowDraftController,
} from "../builder/useQuizshowDraft";
import { useQuizshowSave } from "../builder/useQuizshowSave";
import { STUDIO_FOCUS_PARAMS } from "../quizshowPaths";
import { isQuizshowSessionScope, type QuizshowScope } from "../quizshowScope";
import { isWheelRoundKind } from "../quizshowWheel";
import { primaryLanguageOf } from "../stage/quizshowText";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateMetaOf } from "../templates/quizshowTemplateResponse";
import { useQuizshowTemplateDraft } from "../templates/useQuizshowTemplateDraft";
import type {
  QuizshowStudioActions,
  QuizshowStudioContextValue,
} from "./QuizshowStudioContext";
import { questionMoveTargetsOf } from "./quizshowStudioRailMenus";
import {
  problemsForSelection,
  QUIZ_SELECTION,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";
import { useIsStudioWide } from "./useIsStudioWide";
import { useStudioSave } from "./useStudioSave";
import { useStudioSelectionModel } from "./useStudioSelectionModel";
import { useStudioHistoryShortcuts } from "./useStudioShortcuts";

export interface QuizshowStudioControllerOptions {
  /** The event's start, for the import's series shortcut; null on a game or a template. */
  eventStartAt?: Date | null;
  /** Opens this import picker on mount, once (`?start=copy` from My games). */
  initialImportPicker?: QuizshowImportPicker | null;
}

export interface QuizshowStudioControllerResult {
  status: "loading" | "error" | "ready";
  /** Why the first load failed, as a catalog key; null unless `status` is "error". */
  errorReasonKey: string | null;
  /** The provider's value once ready; null while loading or after a failed first load. */
  value: QuizshowStudioContextValue | null;
  /** The save conflict dialog; render it inside the studio in every status. */
  conflictDialog: ReactNode;
  /** Additive. Loads again after a failed first load. */
  retry: () => void;
  /** Additive. A retry is in flight. */
  isRetrying: boolean;
}

/** Below this scale the 1280x720 slide is too small to type on (about 700px wide). */
const SLIDE_EDIT_SCALE_MIN = 0.55;

/** What the hooks read until the first load arrives; each one follows the real response then. */
const LOADING_RESPONSE: QuizshowQuizResponse = {
  quiz: null,
  problems: [],
  isAdultsEvent: false,
  liveSession: null,
  hasResults: false,
  lastOpenSettings: null,
};

/** How long a removal's toast offers its Undo (D12). */
const REMOVED_TOAST_MS = 6_000;

/** A 0-based index from the address; null for anything else. */
function indexParamOf(value: string | null): number | null {
  return value !== null && /^\d+$/.test(value) ? Number(value) : null;
}

/**
 * Item 59: on the first ready load, selects the question the focus link
 * names (`?round=<r>&question=<q>`, 0-based, written by
 * `quizshowStudioFocusPath`), then takes the params off the address with
 * `replace`, so a reload or Back never jumps there again. A link that
 * carries the question's prompt in both languages selects only while the
 * draft still holds the same prompts at those indices; a question that moved
 * or changed since opens the studio with no selection.
 */
function useStudioFocusLink(
  isReady: boolean,
  draft: QuizshowDraft,
  select: (selection: QuizshowStudioSelection) => void,
): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const isHandledRef = useRef(false);
  useEffect(() => {
    if (!isReady || isHandledRef.current) return;
    isHandledRef.current = true;
    const roundParam = searchParams.get(STUDIO_FOCUS_PARAMS.round);
    const questionParam = searchParams.get(STUDIO_FOCUS_PARAMS.question);
    if (roundParam === null && questionParam === null) return;
    const roundIndex = indexParamOf(roundParam);
    const questionIndex = indexParamOf(questionParam);
    const focusedQuestion =
      roundIndex === null || questionIndex === null
        ? undefined
        : draft.rounds[roundIndex]?.questions[questionIndex]?.question;
    const promptEnParam = searchParams.get(STUDIO_FOCUS_PARAMS.promptEn);
    const promptPtParam = searchParams.get(STUDIO_FOCUS_PARAMS.promptPt);
    const isPromptChecked = promptEnParam !== null || promptPtParam !== null;
    if (
      roundIndex !== null &&
      questionIndex !== null &&
      focusedQuestion !== undefined &&
      (!isPromptChecked ||
        (focusedQuestion.prompt.en === (promptEnParam ?? "") &&
          focusedQuestion.prompt.pt === (promptPtParam ?? "")))
    ) {
      select({ kind: "question", roundIndex, questionIndex });
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(STUDIO_FOCUS_PARAMS.round);
        next.delete(STUDIO_FOCUS_PARAMS.question);
        next.delete(STUDIO_FOCUS_PARAMS.promptEn);
        next.delete(STUDIO_FOCUS_PARAMS.promptPt);
        return next;
      },
      { replace: true },
    );
  }, [isReady, draft, searchParams, select, setSearchParams]);
}

/** The removal toast on screen and the draft its removal started from. */
interface StudioRemovalToast {
  toastId: number;
  draftBefore: QuizshowDraft;
}

/**
 * The selection model's actions plus what needs the draft history: each
 * removal raises a 6 s toast (D12) whose Undo takes back that removal only
 * while it is still the latest change, then selects what came back; and Move
 * to round (item 51) moves the question and selects it in its new round.
 * `undoFromKeys` is Cmd/Ctrl+Z: when it takes back the removal a toast
 * offers to undo, that toast goes too (its Undo would have nothing left).
 * A confirmed type change shares the same toast slot ("Changed to Poll"
 * with Undo), so the studio shows one such toast at a time.
 */
export function useStudioHistoryActions(
  controller: QuizshowDraftController,
  actions: QuizshowStudioActions,
  select: (selection: QuizshowStudioSelection) => void,
): { actions: QuizshowStudioActions; undoFromKeys: () => void } {
  const { t } = useTranslation();
  const { showToast, dismissToast } = useToast();
  const removalToastRef = useRef<StudioRemovalToast | null>(null);
  const { draft, undoIfLatest } = controller;
  const latestUndoTarget = controller.latestUndoTarget ?? null;
  // The Undo only acts while its removal is the latest change: once another
  // change lands (an edit, another removal), the toast goes too.
  useEffect(() => {
    const removalToast = removalToastRef.current;
    if (
      removalToast !== null &&
      undoIfLatest !== undefined &&
      latestUndoTarget !== removalToast.draftBefore
    ) {
      dismissToast(removalToast.toastId);
      removalToastRef.current = null;
    }
  }, [latestUndoTarget, undoIfLatest, dismissToast]);
  const dismissRemovalToast = () => {
    if (removalToastRef.current !== null) {
      dismissToast(removalToastRef.current.toastId);
      removalToastRef.current = null;
    }
  };
  /** One removal toast at a time: a new removal takes the last one down. */
  const showRemovedToast = (
    titleKey: string,
    draftBefore: QuizshowDraft,
    restored: QuizshowStudioSelection,
    titleValues?: Record<string, string | number>,
  ) => {
    dismissRemovalToast();
    const toastId = showToast(
      t(titleKey, titleValues),
      "info",
      REMOVED_TOAST_MS,
      undoIfLatest === undefined
        ? undefined
        : {
            label: t("quizshow:studio.removed.undo"),
            // Selects only once the undo really happened.
            onClick: () => undoIfLatest(draftBefore, () => select(restored)),
          },
    );
    removalToastRef.current = { toastId, draftBefore };
  };
  const undoFromKeys = () => {
    const removalToast = removalToastRef.current;
    if (
      removalToast !== null &&
      controller.latestUndoTarget === removalToast.draftBefore
    ) {
      dismissRemovalToast();
    }
    controller.undo?.();
  };
  const historyActions: QuizshowStudioActions = {
    ...actions,
    removeRound: (roundIndex) => {
      const round = draft.rounds[roundIndex];
      if (round === undefined) return;
      actions.removeRound(roundIndex);
      showRemovedToast(
        isWheelRoundKind(round.kind)
          ? "quizshow:studio.removed.wheel"
          : "quizshow:studio.removed.round",
        draft,
        { kind: "round", roundIndex },
      );
    },
    removeQuestion: (roundIndex, questionIndex) => {
      if (draft.rounds[roundIndex]?.questions[questionIndex] === undefined)
        return;
      actions.removeQuestion(roundIndex, questionIndex);
      showRemovedToast("quizshow:studio.removed.question", draft, {
        kind: "question",
        roundIndex,
        questionIndex,
      });
    },
    changeQuestionTypeWithUndo: (roundIndex, questionIndex, nextType) => {
      const round = draft.rounds[roundIndex];
      const question = round?.questions[questionIndex]?.question;
      if (round === undefined || question === undefined) return;
      controller.updateQuestion(
        roundIndex,
        questionIndex,
        changeQuestionType(question, nextType, round.kind),
      );
      showRemovedToast(
        "quizshow:studio.typeChange.changed",
        draft,
        { kind: "question", roundIndex, questionIndex },
        { type: t(`quizshow:type.${nextType}`) },
      );
    },
    moveQuestionToRound: (fromRoundIndex, questionIndex, toRoundIndex) => {
      const target = draft.rounds[toRoundIndex];
      const isFitting =
        draft.rounds[fromRoundIndex]?.questions[questionIndex] !== undefined &&
        questionMoveTargetsOf(draft.rounds, fromRoundIndex).includes(
          toRoundIndex,
        );
      if (
        target === undefined ||
        !isFitting ||
        controller.moveQuestionToRound === undefined
      ) {
        return;
      }
      controller.moveQuestionToRound(
        fromRoundIndex,
        questionIndex,
        toRoundIndex,
      );
      // It lands at the end of the target round.
      select({
        kind: "question",
        roundIndex: toRoundIndex,
        questionIndex: target.questions.length,
      });
    },
  };
  return { actions: historyActions, undoFromKeys };
}

function errorReasonKeyOf(scope: QuizshowScope, error: unknown): string {
  return scope.kind === "template"
    ? quizshowTemplateErrorKeyOf(error)
    : quizshowErrorKeyOf(quizshowErrorCodeOf(error));
}

/**
 * The studio's orchestration for an event, a game or a template: the quiz
 * query, the draft and its 18+ and template parts, the selection, the view
 * language, the problems, saving (autosave or explicit) and the conflict
 * dialog. It replaced the old accordion builder's loaded state.
 */
export function useQuizshowStudioController(
  scope: QuizshowScope,
  options: QuizshowStudioControllerOptions = {},
): QuizshowStudioControllerResult {
  const { language } = useTranslation();
  const query = useQuizshowQuiz(scope, { isEnabled: true });
  const data = query.data ?? LOADING_RESPONSE;
  // While our own save is out, a refetch that lands before its response
  // must not adopt over edits made meanwhile; the response rebases the draft.
  const [isOwnSavePending, setIsOwnSavePending] = useState(false);
  const controller = useQuizshowDraft(data.quiz, {
    isAdoptPaused: isOwnSavePending,
  });
  const { draft } = controller;
  const adults = useQuizshowAdultsDraft({ scope, data, draft });
  const templateDraft = useQuizshowTemplateDraft({ data });
  const isWide = useIsStudioWide();
  // The canvas reports its scale; only the verdict is kept, so a resize
  // re-renders the studio only when the verdict flips.
  const [isCanvasReadable, setIsCanvasReadable] = useState(true);
  const {
    selection,
    select,
    actions: selectionActions,
  } = useStudioSelectionModel(controller);
  const { actions, undoFromKeys } = useStudioHistoryActions(
    controller,
    selectionActions,
    select,
  );
  const isLoaded = query.data !== undefined;
  useStudioFocusLink(isLoaded, draft, select);
  useStudioHistoryShortcuts(
    isLoaded && controller.redo
      ? { onUndo: undoFromKeys, onRedo: controller.redo }
      : null,
  );
  const [isBlankStarted, setIsBlankStarted] = useState(false);
  const [viewLanguageChoice, setViewLanguageChoice] =
    useState<QuizshowLanguage | null>(null);

  const saving = useQuizshowSave({
    scope,
    data,
    controller,
    refetch: async () => (await query.refetch()).data ?? null,
    isAdultsOnly: adults.isAdultsOnlyToSave,
    templateFields: templateDraft.fieldsToSave,
    onReset: (response) => {
      adults.resetTo(response);
      templateDraft.resetTo(response);
    },
    // A save answered while the host kept editing: the drafts keep the edits.
    onRebase: (response) => {
      adults.rebaseTo(response);
      templateDraft.rebaseTo(response);
    },
  });
  if (saving.isSaving !== isOwnSavePending)
    setIsOwnSavePending(saving.isSaving);
  const isUnsaved =
    controller.isDirty ||
    (data.quiz === null && isBlankStarted) ||
    adults.isUnsaved ||
    templateDraft.isUnsaved;
  const { problems, dryRunProblems, publishing } = useQuizshowBuilderProblems({
    scope,
    data,
    draft,
    isAdultsEvent: adults.isAdultsEvent,
    isUnsaved,
    saveRejectedProblems: saving.rejectedProblems,
    templateCard: templateDraft.card,
  });
  // A game is listed by its title and the server refuses a blank template title, so both need one.
  const isTitleRequired = scope.kind !== "event";
  const isTitleBlank = isTitleRequired && draft.title.trim() === "";
  // A new identity on every edit to anything a save sends.
  const editKey = useMemo(
    () => ({
      draft,
      isAdultsOnly: adults.isAdultsOnlyToSave,
      templateFields: templateDraft.fieldsToSave,
    }),
    [draft, adults.isAdultsOnlyToSave, templateDraft.fieldsToSave],
  );
  const { save, conflictDialog } = useStudioSave({
    scope,
    rounds: draft.rounds,
    saving,
    problems,
    isUnsaved,
    isTitleBlank,
    editKey,
  });

  const retry = () => void query.refetch();
  const resultBase = { conflictDialog, retry, isRetrying: query.isRefetching };
  if (query.isPending) {
    return {
      ...resultBase,
      status: "loading",
      errorReasonKey: null,
      value: null,
    };
  }
  if (!query.data) {
    // A failed refresh keeps the last quiz and the host's draft on screen;
    // the error state is for a first load that never arrived.
    return {
      ...resultBase,
      status: "error",
      errorReasonKey: errorReasonKeyOf(scope, query.error),
      value: null,
    };
  }

  const sessionScope = isQuizshowSessionScope(scope) ? scope : null;
  const shownProblems = [...problems];
  const viewLanguage =
    draft.languages === "both"
      ? (viewLanguageChoice ?? primaryLanguageOf(draft.screenLanguage))
      : draft.languages;
  const value: QuizshowStudioContextValue = {
    scope,
    data,
    controller,
    // A game created blank holds a quiz with no rounds yet, which still
    // shows the start panel, so `?start=copy` opens its picker there.
    hasQuiz:
      (data.quiz?.rounds.length ?? 0) > 0 ||
      isBlankStarted ||
      sessionScope === null,
    selection,
    select,
    viewLanguage,
    setViewLanguage: setViewLanguageChoice,
    problems: shownProblems,
    problemsFor: (target) => problemsForSelection(shownProblems, target),
    save: {
      ...save,
      discard: () => {
        controller.resetTo(data.quiz);
        adults.resetTo(data);
        templateDraft.resetTo(data);
        setIsBlankStarted(false);
        select(QUIZ_SELECTION);
      },
    },
    adults: scope.kind === "game" ? adults : null,
    template: scope.kind === "template" ? templateDraft : null,
    isWide,
    isAdultsEvent: adults.isAdultsEvent,
    dryRunProblems: [...dryRunProblems],
    lobby: {
      isBlocked: isUnsaved || shownProblems.length > 0,
      blockedReasonKey: lobbyBlockedReasonKeyOf(
        isUnsaved,
        shownProblems.length,
      ),
    },
    publishing: scope.kind === "template" ? publishing : null,
    templateMeta: templateMetaOf(data),
    isTitleRequired,
    isRefreshFailed: query.isRefetchError,
    actions,
    history:
      controller.redo === undefined
        ? null
        : { undo: undoFromKeys, redo: controller.redo },
    slideEditing: {
      isEditable: isWide && isCanvasReadable,
      reportCanvasScale: (scale) =>
        setIsCanvasReadable(scale >= SLIDE_EDIT_SCALE_MIN),
    },
    start: {
      sessionScope,
      eventStartAt: options.eventStartAt ?? null,
      isAdultsEvent: data.isAdultsEvent,
      initialImportPicker: options.initialImportPicker ?? null,
      startBlank: () => {
        controller.startBlank(language);
        setIsBlankStarted(true);
        select(QUIZ_SELECTION);
      },
      importDraft: (response) => {
        controller.resetTo(response.quiz);
        adults.resetTo(response);
        select(QUIZ_SELECTION);
      },
    },
  };
  return { ...resultBase, status: "ready", errorReasonKey: null, value };
}

/** While unsaved the save status is the reason; otherwise the problems list. */
function lobbyBlockedReasonKeyOf(
  isUnsaved: boolean,
  problemCount: number,
): string | null {
  if (isUnsaved) return "quizshow:save.unsaved";
  return problemCount > 0 ? "quizshow:problems.title" : null;
}
