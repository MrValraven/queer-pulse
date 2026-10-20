import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  QuizshowLanguage,
  QuizshowQuestionInput,
  QuizshowQuiz,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  changeRoundKind as changeDraftRoundKind,
  draftFromQuiz,
  duplicateQuestionAt,
  isDraftDirty,
  moveItem,
  newQuestion,
  newRound,
  removeAt,
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
  addRound: (kind: QuizshowRoundKind) => void;
  updateRound: (
    roundIndex: number,
    patch: Partial<
      Pick<QuizshowDraftRound, "title" | "contentLabel" | "settings">
    >,
  ) => void;
  changeRoundKind: (roundIndex: number, kind: QuizshowRoundKind) => void;
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
  /** A new baseline from the server (after load, save or import); the draft follows it. */
  resetTo: (quiz: QuizshowQuiz | null) => void;
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

/** Follows a newer server quiz (by `updatedAt`) on its own while the draft is clean; a dirty draft waits for the save. */
export function useQuizshowDraft(
  quiz: QuizshowQuiz | null,
): QuizshowDraftController {
  const [state, setState] = useState<DraftState>(() => stateFromQuiz(quiz));
  const isDirty = useMemo(
    () => isDraftDirty(state.draft, state.baseline),
    [state.draft, state.baseline],
  );

  // A newer server quiz arriving while the draft is clean replaces it during
  // render, so no frame paints the old quiz.
  if (quiz && isNewerThan(quiz, state.baselineStamp) && !isDirty) {
    setState(stateFromQuiz(quiz, state.pickedPreviewUrls));
  }
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
    (kind: QuizshowRoundKind) =>
      editDraft((draft) => ({
        ...draft,
        rounds: [...draft.rounds, newRound(kind)],
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
    (roundIndex: number, kind: QuizshowRoundKind) =>
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
      editDraft((draft) =>
        withRound(draft, roundIndex, (round) => ({
          ...round,
          questions: [
            ...round.questions,
            {
              draftKey: `${round.draftKey}-question-${crypto.randomUUID()}`,
              question: newQuestion(
                round.kind === "quiz" ? "multiple_choice" : "prompt",
                round.kind,
              ),
              mediaUrl: null,
            },
          ],
        })),
      ),
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
    (nextQuiz: QuizshowQuiz | null) =>
      setState((previous) =>
        stateFromQuiz(nextQuiz, previous.pickedPreviewUrls),
      ),
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
    startBlank,
    pickedPreviewUrls: state.pickedPreviewUrls,
    rememberPickedPreview,
  };
}
