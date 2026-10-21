import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowPartyRevealEntry,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape, type QuizshowShapeSize } from "../QuizshowShape";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import styles from "./QuizshowStage.module.css";
import { orderRevealEntries } from "./quizshowRevealOrder";
import {
  optionLetter,
  pickQuizshowText,
  type QuizshowStageSize,
} from "./quizshowText";

interface QuizshowDistributionProps {
  reveal: QuizshowReveal;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  size: QuizshowStageSize;
  /** Party reveals only: how many entries to list before a "+N more" line. Every entry shows when unset. */
  maxEntries?: number;
}

interface BarRowProps {
  /** The option letter, or null for True and False. */
  letter: string | null;
  label: string;
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
            <>
              <span className={styles.barLetter}>{letter}</span>{" "}
            </>
          )}
          {label}
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
    <div className={styles.voteEntry}>
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
        <li key={line} className={styles.distributionNote}>
          {line}
        </li>
      ))}
    </ul>
  );
}

export function QuizshowDistribution({
  reveal,
  question,
  language,
  size,
  maxEntries,
}: QuizshowDistributionProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { distribution, correct } = reveal;
  const shapeSize = SHAPE_SIZES[size];
  let body;

  if (distribution.kind === "options") {
    const maxCount = Math.max(0, ...distribution.counts);
    const correctIndex =
      correct?.type === "multiple_choice" ? correct.correctIndex : null;
    body = (
      <BarChart reveal={reveal} hasCorrect={correctIndex !== null}>
        {distribution.counts.map((count, optionIndex) => {
          const option = question.options?.[optionIndex];
          return (
            <BarRow
              key={option?.id ?? optionIndex}
              letter={optionLetter(optionIndex)}
              label={option ? pickQuizshowText(option.text, language) : ""}
              shape={answerSwatchFor(optionIndex)}
              shapeSize={shapeSize}
              count={count}
              maxCount={maxCount}
              answeredCount={reveal.answeredCount}
              isCorrect={correctIndex === optionIndex}
            />
          );
        })}
      </BarChart>
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
    const lines: string[] = [];
    if (distribution.closestValue !== null) {
      lines.push(
        t("quizshow:stage.closestValue", {
          value: format.number(distribution.closestValue),
        }),
      );
    }
    if (distribution.closestNames.length > 0) {
      lines.push(
        t("quizshow:stage.closestNames", {
          names: distribution.closestNames.join(", "),
        }),
      );
    }
    lines.push(
      t("quizshow:stage.withinBand", { count: distribution.withinBandCount }),
    );
    body = <NoteLines lines={lines} />;
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
