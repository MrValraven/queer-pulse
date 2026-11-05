import { useMemo, useState, type ReactNode } from "react";
import type {
  QuizshowLanguage,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import { useQuizshowAdultsDraft } from "../builder/useQuizshowAdultsDraft";
import { useQuizshowBuilderProblems } from "../builder/useQuizshowBuilderProblems";
import { useQuizshowDraft } from "../builder/useQuizshowDraft";
import { useQuizshowSave } from "../builder/useQuizshowSave";
import { isQuizshowSessionScope, type QuizshowScope } from "../quizshowScope";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateMetaOf } from "../templates/quizshowTemplateResponse";
import { useQuizshowTemplateDraft } from "../templates/useQuizshowTemplateDraft";
import type { QuizshowStudioContextValue } from "./QuizshowStudioContext";
import {
  problemsForSelection,
  QUIZ_SELECTION,
} from "./quizshowStudioSelection";
import { useIsStudioWide } from "./useIsStudioWide";
import { useStudioSave } from "./useStudioSave";
import { useStudioSelectionModel } from "./useStudioSelectionModel";

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
};

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
  const { selection, select, actions } = useStudioSelectionModel(controller);
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
      ? (viewLanguageChoice ?? draft.screenLanguage)
      : draft.languages;
  const value: QuizshowStudioContextValue = {
    scope,
    data,
    controller,
    hasQuiz: data.quiz !== null || isBlankStarted || sessionScope === null,
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
