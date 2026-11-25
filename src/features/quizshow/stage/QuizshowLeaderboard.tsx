import { AnimatePresence, m } from "motion/react";
import { FaFire } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowScores,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";
import {
  LEADERBOARD_RESORT_MS,
  type QuizshowLeaderboardDisplayRow,
  useLeaderboardOvertakes,
} from "./useLeaderboardOvertakes";

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

const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

/** "+2 places" with an up arrow, and the flame with the streak (C6.18). */
function LeaderboardBadges({
  placesUp,
  streak,
  isSettled,
}: {
  placesUp: number | null;
  streak: number;
  isSettled: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isStreakShown = streak >= QUIZSHOW_LIMITS.leaderboardStreakMin;
  return (
    <span className={styles.leaderboardBadges}>
      {/* Drawn from the first frame, unseen until the rows settle, so its
          width is held and the names never re-ellipsize when it fades in. */}
      {placesUp !== null && (
        <m.span
          className={styles.placesUp}
          aria-hidden={isSettled ? undefined : "true"}
          initial={false}
          animate={{ opacity: isSettled ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
          <FiArrowUp aria-hidden="true" fill="none" focusable="false" />
          {t("quizshow:stage.placesUp", { count: placesUp })}
        </m.span>
      )}
      {isStreakShown && (
        <span className={styles.streak}>
          <FaFire aria-hidden="true" focusable="false" />
          <span aria-hidden="true">{streak}</span>
          <span className={styles.visuallyHidden}>
            {t("quizshow:stage.streakLabel", { count: streak })}
          </span>
        </span>
      )}
    </span>
  );
}

function LeaderboardRow({
  row,
  isSettled,
  isHighlighted,
  size,
}: {
  row: QuizshowLeaderboardDisplayRow;
  isSettled: boolean;
  isHighlighted: boolean;
  size: QuizshowStageSize;
}) {
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const { entry, shownRank, placesUp } = row;
  return (
    <m.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // The re-sort is a FLIP of the row's position: transform only.
      layout={reducedMotion ? false : "position"}
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LEADERBOARD_RESORT_MS / 1000, ease: ROW_EASE },
        opacity: { duration: reducedMotion ? 0 : 0.25 },
      }}
      className={[
        styles.leaderboardRow,
        TOP_RANK_CLASS_NAMES[shownRank] ?? "",
        isHighlighted ? styles.leaderboardRowSelf : "",
        // A climbing row glides over the rows it passes.
        row.isRising ? styles.leaderboardRowRising : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isHighlighted ? "true" : undefined}
    >
      <span className={styles.rank}>{shownRank}</span>
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
      {/* The name and its badges: side by side on the TV, the badges under
          the name on a phone, so a narrow row keeps the name whole. */}
      <span className={styles.entrantCell}>
        <span className={styles.entrantName}>{entry.name}</span>
        <LeaderboardBadges
          placesUp={placesUp}
          streak={entry.streak}
          isSettled={isSettled}
        />
      </span>
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
  );
}

/**
 * The scores board (item 11): rows mount in the previous order while each
 * number rolls up from its previous score, then glide into the new order,
 * and the rows that climbed show "+N places". The TV and the phone mount it.
 */
export function QuizshowLeaderboard({
  scores,
  highlightEntrantId,
  size,
}: QuizshowLeaderboardProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { rows, isSettled } = useLeaderboardOvertakes(
    scores.entries,
    scores.phaseId,
    reducedMotion,
  );
  return (
    <ol
      className={`${styles.leaderboard} ${styles[size]}`}
      aria-label={t("quizshow:stage.leaderboard")}
    >
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <LeaderboardRow
            key={row.entry.entrantId}
            row={row}
            isSettled={isSettled}
            isHighlighted={row.entry.entrantId === highlightEntrantId}
            size={size}
          />
        ))}
      </AnimatePresence>
    </ol>
  );
}
