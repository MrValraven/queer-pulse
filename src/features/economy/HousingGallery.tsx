import { useMemo, useState } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Tint } from "./housingListings";
import { GAL_BG } from "./housingListing.data";
import { buildGalleryPhotos } from "./housingGalleryPhotos";
import { HousingGalleryLightbox } from "./HousingGalleryLightbox";
import styles from "./housingGallery.module.css";

/** How many cells the mosaic grid shows before collapsing the rest behind a
 * "+N" veil on the last visible cell (the grid is a 5-cell 2fr/1fr/1fr mosaic). */
const VISIBLE_CELLS = 5;

/**
 * The listing photo mosaic. Each cell is a real button that opens the accessible
 * lightbox at that photo; a URL entry renders a real image (with alt), a demo
 * caption entry renders a captioned tinted frame. Reuses `resolveAvatarSrc`
 * (the repo's image-loading path) — it does not reinvent image loading.
 */
export function HousingGallery({
  listing,
}: {
  listing: { title: string; tint: Tint; gallery: string[] };
}) {
  const { t } = useTranslation();
  const [openAt, setOpenAt] = useState<number | null>(null);
  const photos = useMemo(
    () => buildGalleryPhotos(listing.gallery),
    [listing.gallery],
  );

  if (photos.length === 0) return null;

  const visible = photos.slice(0, VISIBLE_CELLS);
  const hiddenCount = photos.length - visible.length;

  return (
    <>
      <div className={styles.gallery}>
        {visible.map((photo, index) => {
          const isLastVisible = index === visible.length - 1;
          const showVeil = isLastVisible && hiddenCount > 0;
          return (
            <button
              type="button"
              key={index}
              className={styles.cell}
              style={{ background: GAL_BG[listing.tint] }}
              onClick={() => setOpenAt(index)}
              aria-label={t("economy:housingGallery.openAt", {
                title: listing.title,
                index: index + 1,
                total: photos.length,
              })}
            >
              {photo.src ? (
                <img
                  className={styles.cellImg}
                  src={resolveAvatarSrc(photo.src, 800)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={styles.cap}>{photo.caption}</span>
              )}
              {showVeil && (
                <span className={styles.moreVeil} aria-hidden>
                  +{hiddenCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {openAt !== null && (
        <HousingGalleryLightbox
          photos={photos}
          startIndex={openAt}
          title={listing.title}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
