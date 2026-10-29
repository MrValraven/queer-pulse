import type { ChangeEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LISTING_PHOTO_ZOOM_MAX,
  type ListingPhotoFraming,
} from "./api/directory.api";
import {
  clampPhotoFraming,
  PHOTO_ZOOM_SLIDER_STEP,
} from "./photoFramingGeometry";
import styles from "./DirectoryGalleryFrame.module.css";

const ZOOM_STRIP_EASE = [0.22, 0.68, 0.16, 1] as const;
const ZOOM_STRIP_SECONDS = 0.15;

export interface DirectoryGalleryZoomStripProps {
  isVisible: boolean;
  isLocked: boolean;
  index: number;
  framing: ListingPhotoFraming;
  onFramingChange: (framing: ListingPhotoFraming) => void;
}

/**
 * The zoom slider along the bottom edge of a gallery frame in reposition
 * mode, between a zoom-out and a zoom-in icon. It slides in and out with edit
 * mode, and keeps its pointer and key events to itself so the frame's drag
 * and arrow handlers leave the slider alone.
 */
export function DirectoryGalleryZoomStrip({
  isVisible,
  isLocked,
  index,
  framing,
  onFramingChange,
}: DirectoryGalleryZoomStripProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const stripTransition = {
    duration: reducedMotion ? 0 : ZOOM_STRIP_SECONDS,
    ease: ZOOM_STRIP_EASE,
  };

  function handleZoomChange(event: ChangeEvent<HTMLInputElement>) {
    onFramingChange(
      clampPhotoFraming({ ...framing, zoom: Number(event.target.value) }),
    );
  }

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <m.div
          key="zoom"
          className={styles.zoomStrip}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: stripTransition }}
          exit={{ opacity: 0, y: 6, transition: stripTransition }}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <FiZoomOut className={styles.zoomIcon} aria-hidden="true" />
          <input
            type="range"
            className={styles.zoomSlider}
            min={1}
            max={LISTING_PHOTO_ZOOM_MAX}
            step={PHOTO_ZOOM_SLIDER_STEP}
            value={framing.zoom}
            onChange={handleZoomChange}
            disabled={isLocked}
            aria-label={t("marketing:directory.detail.reposition.zoomAria", {
              index: index + 1,
            })}
            aria-valuetext={t(
              "marketing:directory.detail.reposition.zoomValue",
              { zoom: framing.zoom.toFixed(1) },
            )}
          />
          <FiZoomIn className={styles.zoomIcon} aria-hidden="true" />
        </m.div>
      )}
    </AnimatePresence>
  );
}
