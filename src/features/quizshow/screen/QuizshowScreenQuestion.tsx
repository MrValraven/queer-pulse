import { AnimatePresence, m } from "motion/react";
import { FiEdit3, FiInfo, FiUsers } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  type QuizshowCursor,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowScreenLanguage,
  type QuizshowScreenState,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { QuizshowDistribution } from "../stage/QuizshowDistribution";
import { QuizshowStagePicture } from "../stage/QuizshowStagePicture";
import { frozenRevealProgressOf } from "../stage/quizshowFrozenReveal";
import { useHeldSlowReveal } from "../stage/useHeldSlowReveal";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { useQuizshowCountdown } from "../stage/useQuizshowCountdown";
import { stageRoundLineCopy } from "../stage/quizshowWheelCopy";
import {
  pickQuizshowText,
  primaryLanguageOf,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import {
  QuizshowScreenAnswered,
  QuizshowScreenHeader,
  type ScreenMetaSegment,
} from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { TileList } from "./QuizshowScreenTiles";
import { gotItOf, numberWithUnit, tilesFor } from "./quizshowScreenTileModel";
import { SCREEN_EASE, SCREEN_EASE_OUT } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/** The catalog key of the plain "Round N of M" line; any other key is the wheel's category pill. */
const ROUND_LINE_KEY = "quizshow:stage.roundOf";
/** A warm-up's line reads Warm-up; its title and question count still follow. */
const WARM_UP_LINE_KEY = "quizshow:stage.warmUp";
/** The fun fact lands just after the answer it explains. */
const NOTE_DELAY_S = 0.35;

/** The right answer of a typed or number question; a number carries the question's unit in each language. */
function typedAnswerOf(
  reveal: QuizshowReveal | null,
  question: QuizshowQuestionView,
  formatNumber: (value: number) => string,
): QuizshowText | null {
  const correct = reveal?.correct ?? null;
  if (correct?.type === "type_answer") return correct.text;
  if (correct?.type === "closest_number")
    return numberWithUnit(formatNumber(correct.value), question.numberUnit);
  return null;
}

/** Typed and number questions: "Answer on your phone", then the right answer at the reveal, faded from one to the other. */
function TypedAnswerBox({
  typedAnswer,
  language,
  isWaiting,
}: {
  typedAnswer: QuizshowText | null;
  language: QuizshowScreenLanguage;
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
          key={
            typedAnswer === null
              ? "on-phone"
              : `answer-${typedAnswer.en}-${typedAnswer.pt}`
          }
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
              <QuizshowStageText
                className={styles.answerOnPhoneAnswer}
                text={typedAnswer}
                language={language}
              />
            </>
          )}
        </m.p>
      </AnimatePresence>
    </m.div>
  );
}

/**
 * "Talk it over" in `read` once the talk beat starts (C6.20), with the
 * seconds left until the answers open. The beat is the tail of `read`, so its
 * seconds are the phase's own countdown. While paused the window comes from
 * the round's talk seconds, since the deadline is cleared.
 */
function TalkItOverChip({
  cursor,
  clockOffsetMs,
  talkSeconds,
}: {
  cursor: QuizshowCursor;
  clockOffsetMs: number;
  talkSeconds: number;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const countdown = useQuizshowCountdown(cursor, clockOffsetMs, {
    hasExtraTime: false,
  });
  const { talkStartsAt, deadline } = cursor;
  const talkWindowMs =
    talkStartsAt !== null && deadline !== null
      ? deadline - talkStartsAt
      : talkSeconds * 1000;
  const remaining = countdown.remainingMs;
  const isTalking =
    cursor.phase === "read" &&
    talkStartsAt !== null &&
    remaining !== null &&
    remaining <= talkWindowMs;
  return (
    <Collapse isOpen={isTalking}>
      <p className={styles.talkChip}>
        <FiUsers aria-hidden="true" focusable="false" fill="none" />
        <span>{t("quizshow:stage.talkItOverChip")}</span>
        <span className={styles.talkChipSeconds}>
          {format.number(Math.ceil((remaining ?? 0) / 1000))}
        </span>
      </p>
    </Collapse>
  );
}

/** "Fun fact" under the answer at the reveal (C6.22); it fades in just after the answer lands. */
function RevealNote({
  note,
  language,
}: {
  note: QuizshowText | null;
  language: QuizshowScreenLanguage;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <Collapse isOpen={note !== null}>
      {note !== null && (
        <m.aside
          className={styles.revealNote}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.3,
            delay: reducedMotion ? 0 : NOTE_DELAY_S,
            ease: SCREEN_EASE_OUT,
          }}
        >
          <p className={styles.revealNoteLabel}>
            <FiInfo aria-hidden="true" focusable="false" fill="none" />
            {t("quizshow:stage.revealNote")}
          </p>
          <QuizshowStageText
            as="p"
            className={styles.revealNoteText}
            text={note}
            language={language}
          />
        </m.aside>
      )}
    </Collapse>
  );
}

/**
 * Order, typed, closest-number and poll reveals keep their own column beside
 * the answers, held open from `read` on so nothing changes width when the
 * counts arrive. Multiple choice and true or false show their share in the
 * tiles. A poll has no right answer: its bars sit under "How everyone
 * voted" with no option marked (C6.22).
 */
function RevealColumn({
  reveal,
  question,
  language,
  size,
}: {
  reveal: QuizshowReveal | null;
  question: QuizshowQuestionView;
  language: QuizshowScreenLanguage;
  size: QuizshowScreenStageSize;
}) {
  const { t } = useTranslation();
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
            {question.type === "poll" && (
              <p className={styles.answersLabel}>
                {t("quizshow:stage.pollResults")}
              </p>
            )}
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

/** The header pill: "Round N of M", the round title and "Question N of M", or the wheel's category pill alone. */
function metaSegmentsFor(
  session: QuizshowScreenState,
  question: QuizshowQuestionView,
  t: TFunction,
): ScreenMetaSegment[] {
  const { cursor } = session;
  const leadLanguage = primaryLanguageOf(session.screenLanguage);
  const roundCard =
    session.round ?? session.rounds[question.roundIndex] ?? null;
  const roundLine = stageRoundLineCopy(
    cursor,
    session.wheel,
    session.rounds,
    leadLanguage,
    t,
  );
  const meta: ScreenMetaSegment[] = [
    { id: "round", text: t(roundLine.key, roundLine.values) },
  ];
  if (roundLine.key !== ROUND_LINE_KEY && roundLine.key !== WARM_UP_LINE_KEY)
    return meta;
  // The title in the lead language; under screen language Both the pill
  // draws it from `quizText`, EN then PT (C6.26).
  const roundTitle =
    roundCard !== null ? pickQuizshowText(roundCard.title, leadLanguage) : "";
  if (roundCard !== null && roundTitle !== "") {
    meta.push({
      id: "title",
      text: roundTitle,
      quizText: { text: roundCard.title, language: session.screenLanguage },
    });
  }
  if (roundCard !== null) {
    meta.push({
      id: "question",
      text: t("quizshow:stage.questionOf", {
        number: question.questionIndex + 1,
        total: roundCard.questionCount,
      }),
    });
  }
  return meta;
}

/**
 * A quiz question in `read`, `open` and `reveal`. `read` shows the question
 * alone; the tiles rise in when it opens. Correctness shows only once the
 * reveal carries it. Quiz texts follow the screen language, both lines
 * under Both (C6.26).
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
  const { cursor, answerCount } = session;
  const reveal =
    cursor.phase === "reveal" &&
    session.reveal?.questionId === question.questionId
      ? session.reveal
      : null;
  const leadLanguage = primaryLanguageOf(session.screenLanguage);
  const tiles = tilesFor(question, reveal, leadLanguage, {
    true: t("quizshow:questions.trueFalse.true"),
    false: t("quizshow:questions.trueFalse.false"),
  });
  const isTyped =
    question.type === "type_answer" || question.type === "closest_number";
  const typedAnswer = typedAnswerOf(
    reveal,
    question,
    quizshowAnswerNumberFormatter(format.number),
  );
  const roundCard =
    session.round ?? session.rounds[question.roundIndex] ?? null;
  const talkSeconds = roundCard?.talkSeconds ?? 0;
  const slowReveal = useHeldSlowReveal(question, cursor, talkSeconds * 1000);
  const isOrder = question.type === "order";
  const hasSideReveal =
    question.type !== "multiple_choice" && question.type !== "true_false";
  const answered =
    reveal !== null
      ? { count: reveal.answeredCount, total: reveal.eligibleCount }
      : { count: answerCount?.count ?? 0, total: answerCount?.total ?? 0 };

  return (
    <div className={styles.question}>
      <QuizshowScreenHeader
        meta={metaSegmentsFor(session, question, t)}
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
          <QuizshowStageText
            text={question.prompt}
            language={session.screenLanguage}
          />
        </m.h1>
        <TalkItOverChip
          cursor={cursor}
          clockOffsetMs={clockOffsetMs}
          talkSeconds={talkSeconds}
        />
      </div>
      {/* Picture, answers and (for order, typed, closest and poll) the reveal's column side by side, so a 1080p screen holds them all. */}
      <div
        className={styles.questionBody}
        data-has-picture={question.mediaUrl !== null ? "true" : "false"}
        data-reveal={hasSideReveal ? "side" : "tiles"}
      >
        {question.mediaUrl !== null && (
          <QuizshowStagePicture
            className={styles.picture}
            mediaUrl={question.mediaUrl}
            alt={question.mediaAlt}
            language={leadLanguage}
            slowReveal={slowReveal}
            clockOffsetMs={clockOffsetMs}
            frozenProgress={frozenRevealProgressOf(
              slowReveal,
              cursor,
              question.timeLimitSeconds * 1000,
            )}
          />
        )}
        <div className={styles.answers}>
          {isTyped ? (
            <TypedAnswerBox
              typedAnswer={typedAnswer}
              language={session.screenLanguage}
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
            language={session.screenLanguage}
            size={size}
          />
        )}
      </div>
      {/* A host's rescore changed who got it (item 19): the room hears it from the screen too. */}
      <Collapse isOpen={reveal?.wasCorrected === true}>
        <p className={styles.revealNoteLabel}>
          <FiEdit3 aria-hidden="true" focusable="false" fill="none" />
          {t("quizshow:stage.hostCorrected")}
        </p>
      </Collapse>
      <RevealNote
        note={reveal?.note ?? null}
        language={session.screenLanguage}
      />
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
