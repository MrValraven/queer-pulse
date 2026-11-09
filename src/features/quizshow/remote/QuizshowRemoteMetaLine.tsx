import type { ReactNode } from "react";
import type { QuizshowHostState } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { stageRoundLineCopy, wheelPillCopy } from "../stage/quizshowWheelCopy";

/** The catalog key of the pick-a-question pill, which already counts the spins. */
const QUESTION_PILL_KEY = "quizshow:stage.wheel.questionPill";

/**
 * The spans of the remote header's first meta line: the quiz title in the
 * lobby, the wheel pill while the wheel is up, else the round line and the
 * question count. A slice title in the pill follows the session's screen
 * language, as the "Start {title}" button does. They sit directly under the line, which lays them out.
 */
export function QuizshowRemoteRoundLine({
  session,
}: {
  session: QuizshowHostState;
}): ReactNode {
  const { t } = useTranslation();
  const { cursor, round, question, wheel, quizTitle, screenLanguage } = session;
  if (cursor.phase === "lobby") return <span>{quizTitle}</span>;
  if (cursor.phase === "wheel" && wheel !== null) {
    const pillCopy = wheelPillCopy(wheel);
    return <span>{t(pillCopy.key, pillCopy.values)}</span>;
  }
  if (round === null) return null;
  const roundLineCopy = stageRoundLineCopy(
    cursor,
    wheel,
    session.rounds,
    screenLanguage,
    t,
  );
  const isSpinCounted = roundLineCopy.key === QUESTION_PILL_KEY;
  return (
    <>
      <span>{t(roundLineCopy.key, roundLineCopy.values)}</span>
      {!isSpinCounted && question !== null && (
        <span>
          {t("quizshow:stage.questionOf", {
            number: question.questionIndex + 1,
            total: round.questionCount,
          })}
        </span>
      )}
    </>
  );
}
