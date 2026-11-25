import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowPartyRevealEntry,
  QuizshowScreenLanguage,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape, type QuizshowShapeSize } from "../QuizshowShape";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import {
  closestBandCopyOf,
  numberWithUnit,
} from "../screen/quizshowScreenTileModel";
import styles from "./QuizshowStage.module.css";
import { QuizshowStageText } from "./QuizshowStageText";
import { orderRevealEntries } from "./quizshowRevealOrder";
import {
  optionLetter,
  pickQuizshowText,
  primaryLanguageOf,
  quizshowAnswerNumberFormatter,
  type QuizshowStageSize,
} from "./quizshowText";

interface QuizshowDistributionProps {
  reveal: QuizshowReveal;
  question: QuizshowQuestionView;
  /** 'both' shows each option's EN line with the PT line under it (C6.26). */
  language: QuizshowScreenLanguage;
  size: QuizshowStageSize;
  /** Party reveals only: how many entries to list before a "+N more" line. Every entry shows when unset. */
  maxEntries?: number;
}

interface BarRowProps {
  /** The option letter, or null for True and False. */
  letter: string | null;
  label: ReactNode;
  shape: QuizshowSwatch;
  shapeSize: QuizshowShapeSize;
  count: number;
  maxCount: number;
  answeredCount: number;
  isCorrect: boolean;
}

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

const COUNT_START = { value: "0", numericValue: 0 };

const PERCENT_FORMAT: Intl.NumberFormatOptions = {
  style: "percent",
  maximumFractionDigits: 0,
};

/**
 * One option: its shape, its answer text over a bar, and the count with its
 * share of everyone who answered. The bar fills against the most picked
 * option. A correct row gets a check badge on its shape and an edge on its bar.
 */
function BarRow({
  letter,
  label,
  shape,
  shapeSize,
  count,
  maxCount,
  answeredCount,
  isCorrect,
}: BarRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const barStyle = { "--quizshow-bar-fill": shape.fillVar } as CSSProperties;
  const fraction = maxCount > 0 ? count / maxCount : 0;
  const percent = format.number(
    answeredCount > 0 ? count / answeredCount : 0,
    PERCENT_FORMAT,
  );
  return (
    <li className={`${styles.barRow} ${isCorrect ? styles.barRowCorrect : ""}`}>
      <span className={styles.barShape}>
        <QuizshowShape
          colorKey={shape.colorKey}
          size={shapeSize}
          label={null}
          isGlowing
        />
        {isCorrect && (
          <span className={styles.barCheck}>
            <FiCheck aria-hidden="true" focusable="false" />
            <span className={styles.visuallyHidden}>
              {t("quizshow:stage.correctAnswer")}
            </span>
          </span>
        )}
      </span>
      <span className={styles.barBody}>
        <span className={styles.barLabel}>
          {letter !== null && (
            <span className={styles.barLetter}>{letter}</span>
          )}
          <span className={styles.barText}>{label}</span>
        </span>
        <span className={styles.barTrack} style={barStyle} aria-hidden="true">
          <m.span
            className={styles.barFill}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: fraction }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: [0.22, 0.68, 0.16, 1],
            }}
          />
        </span>
      </span>
      <span className={styles.barCount}>
        <RollingNumber
          className={styles.barNumber}
          value={String(count)}
          numericValue={count}
          revealFrom={COUNT_START}
        />
        <span className={styles.barPercent}>{percent}</span>
      </span>
    </li>
  );
}

/** The bar rows and the "N of M answered" line under them. Wrong rows dim once a correct answer exists. */
function BarChart({
  reveal,
  hasCorrect,
  children,
}: {
  reveal: QuizshowReveal;
  hasCorrect: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.barChart}>
      <ul
        className={`${styles.distribution} ${styles.barList}`}
        data-has-correct={hasCorrect ? "true" : "false"}
      >
        {children}
      </ul>
      <p className={styles.barCaption}>
        {t("quizshow:stage.answered", {
          count: reveal.answeredCount,
          total: reveal.eligibleCount,
        })}
      </p>
    </div>
  );
}

/** One party entry. The favourite tag fades in and out where it sits. */
function VoteEntryRow({
  entry,
  isFavourite,
}: {
  entry: QuizshowPartyRevealEntry;
  isFavourite: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <div
      className={`${styles.voteEntry} ${entry.isTruth ? styles.voteEntryTruth : ""}`}
    >
      <span className={styles.voteText}>{entry.text}</span>
      <span className={styles.voteMeta}>
        {entry.isTruth && (
          <span className={styles.voteTag}>{t("quizshow:stage.theTruth")}</span>
        )}
        {entry.authorName !== null && (
          <span>
            {t("quizshow:stage.writtenBy", { name: entry.authorName })}
          </span>
        )}
        <span>{t("quizshow:stage.votes", { count: entry.voteCount })}</span>
        <AnimatePresence initial={false}>
          {isFavourite && (
            <m.span
              key="favourite"
              className={styles.voteTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {t("quizshow:stage.favourite")}
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </div>
  );
}

/**
 * The first `maxEntries` of the ordered entries. The truth already leads; the
 * hosts' favourite always shows too, taking the last shown slot that holds a
 * lie when it falls past the cap.
 */
function capRevealEntries(
  orderedEntries: QuizshowPartyRevealEntry[],
  maxEntries: number | undefined,
  favouriteOptionId: string | null,
): QuizshowPartyRevealEntry[] {
  if (maxEntries === undefined) return orderedEntries;
  const shownEntries = orderedEntries.slice(0, maxEntries);
  const favouriteEntry = orderedEntries.find(
    (entry) => entry.optionId === favouriteOptionId,
  );
  if (favouriteEntry === undefined || shownEntries.includes(favouriteEntry)) {
    return shownEntries;
  }
  const lastLieIndex = shownEntries.findLastIndex((entry) => !entry.isTruth);
  if (lastLieIndex === -1) return [...shownEntries, favouriteEntry];
  return shownEntries.toSpliced(lastLieIndex, 1, favouriteEntry);
}

/** Party entries, truth first and then by votes. A host hiding an entry takes it out of `entries`: its row folds away. */
function VoteEntryList({
  distribution,
  maxEntries,
}: {
  distribution: Extract<QuizshowReveal["distribution"], { kind: "votes" }>;
  maxEntries: number | undefined;
}) {
  const { t } = useTranslation();
  const orderedEntries = orderRevealEntries(distribution.entries);
  const shownEntries = capRevealEntries(
    orderedEntries,
    maxEntries,
    distribution.favouriteOptionId,
  );
  const moreCount = orderedEntries.length - shownEntries.length;
  return (
    <ul className={`${styles.distribution} ${styles.voteList}`}>
      <AnimatePresence initial={false}>
        {shownEntries.map((entry) => (
          <CollapseListItem key={entry.optionId}>
            <VoteEntryRow
              entry={entry}
              isFavourite={entry.optionId === distribution.favouriteOptionId}
            />
          </CollapseListItem>
        ))}
        {moreCount > 0 && (
          <CollapseListItem key="more-entries">
            <p className={styles.distributionNote}>
              {t("quizshow:screen.morePlayers", { count: moreCount })}
            </p>
          </CollapseListItem>
        )}
      </AnimatePresence>
    </ul>
  );
}

function NoteLines({ lines }: { lines: string[] }) {
  return (
    <ul className={styles.distribution}>
      {lines.map((line) => (
        <li key={line} className={styles.noteLine}>
          {line}
        </li>
      ))}
    </ul>
  );
}

/**
 * Multiple choice and poll: one bar per option. Every option in the key gets
 * the correct mark (C6.22); a poll has no key, so no bar is marked and none
 * dims. Option texts follow the screen language, both lines under Both.
 */
function OptionBars({
  reveal,
  counts,
  question,
  language,
  shapeSize,
}: {
  reveal: QuizshowReveal;
  counts: number[];
  question: QuizshowQuestionView;
  language: QuizshowScreenLanguage;
  shapeSize: QuizshowShapeSize;
}) {
  const maxCount = Math.max(0, ...counts);
  const correct = reveal.correct;
  const correctIndexes =
    correct?.type === "multiple_choice" ? correct.correctIndexes : [];
  return (
    <BarChart reveal={reveal} hasCorrect={correctIndexes.length > 0}>
      {counts.map((count, optionIndex) => {
        const option = question.options?.[optionIndex];
        return (
          <BarRow
            key={option?.id ?? optionIndex}
            letter={optionLetter(optionIndex)}
            label={
              option ? (
                <QuizshowStageText text={option.text} language={language} />
              ) : (
                ""
              )
            }
            shape={answerSwatchFor(optionIndex)}
            shapeSize={shapeSize}
            count={count}
            maxCount={maxCount}
            answeredCount={reveal.answeredCount}
            isCorrect={correctIndexes.includes(optionIndex)}
          />
        );
      })}
    </BarChart>
  );
}

/**
 * Closest number: the closest guess with the question's unit, who guessed
 * it, then the half-points rule from the question's margin (C6.1) and how
 * many landed inside it. An exact question has no margin, so it shows
 * neither of the last two.
 */
function ClosestLines({
  distribution,
  correct,
  question,
  language,
}: {
  distribution: Extract<QuizshowReveal["distribution"], { kind: "closest" }>;
  correct: QuizshowReveal["correct"];
  question: QuizshowQuestionView;
  language: QuizshowScreenLanguage;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const leadLanguage = primaryLanguageOf(language);
  const formatAnswer = quizshowAnswerNumberFormatter(format.number);
  const lines: string[] = [];
  if (distribution.closestValue !== null) {
    const valueWithUnit = numberWithUnit(
      formatAnswer(distribution.closestValue),
      question.numberUnit,
    );
    lines.push(
      t("quizshow:stage.closestValue", { value: valueWithUnit[leadLanguage] }),
    );
  }
  if (distribution.closestNames.length > 0) {
    lines.push(
      t("quizshow:stage.closestNames", {
        names: distribution.closestNames.join(", "),
      }),
    );
  }
  const band =
    correct?.type === "closest_number"
      ? closestBandCopyOf(
          correct.tolerance,
          format.number(correct.tolerance.amount),
          pickQuizshowText(question.numberUnit, leadLanguage),
        )
      : null;
  if (band !== null) {
    lines.push(
      t(band.key, band.values),
      t("quizshow:stage.withinMargin", {
        count: distribution.withinBandCount,
      }),
    );
  }
  return <NoteLines lines={lines} />;
}

export function QuizshowDistribution({
  reveal,
  question,
  language,
  size,
  maxEntries,
}: QuizshowDistributionProps) {
  const { t } = useTranslation();
  const { distribution, correct } = reveal;
  const shapeSize = SHAPE_SIZES[size];
  let body;

  if (distribution.kind === "options") {
    body = (
      <OptionBars
        reveal={reveal}
        counts={distribution.counts}
        question={question}
        language={language}
        shapeSize={shapeSize}
      />
    );
  } else if (distribution.kind === "true_false") {
    const maxCount = Math.max(distribution.trueCount, distribution.falseCount);
    const correctIsTrue =
      correct?.type === "true_false" ? correct.isTrue : null;
    body = (
      <BarChart reveal={reveal} hasCorrect={correctIsTrue !== null}>
        <BarRow
          letter={null}
          label={t("quizshow:questions.trueFalse.true")}
          shape={trueFalseSwatchFor(true)}
          shapeSize={shapeSize}
          count={distribution.trueCount}
          maxCount={maxCount}
          answeredCount={reveal.answeredCount}
          isCorrect={correctIsTrue === true}
        />
        <BarRow
          letter={null}
          label={t("quizshow:questions.trueFalse.false")}
          shape={trueFalseSwatchFor(false)}
          shapeSize={shapeSize}
          count={distribution.falseCount}
          maxCount={maxCount}
          answeredCount={reveal.answeredCount}
          isCorrect={correctIsTrue === false}
        />
      </BarChart>
    );
  } else if (distribution.kind === "typed") {
    body = (
      <NoteLines
        lines={[
          t("quizshow:stage.typedCorrect", {
            count: distribution.correctCount,
          }),
          t("quizshow:stage.typedIncorrect", {
            count: distribution.incorrectCount,
          }),
        ]}
      />
    );
  } else if (distribution.kind === "order") {
    body = (
      <NoteLines
        lines={[
          t("quizshow:stage.orderExact", { count: distribution.exactCount }),
          t("quizshow:stage.orderPartial", {
            count: distribution.partialCount,
          }),
          t("quizshow:stage.orderNone", { count: distribution.noneCount }),
        ]}
      />
    );
  } else if (distribution.kind === "closest") {
    body = (
      <ClosestLines
        distribution={distribution}
        correct={correct}
        question={question}
        language={language}
      />
    );
  } else {
    body = (
      <VoteEntryList distribution={distribution} maxEntries={maxEntries} />
    );
  }
  return (
    <div className={styles[size]} data-quizshow-distribution="">
      {body}
    </div>
  );
}
