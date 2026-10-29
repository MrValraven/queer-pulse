import { useState } from "react";
import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import { galleryShotsOf, type GalleryShot } from "./directoryGalleryShots";
import { DirectoryGalleryRepositionable } from "./DirectoryGalleryRepositionable";
import { DirectoryLightbox } from "./DirectoryLightbox";
import { DirectoryPhotoGrid } from "./DirectoryPhotoGrid";
import { resolveShotFraming } from "./photoFramingGeometry";
import type { ListingPhotoRepositionAccess } from "./useListingPhotoRepositionAccess";
import styles from "./DirectorySpacePage.module.css";

export type { GalleryShot };

const GCELL: Record<Tint, string> = {
  coral: "",
  jade: styles.gCellJade!,
  plum: styles.gCellPlum!,
};

/** The published grid is read-only, so a framing change has nowhere to go. */
const ignoreFramingChange = () => undefined;

/**
 * Directory detail cover. Places with real uploaded photos get a photo hero
 * + thumbnail grid, each photo drawn with its saved framing, that opens a
 * lightbox on click; places without photos (demo places, or listings the
 * owner hasn't uploaded images for yet) fall back to the original tinted
 * caption blocks. A listing with neither renders no cover at all. When
 * `repositionAccess` is set (the listing's owner, co-manager or an admin),
 * the grid carries the "Reposition photos" control above it.
 */
export function DirectoryGallery({
  place,
  repositionAccess = null,
}: {
  place: DirectoryPlace;
  repositionAccess?: ListingPhotoRepositionAccess | null;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shots: GalleryShot[] = galleryShotsOf(place);

  if (shots.length === 0) {
    // No uploaded photos. If the listing at least described its slots, keep the
    // tinted caption grid. Otherwise (a fresh submission with no captions
    // either) the cover has nothing to show, so the page skips it entirely and
    // goes from the header straight to the body rather than holding space for
    // photos that do not exist.
    if (place.gallery.length === 0) {
      return null;
    }
    return (
      <div className={styles.cover}>
        <div className={styles.coverInner}>
          <div className={styles.gallery}>
            {place.gallery.map((caption, index) => (
              <div
                key={index}
                className={[styles.gCell, GCELL[place.tint]].join(" ")}
              >
                <span className={styles.gCap}>{caption}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cover}>
      <div className={styles.coverInner}>
        {repositionAccess ? (
          <DirectoryGalleryRepositionable
            placeName={place.name}
            shots={shots}
            access={repositionAccess}
            onOpenShot={setLightboxIndex}
          />
        ) : (
          <DirectoryPhotoGrid
            placeName={place.name}
            shots={shots}
            framingFor={resolveShotFraming}
            isEditing={false}
            isLocked={false}
            viewport="desktop"
            onOpenShot={setLightboxIndex}
            onFramingChange={ignoreFramingChange}
          />
        )}
      </div>

      {lightboxIndex !== null && (
        <DirectoryLightbox
          shots={shots}
          startIndex={lightboxIndex}
          placeName={place.name}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
