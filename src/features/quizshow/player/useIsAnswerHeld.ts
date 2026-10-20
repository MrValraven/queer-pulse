import {
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
} from "../../../shared/contracts/quizshow";
import { useNow } from "../../gatherings/checkin/useNow";
import { ownDeadlineOf, serverNow } from "../realtime/quizshowClock";

const HELD_REFRESH_MS = 250;

/** True while the game is paused, or once the player's own deadline plus the grace
 *  window has passed on the server's clock. Answer and vote buttons stay focusable
 *  with aria-disabled and send nothing while held. */
export function useIsAnswerHeld(
  cursor: QuizshowCursor | null,
  clockOffsetMs: number,
  hasExtraTime: boolean,
): boolean {
  const clientNow = useNow(HELD_REFRESH_MS).getTime();
  if (cursor === null) return false;
  if (cursor.status === "paused") return true;
  const ownDeadline = ownDeadlineOf(cursor, hasExtraTime);
  if (ownDeadline === null) return false;
  return (
    serverNow(clientNow, clockOffsetMs) >
    ownDeadline + QUIZSHOW_LIMITS.answerGraceMs
  );
}
