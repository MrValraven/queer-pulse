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

/** The top three ranks wear a coral, rose and lilac edge. */
const TOP_RANK_CLASS_NAMES: Partial<Record<number, string>> = {
  1: `${styles.leaderboardRowTop} ${styles.leaderboardRowFirst}`,
  2: `${styles.leaderboardRowTop} ${styles.leaderboardRowSecond}`,
  3: `${styles.leaderboardRowTop} ${styles.leaderboardRowThird}`,
};

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
            className={[
              styles.leaderboardRow,
              TOP_RANK_CLASS_NAMES[entry.rank] ?? "",
              entry.entrantId === highlightEntrantId
                ? styles.leaderboardRowSelf
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
                isGlowing
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
