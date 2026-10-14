import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMoon } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../../api/studio.adapters";
import {
  useStudioPlayer,
  type StudioSleepTimerOption,
  type StudioSleepTimerState,
} from "../studioPlayerContext";
import { remainingSeconds } from "./studioSleepTimerLabel";
import styles from "./StudioPlayerControls.module.css";

const MINUTE_OPTIONS = [15, 30, 45, 60] as const;

/** The clock for a minutes timer, restarted whenever `endsAt` changes. The
 *  restart reads the time in a layout effect, so a replaced timer repaints
 *  with a fresh clock and never shows a stale second (30:01). */
function useNow(endsAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useLayoutEffect(() => {
    if (endsAt === null) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [endsAt]);
  return now;
}

const timerKey = (timer: StudioSleepTimerState) =>
  !timer
    ? "off"
    : timer.kind === "minutes"
      ? `minutes:${timer.endsAt}`
      : "endOfTrack";

/** One sentence per timer change, compared by content, so clock ticks and
 *  re-renders with an equal value stay silent. */
function useSleepAnnouncement(timer: StudioSleepTimerState): string {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");
  const previousKeyRef = useRef(timerKey(timer));
  useEffect(() => {
    const key = timerKey(timer);
    if (key === previousKeyRef.current) return;
    previousKeyRef.current = key;
    if (!timer) setAnnouncement(t("studio:player.sleep.cancelledStatus"));
    else if (timer.kind === "endOfTrack")
      setAnnouncement(t("studio:player.sleep.endOfTrackStatus"));
    else
      setAnnouncement(
        t("studio:player.sleep.setStatus", {
          minutes: Math.max(1, Math.round((timer.endsAt - Date.now()) / 60000)),
        }),
      );
  }, [timer, t]);
  return announcement;
}

/** The control that takes focus when the chip it replaces turns the timer
 *  off: the next button or link beside the chip, else the one before it. */
function neighbourOf(chip: HTMLElement): HTMLElement | null {
  const siblings = Array.from(
    chip.parentElement?.querySelectorAll<HTMLElement>("button, a[href]") ?? [],
  ).filter((element) => !chip.contains(element));
  return (
    siblings.find(
      (element) =>
        chip.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ) ??
    siblings.at(-1) ??
    null
  );
}

/** The chip in the bar and in Now playing; pressing it turns the timer off
 *  and moves focus to its neighbour, since the chip leaves. One chip
 *  announces at a time (`announces`), so a screen reader hears each change
 *  once while both are mounted. */
export function StudioSleepTimerChip({
  announces = true,
}: {
  announces?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { sleepTimer, cancelSleepTimer } = useStudioPlayer();
  const descriptionId = useId();
  const now = useNow(sleepTimer?.kind === "minutes" ? sleepTimer.endsAt : null);
  const announcement = useSleepAnnouncement(sleepTimer);
  const seconds = sleepTimer ? remainingSeconds(sleepTimer, now) : null;
  const remaining = formatTrackTime(seconds) ?? "0:00";
  return (
    <>
      <AnimatePresence initial={false}>
        {sleepTimer && (
          <m.button
            key="sleep-chip"
            type="button"
            className={styles.chip}
            // The minutes name contains its visible "1:30 left"; the end of
            // track chip is named by its visible text and describes the action.
            aria-label={
              sleepTimer.kind === "minutes"
                ? t("studio:player.sleep.cancelAria", { remaining })
                : undefined
            }
            aria-describedby={
              sleepTimer.kind === "endOfTrack" ? descriptionId : undefined
            }
            onClick={(event) => {
              neighbourOf(event.currentTarget)?.focus();
              cancelSleepTimer();
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            <FiMoon aria-hidden />
            <span>
              {sleepTimer.kind === "endOfTrack"
                ? t("studio:player.sleep.chipEndOfTrack")
                : t("studio:player.sleep.chip", { remaining })}
            </span>
          </m.button>
        )}
      </AnimatePresence>
      <span id={descriptionId} hidden>
        {t("studio:player.sleep.cancelAriaEndOfTrack")}
      </span>
      {announces && (
        <span className="visuallyHidden" role="status">
          {announcement}
        </span>
      )}
    </>
  );
}

/** The timer choices, in the More panel and behind Now playing's moon. */
export function StudioSleepTimerOptions({
  onChosen,
}: {
  onChosen: () => void;
}) {
  const { t } = useTranslation();
  const { sleepTimer, startSleepTimer, cancelSleepTimer } = useStudioPlayer();
  const choose = (option: StudioSleepTimerOption) => {
    startSleepTimer(option);
    onChosen();
  };
  return (
    <div className={styles.options}>
      {MINUTE_OPTIONS.map((minutes) => (
        <button
          key={minutes}
          type="button"
          className={styles.option}
          onClick={() => choose({ kind: "minutes", minutes })}
        >
          {t("studio:player.sleep.minutes", { count: minutes })}
        </button>
      ))}
      <button
        type="button"
        className={styles.option}
        onClick={() => choose({ kind: "endOfTrack" })}
      >
        {t("studio:player.sleep.endOfTrack")}
      </button>
      {sleepTimer && (
        <button
          type="button"
          className={styles.option}
          onClick={() => {
            cancelSleepTimer();
            onChosen();
          }}
        >
          {t("studio:player.sleep.turnOff")}
        </button>
      )}
    </div>
  );
}
