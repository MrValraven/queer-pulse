import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { useQuizshowCountdown } from "./useQuizshowCountdown";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

interface QuizshowCountdownBarProps {
  cursor: QuizshowCursor | null;
  clockOffsetMs: number;
  hasExtraTime: boolean;
  size: QuizshowStageSize;
  /** The phase's standard limit in ms, so a bar that mounts during a pause still holds its place. */
  standardLimitMs?: number | null;
}

const LOW_FRACTION = 0.25;
const FIRST_ANNOUNCEMENT_SECONDS = 10;
const SECOND_ANNOUNCEMENT_SECONDS = 5;

export function QuizshowCountdownBar({
  cursor,
  clockOffsetMs,
  hasExtraTime,
  size,
  standardLimitMs = null,
}: QuizshowCountdownBarProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const countdown = useQuizshowCountdown(cursor, clockOffsetMs, {
    hasExtraTime,
    standardLimitMs,
  });
  const { fraction, remainingMs, isPaused, isFinishingUp } = countdown;

  // Paused is said once per surface by the shared QuizshowPausedNote, so the
  // bar only holds its place while paused and stays quiet.
  const visibleNote: string | null = isFinishingUp
    ? t("quizshow:stage.finishingUp")
    : null;

  // Announce at 10 and 5 seconds only: the text holds still between them, so a
  // screen reader says each line once and never counts every second.
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
  const fillClassName = [
    styles.fill,
    isLow ? styles.fillLow : "",
    reducedMotion ? styles.fillStill : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Collapse isOpen={fraction !== null}>
        <div className={`${styles.countdown} ${styles[size]}`}>
          <div className={styles.track} aria-hidden="true">
            <div
              className={fillClassName}
              style={{ transform: `scaleX(${fraction ?? 0})` }}
            />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={visibleNote ?? "none"}
              className={styles.countdownNote}
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
