import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VjScaledImage } from "./VjClipCard";
import styles from "./VjClips.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * A 16:9 stage showing the clip the way the screen will. It holds the
 * thumbnail until "Play preview", so opening the dialog loads no media. Fill
 * covers the stage; Fit shows the whole clip over a blurred copy of the
 * thumbnail, so switching between them shows the difference right away.
 */
export function VjClipPreview({ clip }: { clip: VjClipDTO }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isPlaying, setIsPlaying] = useState(false);
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
        {isPlaying ? (
          <m.div
            key="media"
            className={styles.previewLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {clip.mediaKind === "video" ? (
              <video
                className={styles.previewMedia}
                src={clip.mediaUrl}
                width={clip.width}
                height={clip.height}
                aria-label={label}
                muted
                loop
                playsInline
                autoPlay
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
              <Button size="sm" onClick={() => setIsPlaying(true)}>
                <FiPlay aria-hidden="true" focusable="false" fill="none" />
                {t("vj:clipDialog.playPreview")}
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
