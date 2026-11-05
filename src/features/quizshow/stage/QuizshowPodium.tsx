import type { CSSProperties } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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

/** Seconds between the winner's step starting to rise and the confetti burst. */
const CONFETTI_AFTER_SECONDS = 0.45;

const CONFETTI_COLORS = [
  "var(--quizshow-triangle)",
  "var(--quizshow-circle)",
  "var(--quizshow-star)",
  "var(--quizshow-moon)",
  "var(--accent)",
  "var(--quizshow-hexagon)",
] as const;

/**
 * Sixteen pieces, spread evenly left to right, each with its own arc and
 * spin. Every height is above the winner's name (negative is up): the burst
 * fans out over the name and settles back without ever reaching it, so the
 * name and the score stay clear the whole time.
 */
const CONFETTI_PIECES = Array.from({ length: 16 }, (_, pieceIndex) => {
  const spread = pieceIndex / 15 - 0.5;
  return {
    id: `piece-${pieceIndex}`,
    style: {
      "--piece-color": CONFETTI_COLORS[pieceIndex % CONFETTI_COLORS.length],
      "--piece-x": `${(spread * 9).toFixed(2)}em`,
      "--piece-rise": `${(-0.9 - ((pieceIndex * 3) % 5) * 0.15).toFixed(2)}em`,
      "--piece-fall": `${(-0.15 - (pieceIndex % 3) * 0.15).toFixed(2)}em`,
      "--piece-spin": `${(pieceIndex % 2 === 0 ? 1 : -1) * (220 + pieceIndex * 18)}deg`,
      "--piece-delay": `${((pieceIndex % 5) * 0.035).toFixed(3)}s`,
    } as CSSProperties,
  };
});

/** A short burst above the winner's name: CSS pieces, about 1.4 s, played once. */
function PodiumConfetti({ delaySeconds }: { delaySeconds: number }) {
  const confettiStyle = {
    "--confetti-delay": `${delaySeconds + CONFETTI_AFTER_SECONDS}s`,
  } as CSSProperties;
  return (
    <span className={styles.confetti} style={confettiStyle} aria-hidden="true">
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.id}
          className={styles.confettiPiece}
          style={piece.style}
        />
      ))}
    </span>
  );
}

/** The most names one step lists before a "+N more" line. */
const MAX_NAMES_PER_STEP = 3;

type PodiumPlace = QuizshowPodiumEntry["place"];

/** Ties share a place, so each place gets one step that lists everyone on it. */
function groupByPlace(
  entries: readonly QuizshowPodiumEntry[],
): { place: PodiumPlace; entries: QuizshowPodiumEntry[] }[] {
  const places: PodiumPlace[] = [1, 2, 3];
  return places
    .map((place) => ({
      place,
      entries: entries.filter((entry) => entry.place === place),
    }))
    .filter((group) => group.entries.length > 0);
}

interface PodiumStepProps {
  place: PodiumPlace;
  entries: QuizshowPodiumEntry[];
  size: QuizshowStageSize;
}

/** One step: its names (tied entrants stacked), the score, the block and its beam. */
function PodiumStep({ place, entries, size }: PodiumStepProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const format = useFormat();
  const delaySeconds = reducedMotion
    ? 0
    : REVEAL_ORDER[place] * STEP_GAP_SECONDS;
  const shownEntries = entries.slice(0, MAX_NAMES_PER_STEP);
  const moreCount = entries.length - shownEntries.length;
  const score = entries[0]?.score ?? 0;
  return (
    <m.li
      className={`${STEP_CLASS_NAMES[place]} ${styles.podiumStep}`}
      data-place={place}
      data-reveal-delay={delaySeconds}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: delaySeconds,
        ease: [0.22, 0.68, 0.16, 1],
      }}
    >
      <span className={styles.podiumNames}>
        {shownEntries.map((entry) => (
          <span key={entry.entrantId} className={styles.podiumEntrant}>
            {entry.colorKey !== null && (
              <QuizshowShape
                colorKey={entry.colorKey}
                size={SHAPE_SIZES[size]}
                label={null}
                isGlowing
              />
            )}
            <span className={styles.podiumName}>{entry.name}</span>
          </span>
        ))}
        {moreCount > 0 && (
          <span className={styles.podiumMore}>
            {t("quizshow:screen.morePlayers", { count: moreCount })}
          </span>
        )}
      </span>
      <span className={styles.podiumScore}>{format.number(score)}</span>
      <span
        className={`${styles.podiumBlock} ${BLOCK_CLASS_NAMES[place]}`}
        aria-hidden="true"
      >
        <span className={styles.podiumPlace}>{place}</span>
      </span>
      {place === 1 && !reducedMotion && (
        <PodiumConfetti delaySeconds={delaySeconds} />
      )}
    </m.li>
  );
}

export function QuizshowPodium({ entries, size }: QuizshowPodiumProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <ol
      className={[
        styles.podium,
        styles[size],
        reducedMotion ? "" : styles.podiumPulse,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {groupByPlace(entries).map((group) => (
        <PodiumStep
          key={group.place}
          place={group.place}
          entries={group.entries}
          size={size}
        />
      ))}
    </ol>
  );
}
