import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  QuizshowLanguage,
  QuizshowQuestionInput,
  QuizshowQuiz,
  QuizshowPlayableRoundKind,
} from "../../../shared/contracts/quizshow";
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
   * revoked once no question of the draft holds the key (a question drops or
   * replaces its picture, is removed, or a reset or import leaves the key
   * out), and when the builder unmounts. A duplicated question shares the key,
   * so the preview lives while either copy holds it.
   */
  rememberPickedPreview: (mediaRef: string, previewUrl: string) => void;
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

/** The picked previews whose key a question of `draft` still holds. */
function keepHeldPreviews(
  previews: PickedPreviewUrls,
  draft: QuizshowDraft,
): PickedPreviewUrls {
  if (previews.size === 0) return previews;
  const heldMediaRefs = mediaRefsOf(draft);
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

/** A reset that keeps the previous draft's keys (see `QuizshowResetOptions`). */
function stateFromQuizKeepingKeys(
  quiz: QuizshowQuiz | null,
  previous: DraftState,
): DraftState {
  const fresh = stateFromQuiz(quiz, previous.pickedPreviewUrls);
  const baseline = withKeysOf(fresh.baseline, previous.draft);
  return { ...fresh, baseline, draft: structuredClone(baseline) };
}

/**
 * Revokes each picked preview the moment it leaves the map, and every one
 * still kept when the builder unmounts. Also tracks the committed draft, so a
 * copy that arrives late can see whether a question still holds its key.
 */
function usePickedPreviewRevoking(
  previews: PickedPreviewUrls,
  draft: QuizshowDraft,
) {
  const ownedPreviewsRef = useRef(previews);
  const isMountedRef = useRef(false);
  const latestDraftRef = useRef(draft);

  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

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

  return { isMountedRef, latestDraftRef };
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
  const { isMountedRef, latestDraftRef } = usePickedPreviewRevoking(
    state.pickedPreviewUrls,
    state.draft,
  );

  const editDraft = useCallback(
    (recipe: (draft: QuizshowDraft) => QuizshowDraft) => {
      setState((previous) => {
        const draft = recipe(previous.draft);
        return {
          ...previous,
          draft,
          pickedPreviewUrls: keepHeldPreviews(
            previous.pickedPreviewUrls,
            draft,
          ),
        };
      });
    },
    [],
  );

  const setQuizField = useCallback<QuizshowDraftController["setQuizField"]>(
    (key, value) => editDraft((draft) => ({ ...draft, [key]: value })),
    [editDraft],
  );
  const addRound = useCallback(
    (kind: QuizshowPlayableRoundKind) =>
      editDraft((draft) => ({
        ...draft,
        rounds: [...draft.rounds, newRound(kind)],
      })),
    [editDraft],
  );
  const addWheel = useCallback(
    () =>
      editDraft((draft) => ({
        ...draft,
        rounds: [...draft.rounds, newWheel()],
      })),
    [editDraft],
  );
  const updateRound = useCallback<QuizshowDraftController["updateRound"]>(
    (roundIndex, patch) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) => ({ ...round, ...patch })),
      ),
    [editDraft],
  );
  const changeRoundKind = useCallback(
    (roundIndex: number, kind: QuizshowPlayableRoundKind) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) =>
          changeDraftRoundKind(round, kind),
        ),
      ),
    [editDraft],
  );
  const moveRound = useCallback(
    (fromIndex: number, toIndex: number) =>
      editDraft((draft) => ({
        ...draft,
        rounds: moveItem(draft.rounds, fromIndex, toIndex),
      })),
    [editDraft],
  );
  const removeRound = useCallback(
    (roundIndex: number) =>
      editDraft((draft) => ({
        ...draft,
        rounds: removeAt(draft.rounds, roundIndex),
      })),
    [editDraft],
  );
  const addQuestion = useCallback(
    (roundIndex: number) =>
      editDraft((draft) => withRound(draft, roundIndex, withNewQuestion)),
    [editDraft],
  );
  const updateQuestion = useCallback<QuizshowDraftController["updateQuestion"]>(
    (roundIndex, questionIndex, question, mediaUrl) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) => ({
          ...round,
          questions: round.questions.map((draftQuestion, index) =>
            index === questionIndex
              ? {
                  ...draftQuestion,
                  question,
                  mediaUrl:
                    mediaUrl === undefined ? draftQuestion.mediaUrl : mediaUrl,
                }
              : draftQuestion,
          ),
        })),
      ),
    [editDraft],
  );
  const moveQuestion = useCallback(
    (roundIndex: number, fromIndex: number, toIndex: number) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) => ({
          ...round,
          questions: moveItem(round.questions, fromIndex, toIndex),
        })),
      ),
    [editDraft],
  );
  const duplicateQuestion = useCallback(
    (roundIndex: number, questionIndex: number) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) =>
          duplicateQuestionAt(round, questionIndex),
        ),
      ),
    [editDraft],
  );
  const removeQuestion = useCallback(
    (roundIndex: number, questionIndex: number) =>
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) => ({
          ...round,
          questions: removeAt(round.questions, questionIndex),
        })),
      ),
    [editDraft],
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
  const startBlank = useCallback(
    (language?: QuizshowLanguage) => editDraft(() => blankDraft(language)),
    [editDraft],
  );
  const rememberPickedPreview = useCallback(
    (mediaRef: string, previewUrl: string) => {
      // A copy that lands after the builder closed, or after every question
      // holding its key dropped it, has nothing to show it: revoke it now.
      if (
        !isMountedRef.current ||
        !mediaRefsOf(latestDraftRef.current).has(mediaRef)
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
    [isMountedRef, latestDraftRef],
  );

  return {
    draft: state.draft,
    isDirty,
    setQuizField,
    addRound,
    addWheel,
    updateRound,
    changeRoundKind,
    moveRound,
    removeRound,
    addQuestion,
    updateQuestion,
    moveQuestion,
    duplicateQuestion,
    removeQuestion,
    resetTo,
    rebaseTo,
    startBlank,
    pickedPreviewUrls: state.pickedPreviewUrls,
    rememberPickedPreview,
    baselineStamp: state.baselineStamp,
  };
}
