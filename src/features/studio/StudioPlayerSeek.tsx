import { useCallback, useMemo, type CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime } from "./api/studio.adapters";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioBufferedRange,
} from "./player/studioPlayerContext";
import { useStudioEpisodeSpeed } from "./player/useStudioEpisodeMemory";
import { playbackRateFor } from "./player/useStudioEpisodeRate";
import { StudioRangeSlider } from "./player/ui/range/StudioRangeSlider";
import type {
  StudioRangeBubbleContent,
  StudioRangeKeySteps,
} from "./player/ui/range/studioRange.types";
import { paintStudioRangeProgress } from "./player/ui/range/studioRangePaint";
import {
  StudioSeekElapsedLabel,
  StudioSeekTotalToggle,
} from "./player/ui/StudioSeekTimeLabels";
import {
  chapterAt,
  reservedTimeChars,
  toFractionSpans,
  UNKNOWN_TIME_LABEL,
} from "./player/ui/studioSeekTime";
import { StudioWaveformScrubber } from "./player/ui/StudioWaveformScrubber";
import { chapterTickPositions } from "./player/ui/studioWaveformBars";
import { useStudioSeekDisplay } from "./player/ui/useStudioSeekDisplay";
import { useStudioSeekTimeMode } from "./player/ui/useStudioSeekTimeMode";
import { useStudioSmoothProgress } from "./player/ui/useStudioSmoothProgress";
import styles from "./StudioPlayerSeek.module.css";

/** Five seconds per arrow key, thirty per page key. */
const SEEK_KEY_STEPS: StudioRangeKeySteps = { arrow: 5, page: 30 };
const EMPTY_BUFFERED_RANGES: readonly StudioBufferedRange[] = [];

/** The seek row: elapsed time, the shared range slider (over the waveform
 *  when the upload has peaks, spec 7.7) and the length, which a press
 *  turns into the time left. A drag or key burst seeks once on release,
 *  and the playhead holds the new spot until the clock gets there. */
export function StudioPlayerSeek({
  onSeek,
  size = "bar",
}: {
  onSeek: (seconds: number) => void;
  size?: "bar" | "large";
}) {
  const { t } = useTranslation();
  const { currentTime, duration, bufferedRanges, seekCount } =
    useStudioPlayerClock();
  const { currentWaveform, currentChapters, currentItem, status } =
    useStudioPlayer();
  // Same rule as the engine: music at 1x, an episode at the member's speed.
  const { speed } = useStudioEpisodeSpeed();
  const playbackRate = playbackRateFor(currentItem?.isEpisode === true, speed);
  const chapterStarts = useMemo(
    () => currentChapters?.map((chapter) => chapter.startSeconds) ?? [],
    [currentChapters],
  );
  const total = duration ?? 0;
  // Until the length is known the slider stays focusable and ignores input.
  const isSeekable = total > 0;
  const trackKey = currentItem?.queueEntryId ?? null;
  const isPlaying = status === "playing";
  const seek = useStudioSeekDisplay({
    clockSeconds: currentTime,
    clockSeekCount: seekCount ?? 0,
    isPlaying,
    trackKey,
    onSeek,
  });
  const { mode, toggleMode } = useStudioSeekTimeMode();
  const progressRef = useStudioSmoothProgress<HTMLDivElement>({
    currentTime: seek.displaySeconds,
    duration: total,
    isPlaying: isPlaying && seek.previewSeconds === null,
    playbackRate,
    paint: paintStudioRangeProgress,
  });
  const tickFractions = useMemo(
    () => chapterTickPositions(chapterStarts, total),
    [chapterStarts, total],
  );
  const bufferedSpans = useMemo(
    () => toFractionSpans(bufferedRanges ?? EMPTY_BUFFERED_RANGES, total),
    [bufferedRanges, total],
  );
  const describeValue = useCallback(
    (seconds: number): StudioRangeBubbleContent => ({
      valueLabel: formatTrackTime(seconds) ?? "0:00",
      detailLabel: chapterAt(currentChapters, seconds)?.title ?? null,
    }),
    [currentChapters],
  );

  const totalLabel = isSeekable
    ? (formatTrackTime(total) ?? UNKNOWN_TIME_LABEL)
    : UNKNOWN_TIME_LABEL;
  const announcedLabel = formatTrackTime(seek.announcedSeconds) ?? "0:00";
  const announcedChapter = chapterAt(currentChapters, seek.announcedSeconds);
  let ariaValueText = t("studio:playerBar.seekValueUnknown");
  if (isSeekable)
    ariaValueText = announcedChapter
      ? t("studio:playerBar.seekValueChapter", {
          elapsed: announcedLabel,
          total: totalLabel,
          chapter: announcedChapter.title,
        })
      : t("studio:playerBar.seekValue", {
          elapsed: announcedLabel,
          total: totalLabel,
        });
  // Reserved from the known length only, so the bar keeps its width when
  // the length arrives.
  const timeChars = reservedTimeChars(
    isSeekable
      ? t("studio:playerBar.remainingTime", { time: totalLabel })
      : UNKNOWN_TIME_LABEL,
  );

  return (
    <div
      className={styles.seekRow}
      data-size={size}
      style={{ "--studio-seek-time-chars": timeChars } as CSSProperties}
    >
      <StudioSeekElapsedLabel
        seconds={seek.displaySeconds}
        isLengthKnown={isSeekable}
      />
      <StudioRangeSlider
        variant="seek"
        size={size}
        min={0}
        max={total}
        value={seek.heldSeconds ?? currentTime}
        isDisabled={!isSeekable}
        commitMode="release"
        keySteps={SEEK_KEY_STEPS}
        ariaLabel={t("studio:playerBar.seekLabel")}
        ariaValueText={ariaValueText}
        ariaValueNow={seek.announcedSeconds}
        describeValue={describeValue}
        tickFractions={tickFractions}
        bufferedSpans={bufferedSpans}
        visual={
          currentWaveform ? (
            <StudioWaveformScrubber
              peaks={currentWaveform}
              chapterStarts={chapterStarts}
              duration={total}
              size={size}
            />
          ) : undefined
        }
        progressElementRef={progressRef}
        interactionResetKey={trackKey}
        onPreviewChange={seek.handlePreviewChange}
        onCommit={seek.handleCommit}
        className={styles.slider}
      />
      <StudioSeekTotalToggle
        mode={mode}
        onToggle={toggleMode}
        totalSeconds={total}
        displaySeconds={seek.displaySeconds}
        isLengthKnown={isSeekable}
      />
    </div>
  );
}
