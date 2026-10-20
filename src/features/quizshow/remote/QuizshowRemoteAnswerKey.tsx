import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowAnswerKeyView,
  QuizshowHostQuestionView,
  QuizshowLanguage,
  QuizshowOption,
} from "../../../shared/contracts/quizshow";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";
import { answerSwatchFor, trueFalseSwatchFor } from "../quizshowSwatches";
import styles from "./QuizshowRemote.module.css";

interface AnswerKeyBodyProps {
  answerKey: QuizshowAnswerKeyView;
  options: QuizshowOption[];
  language: QuizshowLanguage;
}

/** Multiple choice and true or false: every tile, the right one ringed and named as correct. */
function AnswerKeyTiles({ answerKey, options, language }: AnswerKeyBodyProps) {
  const { t } = useTranslation();
  const correctIndex =
    answerKey.type === "multiple_choice" ? answerKey.correctIndex : null;
  const correctTruth =
    answerKey.type === "true_false" ? answerKey.isTrue : null;
  const tiles =
    correctIndex !== null
      ? options.map((option, optionIndex) => ({
          id: option.id,
          swatch: answerSwatchFor(optionIndex),
          letter: optionLetter(optionIndex),
          text: pickQuizshowText(option.text, language),
          isCorrect: optionIndex === correctIndex,
        }))
      : [true, false].map((isTrue, optionIndex) => ({
          id: String(isTrue),
          swatch: trueFalseSwatchFor(isTrue),
          letter: optionLetter(optionIndex),
          text: t(
            isTrue
              ? "quizshow:questions.trueFalse.true"
              : "quizshow:questions.trueFalse.false",
          ),
          isCorrect: correctTruth === isTrue,
        }));
  return (
    <div className={styles.tiles}>
      {tiles.map((tile) => {
        const answerLabel = t("quizshow:stage.answerLabel", {
          letter: tile.letter,
          shape: t(tile.swatch.labelKey),
          text: tile.text,
        });
        return (
          <QuizshowAnswerTile
            key={tile.id}
            colorKey={tile.swatch.colorKey}
            letter={tile.letter}
            text={tile.text}
            size="phone"
            state={tile.isCorrect ? "correct" : "dimmed"}
            ariaLabel={
              tile.isCorrect
                ? `${t("quizshow:stage.correctAnswer")}, ${answerLabel}`
                : answerLabel
            }
          />
        );
      })}
    </div>
  );
}

function AnswerKeyBody({ answerKey, options, language }: AnswerKeyBodyProps) {
  const { t } = useTranslation();
  const format = useFormat();
  switch (answerKey.type) {
    case "multiple_choice":
    case "true_false":
      return (
        <AnswerKeyTiles
          answerKey={answerKey}
          options={options}
          language={language}
        />
      );
    case "type_answer":
      return (
        <>
          <p className={styles.keyText}>
            {pickQuizshowText(answerKey.text, language)}
          </p>
          {answerKey.acceptedAnswers.length > 0 && (
            <p className={styles.hint}>
              {t("quizshow:questions.typeAnswer.accepted")}:{" "}
              {answerKey.acceptedAnswers.join(", ")}
            </p>
          )}
        </>
      );
    case "order":
      return (
        <ol className={styles.keyList}>
          {answerKey.orderedIds.map((optionId) => {
            const shownIndex = options.findIndex(
              (option) => option.id === optionId,
            );
            const option = options[shownIndex];
            // An id the shown options lack has no letter or text to show.
            if (option === undefined) return null;
            return (
              <li key={optionId}>
                <span className={styles.keyLetter}>
                  {optionLetter(shownIndex)}
                </span>{" "}
                {pickQuizshowText(option.text, language)}
              </li>
            );
          })}
        </ol>
      );
    case "closest_number":
      return (
        <p className={`${styles.keyText} ${styles.count}`}>
          {format.number(answerKey.value)}
        </p>
      );
    case "lie_detector":
      return (
        <>
          <p className={styles.hint}>{t("quizshow:stage.theTruth")}</p>
          <p className={styles.keyText}>
            {pickQuizshowText(answerKey.truth, language)}
          </p>
        </>
      );
  }
}

/** The answer for hosts, from the question's first phase. Renders nothing on Caption This and Drag Name. */
export function QuizshowRemoteAnswerKey({
  question,
  language,
}: {
  question: QuizshowHostQuestionView;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const { answerKey } = question;
  if (answerKey === null) return null;
  return (
    <section
      className={styles.section}
      aria-labelledby="quizshow-remote-answer-key"
    >
      <h2 id="quizshow-remote-answer-key" className={styles.sectionTitle}>
        {t("quizshow:remote.answerKey")}
      </h2>
      <p className={styles.rowText}>
        {pickQuizshowText(question.prompt, language)}
      </p>
      <AnswerKeyBody
        answerKey={answerKey}
        options={question.options ?? []}
        language={language}
      />
    </section>
  );
}
