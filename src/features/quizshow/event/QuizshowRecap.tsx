import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowRecap as QuizshowRecapData,
  QuizshowRecapQuestion,
} from "../../../shared/contracts/quizshow";
import styles from "./QuizshowEvent.module.css";

interface QuizshowRecapProps {
  recap: QuizshowRecapData;
  language: QuizshowLanguage;
}

function promptFor(
  question: QuizshowRecapQuestion,
  language: QuizshowLanguage,
): string {
  const otherLanguage = language === "en" ? "pt" : "en";
  return question.prompt[language] || question.prompt[otherLanguage];
}

function RecapRow({
  question,
  language,
}: {
  question: QuizshowRecapQuestion;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { percentCorrect, averageAnswerMs, wasSkipped } = question;
  let detail;
  if (wasSkipped) {
    detail = (
      <span className={styles.recapTag}>
        {t("quizshow:results.recap.skipped")}
      </span>
    );
  } else if (percentCorrect === null) {
    detail = (
      <span className={styles.recapTag}>
        {t("quizshow:results.recap.party")}
      </span>
    );
  } else {
    detail = (
      <>
        <span className={styles.recapBar} aria-hidden="true">
          <span
            className={styles.recapBarFill}
            style={{ width: `${percentCorrect}%` }}
          />
        </span>
        <span className={styles.recapFigures}>
          {t("quizshow:results.recap.correct", { percent: percentCorrect })}
          {averageAnswerMs !== null &&
            ` · ${t("quizshow:results.recap.averageTime", {
              seconds: format.number(averageAnswerMs / 1000, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }),
            })}`}
        </span>
      </>
    );
  }
  return (
    <li className={styles.recapRow}>
      <span className={styles.recapPrompt}>
        {promptFor(question, language)}
      </span>
      {detail}
    </li>
  );
}

/** Totals for hosts, with how each question went. */
export function QuizshowRecap({ recap, language }: QuizshowRecapProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.recap}>
      <h3 className={styles.recapTitle}>{t("quizshow:results.recap.title")}</h3>
      <p className={styles.recapSub}>{t("quizshow:results.recap.sub")}</p>
      <p className={styles.recapTotals}>
        {t("quizshow:results.recap.questions", {
          count: recap.questionsPlayed,
        })}
        {" · "}
        {t("quizshow:results.recap.answers", { count: recap.answersGiven })}
      </p>
      <ol className={styles.recapList}>
        {recap.questions.map((question) => (
          <RecapRow
            key={`${question.roundIndex}-${question.questionIndex}`}
            question={question}
            language={language}
          />
        ))}
      </ol>
    </div>
  );
}
