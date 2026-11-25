import { API_BASE_URL } from "../../../shared/api/config";
import type { QuizshowQuiz } from "../../../shared/contracts/quizshow";
import { quizFromInput } from "../api/quizshowDemoStore";
import { isWheelRoundKind } from "../quizshowWheel";
import {
  draftToInput,
  type QuizshowDraft,
  type QuizshowDraftQuestion,
} from "./quizshowDraft";
import type {
  QuizshowLocalProblem,
  QuizshowLocalProblemCode,
} from "./quizshowValidation";

export const DRY_RUN_ID = "dry-run";

/** Part of the draft to try (item 21): one round, from one of its questions on. */
export interface QuizshowDryRunSlice {
  roundIndex: number;
  /** Left out: the round from its first question. */
  fromQuestionIndex?: number;
}

/**
 * Problems that belong to the whole quiz and never to a slice: the 18+ check
 * is about the event (the full try-out leaves it open too), and a sliced
 * round always opens the try-out, so a warm-up anywhere plays first.
 */
const WHOLE_QUIZ_CODES: readonly QuizshowLocalProblemCode[] = [
  "adults_round_needs_adults_event",
  "warm_up_not_first",
];
/** A URL an `<img>` can already load, local `blob:` previews included. */
const LOADABLE_URL_PATTERN = /^(?:https?:|blob:|data:|\/)/;

/**
 * The question's picture as something an `<img>` can load. The draft keeps
 * the URL the server resolved for a saved picture; a picture picked in this
 * edit is a bare `event-cover` key, which the API serves at `/files/<key>`
 * (the same rule as the event cover preview in EditDetailsPreview). In demo a
 * fresh pick's key is already a `blob:` URL. The draft's own copy of a
 * picture picked in this edit comes first: the picture field revokes its own
 * `blob:` URL once the question closes, so that key may no longer load.
 */
function pictureUrlOf(
  draftQuestion: QuizshowDraftQuestion | undefined,
  pickedPreviewUrls: ReadonlyMap<string, string>,
) {
  const key = draftQuestion?.question.mediaRef?.trim() ?? "";
  if (!draftQuestion || !key) return null;
  const pickedPreviewUrl = draftQuestion.question.mediaRef
    ? pickedPreviewUrls.get(draftQuestion.question.mediaRef)
    : undefined;
  if (pickedPreviewUrl !== undefined) return pickedPreviewUrl;
  if (draftQuestion.mediaUrl !== null) return draftQuestion.mediaUrl;
  if (LOADABLE_URL_PATTERN.test(key) || !API_BASE_URL) return key;
  return `${API_BASE_URL}/files/${key}`;
}

/**
 * The draft cut to the slice: that one round, from the slice's question on.
 * A round inside a wheel's range plays as a plain round, since the wheel row
 * stays out. Without a slice the draft is returned as it is.
 */
export function dryRunDraftOf(
  draft: QuizshowDraft,
  slice?: QuizshowDryRunSlice,
): QuizshowDraft {
  if (slice === undefined) return draft;
  const round = draft.rounds[slice.roundIndex];
  if (round === undefined) return { ...draft, rounds: [] };
  return {
    ...draft,
    rounds: [
      {
        ...round,
        questions: round.questions.slice(slice.fromQuestionIndex ?? 0),
      },
    ],
  };
}

/**
 * What blocks trying the slice, read from problems the caller already has
 * for the whole draft (the studio's own list): the round's own problems (an
 * empty round, too many questions) and those of its questions from the
 * slice's question on. A wheel row, or a slice past the round's last
 * question, has nothing to play and reads as an empty round.
 */
export function sliceProblemsOf(
  problems: readonly QuizshowLocalProblem[],
  draft: QuizshowDraft,
  slice: QuizshowDryRunSlice,
): QuizshowLocalProblem[] {
  const round = draft.rounds[slice.roundIndex];
  const fromQuestionIndex = slice.fromQuestionIndex ?? 0;
  const hasNoQuestionToPlay =
    round === undefined ||
    isWheelRoundKind(round.kind) ||
    round.questions.length <= fromQuestionIndex;
  if (hasNoQuestionToPlay) {
    return [
      {
        code: "round_empty",
        roundIndex: slice.roundIndex,
        questionIndex: null,
        language: null,
      },
    ];
  }
  return problems.filter(
    (found) =>
      found.roundIndex === slice.roundIndex &&
      !WHOLE_QUIZ_CODES.includes(found.code) &&
      (found.questionIndex === null ||
        found.questionIndex >= fromQuestionIndex),
  );
}

/** The draft, or the slice of it, as a playable quiz, its pictures pointing at loadable URLs. */
export function dryRunQuizOf(
  fullDraft: QuizshowDraft,
  pickedPreviewUrls: ReadonlyMap<string, string>,
  slice?: QuizshowDryRunSlice,
): QuizshowQuiz {
  const draft = dryRunDraftOf(fullDraft, slice);
  const quiz = quizFromInput(draftToInput(draft, null), {
    idPrefix: DRY_RUN_ID,
    updatedAt: new Date().toISOString(),
    sourceTemplateId: null,
  });
  return {
    ...quiz,
    rounds: quiz.rounds.map((round, roundIndex) => ({
      ...round,
      questions: round.questions.map((question, questionIndex) => ({
        ...question,
        mediaUrl: pictureUrlOf(
          draft.rounds[roundIndex]?.questions[questionIndex],
          pickedPreviewUrls,
        ),
      })),
    })),
  };
}
