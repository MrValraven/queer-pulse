import { FiShield } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingPublicQuestion } from "./directoryPlaces";
import s from "./DirectoryQuestions.module.css";

interface Props {
  question: ListingPublicQuestion;
  /** The listing's name, used as the byline when the business itself answered. */
  placeName: string;
}

/**
 * The answer under a question, attributed to whoever actually wrote it.
 *
 * A moderator's answer and the business's answer never look alike: the
 * business gets the plum house block bylined with its own name, a moderator
 * gets a separate jade block, a shield icon, the moderator byline and one line
 * of plain text saying a QueerPulse moderator wrote it and the business has
 * stayed quiet. The attribution is words plus shape, so it survives greyscale
 * and screen readers alike.
 *
 * An unanswered question renders a calm waiting line. That is an ordinary
 * state for a fresh question, so it is written as information, with nothing
 * held against the business.
 */
export function DirectoryQuestionAnswer({ question, placeName }: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (!question.answer) {
    return (
      <p className={s.awaiting}>
        {t("marketing:directory.detail.questions.awaitingAnswer")}
      </p>
    );
  }

  const isModeratorAnswer = question.answeredByRole === "moderator";
  const answeredAt = question.answeredAt ? new Date(question.answeredAt) : null;
  const hasDate = answeredAt !== null && !Number.isNaN(answeredAt.getTime());

  return (
    <div className={isModeratorAnswer ? s.answerModerator : s.answerOwner}>
      <div className={s.answerHead}>
        <span className={s.answerBy}>
          {isModeratorAnswer && <FiShield aria-hidden />}
          {isModeratorAnswer
            ? t("marketing:directory.detail.questions.answeredByModerator")
            : t("marketing:directory.detail.questions.answeredByOwner", {
                name: placeName,
              })}
        </span>
        {hasDate && (
          <time className={s.answerDate} dateTime={question.answeredAt ?? ""}>
            {fmt.date(answeredAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        )}
      </div>
      <div className={s.answerText}>{question.answer}</div>
      {isModeratorAnswer && (
        <p className={s.answerNote}>
          {t("marketing:directory.detail.questions.moderatorNote")}
        </p>
      )}
    </div>
  );
}
