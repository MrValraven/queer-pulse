import { useEffect, useRef, useState } from "react";
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
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import type { QuizshowTemplateFields } from "../templates/quizshowTemplateResponse";
import { draftToInput, isDraftDirty } from "./quizshowDraft";
import { quizshowProblemsFromServer } from "./quizshowValidation";
import type { QuizshowDraftController } from "./useQuizshowDraft";

/** How one save ended: stored, refused by a newer version (409), refused as invalid, or failed for another reason. */
export type QuizshowSaveOutcome = "saved" | "conflict" | "failed" | "refused";

export interface QuizshowSaveOptions {
  /** Raise no toast; the caller shows the outcome itself (the studio's autosave). */
  isSilent?: boolean;
  /**
   * The studio's save: it sends the draft as it stands now against the last
   * saved `updatedAt` (this hook's own answer included, before the query
   * re-renders), and keeps edits made while the request was in flight. When
   * the draft (or the 18+ switch, or a template's fields) changed after the
   * body went out, the draft is rebased on the response instead of reset to
   * it, so the next save sends those edits and a revert is never lost.
   */
  shouldKeepNewerEdits?: boolean;
  /**
   * Additive. The reset after the save keeps the draft keys when the shape
   * is unchanged (see `QuizshowResetOptions`), so the studio's rail keeps its
   * rows on a template's explicit save and on "Save mine". Implied by
   * `shouldKeepNewerEdits`.
   */
  shouldKeepKeys?: boolean;
}

export function conflictUpdatedAtOf(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  const { updatedAt } = data as { updatedAt?: unknown };
  return typeof updatedAt === "string" ? updatedAt : null;
}

/**
 * Saves the draft for an event, a game or a template. `isAdultsOnly` is the
 * game's 18+ switch, and null elsewhere. `templateFields` is a template's card
 * and staff notes, and null elsewhere; an event's body goes out exactly as
 * before. `onReset` hears every response the draft is reset to (a save, or
 * their version), so the 18+ and template drafts can follow it.
 */
export function useQuizshowSave(options: {
  scope: QuizshowScope;
  data: QuizshowQuizResponse;
  controller: QuizshowDraftController;
  refetch: () => Promise<QuizshowQuizResponse | null>;
  isAdultsOnly: boolean | null;
  templateFields: QuizshowTemplateFields | null;
  onReset?: (response: QuizshowQuizResponse | null) => void;
  /** Hears a save's response when edits made in flight are kept (`shouldKeepNewerEdits`), so the 18+ draft can rebase. */
  onRebase?: (response: QuizshowQuizResponse) => void;
}) {
  const {
    scope,
    data,
    controller,
    refetch,
    isAdultsOnly,
    templateFields,
    onReset,
    onRebase,
  } = options;
  const isTemplate = scope.kind === "template";
  const { t } = useTranslation();
  const { showToast } = useToast();
  const saveQuiz = useSaveQuizshowQuiz(scope);
  const [conflictUpdatedAt, setConflictUpdatedAt] = useState<string | null>(
    null,
  );
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  // A 409 waits for the host to pick their version or mine; closing the
  // dialog leaves it pending, so the studio's autosave stays paused.
  const [isConflictPending, setIsConflictPending] = useState(false);
  // The copy key of the last save's refusal or failure; null after a save.
  const [lastErrorKey, setLastErrorKey] = useState<string | null>(null);
  // The same key, readable by an awaiting caller before the state re-renders.
  const lastErrorKeyRef = useRef<string | null>(null);
  const recordErrorKey = (errorKey: string | null) => {
    lastErrorKeyRef.current = errorKey;
    setLastErrorKey(errorKey);
  };
  // What the draft holds now, read when a save answers.
  const latestRef = useRef({
    draft: controller.draft,
    isAdultsOnly,
    templateFields,
  });
  useEffect(() => {
    latestRef.current = {
      draft: controller.draft,
      isAdultsOnly,
      templateFields,
    };
  }, [controller.draft, isAdultsOnly, templateFields]);
  // The studio's expected `updatedAt`: the version the draft is built on.
  // It follows this hook's own answers, Load their version, and the draft's
  // baseline (which moves only when a clean draft adopts a newer quiz), and
  // never a poll: a stale poll would 409 the next save against our own, and a
  // co-host's version polled under a dirty draft would hide their conflict.
  // A controller without `baselineStamp` (a test double) reads the query.
  const draftStamp =
    controller.baselineStamp === undefined
      ? (data.quiz?.updatedAt ?? null)
      : controller.baselineStamp;
  const savedStampRef = useRef(draftStamp);
  useEffect(() => {
    savedStampRef.current = draftStamp;
  }, [draftStamp]);
  // The server's refusal belongs to the draft it answered; any edit makes a
  // new draft object, which retires the list without an effect.
  const [rejected, setRejected] = useState<{
    draft: QuizshowDraftController["draft"];
    problems: QuizshowQuizProblem[];
  } | null>(null);

  function saveBodyOf(
    sent: typeof latestRef.current,
    expectedUpdatedAt: string | null,
  ): QuizshowSaveInput {
    const quizInput: QuizshowSaveInput = draftToInput(
      sent.draft,
      expectedUpdatedAt,
    );
    return {
      ...quizInput,
      ...(sent.isAdultsOnly === null
        ? {}
        : { isAdultsOnly: sent.isAdultsOnly }),
      ...(sent.templateFields === null
        ? {}
        : { templateFields: sent.templateFields }),
    };
  }

  /** Whether the draft, the 18+ switch or the template fields moved on since `sent`. */
  function hasEditedSince(sent: typeof latestRef.current): boolean {
    const latest = latestRef.current;
    return (
      isDraftDirty(latest.draft, sent.draft) ||
      latest.isAdultsOnly !== sent.isAdultsOnly ||
      latest.templateFields !== sent.templateFields
    );
  }

  async function save(
    expectedUpdatedAt: string | null,
    options: QuizshowSaveOptions = {},
  ): Promise<QuizshowSaveOutcome> {
    const {
      isSilent = false,
      shouldKeepNewerEdits = false,
      shouldKeepKeys = false,
    } = options;
    // The studio sends what the draft holds now; the builder, what it rendered.
    const sent = shouldKeepNewerEdits
      ? latestRef.current
      : { draft: controller.draft, isAdultsOnly, templateFields };
    const sentDraft = sent.draft;
    const expectedStamp = shouldKeepNewerEdits
      ? savedStampRef.current
      : expectedUpdatedAt;
    try {
      const response = await saveQuiz.mutateAsync(
        saveBodyOf(sent, expectedStamp),
      );
      savedStampRef.current = response.quiz?.updatedAt ?? null;
      if (!isSilent) {
        showToast(
          t(isTemplate ? "quizshow:templates.saved" : "quizshow:save.saved"),
          "success",
        );
      }
      // An edit made while the request was in flight stays in the draft,
      // measured against the new baseline, so the next save sends it.
      if (shouldKeepNewerEdits && hasEditedSince(sent) && controller.rebaseTo) {
        controller.rebaseTo(response.quiz);
        onRebase?.(response);
      } else if (shouldKeepNewerEdits || shouldKeepKeys) {
        // The studio's rail is keyed by draft key: keep the keys, so its rows stay put.
        controller.resetTo(response.quiz, { shouldKeepKeys: true });
        onReset?.(response);
      } else {
        controller.resetTo(response.quiz);
        onReset?.(response);
      }
      setRejected(null);
      recordErrorKey(null);
      return "saved";
    } catch (error) {
      const code = quizshowErrorCodeOf(error);
      if (code === "quizshow_quiz_changed") {
        setConflictUpdatedAt(conflictUpdatedAtOf(error));
        setIsConflictOpen(true);
        setIsConflictPending(true);
        return "conflict";
      }
      if (code === "quizshow_quiz_invalid") {
        setRejected({ draft: sentDraft, problems: quizshowProblemsOf(error) });
        recordErrorKey("quizshow:save.invalid");
        if (!isSilent) showToast(t("quizshow:save.invalid"), "error");
        return "refused";
      }
      // Staff template writes also name uncoded refusals (access, role, validation).
      const errorKey = isTemplate
        ? quizshowTemplateErrorKeyOf(error)
        : quizshowErrorKeyOf(code);
      recordErrorKey(errorKey);
      if (!isSilent) showToast(t(errorKey), "error");
      return "failed";
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
    saveNow: async () => (await save(data.quiz?.updatedAt ?? null)) === "saved",
    /** The same save, reporting how it ended; `isSilent` raises no toast. */
    saveWithOutcome: (options?: QuizshowSaveOptions) =>
      save(data.quiz?.updatedAt ?? null, options),
    /** Additive: the studio passes `{ shouldKeepKeys: true }`; the builder calls it bare, as before. */
    saveMine: (mineOptions?: Pick<QuizshowSaveOptions, "shouldKeepKeys">) => {
      setIsConflictOpen(false);
      const shouldKeepMineKeys = mineOptions?.shouldKeepKeys === true;
      void save(conflictUpdatedAt, { shouldKeepKeys: shouldKeepMineKeys }).then(
        (outcome) => {
          // Only a stored overwrite ends the conflict; a second 409 opens the
          // dialog again, and a failure leaves "Review changes" to retry.
          if (outcome === "saved") setIsConflictPending(false);
        },
      );
    },
    loadTheirs: async () => {
      setIsConflictOpen(false);
      const fresh = await refetch();
      savedStampRef.current = fresh?.quiz?.updatedAt ?? null;
      controller.resetTo(fresh?.quiz ?? null);
      onReset?.(fresh);
      setRejected(null);
      recordErrorKey(null);
      setIsConflictPending(false);
    },
    closeConflict: () => setIsConflictOpen(false),
    /** True from a 409 until the host loads their version or saves mine. */
    isConflictPending,
    /** Opens the conflict dialog again while a conflict is pending ("Review changes"). */
    reopenConflict: () => {
      if (isConflictPending) setIsConflictOpen(true);
    },
    /** The copy key naming why the last save was refused or failed; null after a save. */
    lastErrorKey,
    /**
     * Additive. The same key read now, for a caller awaiting a save
     * (`saveWithOutcome`), whose closure still holds the render before it.
     */
    readLastErrorKey: () => lastErrorKeyRef.current,
  };
}
