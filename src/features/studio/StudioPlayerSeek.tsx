import type { KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime } from "./api/studio.adapters";
import { useStudioPlayerClock } from "./player/studioPlayerContext";
import styles from "./StudioPlayer.module.css";

const ARROW_STEP_SECONDS = 5;
const PAGE_STEP_SECONDS = 30;
const KEY_STEPS: Record<string, number> = {
  ArrowRight: ARROW_STEP_SECONDS,
  ArrowUp: ARROW_STEP_SECONDS,
  ArrowLeft: -ARROW_STEP_SECONDS,
  ArrowDown: -ARROW_STEP_SECONDS,
  PageUp: PAGE_STEP_SECONDS,
  PageDown: -PAGE_STEP_SECONDS,
};

/** The seek slider: a native range input (role slider), five seconds per
 *  arrow key, elapsed and total time on either side. */
export function StudioPlayerSeek({
  onSeek,
}: {
  onSeek: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const { currentTime, duration } = useStudioPlayerClock();
  const total = duration ?? 0;
  // Until the length is known the slider stays focusable and ignores input.
  const isSeekable = total > 0;
  const elapsedLabel = formatTrackTime(currentTime) ?? "0:00";
  const totalLabel = formatTrackTime(duration) ?? "0:00";

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isHome = event.key === "Home";
    const isEnd = event.key === "End";
    if (!isHome && !isEnd && !(event.key in KEY_STEPS)) return;
    event.preventDefault();
    if (!isSeekable) return;
    if (isHome) onSeek(0);
    else if (isEnd) onSeek(total);
    else onSeek(currentTime + (KEY_STEPS[event.key] ?? 0));
  }

  return (
    <div className={styles.seekRow}>
      <span className={styles.time} aria-hidden>
        {elapsedLabel}
      </span>
      <input
        type="range"
        className={styles.seek}
        min={0}
        max={total}
        step="any"
        value={Math.min(currentTime, total)}
        aria-disabled={!isSeekable || undefined}
        aria-label={t("studio:playerBar.seekLabel")}
        aria-valuetext={t("studio:playerBar.seekValue", {
          elapsed: elapsedLabel,
          total: totalLabel,
        })}
        onChange={(event) => {
          if (isSeekable) onSeek(Number(event.target.value));
        }}
        onKeyDown={handleKeyDown}
      />
      <span className={styles.time} aria-hidden>
        {totalLabel}
      </span>
    </div>
  );
}
