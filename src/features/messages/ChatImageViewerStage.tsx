import { useRef, type RefObject } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useZoomPan } from "./useZoomPan";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewer.module.css";

/**
 * The photo itself plus every gesture that acts on it. All the pointer
 * arbitration lives in `useZoomPan`; this component only wires its handlers to
 * the surface and renders the desktop arrow buttons (hidden on touch, where
 * the swipe does the same job).
 */
export function ChatImageViewerStage({
  photo,
  hasSiblings,
  isChromeVisible,
  scrimWashRef,
  onPrev,
  onNext,
  onDismiss,
  onToggleChrome,
  onGestureActive,
}: {
  photo: ViewerPhoto;
  hasSiblings: boolean;
  isChromeVisible: boolean;
  /** The plum wash behind the dialog, owned by the shell. A downward drag
   *  fades it so the conversation reads through; the gesture hook writes its
   *  opacity directly, frame by frame. */
  scrimWashRef: RefObject<HTMLDivElement | null>;
  onPrev: () => void;
  onNext: () => void;
  onDismiss: () => void;
  onToggleChrome: () => void;
  /** True while any gesture (a scale-1 drag, a pinch, or a pan above scale 1)
   *  is in progress, so the shell can move the chrome out of the way of a
   *  photo that is being actively manipulated. */
  onGestureActive: (isGestureActive: boolean) => void;
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { isZoomed, handlers } = useZoomPan({
    imageRef,
    viewportRef,
    scrimWashRef,
    onGestureActive,
    photoKey: photo.key,
    hasSiblings,
    reducedMotion,
    onNext,
    onPrev,
    onDismiss,
    onToggleChrome,
  });

  return (
    <div ref={viewportRef} className={styles.stage} {...handlers}>
      <img
        ref={imageRef}
        className={[styles.image, isZoomed && styles.imageZoomed]
          .filter(Boolean)
          .join(" ")}
        src={photo.url}
        alt={photo.alt ?? t("messages:attachments.imageAlt")}
        // Reserve the letterbox before decode. `.image` caps the rendered
        // size with max-width/max-height plus object-fit: contain, so these
        // intrinsic attributes only seed the browser's default aspect-ratio
        // and never force the photo to its native pixel size. Omitted, not
        // 0, when the attachment carried no dimensions: an explicit 0 would
        // ask the browser to reserve no box at all.
        width={photo.width > 0 ? photo.width : undefined}
        height={photo.height > 0 ? photo.height : undefined}
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
      />
      {hasSiblings && (
        <>
          <button
            type="button"
            className={[
              styles.navButton,
              styles.navPrev,
              !isChromeVisible && styles.barHidden,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onPrev}
            aria-label={t("messages:viewer.prev")}
          >
            <FiChevronLeft aria-hidden size={24} />
          </button>
          <button
            type="button"
            className={[
              styles.navButton,
              styles.navNext,
              !isChromeVisible && styles.barHidden,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onNext}
            aria-label={t("messages:viewer.next")}
          >
            <FiChevronRight aria-hidden size={24} />
          </button>
        </>
      )}
    </div>
  );
}
