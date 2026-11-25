import { apiGet } from "../../../shared/api/client";
import type { QuizshowWinBadgesPreviewResponse } from "../../../shared/contracts/quizWinBadges";

/** Route 11: the badges the event's next game awards, or a null preview. */
export const getQuizshowWinBadgesPreview = (
  slug: string,
): Promise<QuizshowWinBadgesPreviewResponse> =>
  apiGet<QuizshowWinBadgesPreviewResponse>(
    `/events/${encodeURIComponent(slug)}/quizshow/win-badges`,
  );
