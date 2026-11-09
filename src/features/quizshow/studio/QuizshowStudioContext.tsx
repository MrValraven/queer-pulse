import { createContext, useContext } from "react";
import type {
  QuizshowLanguage,
  QuizshowPlayableRoundKind,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import type { useQuizshowAdultsDraft } from "../builder/useQuizshowAdultsDraft";
import type { QuizshowDraftController } from "../builder/useQuizshowDraft";
import type { QuizshowScope, QuizshowSessionScope } from "../quizshowScope";
import type { QuizshowTemplateMeta } from "../templates/quizshowTemplateResponse";
import type { QuizshowTemplatePublishing } from "../templates/useQuizshowTemplatePublish";
import type { useQuizshowTemplateDraft } from "../templates/useQuizshowTemplateDraft";
import type { QuizshowStudioProblemValues } from "./quizshowStudioProblemCopy";
import type { QuizshowStudioSelection } from "./quizshowStudioSelection";
import type { QuizshowStudioSaveStatus } from "./useStudioAutosave";

export interface QuizshowStudioSave {
  status: QuizshowStudioSaveStatus;
  /** Why the status is held or failed, as a catalog key; null otherwise. */
  reasonKey: string | null;
  /** Cmd/Ctrl+S and the Save button: saves now; while a conflict waits, reopens its dialog. */
  saveNow: () => void;
  /** True in template scope: no autosave, a Save button in the top bar. */
  isExplicit: boolean;
  /** Additive. The values `reasonKey` reads when it is a problem sentence: `t(reasonKey, reasonValues)`. */
  reasonValues: QuizshowStudioProblemValues | null;
  /** Additive. A save (auto or explicit) is in flight. */
  isSaving: boolean;
  /** Additive. A structural problem or a required blank title holds every save. */
  isSaveBlocked: boolean;
  /** Additive. The draft differs from the saved quiz (the leave guard is armed). */
  isUnsaved: boolean;
  /** Additive. "Review changes": reopens the conflict dialog while a 409 waits. */
  reviewConflict: () => void;
  /** Additive. Discard changes: the quiz, the 18+ switch and the template card go back to the saved version. */
  discard: () => void;
  /**
   * Additive. Waits out the autosave, then saves what is left; resolves null
   * once the quiz is stored, or the sentence naming why it is not (a problem
   * that holds the save, a refusal, a failure or a conflict). A template
   * saves explicitly, so it resolves null only when nothing is unsaved.
   */
  saveFirst: () => Promise<string | null>;
}

/** Additive. Selection-aware edits for the rail, the shortcuts and the inspector. */
export interface QuizshowStudioActions {
  /** Room under the quiz-wide question limit (`questionsPerQuizMax`). */
  isAddQuestionAllowed: boolean;
  /** Room for one more round (wheel rows do not count), and for the question it arrives with. */
  isAddRoundAllowed: boolean;
  /** Additive. Room for one more wheel row (`wheelStepsMax`); a wheel brings no question. */
  isAddWheelAllowed: boolean;
  /** Room in round `roundIndex` and under the quiz-wide limit (add or duplicate there). */
  isAddQuestionToRoundAllowed: (roundIndex: number) => boolean;
  selectPrevious: () => void;
  selectNext: () => void;
  /** N: a new question right after the selected one (the end of a selected round; the last round from the quiz). */
  addQuestionAfterSelection: () => void;
  /** A new question at the end of round `roundIndex`, selected. */
  addQuestionToRound: (roundIndex: number) => void;
  /** Cmd/Ctrl+D: duplicates the selected question and selects the copy. */
  duplicateSelectedQuestion: () => void;
  duplicateQuestion: (roundIndex: number, questionIndex: number) => void;
  /** A new round at the end, its header selected. */
  addRound: (kind: QuizshowPlayableRoundKind) => void;
  /** Additive. A new wheel at the end, selected. */
  addWheel: () => void;
  /** Removes a question; the selection moves to the previous one, or the round's header. Confirm first. */
  removeQuestion: (roundIndex: number, questionIndex: number) => void;
  /** Removes a round; the selection moves to the previous round's header, or the quiz. Confirm first. */
  removeRound: (roundIndex: number) => void;
  /** Moves a question within its round; the selection follows it. */
  moveQuestion: (
    roundIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  /** Moves a round; the selection follows it. */
  moveRound: (fromIndex: number, toIndex: number) => void;
}

/** Additive. What the canvas's start panel needs (an empty event or game quiz). */
export interface QuizshowStudioStart {
  /** The import buttons' scope; null on a template, which has no start panel. */
  sessionScope: QuizshowSessionScope | null;
  /** The event's start, for the series shortcut; null on a game. */
  eventStartAt: Date | null;
  /** The saved 18+ flag, the one the server checks on an import. */
  isAdultsEvent: boolean;
  /** The picker to open once on mount (`?start=copy` on a game). */
  initialImportPicker: QuizshowImportPicker | null;
  /** Start with a blank quiz in the app language. */
  startBlank: () => void;
  /** Follows an import's response (pass as `onImported`). */
  importDraft: (response: QuizshowQuizResponse) => void;
}

/**
 * Additive. Typing on the slide needs the wide layout AND a canvas drawn at
 * a readable scale; otherwise the slide is a read-only preview and the
 * inspector shows the editing fields. The canvas reports its scale.
 */
export interface QuizshowStudioSlideEditing {
  /** The slide takes typing; the inspector reads this in place of `isWide` for its editing fields. */
  isEditable: boolean;
  /** The canvas's scale of its 1280x720 slide (the canvas calls this as it measures). */
  reportCanvasScale: (scale: number) => void;
}

export interface QuizshowStudioContextValue {
  scope: QuizshowScope;
  /** From useQuizshowQuiz. */
  data: QuizshowQuizResponse;
  controller: QuizshowDraftController;
  /** The quiz exists, or a blank one was started; always true on a template. */
  hasQuiz: boolean;
  selection: QuizshowStudioSelection;
  select: (selection: QuizshowStudioSelection) => void;
  /** Which language the host types on the slide. Local UI, never saved; the screen language by default. */
  viewLanguage: QuizshowLanguage;
  setViewLanguage: (language: QuizshowLanguage) => void;
  /** From useQuizshowBuilderProblems. */
  problems: QuizshowLocalProblem[];
  problemsFor: (selection: QuizshowStudioSelection) => QuizshowLocalProblem[];
  save: QuizshowStudioSave;
  /** Game scope (the 18+ switch); null elsewhere. */
  adults: ReturnType<typeof useQuizshowAdultsDraft> | null;
  /** Template scope (card and staff notes); null elsewhere. */
  template: ReturnType<typeof useQuizshowTemplateDraft> | null;
  isWide: boolean;
  // ── Additive fields ──
  /** The draft's 18+ on a game, the event's flag on an event; content labels and problems read it. */
  isAdultsEvent: boolean;
  /** The try-out's own problems (Try it is blocked by these). */
  dryRunProblems: QuizshowLocalProblem[];
  /** Open lobby: blocked while unsaved or while any problem is listed. */
  lobby: { isBlocked: boolean; blockedReasonKey: string | null };
  /** Template scope: publish state and actions; null elsewhere. */
  publishing: QuizshowTemplatePublishing | null;
  /** Template scope: the template's meta (status, card); null elsewhere. */
  templateMeta: QuizshowTemplateMeta | null;
  /** A game and a template need a title; an event's quiz does not. */
  isTitleRequired: boolean;
  /** A refresh of the loaded quiz failed; the draft stays on screen. */
  isRefreshFailed: boolean;
  actions: QuizshowStudioActions;
  start: QuizshowStudioStart;
  /** Additive. Whether the host types on the slide (see QuizshowStudioSlideEditing). */
  slideEditing: QuizshowStudioSlideEditing;
}

export const QuizshowStudioContext =
  createContext<QuizshowStudioContextValue | null>(null);

/** The studio's state; only inside the studio's provider. */
export function useQuizshowStudio(): QuizshowStudioContextValue {
  const value = useContext(QuizshowStudioContext);
  if (value === null) {
    throw new Error(
      "useQuizshowStudio was called outside QuizshowStudioContext.Provider: render the component inside the studio, under the provider fed by useQuizshowStudioController",
    );
  }
  return value;
}
