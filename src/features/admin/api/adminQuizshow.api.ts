import { apiDelete, apiPost } from "../../../shared/api/client";

/** The staff action body: the reason goes to the moderation log, linked to the report it answers. */
export interface QuizshowStaffActionInput {
  sessionId: string;
  reason: string;
  /** The report shown in the drawer. */
  reportId?: string;
}

function staffActionBodyOf({ reason, reportId }: QuizshowStaffActionInput) {
  return reportId === undefined ? { reason } : { reason, reportId };
}

/** POST /admin/quizshow/sessions/:sessionId/end (204). Sends every player out
 *  of the reported game; the game itself stays. A reason is required (400 without it). 404 `quizshow_game_not_found`
 *  once the game is gone. */
export const endReportedQuizshowGame = (input: QuizshowStaffActionInput) =>
  apiPost<void>(
    `/admin/quizshow/sessions/${encodeURIComponent(input.sessionId)}/end`,
    staffActionBodyOf(input),
  );

/** DELETE /admin/quizshow/sessions/:sessionId/game (204). Ends an open lobby,
 *  then deletes the game. 404 `quizshow_game_not_found` once it is gone. */
export const deleteReportedQuizshowGame = (input: QuizshowStaffActionInput) =>
  apiDelete<void>(
    `/admin/quizshow/sessions/${encodeURIComponent(input.sessionId)}/game`,
    staffActionBodyOf(input),
  );
