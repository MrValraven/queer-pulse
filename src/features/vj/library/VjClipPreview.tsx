import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { FiPlay } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjPreviewPlayback } from "./useVjClipPlaybackDraft";
import { useVjLoopPlayback } from "./useVjLoopPlayback";
import { VjScaledImage } from "./VjClipCard";
import styles from "./VjClips.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * A 16:9 stage showing the clip the way the screen will. It holds the
 * thumbnail until "Play preview", so opening the dialog loads no media. Fill
 * covers the stage; Fit shows the whole clip over a blurred copy of the
 * thumbnail, so switching between them shows the difference right away.
 * With `playback` (Edit clip) a video plays at the chosen speed inside the
 * draft loop; while `scrubMs` is set it holds the frame a loop handle points
 * at, then plays the loop once the handle is let go. GIFs ignore both.
 */
export function VjClipPreview({
  clip,
  playback = null,
  scrubMs = null,
}: {
  clip: VjClipDTO;
  playback?: VjPreviewPlayback | null;
  scrubMs?: number | null;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isPlaying, setIsPlaying] = useState(false);
  const isVideo = clip.mediaKind === "video";
  // A handle drag shows the video paused at that frame; letting go plays the
  // loop, except under reduced motion, where only "Play preview" plays it.
  const [isFrameHeld, setIsFrameHeld] = useState(false);
  const [lastScrubMs, setLastScrubMs] = useState(scrubMs);
  if (scrubMs !== lastScrubMs) {
    setLastScrubMs(scrubMs);
    if (scrubMs !== null) setIsFrameHeld(true);
    else if (!reducedMotion) setIsPlaying(true);
  }
  // The video mounts after the poster fades out, so the element is state and
  // the ref object changes with it, which runs the playback effect again.
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const videoRef = useMemo(() => ({ current: videoElement }), [videoElement]);
  useVjLoopPlayback(videoRef, {
    playback: isVideo ? playback : null,
    scrubMs: isVideo ? scrubMs : null,
    isPlaying,
  });
  const isMediaShown = isPlaying || (isVideo && isFrameHeld);
  const label = t("vj:clipDialog.previewLabel", { title: clip.title });
  const fade = reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE };

  return (
    <div className={styles.previewStage} data-fit={clip.fitMode}>
      <img
        src={clip.thumbnailUrl}
        alt=""
        width={clip.width}
        height={clip.height}
        decoding="async"
        className={styles.previewBackdrop}
      />
      <AnimatePresence mode="wait" initial={false}>
        {isMediaShown ? (
          <m.div
            key="media"
            className={styles.previewLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {isVideo ? (
              <video
                ref={setVideoElement}
                className={styles.previewMedia}
                src={clip.mediaUrl}
                width={clip.width}
                height={clip.height}
                aria-label={label}
                muted
                loop
                playsInline
                autoPlay={isPlaying && playback === null}
              />
            ) : (
              <VjScaledImage
                src={clip.mediaUrl}
                alt={label}
                nativeWidth={clip.width}
                nativeHeight={clip.height}
                className={styles.previewMedia}
              />
            )}
            <AnimatePresence initial={false}>
              {!isPlaying && scrubMs === null && (
                <m.div
                  key="play"
                  className={styles.previewPlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  <VjPlayPreviewButton onPlay={() => setIsPlaying(true)} />
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        ) : (
          <m.div
            key="poster"
            className={styles.previewLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <VjScaledImage
              src={clip.thumbnailUrl}
              alt=""
              nativeWidth={clip.width}
              nativeHeight={clip.height}
              className={styles.previewMedia}
            />
            <div className={styles.previewPlay}>
              <VjPlayPreviewButton onPlay={() => setIsPlaying(true)} />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VjPlayPreviewButton({ onPlay }: { onPlay: () => void }) {
  const { t } = useTranslation();
  return (
    <Button size="sm" onClick={onPlay}>
      <FiPlay aria-hidden="true" focusable="false" fill="none" />
      {t("vj:clipDialog.playPreview")}
    </Button>
  );
}
