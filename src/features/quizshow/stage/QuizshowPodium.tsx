import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPodiumEntry,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

interface QuizshowPodiumProps {
  /** The places revealed so far (the podium frame withholds the rest, C6.7); all of them at the end. */
  entries: readonly QuizshowPodiumEntry[];
  size: QuizshowStageSize;
  /** How many entrants played, when known: a place no entrant can reach never waits as an empty step. */
  entrantCount?: number | null;
  /** The viewer's own player or team on a phone: listed first on a tied step and marked as theirs. */
  highlightEntrantId?: string | null;
}

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

const STEP_EASE = [0.22, 0.68, 0.16, 1] as const;

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

/** Seconds between the winner's name arriving and the confetti burst. */
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
function PodiumConfetti() {
  const confettiStyle = {
    "--confetti-delay": `${CONFETTI_AFTER_SECONDS}s`,
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

/** In the order the list is drawn: first in the middle column, by the grid. */
const PODIUM_PLACES: readonly PodiumPlace[] = [1, 2, 3];

/**
 * The places still to come. The host reveals 3rd, then 2nd, then the winner
 * (C6.7), so a place below the lowest revealed one can still arrive and a
 * place above it never will. Nothing revealed yet: every place waits, up to
 * the number of entrants when it is known.
 */
function pendingPlacesOf(
  entries: readonly QuizshowPodiumEntry[],
  entrantCount: number | null,
): ReadonlySet<PodiumPlace> {
  const revealedPlaces = new Set(entries.map((entry) => entry.place));
  const lowestRevealed =
    revealedPlaces.size === 0 ? null : Math.min(...revealedPlaces);
  return new Set(
    PODIUM_PLACES.filter(
      (place) =>
        !revealedPlaces.has(place) &&
        (lowestRevealed === null || place < lowestRevealed) &&
        (entrantCount === null || place <= entrantCount),
    ),
  );
}

/**
 * The beat before the winner (C6.7): when 1st place arrives while the podium
 * is on screen, its step holds `podiumWinnerHoldMs` on "And the winner is"
 * first. A podium that mounts with the winner already in it (a reload, the
 * end screen) shows it at once. The timer is cleared on unmount.
 */
function useWinnerHold(hasWinner: boolean): boolean {
  const [isHoldDone, setIsHoldDone] = useState(hasWinner);
  const isHolding = hasWinner && !isHoldDone;
  useEffect(() => {
    if (!isHolding) return undefined;
    const timer = window.setTimeout(() => {
      setIsHoldDone(true);
    }, QUIZSHOW_LIMITS.podiumWinnerHoldMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isHolding]);
  return isHolding;
}

/**
 * A tied step with the viewer on it: the viewer comes first, so the "+N more"
 * line never hides them. The rest keep their order.
 */
function viewerFirst(
  entries: readonly QuizshowPodiumEntry[],
  highlightEntrantId: string | null,
): QuizshowPodiumEntry[] {
  const viewerEntries = entries.filter(
    (entry) => entry.entrantId === highlightEntrantId,
  );
  const otherEntries = entries.filter(
    (entry) => entry.entrantId !== highlightEntrantId,
  );
  return [...viewerEntries, ...otherEntries];
}

/** The names on one step (tied entrants stacked) and the score, faded in when the place is revealed. */
function PodiumReveal({
  entries,
  size,
  highlightEntrantId,
}: {
  entries: QuizshowPodiumEntry[];
  size: QuizshowStageSize;
  highlightEntrantId: string | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const shownEntries = viewerFirst(entries, highlightEntrantId).slice(
    0,
    MAX_NAMES_PER_STEP,
  );
  const moreCount = entries.length - shownEntries.length;
  const score = entries[0]?.score ?? 0;
  return (
    <>
      <span className={styles.podiumNames}>
        {shownEntries.map((entry) => (
          <span
            key={entry.entrantId}
            className={
              entry.entrantId === highlightEntrantId
                ? `${styles.podiumEntrant} ${styles.podiumEntrantSelf}`
                : styles.podiumEntrant
            }
            aria-current={
              entry.entrantId === highlightEntrantId ? "true" : undefined
            }
          >
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
    </>
  );
}

interface PodiumStepProps {
  place: PodiumPlace;
  /** Everyone on this place; empty while the place waits to be revealed. */
  entries: QuizshowPodiumEntry[];
  size: QuizshowStageSize;
  /** 1st place only: the held beat on "And the winner is". */
  isWinnerHold: boolean;
  highlightEntrantId: string | null;
  /** How many steps the grid lays out: the step glides only when it changes. */
  laidOutStepCount: number;
}

/**
 * One step: the block and its beam stand from the start; the names and the
 * score fade in when the host reveals the place. An unrevealed place is an
 * empty, dimmed block.
 */
function PodiumStep({
  place,
  entries,
  size,
  isWinnerHold,
  highlightEntrantId,
  laidOutStepCount,
}: PodiumStepProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isRevealed = entries.length > 0 && !isWinnerHold;
  const fadeTransition = {
    duration: reducedMotion ? 0.2 : 0.5,
    ease: STEP_EASE,
  };
  let topContent: "names" | "hold" | null = null;
  if (isRevealed) topContent = "names";
  else if (isWinnerHold) topContent = "hold";
  return (
    <m.li
      className={`${STEP_CLASS_NAMES[place]} ${styles.podiumStep}`}
      data-place={place}
      data-revealed={isRevealed ? "true" : "false"}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      // When a tie drops a step, the others glide to the centred two-step
      // layout: a FLIP of the position, transform only. Measured only when
      // the step count changes, so a reveal growing the step never moves it.
      layout={reducedMotion ? false : "position"}
      layoutDependency={laidOutStepCount}
      transition={{ duration: reducedMotion ? 0 : 0.5, ease: STEP_EASE }}
    >
      {/* The names rise in; under reduced motion they fade in place. */}
      <AnimatePresence mode="wait">
        {topContent !== null && (
          <m.span
            key={topContent}
            className={styles.podiumTop}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
          >
            {topContent === "names" ? (
              <PodiumReveal
                entries={entries}
                size={size}
                highlightEntrantId={highlightEntrantId}
              />
            ) : (
              <span className={styles.podiumHold}>
                {t("quizshow:stage.podiumWinnerHold")}
              </span>
            )}
          </m.span>
        )}
      </AnimatePresence>
      <span
        className={`${styles.podiumBlock} ${BLOCK_CLASS_NAMES[place]}`}
        aria-hidden="true"
      >
        <span className={styles.podiumPlace}>{place}</span>
      </span>
      {place === 1 && isRevealed && !reducedMotion && <PodiumConfetti />}
    </m.li>
  );
}

/**
 * Which pair a two-step podium stands as, for its grid columns: 2nd left of
 * the winner, or the winner left of 3rd. Undefined for any other count.
 */
function twoStepLayoutOf(
  laidOutStepCount: number,
  places: readonly PodiumPlace[],
): "second-first" | "first-third" | undefined {
  if (laidOutStepCount !== 2) return undefined;
  if (places.includes(1) && places.includes(2)) return "second-first";
  if (places.includes(1) && places.includes(3)) return "first-third";
  return undefined;
}

/**
 * How many steps the grid lays out. It grows at once and shrinks only once a
 * dropped step has faded out, so the steps that stay never jump under it.
 */
function useLaidOutStepCount(stepCount: number) {
  const [laidOutStepCount, setLaidOutStepCount] = useState(stepCount);
  if (stepCount > laidOutStepCount) setLaidOutStepCount(stepCount);
  const onStepExitComplete = () => {
    setLaidOutStepCount(stepCount);
  };
  return { laidOutStepCount, onStepExitComplete };
}

/**
 * The podium, paced by the host (item 12, C6.7): each `host:next` reveals
 * one more place, 3rd, then 2nd, then the winner after a held beat. The
 * places still to come stand as empty steps. Phones mount it too, and mark
 * the viewer's own name with `highlightEntrantId`.
 */
export function QuizshowPodium({
  entries,
  size,
  entrantCount = null,
  highlightEntrantId = null,
}: QuizshowPodiumProps) {
  const { reducedMotion } = useMotionPrefs();
  const isWinnerHold = useWinnerHold(
    entries.some((entry) => entry.place === 1),
  );
  // Through the hold the winner is not shown yet, so the steps still to come
  // stay as they were (a top tie leaves 2nd empty until the winner lands).
  const pendingPlaces = pendingPlacesOf(
    isWinnerHold ? entries.filter((entry) => entry.place !== 1) : entries,
    entrantCount,
  );
  const steps = PODIUM_PLACES.map((place) => ({
    place,
    placeEntries: entries.filter((entry) => entry.place === place),
  })).filter(
    (step) => step.placeEntries.length > 0 || pendingPlaces.has(step.place),
  );
  const { laidOutStepCount, onStepExitComplete } = useLaidOutStepCount(
    steps.length,
  );
  return (
    <ol
      className={[
        styles.podium,
        styles[size],
        reducedMotion ? "" : styles.podiumPulse,
      ]
        .filter(Boolean)
        .join(" ")}
      data-steps={laidOutStepCount}
      data-layout={twoStepLayoutOf(
        laidOutStepCount,
        steps.map((step) => step.place),
      )}
    >
      {/* A tie can leave a place nobody reaches: its empty step fades out. */}
      <AnimatePresence onExitComplete={onStepExitComplete}>
        {steps.map(({ place, placeEntries }) => (
          <PodiumStep
            key={place}
            place={place}
            entries={placeEntries}
            size={size}
            isWinnerHold={place === 1 && isWinnerHold}
            highlightEntrantId={highlightEntrantId}
            laidOutStepCount={laidOutStepCount}
          />
        ))}
      </AnimatePresence>
    </ol>
  );
}
