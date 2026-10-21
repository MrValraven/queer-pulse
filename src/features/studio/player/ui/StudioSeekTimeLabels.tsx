import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../../api/studio.adapters";
import styles from "../../StudioPlayerSeek.module.css";
import { UNKNOWN_TIME_LABEL } from "./studioSeekTime";
import type { StudioSeekTimeMode } from "./useStudioSeekTimeMode";

/** The elapsed time before the seek bar. The slider speaks the time, so
 *  this stays hidden from screen readers. */
export function StudioSeekElapsedLabel({
  seconds,
  isLengthKnown,
}: {
  seconds: number;
  isLengthKnown: boolean;
}) {
  return (
    <span className={styles.time} data-seek-time="" aria-hidden>
      {isLengthKnown
        ? (formatTrackTime(seconds) ?? "0:00")
        : UNKNOWN_TIME_LABEL}
    </span>
  );
}

/** The label after the seek bar: the track's length, or the time left
 *  once the member presses it. Its press area reaches 44px tall on touch
 *  while the text keeps its size (DES-24). */
export function StudioSeekTotalToggle({
  mode,
  onToggle,
  totalSeconds,
  displaySeconds,
  isLengthKnown,
}: {
  mode: StudioSeekTimeMode;
  onToggle: () => void;
  totalSeconds: number;
  displaySeconds: number;
  isLengthKnown: boolean;
}) {
  const { t } = useTranslation();
  // Whole seconds on both sides, so elapsed and time left add up to the length.
  const remainingSeconds = Math.max(
    0,
    Math.floor(totalSeconds) - Math.floor(displaySeconds),
  );
  const remainingLabel = formatTrackTime(remainingSeconds) ?? "0:00";
  const totalLabel = formatTrackTime(totalSeconds) ?? UNKNOWN_TIME_LABEL;
  let shownLabel = UNKNOWN_TIME_LABEL;
  if (isLengthKnown)
    shownLabel =
      mode === "remaining"
        ? t("studio:playerBar.remainingTime", { time: remainingLabel })
        : totalLabel;
  return (
    <Button
      variant="quiet"
      className={`${styles.time} ${styles.timeToggle}`}
      data-seek-time=""
      aria-pressed={mode === "remaining"}
      aria-disabled={isLengthKnown ? undefined : "true"}
      // The name starts with the time on screen, so voice control can press
      // it by what it shows (WCAG 2.5.3); aria-pressed carries the mode.
      aria-label={t("studio:playerBar.timeToggleLabel", { time: shownLabel })}
      onClick={() => {
        if (isLengthKnown) onToggle();
      }}
    >
      {shownLabel}
    </Button>
  );
}
