import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowScreenState,
} from "../../../shared/contracts/quizshow";
import { QuizshowDistribution } from "../stage/QuizshowDistribution";
import { stageRoundLineCopy } from "../stage/quizshowWheelCopy";
import {
  pickQuizshowText,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  QuizshowScreenAnswered,
  QuizshowScreenHeader,
  type ScreenMetaSegment,
} from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { TileList } from "./QuizshowScreenTiles";
import { gotItOf, tilesFor } from "./quizshowScreenTileModel";
import { SCREEN_EASE, SCREEN_EASE_OUT } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/** The catalog key of the plain "Round N of M" line; any other key is the wheel's category pill. */
const ROUND_LINE_KEY = "quizshow:stage.roundOf";

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

/** Typed and number questions: "Answer on your phone", then the right answer at the reveal, faded from one to the other. */
function TypedAnswerBox({
  typedAnswer,
  isWaiting,
}: {
  typedAnswer: string | null;
  /** `read`: the question shows alone; the card rises in when it opens, as the tiles do. */
  isWaiting: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      className={styles.answerOnPhone}
      data-revealed={typedAnswer === null ? "false" : "true"}
      aria-hidden={isWaiting ? "true" : undefined}
      initial={false}
      animate={
        isWaiting
          ? { opacity: 0, y: reducedMotion ? 0 : 28 }
          : { opacity: 1, y: 0 }
      }
      transition={{
        duration: reducedMotion ? 0 : 0.3,
        ease: SCREEN_EASE_OUT,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={typedAnswer === null ? "on-phone" : `answer-${typedAnswer}`}
          className={styles.answerOnPhoneBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: SCREEN_EASE }}
        >
          {typedAnswer === null ? (
            t("quizshow:stage.answerOnPhone")
          ) : (
            <>
              <span className={styles.answerOnPhoneLabel}>
                {t("quizshow:stage.correctAnswer")}
              </span>
              <span className={styles.answerOnPhoneAnswer}>{typedAnswer}</span>
            </>
          )}
        </m.p>
      </AnimatePresence>
    </m.div>
  );
}

/**
 * Order, typed and closest-number reveals keep their own column beside the
 * answers, held open from `read` on so nothing changes width when the counts
 * arrive. Multiple choice and true or false show their share in the tiles.
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
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              ease: SCREEN_EASE,
            }}
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

/**
 * A quiz question in `read`, `open` and `reveal`. `read` shows the question
 * alone; the tiles rise in when it opens. Correctness shows only once the
 * reveal carries it.
 */
export function QuizshowScreenQuestion({
  session,
  question,
  clockOffsetMs,
  size,
}: QuizshowScreenQuestionProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
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
  const typedAnswer = typedAnswerOf(
    reveal,
    language,
    quizshowAnswerNumberFormatter(format.number),
  );
  const roundCard = round ?? session.rounds[question.roundIndex] ?? null;
  const questionCount = roundCard?.questionCount;
  const isOrder = question.type === "order";
  const hasSideReveal =
    question.type !== "multiple_choice" && question.type !== "true_false";
  // The first segment is "Round N of M", or the category pill on a pick-a-question wheel question.
  const roundLine = stageRoundLineCopy(
    cursor,
    session.wheel,
    session.rounds,
    language,
    t,
  );
  const isWheelPill = roundLine.key !== ROUND_LINE_KEY;
  const meta: ScreenMetaSegment[] = [
    { id: "round", text: t(roundLine.key, roundLine.values) },
  ];
  const roundTitle =
    roundCard !== null ? pickQuizshowText(roundCard.title, language) : "";
  if (!isWheelPill && roundTitle !== "")
    meta.push({ id: "title", text: roundTitle });
  if (!isWheelPill && questionCount !== undefined) {
    meta.push({
      id: "question",
      text: t("quizshow:stage.questionOf", {
        number: question.questionIndex + 1,
        total: questionCount,
      }),
    });
  }
  const answered =
    reveal !== null
      ? { count: reveal.answeredCount, total: reveal.eligibleCount }
      : { count: answerCount?.count ?? 0, total: answerCount?.total ?? 0 };

  return (
    <div className={styles.question}>
      <QuizshowScreenHeader
        meta={meta}
        cursor={cursor}
        clockOffsetMs={clockOffsetMs}
        standardLimitMs={question.timeLimitSeconds * 1000}
        // `read` is the question alone: the ring shows the answer limit, full
        // and still, and the clock starts when the answers open.
        previewSeconds={
          cursor.phase === "read" ? question.timeLimitSeconds : null
        }
        size={size}
        gotIt={gotItOf(reveal)}
      />
      {/* Alone and centred in `read`; it glides up to the top as the tiles rise in. */}
      <div
        className={styles.promptZone}
        data-waiting={cursor.phase === "read" ? "true" : "false"}
      >
        {/* Its type is larger while it stands alone; ch-based measure keeps
            the line breaks, so the glide reads as one smooth zoom. */}
        <m.h1
          className={styles.prompt}
          layout={!reducedMotion}
          transition={{ layout: { duration: 0.4, ease: SCREEN_EASE } }}
        >
          {pickQuizshowText(question.prompt, language)}
        </m.h1>
      </div>
      {/* Picture, answers and (for order, typed and closest) the reveal's column side by side, so a 1080p screen holds them all. */}
      <div
        className={styles.questionBody}
        data-has-picture={question.mediaUrl !== null ? "true" : "false"}
        data-reveal={hasSideReveal ? "side" : "tiles"}
      >
        {question.mediaUrl !== null && (
          <img className={styles.picture} src={question.mediaUrl} alt="" />
        )}
        <div className={styles.answers}>
          {isTyped ? (
            <TypedAnswerBox
              typedAnswer={typedAnswer}
              isWaiting={cursor.phase === "read"}
            />
          ) : (
            <>
              <Collapse isOpen={isOrder && reveal !== null}>
                <p className={styles.answersLabel}>
                  {t("quizshow:stage.correctAnswer")}
                </p>
              </Collapse>
              <TileList
                tiles={tiles}
                isColumn={isOrder}
                size={size}
                isWaiting={cursor.phase === "read"}
              />
            </>
          )}
        </div>
        {hasSideReveal && (
          <RevealColumn
            reveal={reveal}
            question={question}
            language={language}
            size={size}
          />
        )}
      </div>
      <QuizshowScreenAnswered
        isReserved
        hasCount={reveal !== null || answerCount !== null}
        labelKey="quizshow:stage.answered"
        count={answered.count}
        total={answered.total}
      />
    </div>
  );
}
