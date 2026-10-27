import { useId, useLayoutEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiMoon } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button, useChipMotion } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../../api/studio.adapters";
import {
  useStudioPlayer,
  type StudioSleepTimerOption,
  type StudioSleepTimerState,
} from "../studioPlayerContext";
import { remainingSeconds } from "./studioSleepTimerLabel";
import styles from "./StudioPlayerControls.module.css";
import timerStyles from "./StudioSleepTimer.module.css";

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
 *  and moves focus to its neighbour, since the chip leaves. Timer changes
 *  are spoken by the player's one live region (useStudioSleepAnnouncement),
 *  which stays mounted when either chip is not. */
export function StudioSleepTimerChip() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { sleepTimer, cancelSleepTimer, currentItem } = useStudioPlayer();
  // An episode's timer stops at the end of the episode, and says so.
  const isEpisode = currentItem?.isEpisode === true;
  const descriptionId = useId();
  const now = useNow(sleepTimer?.kind === "minutes" ? sleepTimer.endsAt : null);
  const seconds = sleepTimer ? remainingSeconds(sleepTimer, now) : null;
  const remaining = formatTrackTime(seconds) ?? "0:00";
  return (
    <>
      <AnimatePresence initial={false}>
        {sleepTimer && (
          <m.span
            key="sleep-chip"
            className={timerStyles.chipSlot}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            <Button
              variant="quiet"
              className={`${styles.chip} ${timerStyles.chip}`}
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
                // The slot leaves with the chip, so its neighbour takes focus.
                const slot = event.currentTarget.parentElement;
                neighbourOf(slot ?? event.currentTarget)?.focus();
                cancelSleepTimer();
              }}
            >
              <FiMoon aria-hidden />
              <span>
                {sleepTimer.kind !== "endOfTrack"
                  ? t("studio:player.sleep.chip", { remaining })
                  : isEpisode
                    ? t("studio:player.sleep.chipEndOfEpisode")
                    : t("studio:player.sleep.chipEndOfTrack")}
              </span>
            </Button>
          </m.span>
        )}
      </AnimatePresence>
      <span id={descriptionId} hidden>
        {t(
          isEpisode
            ? "studio:player.sleep.cancelAriaEndOfEpisode"
            : "studio:player.sleep.cancelAriaEndOfTrack",
        )}
      </span>
    </>
  );
}

/** Whether `option` is the timer that runs. The player keeps the length a
 *  minutes timer was set for beside its end time (useStudioSleepTimer). */
function isOptionActive(
  timer: StudioSleepTimerState,
  option: StudioSleepTimerOption,
): boolean {
  if (!timer || timer.kind !== option.kind) return false;
  if (timer.kind === "endOfTrack" || option.kind === "endOfTrack") return true;
  return "minutes" in timer && timer.minutes === option.minutes;
}

/** One timer choice. The running one is pressed and carries a check
 *  (DES-27), so the set timer never has to be read off the chip. */
function SleepOption({
  label,
  ariaLabel,
  isActive,
  isWide = false,
  onChoose,
}: {
  label: string;
  /** The full name when the visible label is short ("15 min"). */
  ariaLabel?: string;
  isActive: boolean;
  /** Takes two cells of the grid (End of track). */
  isWide?: boolean;
  onChoose: () => void;
}) {
  const { chip } = useChipMotion();
  return (
    <Button
      variant="quiet"
      className={[
        styles.option,
        timerStyles.choice,
        isWide && timerStyles.wide,
        isActive && timerStyles.active,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      onClick={onChoose}
    >
      <AnimatePresence initial={false}>
        {isActive && (
          <m.span key="check" className={timerStyles.check} {...chip}>
            <FiCheck aria-hidden />
          </m.span>
        )}
      </AnimatePresence>
      {label}
    </Button>
  );
}

/** The timer choices, in the More panel and behind Now playing's moon: a
 *  three-column grid of short lengths, then End of track across two cells.
 *  "Turn off the timer" grows in under them while a timer runs. Pressing
 *  the running choice keeps its timer as it is. */
export function StudioSleepTimerOptions({
  onChosen,
}: {
  onChosen: () => void;
}) {
  const { t } = useTranslation();
  const { chip } = useChipMotion();
  const { sleepTimer, startSleepTimer, cancelSleepTimer, currentItem } =
    useStudioPlayer();
  const choose = (option: StudioSleepTimerOption) => {
    if (!isOptionActive(sleepTimer, option)) startSleepTimer(option);
    onChosen();
  };
  const endOfTrack: StudioSleepTimerOption = { kind: "endOfTrack" };
  return (
    <div className={`${styles.options} ${timerStyles.grid}`}>
      {MINUTE_OPTIONS.map((minutes) => {
        const option: StudioSleepTimerOption = { kind: "minutes", minutes };
        return (
          <SleepOption
            key={minutes}
            label={t("studio:player.sleep.minutesShort", { count: minutes })}
            ariaLabel={t("studio:player.sleep.minutes", { count: minutes })}
            isActive={isOptionActive(sleepTimer, option)}
            onChoose={() => choose(option)}
          />
        );
      })}
      <SleepOption
        label={t(
          currentItem?.isEpisode === true
            ? "studio:player.sleep.endOfEpisode"
            : "studio:player.sleep.endOfTrack",
        )}
        isWide
        isActive={isOptionActive(sleepTimer, endOfTrack)}
        onChoose={() => choose(endOfTrack)}
      />
      <AnimatePresence initial={false}>
        {sleepTimer && (
          <m.span key="turn-off" className={timerStyles.turnOffSlot} {...chip}>
            <Button
              variant="quiet"
              className={`${styles.option} ${timerStyles.choice} ${timerStyles.turnOff}`}
              onClick={() => {
                cancelSleepTimer();
                onChosen();
              }}
            >
              {t("studio:player.sleep.turnOff")}
            </Button>
          </m.span>
        )}
      </AnimatePresence>
    </div>
  );
}
