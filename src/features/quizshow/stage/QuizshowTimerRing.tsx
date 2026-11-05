import type { CSSProperties } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiPause } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { useQuizshowCountdown } from "./useQuizshowCountdown";
import styles from "./QuizshowTimerRing.module.css";
import type { QuizshowStageSize } from "./quizshowText";

export interface QuizshowTimerRingProps {
  cursor: QuizshowCursor | null;
  clockOffsetMs: number;
  hasExtraTime: boolean;
  size: QuizshowStageSize;
  /** The phase's standard limit in ms, so a ring that mounts during a pause still holds its place. */
  standardLimitMs?: number | null;
  /**
   * The limit of a countdown that has not started yet (the screen's `read`
   * phase, before the answers open). Set, the ring draws full and still with
   * this number, says nothing and has no low state; the cursor's own
   * countdown is ignored.
   */
  previewSeconds?: number | null;
}

const LOW_FRACTION = 0.25;
const FIRST_ANNOUNCEMENT_SECONDS = 10;
const SECOND_ANNOUNCEMENT_SECONDS = 5;
const FULL_TURN_DEGREES = 360;

/**
 * The countdown as a gradient ring with the seconds left in the middle. It
 * takes the bar's props and reads the same countdown, so it announces at 10 and
 * 5 seconds only, holds its place while paused and says "Finishing up" when
 * only players with extra time are still answering.
 */
export function QuizshowTimerRing({
  cursor,
  clockOffsetMs,
  hasExtraTime,
  size,
  standardLimitMs = null,
  previewSeconds = null,
}: QuizshowTimerRingProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const countdown = useQuizshowCountdown(cursor, clockOffsetMs, {
    hasExtraTime,
    standardLimitMs,
  });
  const isPreview = previewSeconds !== null;
  const fraction = isPreview ? 1 : countdown.fraction;
  const remainingMs = isPreview ? null : countdown.remainingMs;
  const isPaused = isPreview ? false : countdown.isPaused;
  const isFinishingUp = isPreview ? false : countdown.isFinishingUp;

  // Paused is said once per surface by the shared QuizshowPausedNote, so the
  // ring only holds its place while paused and stays quiet.
  const visibleNote: string | null = isFinishingUp
    ? t("quizshow:stage.finishingUp")
    : null;

  // The text holds still between 10 and 5 seconds, so a screen reader says each
  // line once and never counts every second.
  let spokenLine = visibleNote ?? "";
  if (
    visibleNote === null &&
    !isPaused &&
    remainingMs !== null &&
    remainingMs > 0
  ) {
    const secondsLeft = Math.ceil(remainingMs / 1000);
    if (secondsLeft <= SECOND_ANNOUNCEMENT_SECONDS) {
      spokenLine = t("quizshow:stage.secondsLeft", {
        seconds: SECOND_ANNOUNCEMENT_SECONDS,
      });
    } else if (secondsLeft <= FIRST_ANNOUNCEMENT_SECONDS) {
      spokenLine = t("quizshow:stage.secondsLeft", {
        seconds: FIRST_ANNOUNCEMENT_SECONDS,
      });
    }
  }

  const isLow = fraction !== null && fraction < LOW_FRACTION;
  const wrapClassName = [
    styles.wrap,
    styles[size],
    isLow ? styles.low : "",
    isPaused ? styles.paused : "",
    fraction === 0 ? styles.empty : "",
    reducedMotion ? styles.still : "",
  ]
    .filter(Boolean)
    .join(" ");
  const sweepStyle = {
    "--qs-ring-sweep": `${(fraction ?? 0) * FULL_TURN_DEGREES}deg`,
  } as CSSProperties;
  // A restart pause has a fraction but no remainder: derive the seconds from
  // the phase limit when it is known, and otherwise show a pause icon.
  let secondsLeft: number | null = previewSeconds;
  if (remainingMs !== null) {
    secondsLeft = Math.ceil(remainingMs / 1000);
  } else if (!isPreview && fraction !== null && standardLimitMs !== null) {
    secondsLeft = Math.ceil((fraction * standardLimitMs) / 1000);
  }

  return (
    <>
      <Collapse isOpen={fraction !== null}>
        <div className={wrapClassName}>
          <div
            className={styles.dial}
            role="timer"
            aria-label={t("quizshow:stage.timerLabel")}
          >
            <div className={styles.halo} aria-hidden="true" />
            <div className={styles.disc} aria-hidden="true" />
            <div className={styles.track} aria-hidden="true" />
            <div className={styles.arc} style={sweepStyle} aria-hidden="true" />
            {secondsLeft === null ? (
              <FiPause
                className={styles.pauseIcon}
                role="img"
                aria-label={t("quizshow:stage.paused")}
              />
            ) : (
              <span className={styles.number} aria-hidden="true">
                {secondsLeft}
              </span>
            )}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={visibleNote ?? "none"}
              className={styles.note}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
            >
              {visibleNote}
            </m.span>
          </AnimatePresence>
        </div>
      </Collapse>
      <span role="status" className={styles.visuallyHidden}>
        {spokenLine}
      </span>
    </>
  );
}
