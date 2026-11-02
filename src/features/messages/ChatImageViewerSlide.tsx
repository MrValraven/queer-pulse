import { useCallback, type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SlideRole } from "./chatImageSlides";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewer.module.css";

/**
 * One photo on the swipe track. The slide beside the screen is a real `<img>`
 * in the DOM, so the browser has loaded it by the time a swipe lands; the
 * `decode()` call below also gets it decoded, which is the step that otherwise
 * costs a visible beat after the slide arrives.
 *
 * Only the current slide carries the viewer's `imageRef` and its zoom. A
 * neighbour is decoration (`alt=""`, hidden from assistive technology): the
 * dialog's own label and live region already name the photo on screen, and a
 * screen reader reading three images for every one would be noise.
 */
export function ChatImageViewerSlide({
  photo,
  role,
  imageRef,
  isZoomed,
}: {
  photo: ViewerPhoto;
  role: SlideRole;
  /** The viewer's image ref, attached to the current slide's `<img>` only. */
  imageRef: RefObject<HTMLImageElement | null>;
  isZoomed: boolean;
}) {
  const { t } = useTranslation();
  const isCurrent = role === "current";
  const decodeWhenLoaded = useCallback((node: HTMLImageElement | null) => {
    if (node && typeof node.decode === "function") {
      // A decode that fails (a broken URL, a revoked blob) is not an error
      // here: the slide just paints the way it always did, on arrival.
      void node.decode().catch(() => undefined);
    }
  }, []);

  return (
    <div
      className={[
        styles.slide,
        role === "prev" && styles.slidePrev,
        role === "next" && styles.slideNext,
      ]
        .filter(Boolean)
        .join(" ")}
      data-slide={role}
    >
      <img
        ref={isCurrent ? imageRef : decodeWhenLoaded}
        className={[styles.image, isCurrent && isZoomed && styles.imageZoomed]
          .filter(Boolean)
          .join(" ")}
        src={photo.url}
        alt={isCurrent ? (photo.alt ?? t("messages:attachments.imageAlt")) : ""}
        aria-hidden={isCurrent ? undefined : true}
        // Reserve the letterbox before decode. `.image` caps the rendered
        // size with max-width/max-height plus object-fit: contain, so these
        // intrinsic attributes only seed the browser's default aspect-ratio
        // and never force the photo to its native pixel size. Omitted, not
        // 0, when the attachment carried no dimensions: an explicit 0 would
        // ask the browser to reserve no box at all.
        width={photo.width > 0 ? photo.width : undefined}
        height={photo.height > 0 ? photo.height : undefined}
        // Neighbours are fetched at once. They are offscreen by design, so a
        // lazy load would wait for the swipe to bring them into view.
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
      />
    </div>
  );
}
