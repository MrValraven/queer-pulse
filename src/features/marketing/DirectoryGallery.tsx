import { useState } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import { type PhotoKey } from "./listBusiness/listBusiness.data";
import { DirectoryLightbox } from "./DirectoryLightbox";
import styles from "./DirectorySpacePage.module.css";

export interface GalleryShot {
  url: string;
  alt: string;
}

const GCELL: Record<Tint, string> = {
  coral: "",
  jade: styles.gCellJade!,
  plum: styles.gCellPlum!,
};

/** Slot order for the four uploadable photo positions. */
const PHOTO_SLOTS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/**
 * Directory detail cover. Places with real uploaded photos get a photo hero
 * + thumbnail grid that opens a lightbox on click; places without photos
 * (demo places, or listings the owner hasn't uploaded images for yet) fall
 * back to the original tinted caption blocks.
 */
export function DirectoryGallery({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shots: GalleryShot[] = PHOTO_SLOTS.map((key) => ({
    url: place.photos?.[key] ?? null,
    alt: place.alt?.[key] ?? "",
  })).flatMap((shot) => (shot.url ? [{ url: shot.url, alt: shot.alt }] : []));

  if (shots.length === 0) {
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

  const [hero, ...rest] = shots;
  const viewPhotoLabel = t("marketing:directory.detail.viewPhoto");

  return (
    <div className={styles.cover}>
      <div className={styles.coverInner}>
        <div
          className={styles.photoGallery}
          role="group"
          aria-label={t("marketing:directory.detail.galleryAria", {
            name: place.name,
          })}
        >
          <button
            type="button"
            className={styles.photoHero}
            onClick={() => setLightboxIndex(0)}
            aria-label={hero!.alt || viewPhotoLabel}
          >
            <img
              src={resolveAvatarSrc(hero!.url, 1600)}
              alt={hero!.alt}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </button>
          {rest.length > 0 && (
            <div className={styles.thumbGrid}>
              {rest.map((shot, index) => (
                <button
                  key={shot.url}
                  type="button"
                  className={styles.thumb}
                  onClick={() => setLightboxIndex(index + 1)}
                  aria-label={shot.alt || viewPhotoLabel}
                >
                  <img
                    src={resolveAvatarSrc(shot.url, 400)}
                    alt={shot.alt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
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
