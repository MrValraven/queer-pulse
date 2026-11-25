import type { QuizshowPlayerState } from "../../../shared/contracts/quizshow";
import type { TFunction } from "../../../shared/i18n/types";

/** "9 of 14 answered" once the player's own answer to this question is acked (C6.21);
 *  null before the ack and while the count is unknown. */
export function answeredLineOf(
  player: QuizshowPlayerState | null,
  questionId: string,
  translate: TFunction,
): string | null {
  if (player === null || player.answerCount === null) return null;
  if (player.myAnswer?.questionId !== questionId) return null;
  return translate("quizshow:player.answeredCount", {
    count: player.answerCount.count,
    total: player.answerCount.total,
  });
}
