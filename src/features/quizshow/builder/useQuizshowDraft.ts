import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  QuizshowLanguage,
  QuizshowQuestionInput,
  QuizshowQuiz,
  QuizshowPlayableRoundKind,
} from "../../../shared/contracts/quizshow";
import { isWheelRoundKind } from "../quizshowWheel";
import {
  blankDraft,
  changeRoundKind as changeDraftRoundKind,
  draftFromQuiz,
  duplicateQuestionAt,
  isDraftDirty,
  moveItem,
  newRound,
  newWheel,
  removeAt,
  withNewQuestion,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "./quizshowDraft";
import {
  EMPTY_DRAFT_HISTORY,
  recordDraftChange,
  redoDraft,
  undoDraft,
  type QuizshowDraftHistory,
} from "./quizshowDraftHistory";

export interface QuizshowDraftController {
  draft: QuizshowDraft;
  isDirty: boolean;
  setQuizField: <Key extends "title" | "languages" | "screenLanguage">(
    key: Key,
    value: QuizshowDraft[Key],
  ) => void;
  addRound: (kind: QuizshowPlayableRoundKind) => void;
  addWheel: () => void;
  updateRound: (
    roundIndex: number,
    patch: Partial<
      Pick<QuizshowDraftRound, "title" | "contentLabel" | "settings">
    >,
  ) => void;
  changeRoundKind: (
    roundIndex: number,
    kind: QuizshowPlayableRoundKind,
  ) => void;
  moveRound: (fromIndex: number, toIndex: number) => void;
  removeRound: (roundIndex: number) => void;
  addQuestion: (roundIndex: number) => void;
  updateQuestion: (
    roundIndex: number,
    questionIndex: number,
    question: QuizshowQuestionInput,
    mediaUrl?: string | null,
  ) => void;
  moveQuestion: (
    roundIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  duplicateQuestion: (roundIndex: number, questionIndex: number) => void;
  removeQuestion: (roundIndex: number, questionIndex: number) => void;
  /**
   * A new baseline from the server (after load, save or import); the draft
   * follows it. Additive: `shouldKeepKeys` reuses the current draft keys by
   * position when the new quiz has the same shape (round count and question
   * count per round), so a list keyed by them keeps its rows (the studio's
   * post-save reset). Left out, every key is minted fresh, as before.
   */
  resetTo: (quiz: QuizshowQuiz | null, options?: QuizshowResetOptions) => void;
  /**
   * A new baseline from the server that leaves the draft, its keys and its
   * picked previews alone: a save answered while the host kept typing. The
   * draft stays dirty against it until those edits are saved too.
   */
  rebaseTo?: (quiz: QuizshowQuiz | null) => void;
  /**
   * `updatedAt` of the server quiz the draft is built on (null for none). It
   * moves on a load, a reset, a rebase, and when a clean draft adopts a newer
   * quiz; a poll that leaves the draft alone never moves it.
   */
  baselineStamp?: string | null;
  /** A blank quiz written in `language` (the app language); English when left out. */
  startBlank: (language?: QuizshowLanguage) => void;
  /**
   * Local previews of the pictures picked in this edit, by picture key. The
   * question's picture slot reads them, so a picture survives its question
   * closing and opening again.
   */
  pickedPreviewUrls: ReadonlyMap<string, string>;
  /**
   * Keeps `previewUrl` (a `blob:` URL the draft now owns) for `mediaRef`. It is
   * revoked once no question of the draft, and no draft an undo or redo can
   * bring back, holds the key (a question drops or replaces its picture, is
   * removed, or a reset or import leaves the key out), and when the builder
   * unmounts. A duplicated question shares the key, so the preview lives
   * while either copy holds it.
   */
  rememberPickedPreview: (mediaRef: string, previewUrl: string) => void;
  /**
   * Additive (item 20). Steps the draft back one change; a no-op with nothing
   * to undo. A load, a discard, an import or a blank start clears the history;
   * the studio's post-save reset (`shouldKeepKeys`) and `rebaseTo` keep it.
   */
  undo?: () => void;
  /** Additive (item 20). Steps forward again after an undo; any new change clears what is left to redo. */
  redo?: () => void;
  /**
   * Additive (D12). Undoes only when the latest undo step goes back to
   * `expectedPrevious` (the draft a removal started from), so a removal
   * toast's Undo never reverts a later change. The check runs on the state
   * the undo applies to; `onUndone` runs once after the undo really happened,
   * and never when it did not.
   */
  undoIfLatest?: (
    expectedPrevious: QuizshowDraft,
    onUndone?: () => void,
  ) => void;
  /**
   * Additive (D12). The draft the next undo goes back to; null with nothing
   * to undo. A removal toast compares it with the draft the removal started
   * from, to see whether a plain Cmd/Ctrl+Z is about to take that removal back.
   */
  latestUndoTarget?: QuizshowDraft | null;
  /**
   * Additive. A new default question at `insertAt` of round `roundIndex`
   * (the end when past it), as one undo step; a wheel row is left alone.
   */
  addQuestionAt?: (roundIndex: number, insertAt: number) => void;
  /** Additive (item 20). There is a change to undo. */
  canUndo?: boolean;
  /** Additive (item 20). There is an undone change to redo. */
  canRedo?: boolean;
  /**
   * Additive (item 51). Moves question `questionIndex` of round
   * `fromRoundIndex` to the end of round `toRoundIndex`. A no-op unless both
   * rounds exist, differ and are of the same kind.
   */
  moveQuestionToRound?: (
    fromRoundIndex: number,
    questionIndex: number,
    toRoundIndex: number,
  ) => void;
  /**
   * Additive (item 22). Replaces the whole draft in one undo step (paste
   * import, CSV import, fill empty PT). A draft that sends nothing new
   * records no step, like any other edit. `next` may also be an updater
   * that builds the new draft from the current one, so a change that landed
   * since the last render (a newer save adopted) is kept.
   */
  replaceDraft?: (
    next: QuizshowDraft | ((current: QuizshowDraft) => QuizshowDraft),
    historyLabel: "paste" | "csv" | "fillLanguage",
  ) => void;
}

type PickedPreviewUrls = ReadonlyMap<string, string>;

/** Additive options for `resetTo`. */
export interface QuizshowResetOptions {
  shouldKeepKeys?: boolean;
}

interface DraftState {
  draft: QuizshowDraft;
  baseline: QuizshowDraft;
  /** `updatedAt` of the server quiz the baseline came from; null for no quiz. */
  baselineStamp: string | null;
  pickedPreviewUrls: PickedPreviewUrls;
  /** Undo and redo (item 20). */
  history: QuizshowDraftHistory;
  /** The id of the last `undoIfLatest` that really undid; null until one does. */
  guardedUndoId: number | null;
}

const NO_PICKED_PREVIEWS: PickedPreviewUrls = new Map();

function emptyDraft(): QuizshowDraft {
  return { title: "", languages: "en", screenLanguage: "en", rounds: [] };
}

/** Every picture key a question of `draft` holds. */
function mediaRefsOf(draft: QuizshowDraft): Set<string> {
  return new Set(
    draft.rounds
      .flatMap((round) => round.questions)
      .map((draftQuestion) => draftQuestion.question.mediaRef)
      .filter((mediaRef): mediaRef is string => mediaRef !== null),
  );
}

/** Every picture key the draft or a draft in its undo or redo stack holds. */
function heldMediaRefsOf(
  draft: QuizshowDraft,
  history: QuizshowDraftHistory,
): Set<string> {
  const heldMediaRefs = mediaRefsOf(draft);
  for (const storedDraft of [...history.past, ...history.future]) {
    for (const mediaRef of mediaRefsOf(storedDraft))
      heldMediaRefs.add(mediaRef);
  }
  return heldMediaRefs;
}

/**
 * The picked previews whose key a question of `draft`, or of a draft an undo
 * or redo can bring back, still holds.
 */
function keepHeldPreviews(
  previews: PickedPreviewUrls,
  draft: QuizshowDraft,
  history: QuizshowDraftHistory = EMPTY_DRAFT_HISTORY,
): PickedPreviewUrls {
  if (previews.size === 0) return previews;
  const heldMediaRefs = heldMediaRefsOf(draft, history);
  const kept = new Map(
    [...previews].filter(([mediaRef]) => heldMediaRefs.has(mediaRef)),
  );
  return kept.size === previews.size ? previews : kept;
}

function stateFromQuiz(
  quiz: QuizshowQuiz | null,
  previews: PickedPreviewUrls = NO_PICKED_PREVIEWS,
): DraftState {
  const baseline = quiz ? draftFromQuiz(quiz) : emptyDraft();
  return {
    draft: structuredClone(baseline),
    baseline,
    baselineStamp: quiz?.updatedAt ?? null,
    pickedPreviewUrls: keepHeldPreviews(previews, baseline),
    history: EMPTY_DRAFT_HISTORY,
    guardedUndoId: null,
  };
}

/** Whether two drafts have the same rounds and the same question count in each. */
function isSameShape(first: QuizshowDraft, second: QuizshowDraft): boolean {
  return (
    first.rounds.length === second.rounds.length &&
    first.rounds.every(
      (round, roundIndex) =>
        round.questions.length === second.rounds[roundIndex]?.questions.length,
    )
  );
}

/** `next` wearing the draft keys of `previous`, by position, when the shapes match. */
function withKeysOf(
  next: QuizshowDraft,
  previous: QuizshowDraft,
): QuizshowDraft {
  if (!isSameShape(next, previous)) return next;
  return {
    ...next,
    rounds: next.rounds.map((round, roundIndex) => {
      const previousRound = previous.rounds[roundIndex];
      if (!previousRound) return round;
      return {
        ...round,
        draftKey: previousRound.draftKey,
        questions: round.questions.map((draftQuestion, questionIndex) => ({
          ...draftQuestion,
          draftKey:
            previousRound.questions[questionIndex]?.draftKey ??
            draftQuestion.draftKey,
        })),
      };
    }),
  };
}

/**
 * A reset that keeps the previous draft's keys (see `QuizshowResetOptions`).
 * It follows the studio's own save, so the undo history stays too.
 */
function stateFromQuizKeepingKeys(
  quiz: QuizshowQuiz | null,
  previous: DraftState,
): DraftState {
  const fresh = stateFromQuiz(quiz, previous.pickedPreviewUrls);
  const baseline = withKeysOf(fresh.baseline, previous.draft);
  return {
    ...fresh,
    baseline,
    draft: structuredClone(baseline),
    history: previous.history,
    pickedPreviewUrls: keepHeldPreviews(
      previous.pickedPreviewUrls,
      baseline,
      previous.history,
    ),
  };
}

/**
 * Revokes each picked preview the moment it leaves the map, and every one
 * still kept when the builder unmounts. Also tracks the committed state, so a
 * copy that arrives late can see whether a question (or a draft in the undo
 * history) still holds its key, and a toast's Undo can see the latest step.
 */
function usePickedPreviewRevoking(state: DraftState) {
  const previews = state.pickedPreviewUrls;
  const ownedPreviewsRef = useRef(previews);
  const isMountedRef = useRef(false);
  const latestStateRef = useRef(state);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    const keptUrls = new Set(previews.values());
    for (const previewUrl of ownedPreviewsRef.current.values()) {
      if (!keptUrls.has(previewUrl)) URL.revokeObjectURL(previewUrl);
    }
    ownedPreviewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    const ownedPreviews = ownedPreviewsRef;
    const isMounted = isMountedRef;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      for (const previewUrl of ownedPreviews.current.values()) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return { isMountedRef, latestStateRef };
}

/** `previous` with the baseline taken from `quiz`; the draft and its previews stay. */
function rebased(previous: DraftState, quiz: QuizshowQuiz | null): DraftState {
  return {
    ...previous,
    baseline: quiz ? draftFromQuiz(quiz) : emptyDraft(),
    baselineStamp: quiz?.updatedAt ?? null,
  };
}

function isNewerThan(quiz: QuizshowQuiz, stamp: string | null): boolean {
  return stamp === null || quiz.updatedAt > stamp;
}

/** The draft key of the first row that is not a wheel; null when there is none. */
function firstPlayableKeyOf(
  rounds: readonly QuizshowDraftRound[],
): string | null {
  return (
    rounds.find((round) => !isWheelRoundKind(round.kind))?.draftKey ?? null
  );
}

/**
 * Contract 6.19: only the first playable row holds a warm-up. After a move or
 * a removal, the row that stopped being first drops its warm-up, so one never
 * strands on a later row.
 */
function withWarmUpKeptFirst(
  previous: QuizshowDraft,
  next: QuizshowDraft,
): QuizshowDraft {
  const previousFirstKey = firstPlayableKeyOf(previous.rounds);
  if (
    previousFirstKey === null ||
    previousFirstKey === firstPlayableKeyOf(next.rounds)
  ) {
    return next;
  }
  return {
    ...next,
    rounds: next.rounds.map((round) =>
      round.draftKey === previousFirstKey && round.settings.isWarmUp
        ? { ...round, settings: { ...round.settings, isWarmUp: false } }
        : round,
    ),
  };
}

/** The round with a new default question at `insertAt`; a wheel row comes back as it was. */
function withNewQuestionAt(
  round: QuizshowDraftRound,
  insertAt: number,
): QuizshowDraftRound {
  const added = withNewQuestion(round);
  if (added === round) return round;
  const lastIndex = added.questions.length - 1;
  const targetIndex = Math.min(Math.max(insertAt, 0), lastIndex);
  return {
    ...added,
    questions: moveItem(added.questions, lastIndex, targetIndex),
  };
}

/** The draft with one question moved to the end of a round of the same kind; the same draft when the move does not fit. */
function withQuestionMovedToRound(
  draft: QuizshowDraft,
  fromRoundIndex: number,
  questionIndex: number,
  toRoundIndex: number,
): QuizshowDraft {
  const source = draft.rounds[fromRoundIndex];
  const target = draft.rounds[toRoundIndex];
  const moved = source?.questions[questionIndex];
  if (
    moved === undefined ||
    target === undefined ||
    fromRoundIndex === toRoundIndex ||
    target.kind !== source?.kind
  ) {
    return draft;
  }
  return {
    ...draft,
    rounds: draft.rounds.map((round, index) => {
      if (index === fromRoundIndex) {
        return {
          ...round,
          questions: removeAt(round.questions, questionIndex),
        };
      }
      if (index === toRoundIndex) {
        return { ...round, questions: [...round.questions, moved] };
      }
      return round;
    }),
  };
}

function withRound(
  draft: QuizshowDraft,
  roundIndex: number,
  update: (round: QuizshowDraftRound) => QuizshowDraftRound,
): QuizshowDraft {
  return {
    ...draft,
    rounds: draft.rounds.map((round, index) =>
      index === roundIndex ? update(round) : round,
    ),
  };
}

export interface QuizshowDraftOptions {
  /**
   * Holds the adoption of a newer server quiz (the studio's own save is in
   * flight, and its response is about to rebase the draft). Off by default.
   */
  isAdoptPaused?: boolean;
}

/** The state a newer server quiz replaces a clean draft with; null when the draft stays. */
function adoptedStateOf(
  quiz: QuizshowQuiz | null,
  state: DraftState,
  isDirty: boolean,
  options: QuizshowDraftOptions,
): DraftState | null {
  if (!quiz || !isNewerThan(quiz, state.baselineStamp)) return null;
  if (isDirty || options.isAdoptPaused === true) return null;
  return stateFromQuiz(quiz, state.pickedPreviewUrls);
}

/**
 * The undo coalesce key of a field edit: `"<action>:<roundIndex>:<questionIndex>"`.
 * Typing in one field within the coalesce window is one undo step.
 */
function coalesceKeyOf(
  action: string,
  roundIndex: number | null = null,
  questionIndex: number | null = null,
): string {
  return `${action}:${roundIndex ?? ""}:${questionIndex ?? ""}`;
}

/**
 * Applies `recipe` to the draft as one change. `coalesceKey` joins a field
 * edit to the step before it (see `recordDraftChange`); adds, removes and
 * moves pass null, so each one is a step of its own.
 */
type EditDraft = (
  recipe: (draft: QuizshowDraft) => QuizshowDraft,
  coalesceKey: string | null,
) => void;

type QuizshowDraftEdits = Pick<
  QuizshowDraftController,
  | "setQuizField"
  | "addRound"
  | "addWheel"
  | "updateRound"
  | "changeRoundKind"
  | "moveRound"
  | "removeRound"
  | "addQuestion"
  | "updateQuestion"
  | "moveQuestion"
  | "duplicateQuestion"
  | "removeQuestion"
> &
  Required<
    Pick<QuizshowDraftController, "moveQuestionToRound" | "addQuestionAt">
  >;

/** Every draft edit, each recorded in the undo history through `editDraft`. */
function draftEditsOf(editDraft: EditDraft): QuizshowDraftEdits {
  return {
    setQuizField: (key, value) =>
      editDraft(
        (draft) => ({ ...draft, [key]: value }),
        coalesceKeyOf(`setQuizField.${key}`),
      ),
    addRound: (kind) =>
      editDraft(
        (draft) => ({ ...draft, rounds: [...draft.rounds, newRound(kind)] }),
        null,
      ),
    addWheel: () =>
      editDraft(
        (draft) => ({ ...draft, rounds: [...draft.rounds, newWheel()] }),
        null,
      ),
    updateRound: (roundIndex, patch) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) => ({ ...round, ...patch })),
        coalesceKeyOf("updateRound", roundIndex),
      ),
    changeRoundKind: (roundIndex, kind) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) =>
            changeDraftRoundKind(round, kind),
          ),
        null,
      ),
    moveRound: (fromIndex, toIndex) =>
      editDraft(
        (draft) =>
          withWarmUpKeptFirst(draft, {
            ...draft,
            rounds: moveItem(draft.rounds, fromIndex, toIndex),
          }),
        null,
      ),
    removeRound: (roundIndex) =>
      editDraft(
        (draft) =>
          withWarmUpKeptFirst(draft, {
            ...draft,
            rounds: removeAt(draft.rounds, roundIndex),
          }),
        null,
      ),
    addQuestion: (roundIndex) =>
      editDraft((draft) => withRound(draft, roundIndex, withNewQuestion), null),
    addQuestionAt: (roundIndex, insertAt) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) =>
            withNewQuestionAt(round, insertAt),
          ),
        null,
      ),
    updateQuestion: (roundIndex, questionIndex, question, mediaUrl) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) => ({
            ...round,
            questions: round.questions.map((draftQuestion, index) =>
              index === questionIndex
                ? {
                    ...draftQuestion,
                    question,
                    mediaUrl:
                      mediaUrl === undefined
                        ? draftQuestion.mediaUrl
                        : mediaUrl,
                  }
                : draftQuestion,
            ),
          })),
        coalesceKeyOf("updateQuestion", roundIndex, questionIndex),
      ),
    moveQuestion: (roundIndex, fromIndex, toIndex) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) => ({
            ...round,
            questions: moveItem(round.questions, fromIndex, toIndex),
          })),
        null,
      ),
    duplicateQuestion: (roundIndex, questionIndex) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) =>
            duplicateQuestionAt(round, questionIndex),
          ),
        null,
      ),
    removeQuestion: (roundIndex, questionIndex) =>
      editDraft(
        (draft) =>
          withRound(draft, roundIndex, (round) => ({
            ...round,
            questions: removeAt(round.questions, questionIndex),
          })),
        null,
      ),
    moveQuestionToRound: (fromRoundIndex, questionIndex, toRoundIndex) =>
      editDraft(
        (draft) =>
          withQuestionMovedToRound(
            draft,
            fromRoundIndex,
            questionIndex,
            toRoundIndex,
          ),
        null,
      ),
  };
}

/** `previous` with `draft` in place, keeping only the picked previews it still holds. */
function withDraft(
  previous: DraftState,
  draft: QuizshowDraft,
  history: QuizshowDraftHistory,
): DraftState {
  return {
    ...previous,
    draft,
    history,
    pickedPreviewUrls: keepHeldPreviews(
      previous.pickedPreviewUrls,
      draft,
      history,
    ),
  };
}

/** `previous` one undo step back; the same state with nothing to undo. */
function undoneState(previous: DraftState): DraftState {
  const step = undoDraft(previous.history, previous.draft);
  return step === null
    ? previous
    : withDraft(previous, step.draft, step.history);
}

/**
 * `undoIfLatest`: the updater alone decides (on the state the undo applies
 * to) and stamps the state with the call's id when it undid; an effect then
 * runs that call's `onUndone`, once. Calls that undid nothing leave no stamp,
 * so their callback never runs and is dropped with the next stamped one.
 */
function useGuardedUndo(
  setState: Dispatch<SetStateAction<DraftState>>,
  guardedUndoId: number | null,
): NonNullable<QuizshowDraftController["undoIfLatest"]> {
  const sequenceRef = useRef(0);
  const callbacksRef = useRef(new Map<number, () => void>());
  useEffect(() => {
    if (guardedUndoId === null) return;
    const callbacks = callbacksRef.current;
    const onUndone = callbacks.get(guardedUndoId);
    for (const callId of [...callbacks.keys()]) {
      if (callId <= guardedUndoId) callbacks.delete(callId);
    }
    onUndone?.();
  }, [guardedUndoId]);
  return useCallback(
    (expectedPrevious: QuizshowDraft, onUndone?: () => void) => {
      sequenceRef.current += 1;
      const callId = sequenceRef.current;
      if (onUndone !== undefined) callbacksRef.current.set(callId, onUndone);
      setState((previous) =>
        previous.history.past.at(-1) === expectedPrevious
          ? { ...undoneState(previous), guardedUndoId: callId }
          : previous,
      );
    },
    [setState],
  );
}

/** Follows a newer server quiz (by `updatedAt`) on its own while the draft is clean; a dirty draft waits for the save. */
export function useQuizshowDraft(
  quiz: QuizshowQuiz | null,
  options: QuizshowDraftOptions = {},
): QuizshowDraftController {
  const [state, setState] = useState<DraftState>(() => stateFromQuiz(quiz));
  const isDirty = useMemo(
    () => isDraftDirty(state.draft, state.baseline),
    [state.draft, state.baseline],
  );

  // A newer server quiz arriving while the draft is clean replaces it during
  // render, so no frame paints the old quiz.
  const adopted = adoptedStateOf(quiz, state, isDirty, options);
  if (adopted !== null) setState(adopted);
  const { isMountedRef, latestStateRef } = usePickedPreviewRevoking(state);

  const editDraft = useCallback<EditDraft>((recipe, coalesceKey) => {
    // Read once, outside the updater, so a strict-mode second run records the same step.
    const now = Date.now();
    setState((previous) => {
      const draft = recipe(previous.draft);
      if (draft === previous.draft) return previous;
      // An edit that changes nothing a save sends records no step and keeps
      // what is left to redo. Its draft still lands, so a key or a picture
      // preview it carries is never lost.
      const history = isDraftDirty(draft, previous.draft)
        ? recordDraftChange(previous.history, previous.draft, coalesceKey, now)
        : previous.history;
      return withDraft(previous, draft, history);
    });
  }, []);
  const edits = useMemo(() => draftEditsOf(editDraft), [editDraft]);
  // Its own step every time: a null coalesce key never joins the step before.
  const replaceDraft = useCallback(
    (next: QuizshowDraft | ((current: QuizshowDraft) => QuizshowDraft)) =>
      editDraft(
        (current) => (typeof next === "function" ? next(current) : next),
        null,
      ),
    [editDraft],
  );
  const undo = useCallback(() => setState(undoneState), []);
  const undoIfLatest = useGuardedUndo(setState, state.guardedUndoId);
  const redo = useCallback(
    () =>
      setState((previous) => {
        const step = redoDraft(previous.history, previous.draft);
        return step === null
          ? previous
          : withDraft(previous, step.draft, step.history);
      }),
    [],
  );
  const resetTo = useCallback(
    (nextQuiz: QuizshowQuiz | null, resetOptions?: QuizshowResetOptions) =>
      setState((previous) =>
        resetOptions?.shouldKeepKeys === true
          ? stateFromQuizKeepingKeys(nextQuiz, previous)
          : stateFromQuiz(nextQuiz, previous.pickedPreviewUrls),
      ),
    [],
  );
  const rebaseTo = useCallback(
    (nextQuiz: QuizshowQuiz | null) =>
      setState((previous) => rebased(previous, nextQuiz)),
    [],
  );
  // A blank start is a fresh quiz: nothing before it to undo back to.
  const startBlank = useCallback(
    (language?: QuizshowLanguage) =>
      setState((previous) =>
        withDraft(previous, blankDraft(language), EMPTY_DRAFT_HISTORY),
      ),
    [],
  );
  const rememberPickedPreview = useCallback(
    (mediaRef: string, previewUrl: string) => {
      // A copy that lands after the builder closed, or after every question
      // holding its key dropped it (with no undo step holding it either),
      // has nothing to show it: revoke it now.
      const latest = latestStateRef.current;
      if (
        !isMountedRef.current ||
        !heldMediaRefsOf(latest.draft, latest.history).has(mediaRef)
      ) {
        URL.revokeObjectURL(previewUrl);
        return;
      }
      setState((previous) => {
        const pickedPreviewUrls = new Map(previous.pickedPreviewUrls);
        pickedPreviewUrls.set(mediaRef, previewUrl);
        return { ...previous, pickedPreviewUrls };
      });
    },
    [isMountedRef, latestStateRef],
  );

  return {
    draft: state.draft,
    isDirty,
    ...edits,
    resetTo,
    rebaseTo,
    startBlank,
    pickedPreviewUrls: state.pickedPreviewUrls,
    rememberPickedPreview,
    baselineStamp: state.baselineStamp,
    undo,
    redo,
    replaceDraft,
    undoIfLatest,
    latestUndoTarget: state.history.past.at(-1) ?? null,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  };
}
