import type { ReactNode } from "react";
import { FiCheck, FiImage } from "react-icons/fi";
import type {
  QuizshowLanguageMode,
  QuizshowQuiz,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  closestBandCopyOf,
  numberWithUnit,
} from "../screen/quizshowScreenTileModel";
import {
  pickQuizshowText,
  pickQuizshowTextWithLanguage,
  primaryLanguageOf,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  buildAnswerSheets,
  buildHostSheet,
  type QuizshowPrintAnswer,
  type QuizshowPrintAnswerLine,
  type QuizshowPrintAnswerRound,
  type QuizshowPrintHostRound,
  type QuizshowPrintHostRow,
  type QuizshowPrintOption,
  type QuizshowPrintTiming,
} from "./quizshowPrintModel";
import styles from "./QuizshowPrint.module.css";

interface QuizshowPrintTextProps {
  text: QuizshowText;
  languages: QuizshowLanguageMode;
  className?: string;
}

/** Whether a bilingual quiz prints this text as two lines (both sides filled and different). */
function isTwoLanguageText(
  text: QuizshowText,
  languages: QuizshowLanguageMode,
): boolean {
  const englishText = text.en.trim();
  const portugueseText = text.pt.trim();
  return (
    languages === "both" &&
    englishText !== "" &&
    portugueseText !== "" &&
    englishText !== portugueseText
  );
}

/** A quiz text in the quiz's language; a bilingual quiz prints the EN line, then the PT line. */
function QuizshowPrintText({
  text,
  languages,
  className,
}: QuizshowPrintTextProps) {
  if (isTwoLanguageText(text, languages)) {
    return (
      <span className={className}>
        <span lang="en" className={styles.line}>
          {text.en}
        </span>
        <span lang="pt" className={styles.secondLine}>
          {text.pt}
        </span>
      </span>
    );
  }
  const picked = pickQuizshowTextWithLanguage(
    text,
    primaryLanguageOf(languages),
  );
  return (
    <span className={className} lang={picked.language}>
      {picked.text}
    </span>
  );
}

/** A short inline text (a unit) in one string: "years / anos" for a bilingual quiz. */
function inlineTextOf(
  text: QuizshowText,
  languages: QuizshowLanguageMode,
): string {
  if (isTwoLanguageText(text, languages))
    return `${text.en.trim()} / ${text.pt.trim()}`;
  return pickQuizshowText(text, primaryLanguageOf(languages)).trim();
}

function QuizshowPrintAnswerValue({
  answer,
  languages,
}: {
  answer: QuizshowPrintAnswer;
  languages: QuizshowLanguageMode;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAnswer = quizshowAnswerNumberFormatter(format.number);
  switch (answer.kind) {
    case "options":
      return (
        <span className={styles.answerLetters}>
          {answer.letters.join(", ")}
        </span>
      );
    case "order":
      // Numbered so the line reads as a sequence: "1 C, 2 A, 3 B".
      return (
        <span className={styles.answerLetters}>
          {answer.letters
            .map((letter, letterIndex) => `${letterIndex + 1} ${letter}`)
            .join(", ")}
        </span>
      );
    case "trueFalse":
      return (
        <span>
          {t(
            answer.isTrue
              ? "quizshow:questions.trueFalse.true"
              : "quizshow:questions.trueFalse.false",
          )}
        </span>
      );
    case "typed":
      return (
        <span className={styles.answerStack}>
          <QuizshowPrintText text={answer.text} languages={languages} />
          {answer.acceptedAnswers.length > 0 && (
            <span className={styles.muted}>
              {t("quizshow:questions.typeAnswer.accepted")}:{" "}
              {answer.acceptedAnswers.join(", ")}
            </span>
          )}
        </span>
      );
    case "closest":
      return (
        <QuizshowPrintText
          text={numberWithUnit(formatAnswer(answer.value), answer.unit)}
          languages={languages}
        />
      );
    case "truth":
      return <QuizshowPrintText text={answer.text} languages={languages} />;
    case "poll":
      return <span>{t("quizshow:type.pollHint")}</span>;
    case "none":
      return (
        <span className={styles.muted}>{t("quizshow:print.noAnswer")}</span>
      );
    default: {
      const unknownAnswer: never = answer;
      return unknownAnswer;
    }
  }
}

function useTimingText(timing: QuizshowPrintTiming): string {
  const { t } = useTranslation();
  const format = useFormat();
  const seconds = (value: number) =>
    format.number(value, { maximumFractionDigits: 1 });
  if (timing.kind === "party") {
    return t("quizshow:print.timingParty", {
      write: seconds(timing.writeSeconds),
      vote: seconds(timing.voteSeconds),
    });
  }
  const values = {
    read: seconds(timing.readSeconds),
    limit: seconds(timing.limitSeconds),
  };
  return timing.talkSeconds > 0
    ? t("quizshow:print.timingQuizTalk", {
        ...values,
        talk: seconds(timing.talkSeconds),
      })
    : t("quizshow:print.timingQuiz", values);
}

/** The margin copy of a closest-number answer, its unit in every language the quiz prints; null on other answers. */
function useMarginText(
  answer: QuizshowPrintAnswer,
  languages: QuizshowLanguageMode,
): string | null {
  const { t } = useTranslation();
  const format = useFormat();
  if (answer.kind !== "closest") return null;
  const copy = closestBandCopyOf(
    answer.tolerance,
    format.number(answer.tolerance.amount),
    inlineTextOf(answer.unit, languages),
  );
  return copy === null
    ? t("quizshow:questions.tolerance.exact")
    : t(copy.key, copy.values);
}

function QuizshowPrintOptionList({
  options,
  languages,
}: {
  options: QuizshowPrintOption[];
  languages: QuizshowLanguageMode;
}) {
  return (
    <ul className={styles.optionList}>
      {options.map((option) => (
        <li
          key={option.letter}
          className={
            option.isCorrect
              ? `${styles.optionItem} ${styles.optionCorrect}`
              : styles.optionItem
          }
        >
          <span className={styles.letter}>{option.letter}</span>
          <QuizshowPrintText text={option.text} languages={languages} />
          {option.isCorrect && (
            <FiCheck aria-hidden="true" className={styles.optionCheck} />
          )}
        </li>
      ))}
    </ul>
  );
}

function QuizshowPrintFact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

function QuizshowPrintHostQuestion({
  row,
  languages,
}: {
  row: QuizshowPrintHostRow;
  languages: QuizshowLanguageMode;
}) {
  const { t } = useTranslation();
  const timingText = useTimingText(row.timing);
  const marginText = useMarginText(row.answer, languages);
  const { answer, picture } = row;
  const hasAnswerLine = !(answer.kind === "none" && !answer.isMissing);

  return (
    <li className={styles.hostQuestion}>
      <span className={styles.questionNumber}>{row.questionNumber}</span>
      <div className={styles.hostBody}>
        {picture !== null && (
          <span className={styles.picture}>
            <FiImage aria-hidden="true" className={styles.pictureIcon} />
            {picture.alt === null ? (
              t("quizshow:print.pictureQuestion")
            ) : (
              <QuizshowPrintText text={picture.alt} languages={languages} />
            )}
          </span>
        )}
        <QuizshowPrintText
          text={row.prompt}
          languages={languages}
          className={styles.prompt}
        />
        {row.options.length > 0 && (
          <QuizshowPrintOptionList
            options={row.options}
            languages={languages}
          />
        )}
        <dl className={styles.facts}>
          {hasAnswerLine && (
            <QuizshowPrintFact label={t("quizshow:print.answer")}>
              <QuizshowPrintAnswerValue answer={answer} languages={languages} />
            </QuizshowPrintFact>
          )}
          {marginText !== null && (
            <QuizshowPrintFact label={t("quizshow:print.margin")}>
              {marginText}
            </QuizshowPrintFact>
          )}
          {row.note !== null && (
            <QuizshowPrintFact label={t("quizshow:print.note")}>
              <QuizshowPrintText text={row.note} languages={languages} />
            </QuizshowPrintFact>
          )}
          <QuizshowPrintFact label={t("quizshow:print.timing")}>
            {timingText}
          </QuizshowPrintFact>
        </dl>
      </div>
    </li>
  );
}

function QuizshowPrintRoundHeading({
  round,
  languages,
}: {
  round: QuizshowPrintHostRound | QuizshowPrintAnswerRound;
  languages: QuizshowLanguageMode;
}) {
  const { t } = useTranslation();
  return (
    <h2 className={styles.roundTitle}>
      <span className={styles.roundNumber}>
        {t("quizshow:print.round", { number: round.roundNumber })}
      </span>
      <QuizshowPrintText text={round.title} languages={languages} />
      <span className={styles.roundKind}>
        {t(`quizshow:kind.${round.kind}.name`)}
        {round.isWarmUp && ` · ${t("quizshow:stage.warmUp")}`}
      </span>
    </h2>
  );
}

/** Every playable question with its options, answer, margin, note and timing (item 62). */
export function QuizshowPrintHostSheet({ quiz }: { quiz: QuizshowQuiz }) {
  const { t } = useTranslation();
  const rounds = buildHostSheet(quiz);
  return (
    <article className={styles.sheet} data-print-sheet="host">
      <header className={styles.sheetHeader}>
        <p className={styles.eyebrow}>{t("quizshow:print.hostTitle")}</p>
        <h1 className={styles.sheetTitle}>{quiz.title}</h1>
      </header>
      {rounds.map((round) => (
        <section key={round.roundIndex} className={styles.hostRound}>
          <QuizshowPrintRoundHeading round={round} languages={quiz.languages} />
          <ol className={styles.hostQuestions}>
            {round.rows.map((row) => (
              <QuizshowPrintHostQuestion
                key={row.questionId}
                row={row}
                languages={quiz.languages}
              />
            ))}
          </ol>
        </section>
      ))}
    </article>
  );
}

function QuizshowPrintAnswerBoxes({ line }: { line: QuizshowPrintAnswerLine }) {
  const { t } = useTranslation();
  if (line.kind === "write") return <span className={styles.writeLine} />;
  const labels =
    line.kind === "letters"
      ? line.letters
      : [
          t("quizshow:questions.trueFalse.true"),
          t("quizshow:questions.trueFalse.false"),
        ];
  return (
    <span className={styles.letterBoxes}>
      {labels.map((label) => (
        <span
          key={label}
          className={
            line.kind === "letters"
              ? styles.letterBox
              : `${styles.letterBox} ${styles.wordBox}`
          }
        >
          {label}
        </span>
      ))}
    </span>
  );
}

function QuizshowPrintAnswerPage({
  round,
  quiz,
}: {
  round: QuizshowPrintAnswerRound;
  quiz: QuizshowQuiz;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.answerPage}>
      <header className={styles.answerHeader}>
        <p className={styles.eyebrow}>
          {t("quizshow:print.answersTitle")} · {quiz.title}
        </p>
        <div className={styles.teamLine}>
          <span className={styles.teamLabel}>
            {t("quizshow:print.teamName")}
          </span>
          <span className={styles.writeLine} />
        </div>
      </header>
      <QuizshowPrintRoundHeading round={round} languages={quiz.languages} />
      <ol className={styles.answerLines}>
        {round.lines.map((line) => (
          <li key={line.questionNumber} className={styles.answerLine}>
            <span className={styles.questionNumber}>{line.questionNumber}</span>
            <QuizshowPrintAnswerBoxes line={line} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** One page per round for a team to fill in on paper (item 62). */
export function QuizshowPrintAnswerSheets({ quiz }: { quiz: QuizshowQuiz }) {
  const { t } = useTranslation();
  const rounds = buildAnswerSheets(quiz);
  return (
    <article className={styles.answerSheets} data-print-sheet="answers">
      <h1 className="visuallyHidden">
        {t("quizshow:print.answersTitle")} · {quiz.title}
      </h1>
      {rounds.map((round) => (
        <QuizshowPrintAnswerPage
          key={round.roundIndex}
          round={round}
          quiz={quiz}
        />
      ))}
    </article>
  );
}
