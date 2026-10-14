import { useMemo, type KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime } from "./api/studio.adapters";
import {
  useStudioPlayer,
  useStudioPlayerClock,
} from "./player/studioPlayerContext";
import {
  StudioWaveformScrubber,
  WAVEFORM_OVERLAY_CLASS,
} from "./player/ui/StudioWaveformScrubber";
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

/** The seek control: a native range input (role slider), five seconds per
 *  arrow key, elapsed and total time on either side. With peaks from the
 *  upload it lies over the waveform (spec 7.7). */
export function StudioPlayerSeek({
  onSeek,
  size = "bar",
}: {
  onSeek: (seconds: number) => void;
  size?: "bar" | "large";
}) {
  const { t } = useTranslation();
  const { currentTime, duration } = useStudioPlayerClock();
  const { currentWaveform, currentChapters } = useStudioPlayer();
  const chapterStarts = useMemo(
    () => currentChapters?.map((chapter) => chapter.startSeconds) ?? [],
    [currentChapters],
  );
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
    // The shortcuts hook ignores range inputs, so a focused slider seeks once;
    // stopping the event here keeps that true if the hook changes.
    event.stopPropagation();
    if (!isSeekable) return;
    if (isHome) onSeek(0);
    else if (isEnd) onSeek(total);
    else onSeek(currentTime + (KEY_STEPS[event.key] ?? 0));
  }

  const slider = (
    <input
      type="range"
      className={currentWaveform ? WAVEFORM_OVERLAY_CLASS : styles.seek}
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
  );

  return (
    <div className={styles.seekRow}>
      <span className={styles.time} aria-hidden>
        {elapsedLabel}
      </span>
      {currentWaveform ? (
        <StudioWaveformScrubber
          peaks={currentWaveform}
          chapterStarts={chapterStarts}
          currentTime={currentTime}
          duration={total}
          size={size}
        >
          {slider}
        </StudioWaveformScrubber>
      ) : (
        slider
      )}
      <span className={styles.time} aria-hidden>
        {totalLabel}
      </span>
    </div>
  );
}
