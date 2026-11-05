import { API_BASE_URL } from "../../../shared/api/config";
import type { QuizshowQuiz } from "../../../shared/contracts/quizshow";
import { quizFromInput } from "../api/quizshowDemoStore";
import {
  draftToInput,
  type QuizshowDraft,
  type QuizshowDraftQuestion,
} from "./quizshowDraft";

export const DRY_RUN_ID = "dry-run";
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

/** The draft as a playable quiz, its pictures pointing at loadable URLs. */
export function dryRunQuizOf(
  draft: QuizshowDraft,
  pickedPreviewUrls: ReadonlyMap<string, string>,
): QuizshowQuiz {
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
