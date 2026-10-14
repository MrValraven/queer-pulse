import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { FiMinus, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { prefersReducedMotionNow } from "../../../../shared/hooks/usePrefersReducedMotion";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { activeIndexAt } from "../../player/studioTimeline";
import { StudioSyncedLyrics } from "../../player/ui/StudioSyncedLyrics";
import { formatLrcTime } from "./studioLrc";
import type { TapAlong, TapLimitProblem } from "./useTapAlong";
import { useTimingAudio, type TimingAudioSource } from "./useTimingAudio";
import styles from "./StudioLyricTiming.module.css";

/** Collapse's open duration (0.28 s) plus a frame, so the preview has its
 *  full height before it is scrolled into view. */
const PREVIEW_EXPAND_MS = 300;

const isControl = (target: EventTarget) =>
  target instanceof HTMLElement &&
  target.closest(
    "button, input, textarea, select, a, [contenteditable='true']",
  ) !== null;

/** Real audio can stamp and seek once it is ready; the demo silent clock
 *  always can. */
const isAudioClockUsable = (audio: ReturnType<typeof useTimingAudio>) =>
  audio.isSilentClock || (audio.isReady && !audio.hasError);

function AudioStatus({ audio }: { audio: ReturnType<typeof useTimingAudio> }) {
  const { t } = useTranslation();
  const key = audio.hasError
    ? "studio:lyricTiming.tap.audioError"
    : !audio.isReady
      ? "studio:lyricTiming.tap.loading"
      : audio.isSilentClock
        ? "studio:lyricTiming.tap.silentClock"
        : null;
  return (
    <p className={styles.hint} role="status">
      {key ? t(key) : ""}
    </p>
  );
}

function TapLineRow({
  text,
  index,
  stamp,
  isNext,
  isPlaying,
  tap,
  audio,
}: {
  text: string;
  index: number;
  stamp: number | null;
  isNext: boolean;
  isPlaying: boolean;
  tap: TapAlong;
  audio: ReturnType<typeof useTimingAudio>;
}) {
  const { t } = useTranslation();
  const number = index + 1;
  const isSeekable = stamp !== null && isAudioClockUsable(audio);
  return (
    <li
      className={styles.line}
      data-next={isNext || undefined}
      data-playing={isPlaying || undefined}
    >
      <span className={styles.lineTime}>
        {stamp === null
          ? t("studio:lyricTiming.tap.notTimed")
          : formatLrcTime(stamp)}
      </span>
      <span className={styles.lineText}>{text}</span>
      <span className={styles.lineActions}>
        <button
          type="button"
          aria-disabled={stamp === null || undefined}
          aria-label={t("studio:lyricTiming.tap.earlier", { number })}
          onClick={() => tap.nudge(index, -1)}
        >
          <FiMinus aria-hidden />
        </button>
        <button
          type="button"
          aria-disabled={stamp === null || undefined}
          aria-label={t("studio:lyricTiming.tap.later", { number })}
          onClick={() => tap.nudge(index, 1)}
        >
          <FiPlus aria-hidden />
        </button>
        <button
          type="button"
          aria-disabled={!isSeekable || undefined}
          aria-label={t("studio:lyricTiming.tap.playFromHere", {
            number,
          })}
          onClick={() => {
            if (stamp === null || !isSeekable) return;
            audio.seek(stamp / 1000);
            if (!audio.isPlaying) audio.play();
          }}
        >
          <FiPlay aria-hidden />
        </button>
      </span>
    </li>
  );
}

export function StudioTapAlongPane({
  lyricLines,
  tap,
  audioSource,
  stampButtonRef,
  limitProblem,
}: {
  lyricLines: readonly string[];
  tap: TapAlong;
  audioSource: TimingAudioSource;
  stampButtonRef: RefObject<HTMLButtonElement | null>;
  limitProblem: TapLimitProblem | null;
}) {
  const { t } = useTranslation();
  const audio = useTimingAudio(audioSource);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  // Opening the preview brings it into view inside the dialog, once its
  // Collapse has grown (it starts at height 0, so an earlier scroll lands
  // short).
  useEffect(() => {
    if (!isPreviewOpen) return;
    const isReduced = prefersReducedMotionNow();
    const timer = window.setTimeout(
      () => {
        previewRef.current?.scrollIntoView?.({
          block: "nearest",
          behavior: isReduced ? "auto" : "smooth",
        });
      },
      isReduced ? 0 : PREVIEW_EXPAND_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isPreviewOpen]);
  // Keep the last problem so the alert's text stays while its Collapse closes.
  const [lastProblem, setLastProblem] = useState(limitProblem);
  if (limitProblem && limitProblem !== lastProblem)
    setLastProblem(limitProblem);
  const shownProblem = limitProblem ?? lastProblem;
  const isClockUsable = isAudioClockUsable(audio);
  const stampNow = () => {
    if (isClockUsable && tap.nextIndex < lyricLines.length)
      tap.stamp(Math.round(audio.currentTimeNow() * 1000));
  };
  const stampNowRef = useRef(stampNow);
  useLayoutEffect(() => {
    stampNowRef.current = stampNow;
  });
  // Space outside a control stamps (spec 8.4); the Stamp button handles its
  // own Space. A native listener keeps the pane a plain, non-interactive div.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " || !event.target || isControl(event.target)) return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
        return;
      event.preventDefault();
      stampNowRef.current();
    };
    pane.addEventListener("keydown", onKeyDown);
    return () => pane.removeEventListener("keydown", onKeyDown);
  }, []);
  const timedLines = useMemo(
    () =>
      lyricLines.flatMap((text, index) =>
        tap.stamps[index] == null ? [] : [{ ms: tap.stamps[index] ?? 0, text }],
      ),
    [lyricLines, tap.stamps],
  );
  const playingIndex = activeIndexAt(
    timedLines.map((line) => line.ms / 1000),
    audio.currentTime,
  );
  const leftCount =
    lyricLines.length - tap.stamps.filter((stamp) => stamp !== null).length;

  return (
    <div
      ref={paneRef}
      className={styles.pane}
      data-testid="tap-along"
      tabIndex={-1}
    >
      <div className={styles.transport}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={
            audio.isPlaying
              ? t("studio:playerBar.pause")
              : t("studio:playerBar.play")
          }
          aria-disabled={!audio.isReady || audio.hasError || undefined}
          onClick={() => {
            if (!audio.isReady || audio.hasError) return;
            if (audio.isPlaying) audio.pause();
            else audio.play();
          }}
        >
          {audio.isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
        <span className={styles.clock}>
          {formatLrcTime(audio.currentTime * 1000)}
        </span>
        <button
          ref={stampButtonRef}
          type="button"
          className={styles.stamp}
          aria-label={t("studio:lyricTiming.tap.stamp", {
            number: Math.min(tap.nextIndex + 1, lyricLines.length),
          })}
          aria-disabled={tap.isComplete || !isClockUsable || undefined}
          onClick={() => {
            stampNow();
          }}
        >
          {t("studio:lyricTiming.tap.stampVisible")}
        </button>
      </div>
      <AudioStatus audio={audio} />
      <Collapse isOpen={limitProblem !== null}>
        <p className={styles.warning} role="alert">
          {shownProblem?.kind === "tooLong"
            ? t("studio:lyricTiming.paste.tooLong", {
                number: shownProblem.lineNumber,
              })
            : shownProblem
              ? t("studio:lyricTiming.paste.overLimit")
              : ""}
        </p>
      </Collapse>
      <p className={styles.hint}>{t("studio:lyricTiming.tap.stampHint")}</p>
      <p className={styles.count} role="status">
        {tap.isComplete
          ? t("studio:lyricTiming.tap.allStamped")
          : t("studio:lyricTiming.tap.left", { count: leftCount })}
      </p>
      <ol className={styles.lines}>
        {lyricLines.map((text, index) => {
          const stamp = tap.stamps[index] ?? null;
          return (
            <TapLineRow
              key={`${index}-${text}`}
              text={text}
              index={index}
              stamp={stamp}
              isNext={index === tap.nextIndex}
              isPlaying={
                playingIndex !== null &&
                stamp !== null &&
                timedLines[playingIndex]?.ms === stamp
              }
              tap={tap}
              audio={audio}
            />
          );
        })}
      </ol>
      <div className={styles.footerRow}>
        <button type="button" className={styles.linkButton} onClick={tap.clear}>
          {t("studio:lyricTiming.tap.restart")}
        </button>
        <button
          type="button"
          className={styles.linkButton}
          aria-expanded={isPreviewOpen}
          onClick={() => setIsPreviewOpen((wasOpen) => !wasOpen)}
        >
          {t("studio:lyricTiming.preview")}
        </button>
      </div>
      <Collapse isOpen={isPreviewOpen}>
        <div className={styles.preview} ref={previewRef}>
          <StudioSyncedLyrics
            lines={timedLines}
            activeIndex={playingIndex}
            onSeekLine={(ms) => audio.seek(ms / 1000)}
            label={t("studio:player.lyrics.listLabel")}
          />
        </div>
      </Collapse>
    </div>
  );
}
