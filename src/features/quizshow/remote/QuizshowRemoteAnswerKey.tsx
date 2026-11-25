import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowAnswerKeyView,
  QuizshowClosestTolerance,
  QuizshowHostQuestionView,
  QuizshowLanguage,
  QuizshowOption,
  QuizshowReveal,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import {
  optionLetter,
  pickQuizshowTextWithLanguage,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import styles from "./QuizshowRemote.module.css";

interface AnswerKeyBodyProps {
  answerKey: QuizshowAnswerKeyView;
  options: QuizshowOption[];
  numberUnit: QuizshowText;
  language: QuizshowLanguage;
}

/** One quiz text in an element whose `lang` is the language the words are in (item 41). */
function QuizText({
  text,
  language,
  className,
  as: Element = "span",
}: {
  text: QuizshowText;
  language: QuizshowLanguage;
  className?: string;
  as?: "span" | "p";
}) {
  const picked = pickQuizshowTextWithLanguage(text, language);
  return (
    <Element className={className} lang={picked.language}>
      {picked.text}
    </Element>
  );
}

function hasText(text: QuizshowText): boolean {
  return text.en.trim() !== "" || text.pt.trim() !== "";
}

interface AnswerKeyTile {
  id: string;
  swatch: QuizshowSwatch;
  letter: string;
  text: string;
  /** The language an option's words are in; undefined for app copy (True, False). */
  textLanguage: QuizshowLanguage | undefined;
  isCorrect: boolean;
}

/** Multiple choice and true or false: every tile, each right one ringed and named as correct. */
function AnswerKeyTiles({
  answerKey,
  options,
  language,
}: Omit<AnswerKeyBodyProps, "numberUnit">) {
  const { t } = useTranslation();
  const correctIndexes =
    answerKey.type === "multiple_choice" ? answerKey.correctIndexes : null;
  const correctTruth =
    answerKey.type === "true_false" ? answerKey.isTrue : null;
  const tiles: AnswerKeyTile[] =
    correctIndexes !== null
      ? options.map((option, optionIndex) => {
          const picked = pickQuizshowTextWithLanguage(option.text, language);
          return {
            id: option.id,
            swatch: answerSwatchFor(optionIndex),
            letter: optionLetter(optionIndex),
            text: picked.text,
            textLanguage: picked.language,
            isCorrect: correctIndexes.includes(optionIndex),
          };
        })
      : [true, false].map((isTrue, optionIndex) => ({
          id: String(isTrue),
          swatch: trueFalseSwatchFor(isTrue),
          letter: optionLetter(optionIndex),
          text: t(
            isTrue
              ? "quizshow:questions.trueFalse.true"
              : "quizshow:questions.trueFalse.false",
          ),
          textLanguage: undefined,
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
          <div key={tile.id} lang={tile.textLanguage}>
            <QuizshowAnswerTile
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
          </div>
        );
      })}
    </div>
  );
}

/** The C6.1 margin in words; exact shows nothing. */
function ClosestMargin({
  tolerance,
  unit,
}: {
  tolerance: QuizshowClosestTolerance;
  unit: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  if (tolerance.mode === "exact") return null;
  const amount = format.number(tolerance.amount);
  let marginLine: string;
  if (tolerance.mode === "percent") {
    marginLine = t("quizshow:stage.closestBand.percent", { amount });
  } else if (unit === "") {
    marginLine = t("quizshow:stage.closestBand.absoluteNoUnit", { amount });
  } else {
    marginLine = t("quizshow:stage.closestBand.absolute", { amount, unit });
  }
  return <p className={styles.hint}>{marginLine}</p>;
}

function ClosestKey({
  answerKey,
  numberUnit,
  language,
}: {
  answerKey: Extract<QuizshowAnswerKeyView, { type: "closest_number" }>;
  numberUnit: QuizshowText;
  language: QuizshowLanguage;
}) {
  const format = useFormat();
  const unit = pickQuizshowTextWithLanguage(numberUnit, language);
  const unitText = unit.text.trim();
  return (
    <>
      <p className={`${styles.keyText} ${styles.count}`}>
        {quizshowAnswerNumberFormatter(format.number)(answerKey.value)}
        {unitText !== "" && (
          <>
            {" "}
            <span lang={unit.language}>{unitText}</span>
          </>
        )}
      </p>
      <ClosestMargin tolerance={answerKey.tolerance} unit={unitText} />
    </>
  );
}

function AnswerKeyBody({
  answerKey,
  options,
  numberUnit,
  language,
}: AnswerKeyBodyProps) {
  const { t } = useTranslation();
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
          <QuizText
            as="p"
            className={styles.keyText}
            text={answerKey.text}
            language={language}
          />
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
                <QuizText text={option.text} language={language} />
              </li>
            );
          })}
        </ol>
      );
    case "closest_number":
      return (
        <ClosestKey
          answerKey={answerKey}
          numberUnit={numberUnit}
          language={language}
        />
      );
    case "lie_detector":
      return (
        <>
          <p className={styles.hint}>{t("quizshow:stage.theTruth")}</p>
          <QuizText
            as="p"
            className={styles.keyText}
            text={answerKey.truth}
            language={language}
          />
        </>
      );
  }
}

/** True when the remote has an answer, a poll line or a note to show for this question. */
function isAnswerKeyShown(question: QuizshowHostQuestionView | null): boolean {
  if (question === null) return false;
  return (
    question.answerKey !== null ||
    question.type === "poll" ||
    hasText(question.revealNote)
  );
}

/** The host's "Fun fact" (C6.22): theirs alone until the reveal puts it on the screen. */
function RevealNote({
  note,
  language,
  isOnScreen,
}: {
  note: QuizshowText;
  language: QuizshowLanguage;
  isOnScreen: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.revealNote}>
      <h3 className={styles.revealNoteTitle}>
        {t("quizshow:stage.revealNote")}
      </h3>
      <QuizText
        as="p"
        className={styles.revealNoteText}
        text={note}
        language={language}
      />
      <Collapse isOpen={!isOnScreen}>
        <p className={styles.hint}>{t("quizshow:remote.revealNoteHint")}</p>
      </Collapse>
    </div>
  );
}

interface AnswerKeySectionProps {
  question: QuizshowHostQuestionView;
  language: QuizshowLanguage;
  /** The reveal is up, so the TV shows the note too. */
  isNoteOnScreen: boolean;
  /** The reveal on show; after a host correction (item 5) its key replaces the question's. */
  reveal: QuizshowReveal | null;
}

/**
 * The key the game scores by now: a reveal of this question carries any host
 * correction (C6.4 rule 8). The answer key and the Fix answers form both read it.
 */
// eslint-disable-next-line react-refresh/only-export-components -- one pure helper shared with QuizshowRemoteRescore
export function effectiveAnswerKeyOf(
  question: QuizshowHostQuestionView,
  reveal: QuizshowReveal | null,
): QuizshowAnswerKeyView | null {
  if (reveal === null || reveal.questionId !== question.questionId) {
    return question.answerKey;
  }
  return reveal.correct ?? question.answerKey;
}

function AnswerKeySection({
  question,
  language,
  isNoteOnScreen,
  reveal,
}: AnswerKeySectionProps) {
  const { t } = useTranslation();
  const answerKey = effectiveAnswerKeyOf(question, reveal);
  return (
    <section
      className={styles.section}
      aria-labelledby="quizshow-remote-answer-key"
    >
      <h2 id="quizshow-remote-answer-key" className={styles.sectionTitle}>
        {t("quizshow:remote.answerKey")}
      </h2>
      <QuizText
        as="p"
        className={styles.rowText}
        text={question.prompt}
        language={language}
      />
      {answerKey !== null && (
        <AnswerKeyBody
          answerKey={answerKey}
          options={question.options ?? []}
          numberUnit={question.numberUnit}
          language={language}
        />
      )}
      {answerKey === null && question.type === "poll" && (
        <p className={styles.keyText}>{t("quizshow:remote.pollNoAnswer")}</p>
      )}
      {hasText(question.revealNote) && (
        <RevealNote
          note={question.revealNote}
          language={language}
          isOnScreen={isNoteOnScreen}
        />
      )}
    </section>
  );
}

/**
 * The answer for hosts, from the question's first phase: every right option,
 * the closest-number margin, "Poll: no right answer" on a poll, and the
 * reveal note. It folds away while there is nothing to show (no question, or
 * Caption This and Drag Name without a note) and cross-fades between questions.
 */
export function QuizshowRemoteAnswerKey({
  question,
  language,
  isNoteOnScreen,
  reveal,
}: Omit<AnswerKeySectionProps, "question"> & {
  question: QuizshowHostQuestionView | null;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <Collapse isOpen={isAnswerKeyShown(question)}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={question?.questionId ?? "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {question !== null && isAnswerKeyShown(question) && (
            <AnswerKeySection
              question={question}
              language={language}
              isNoteOnScreen={isNoteOnScreen}
              reveal={reveal}
            />
          )}
        </m.div>
      </AnimatePresence>
    </Collapse>
  );
}
