import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowScores } from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

interface QuizshowLeaderboardProps {
  scores: QuizshowScores;
  highlightEntrantId: string | null;
  size: QuizshowStageSize;
}

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

/** Rows rank in place: when a score lands, the row glides to its new spot and its
 *  number rolls up from the previous score. */
export function QuizshowLeaderboard({
  scores,
  highlightEntrantId,
  size,
}: QuizshowLeaderboardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 0.68, 0.16, 1] as const };
  return (
    <ol
      className={`${styles.leaderboard} ${styles[size]}`}
      aria-label={t("quizshow:stage.leaderboard")}
    >
      <AnimatePresence initial={false}>
        {scores.entries.map((entry) => (
          <m.li
            key={entry.entrantId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout={reducedMotion ? false : "position"}
            transition={{
              layout: layoutTransition,
              opacity: { duration: reducedMotion ? 0 : 0.25 },
            }}
            className={`${styles.leaderboardRow} ${
              entry.entrantId === highlightEntrantId
                ? styles.leaderboardRowSelf
                : ""
            }`}
            aria-current={
              entry.entrantId === highlightEntrantId ? "true" : undefined
            }
          >
            <span className={styles.rank}>{entry.rank}</span>
            {entry.colorKey !== null ? (
              <QuizshowShape
                colorKey={entry.colorKey}
                size={SHAPE_SIZES[size]}
                label={null}
              />
            ) : (
              <span aria-hidden="true" />
            )}
            <span className={styles.entrantName}>{entry.name}</span>
            <span className={styles.score}>
              <RollingNumber
                value={format.number(entry.score)}
                numericValue={entry.score}
                revealFrom={{
                  value: format.number(entry.previousScore),
                  numericValue: entry.previousScore,
                }}
              />
            </span>
          </m.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
