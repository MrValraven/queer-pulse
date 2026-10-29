import { useState, type TransitionEvent } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingPhotoFraming } from "./api/directory.api";
import type { GalleryShot } from "./directoryGalleryShots";
import { DirectoryGalleryFrame } from "./DirectoryGalleryFrame";
import type { GalleryPreviewViewport } from "./GalleryRepositionControls";
import styles from "./DirectorySpacePage.module.css";

/**
 * Holds the layout on screen while the gallery fades. A new `viewport` first
 * fades the gallery to 0, the layout swaps on that fade's transitionend, and
 * the gallery fades back to 1, so the page height only moves while the gallery
 * is invisible. One element stays mounted throughout. Under reduced motion the
 * layout follows `viewport` at once. The fade is a CSS opacity transition on
 * .galleryViewport: motion's accelerated opacity path painted one stale frame
 * at full opacity as each fade finished.
 */
function useViewportCrossfade(
  viewport: GalleryPreviewViewport,
  reducedMotion: boolean,
) {
  const [displayedViewport, setDisplayedViewport] = useState(viewport);
  if (reducedMotion && displayedViewport !== viewport) {
    setDisplayedViewport(viewport);
  }
  const isFadingOut = !reducedMotion && displayedViewport !== viewport;
  return {
    displayedViewport: reducedMotion ? viewport : displayedViewport,
    isFadingOut,
    handleFadeEnd: (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || !isFadingOut) return;
      setDisplayedViewport(viewport);
    },
  };
}

export interface DirectoryPhotoGridProps {
  placeName: string;
  shots: GalleryShot[];
  framingFor: (shot: GalleryShot) => ListingPhotoFraming;
  isEditing: boolean;
  isLocked: boolean;
  viewport: GalleryPreviewViewport;
  onOpenShot: (index: number) => void;
  onFramingChange: (url: string, framing: ListingPhotoFraming) => void;
}

/**
 * The photo hero and its thumbnail column, each drawn with its framing. The
 * same grid serves the published page and the manager's reposition mode: the
 * Desktop/Phone preview crossfades between the two layouts (fade out, swap,
 * fade in, see useViewportCrossfade), and every frame switches between
 * opening the lightbox and taking drags and arrow keys. The frames stay
 * mounted across the swap.
 */
export function DirectoryPhotoGrid({
  placeName,
  shots,
  framingFor,
  isEditing,
  isLocked,
  viewport,
  onOpenShot,
  onFramingChange,
}: DirectoryPhotoGridProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const crossfade = useViewportCrossfade(viewport, reducedMotion);
  const [hero, ...rest] = shots;
  if (!hero) return null;

  const frameProps = (shot: GalleryShot, index: number) => ({
    shot,
    index,
    count: shots.length,
    framing: framingFor(shot),
    isEditing,
    isLocked,
    onOpen: () => onOpenShot(index),
    onFramingChange: (framing: ListingPhotoFraming) =>
      onFramingChange(shot.url, framing),
  });

  return (
    <div
      className={[
        styles.galleryViewport,
        crossfade.displayedViewport === "phone" && styles.galleryViewportPhone,
        crossfade.isFadingOut && styles.galleryViewportFading,
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={crossfade.handleFadeEnd}
    >
      <div
        className={[
          styles.photoGallery,
          rest.length === 0 && styles.photoGalleryFull,
        ]
          .filter(Boolean)
          .join(" ")}
        role="group"
        aria-label={t("marketing:directory.detail.galleryAria", {
          name: placeName,
        })}
      >
        <DirectoryGalleryFrame variant="hero" {...frameProps(hero, 0)} />
        {rest.length > 0 && (
          <div className={styles.thumbCol}>
            {rest.map((shot, restIndex) => {
              const index = restIndex + 1;
              return (
                <DirectoryGalleryFrame
                  key={`${index}-${shot.url}`}
                  variant="thumb"
                  {...frameProps(shot, index)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
