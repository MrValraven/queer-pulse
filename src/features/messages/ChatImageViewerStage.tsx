import {
  useEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { slidesFor } from "./chatImageSlides";
import { ChatImageViewerSlide } from "./ChatImageViewerSlide";
import { useViewerPhotoMotion } from "./useViewerPhotoMotion";
import { useZoomPan } from "./useZoomPan";
import type { ViewerCloseReason } from "./useViewerClose";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewer.module.css";

/**
 * The photo itself plus every gesture that acts on it. All the pointer
 * arbitration lives in `useZoomPan`; this component only wires its handlers to
 * the surface and renders the desktop arrow buttons (hidden on touch, where
 * the swipe does the same job).
 *
 * The photo sits on a track of three slides (previous, current, next) so a
 * sideways swipe shows the neighbour arriving beside it. Only the current
 * slide is ever zoomed, and the track is moved by `useSwipeTrack`.
 */
export function ChatImageViewerStage({
  photo,
  prevPhoto,
  nextPhoto,
  stepRef,
  hasSiblings,
  isChromeVisible,
  scrimWashRef,
  onPrev,
  onNext,
  onDismiss,
  onToggleChrome,
  onGestureActive,
  closing,
  originRef,
  canFlipBack,
}: {
  photo: ViewerPhoto;
  /** The photos either side of `photo` in the gallery's wrap-around order,
   *  or null in a single-photo gallery. Rendered as the neighbouring slides.
   *  With two photos both are the other photo. */
  prevPhoto: ViewerPhoto | null;
  nextPhoto: ViewerPhoto | null;
  /** Filled with the function that pages by one photo with the slide
   *  animation, for the shell's arrow keys. The shell owns the key listener
   *  (it also re-shows the chrome), so it needs a way in. */
  stepRef: MutableRefObject<((delta: 1 | -1) => void) | null>;
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
  /** Non-null once the viewer has started closing, which is this component's
   *  cue to play the photo out. */
  closing: ViewerCloseReason | null;
  /** The bubble thumbnail the viewer was opened from, which the photo grows
   *  out of on open and shrinks back into on close. */
  originRef: RefObject<HTMLElement | null>;
  /** Whether the photo on screen is still the one that bubble holds. */
  canFlipBack: boolean;
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const flipLayerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { isZoomed, step, handlers } = useZoomPan({
    imageRef,
    viewportRef,
    trackRef,
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
  useViewerPhotoMotion({
    layerRef: flipLayerRef,
    stageRef: viewportRef,
    imageRef,
    originRef,
    closing,
    canFlipBack,
    isZoomed,
    reducedMotion,
  });
  useEffect(() => {
    stepRef.current = step;
    return () => {
      stepRef.current = null;
    };
  }, [stepRef, step]);

  return (
    <div ref={viewportRef} className={styles.stage} {...handlers}>
      <div ref={flipLayerRef} className={styles.flipLayer}>
        <div ref={trackRef} className={styles.track}>
          {slidesFor(prevPhoto, photo, nextPhoto).map((slide) => (
            <ChatImageViewerSlide
              key={slide.key}
              photo={slide.photo}
              role={slide.role}
              imageRef={imageRef}
              isZoomed={isZoomed}
            />
          ))}
        </div>
      </div>
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
            onClick={() => step(-1)}
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
            onClick={() => step(1)}
            aria-label={t("messages:viewer.next")}
          >
            <FiChevronRight aria-hidden size={24} />
          </button>
        </>
      )}
    </div>
  );
}
