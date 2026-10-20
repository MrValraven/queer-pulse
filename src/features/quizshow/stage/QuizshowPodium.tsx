import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../../shared/i18n/format";
import type { QuizshowPodiumEntry } from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

interface QuizshowPodiumProps {
  entries: readonly QuizshowPodiumEntry[];
  size: QuizshowStageSize;
}

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

const STEP_GAP_SECONDS = 0.8;

/** Third place shows first, then second, then first: 0.8 s apart. */
const REVEAL_ORDER: Record<QuizshowPodiumEntry["place"], number> = {
  3: 0,
  2: 1,
  1: 2,
};

const STEP_CLASS_NAMES: Record<QuizshowPodiumEntry["place"], string> = {
  1: styles.podiumFirst ?? "",
  2: styles.podiumSecond ?? "",
  3: styles.podiumThird ?? "",
};

const BLOCK_CLASS_NAMES: Record<QuizshowPodiumEntry["place"], string> = {
  1: styles.podiumBlockFirst ?? "",
  2: styles.podiumBlockSecond ?? "",
  3: styles.podiumBlockThird ?? "",
};

export function QuizshowPodium({ entries, size }: QuizshowPodiumProps) {
  const { reducedMotion } = useMotionPrefs();
  const format = useFormat();
  const entriesByPlace = [...entries].sort(
    (first, second) => first.place - second.place,
  );
  return (
    <ol className={`${styles.podium} ${styles[size]}`}>
      {entriesByPlace.map((entry) => {
        const delaySeconds = reducedMotion
          ? 0
          : REVEAL_ORDER[entry.place] * STEP_GAP_SECONDS;
        return (
          <m.li
            key={entry.entrantId}
            className={`${STEP_CLASS_NAMES[entry.place]} ${styles.podiumStep}`}
            data-place={entry.place}
            data-reveal-delay={delaySeconds}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: delaySeconds,
              ease: [0.22, 0.68, 0.16, 1],
            }}
          >
            {entry.colorKey !== null && (
              <QuizshowShape
                colorKey={entry.colorKey}
                size={SHAPE_SIZES[size]}
                label={null}
              />
            )}
            <span className={styles.podiumName}>{entry.name}</span>
            <span className={styles.podiumScore}>
              {format.number(entry.score)}
            </span>
            <span
              className={`${styles.podiumBlock} ${BLOCK_CLASS_NAMES[entry.place]}`}
              aria-hidden="true"
            >
              {entry.place}
            </span>
          </m.li>
        );
      })}
    </ol>
  );
}
