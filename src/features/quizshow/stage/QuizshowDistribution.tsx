import type { CSSProperties } from "react";
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
  label: string;
  shape: QuizshowSwatch;
  shapeSize: QuizshowShapeSize;
  count: number;
  maxCount: number;
  isCorrect: boolean;
}

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

const COUNT_START = { value: "0", numericValue: 0 };

function BarRow({
  label,
  shape,
  shapeSize,
  count,
  maxCount,
  isCorrect,
}: BarRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const barStyle = { "--quizshow-bar-fill": shape.fillVar } as CSSProperties;
  const fraction = maxCount > 0 ? count / maxCount : 0;
  return (
    <li
      className={`${styles.distributionRow} ${isCorrect ? styles.distributionRowCorrect : ""}`}
    >
      <span>
        <QuizshowShape
          colorKey={shape.colorKey}
          size={shapeSize}
          label={null}
        />
        <span className={styles.visuallyHidden}>{label}</span>
      </span>
      <span
        className={styles.distributionBar}
        style={barStyle}
        aria-hidden="true"
      >
        <m.span
          className={styles.distributionBarFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: fraction }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: [0.22, 0.68, 0.16, 1],
          }}
        />
      </span>
      <span>
        {isCorrect && (
          <>
            <FiCheck aria-hidden="true" />
            <span className={styles.visuallyHidden}>
              {t("quizshow:stage.correctAnswer")}
            </span>
          </>
        )}
        <RollingNumber
          value={String(count)}
          numericValue={count}
          revealFrom={COUNT_START}
        />
      </span>
    </li>
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
      <ul className={styles.distribution}>
        {distribution.counts.map((count, optionIndex) => {
          const option = question.options?.[optionIndex];
          const text = option ? pickQuizshowText(option.text, language) : "";
          return (
            <BarRow
              key={option?.id ?? optionIndex}
              label={`${optionLetter(optionIndex)} ${text}`}
              shape={answerSwatchFor(optionIndex)}
              shapeSize={shapeSize}
              count={count}
              maxCount={maxCount}
              isCorrect={correctIndex === optionIndex}
            />
          );
        })}
      </ul>
    );
  } else if (distribution.kind === "true_false") {
    const maxCount = Math.max(distribution.trueCount, distribution.falseCount);
    const correctIsTrue =
      correct?.type === "true_false" ? correct.isTrue : null;
    body = (
      <ul className={styles.distribution}>
        <BarRow
          label={t("quizshow:questions.trueFalse.true")}
          shape={trueFalseSwatchFor(true)}
          shapeSize={shapeSize}
          count={distribution.trueCount}
          maxCount={maxCount}
          isCorrect={correctIsTrue === true}
        />
        <BarRow
          label={t("quizshow:questions.trueFalse.false")}
          shape={trueFalseSwatchFor(false)}
          shapeSize={shapeSize}
          count={distribution.falseCount}
          maxCount={maxCount}
          isCorrect={correctIsTrue === false}
        />
      </ul>
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
  return <div className={styles[size]}>{body}</div>;
}
