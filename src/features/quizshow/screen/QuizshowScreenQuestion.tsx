import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowScreenState,
  type QuizshowTeamColorKey,
  QUIZSHOW_LIMITS,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  QUIZSHOW_SWATCHES,
  trueFalseSwatchFor,
} from "../quizshowSwatches";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { QuizshowDistribution } from "../stage/QuizshowDistribution";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import styles from "./QuizshowScreen.module.css";

/** Multiple choice keeps the four answer shapes; order adds two more for its fifth and sixth items. */
const ORDER_SWATCH_KEYS: readonly QuizshowTeamColorKey[] = [
  ...QUIZSHOW_ANSWER_SWATCH_KEYS,
  ...QUIZSHOW_TEAM_COLOR_KEYS.filter(
    (colorKey) =>
      !(QUIZSHOW_ANSWER_SWATCH_KEYS as readonly string[]).includes(colorKey),
  ),
];

type TileState = "idle" | "correct" | "dimmed";

interface ScreenTile {
  key: string;
  colorKey: QuizshowTeamColorKey;
  letter: string;
  text: string;
  state: TileState;
}

function tilesFor(
  question: QuizshowQuestionView,
  reveal: QuizshowReveal | null,
  language: QuizshowLanguage,
  trueFalseTexts: { true: string; false: string },
): ScreenTile[] {
  const correct = reveal?.correct ?? null;
  const stateFor = (isCorrect: boolean): TileState => {
    if (correct === null) return "idle";
    return isCorrect ? "correct" : "dimmed";
  };
  if (question.type === "true_false") {
    return [true, false].map((isTrue, optionIndex) => ({
      key: String(isTrue),
      colorKey: trueFalseSwatchFor(isTrue).colorKey,
      letter: optionLetter(optionIndex),
      text: isTrue ? trueFalseTexts.true : trueFalseTexts.false,
      state: stateFor(
        correct?.type === "true_false" && correct.isTrue === isTrue,
      ),
    }));
  }
  const options = question.options ?? [];
  const shownTiles = options.map((option, optionIndex) => ({
    key: option.id,
    colorKey: ORDER_SWATCH_KEYS[optionIndex] ?? "star",
    letter: optionLetter(optionIndex),
    text: pickQuizshowText(option.text, language),
    state: stateFor(
      correct?.type === "multiple_choice" &&
        correct.correctIndex === optionIndex,
    ),
  }));
  if (question.type !== "order") return shownTiles;
  // Order: tiles keep their letters; the reveal lists them in the right order.
  const orderedIds = correct?.type === "order" ? correct.orderedIds : null;
  if (orderedIds === null) return shownTiles;
  return orderedIds
    .map((optionId) => shownTiles.find((tile) => tile.key === optionId))
    .filter((tile): tile is ScreenTile => tile !== undefined)
    .map((tile): ScreenTile => ({ ...tile, state: "idle" }));
}

function typedAnswerOf(
  reveal: QuizshowReveal | null,
  language: QuizshowLanguage,
  formatNumber: (value: number) => string,
): string | null {
  const correct = reveal?.correct ?? null;
  if (correct?.type === "type_answer")
    return pickQuizshowText(correct.text, language);
  if (correct?.type === "closest_number") return formatNumber(correct.value);
  return null;
}

const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Typed and number questions: "Answer on your phone", then the right answer at the reveal, faded from one to the other. */
function TypedAnswerBox({ typedAnswer }: { typedAnswer: string | null }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <div className={styles.answerOnPhone}>
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={typedAnswer === null ? "on-phone" : `answer-${typedAnswer}`}
          className={styles.answerOnPhoneBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: ROW_EASE }}
        >
          {typedAnswer === null ? (
            t("quizshow:stage.answerOnPhone")
          ) : (
            <>
              <span className={styles.muted}>
                {t("quizshow:stage.correctAnswer")}
              </span>
              <span>{typedAnswer}</span>
            </>
          )}
        </m.p>
      </AnimatePresence>
    </div>
  );
}

/** The answer tiles; an order question's rows glide into the right order at the reveal. */
function TileList({
  tiles,
  isColumn,
  size,
}: {
  tiles: ScreenTile[];
  isColumn: boolean;
  size: QuizshowScreenStageSize;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: ROW_EASE };
  return (
    <ul className={isColumn ? styles.tileColumn : styles.tileGrid}>
      {tiles.map((tile) => {
        const answerLabel = t("quizshow:stage.answerLabel", {
          letter: tile.letter,
          shape: t(QUIZSHOW_SWATCHES[tile.colorKey].labelKey),
          text: tile.text,
        });
        return (
          <m.li
            key={tile.key}
            layout={reducedMotion ? false : "position"}
            transition={{ layout: layoutTransition }}
            data-tile-state={tile.state}
          >
            <QuizshowAnswerTile
              colorKey={tile.colorKey}
              letter={tile.letter}
              text={tile.text}
              size={size}
              state={tile.state}
              ariaLabel={
                tile.state === "correct"
                  ? `${t("quizshow:stage.correctAnswer")}, ${answerLabel}`
                  : answerLabel
              }
            />
          </m.li>
        );
      })}
    </ul>
  );
}

/**
 * The distribution's column, held open from `read` on: every quiz question
 * reveals one, so the answers keep their width and the bars fade in beside them.
 */
function RevealColumn({
  reveal,
  question,
  language,
  size,
}: {
  reveal: QuizshowReveal | null;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  size: QuizshowScreenStageSize;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <div className={styles.revealColumn}>
      <AnimatePresence initial={false}>
        {reveal !== null && (
          <m.div
            key={`distribution-${reveal.questionId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: ROW_EASE }}
          >
            <QuizshowDistribution
              reveal={reveal}
              question={question}
              language={language}
              size={size}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface QuizshowScreenQuestionProps {
  session: QuizshowScreenState;
  question: QuizshowQuestionView;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
}

/** A quiz question in `read`, `open` and `reveal`. Correctness shows only once the reveal carries it. */
export function QuizshowScreenQuestion({
  session,
  question,
  clockOffsetMs,
  size,
}: QuizshowScreenQuestionProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { cursor, round, screenLanguage: language, answerCount } = session;
  const reveal =
    cursor.phase === "reveal" &&
    session.reveal?.questionId === question.questionId
      ? session.reveal
      : null;
  const tiles = tilesFor(question, reveal, language, {
    true: t("quizshow:questions.trueFalse.true"),
    false: t("quizshow:questions.trueFalse.false"),
  });
  const isTyped =
    question.type === "type_answer" || question.type === "closest_number";
  const typedAnswer = typedAnswerOf(reveal, language, format.number);
  const questionCount =
    round?.questionCount ?? session.rounds[question.roundIndex]?.questionCount;
  const isOrder = question.type === "order";

  return (
    <div className={styles.question}>
      <p className={styles.eyebrow}>
        <span>
          {t("quizshow:stage.roundOf", {
            number: question.roundIndex + 1,
            total: cursor.roundCount,
          })}
        </span>
        {questionCount !== undefined && (
          <span>
            {t("quizshow:stage.questionOf", {
              number: question.questionIndex + 1,
              total: questionCount,
            })}
          </span>
        )}
      </p>
      <h1 className={styles.prompt}>
        {pickQuizshowText(question.prompt, language)}
      </h1>
      {/* Picture, answers and the distribution's column sit side by side so a 1080p screen holds them all. */}
      <div
        className={styles.questionBody}
        data-has-picture={question.mediaUrl !== null ? "true" : "false"}
      >
        {question.mediaUrl !== null && (
          <img className={styles.picture} src={question.mediaUrl} alt="" />
        )}
        <div className={styles.answers}>
          {isTyped ? (
            <TypedAnswerBox typedAnswer={typedAnswer} />
          ) : (
            <>
              <Collapse isOpen={isOrder && reveal !== null}>
                <p className={styles.muted}>
                  {t("quizshow:stage.correctAnswer")}
                </p>
              </Collapse>
              <TileList tiles={tiles} isColumn={isOrder} size={size} />
            </>
          )}
        </div>
        <RevealColumn
          reveal={reveal}
          question={question}
          language={language}
          size={size}
        />
      </div>
      <QuizshowCountdownBar
        cursor={cursor}
        clockOffsetMs={clockOffsetMs}
        hasExtraTime={false}
        standardLimitMs={
          cursor.phase === "read"
            ? QUIZSHOW_LIMITS.readPhaseMs
            : question.timeLimitSeconds * 1000
        }
        size={size}
      />
      <Collapse isOpen={cursor.phase === "open" && answerCount !== null}>
        <p className={styles.counter}>
          <Translation
            i18nKey="quizshow:stage.answered"
            values={{
              count: answerCount?.count ?? 0,
              total: answerCount?.total ?? 0,
            }}
            slots={{
              count: (
                <RollingNumber
                  value={String(answerCount?.count ?? 0)}
                  numericValue={answerCount?.count ?? 0}
                />
              ),
            }}
          />
        </p>
      </Collapse>
    </div>
  );
}
