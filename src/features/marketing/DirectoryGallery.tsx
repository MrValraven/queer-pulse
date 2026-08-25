import { useState } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import {
  GALLERY_HERO_PX,
  GALLERY_THUMB_PX,
  galleryShotsOf,
  type GalleryShot,
} from "./directoryGalleryShots";
import { DirectoryLightbox } from "./DirectoryLightbox";
import styles from "./DirectorySpacePage.module.css";

export type { GalleryShot };

const GCELL: Record<Tint, string> = {
  coral: "",
  jade: styles.gCellJade!,
  plum: styles.gCellPlum!,
};

/**
 * Directory detail cover. Places with real uploaded photos get a photo hero
 * + thumbnail grid that opens a lightbox on click; places without photos
 * (demo places, or listings the owner hasn't uploaded images for yet) fall
 * back to the original tinted caption blocks.
 */
export function DirectoryGallery({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shots: GalleryShot[] = galleryShotsOf(place);

  if (shots.length === 0) {
    // No uploaded photos. If the listing at least described its slots, keep the
    // tinted caption grid. Otherwise (a fresh submission with no captions
    // either) a bare grid renders as dead space — show an honest placeholder
    // panel with the place's initials instead so the cover still reads as
    // intentional (this is what a moderator sees before any photos exist).
    if (place.gallery.length === 0) {
      return (
        <div className={styles.cover}>
          <div className={styles.coverInner}>
            <div
              className={[styles.galleryEmpty, GCELL[place.tint]].join(" ")}
              role="img"
              aria-label={t("marketing:directory.detail.galleryAria", {
                name: place.name,
              })}
            >
              <span className={styles.galleryEmptyMonogram}>{place.av}</span>
              <span className={styles.galleryEmptyLabel}>
                {t("marketing:directory.detail.noPhotos")}
              </span>
            </div>
          </div>
        </div>
      );
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

  const [hero, ...rest] = shots;
  const viewPhotoLabel = t("marketing:directory.detail.viewPhoto");

  return (
    <div className={styles.cover}>
      <div className={styles.coverInner}>
        <div
          className={[
            styles.photoGallery,
            rest.length === 0 && styles.photoGalleryFull,
          ]
            .filter(Boolean)
            .join(" ")}
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
              src={resolveAvatarSrc(hero!.url, GALLERY_HERO_PX)}
              alt={hero!.alt}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </button>
          {rest.length > 0 && (
            <div className={styles.thumbCol}>
              {rest.map((shot, index) => (
                <button
                  key={shot.url}
                  type="button"
                  className={styles.thumb}
                  onClick={() => setLightboxIndex(index + 1)}
                  aria-label={shot.alt || viewPhotoLabel}
                >
                  <img
                    src={resolveAvatarSrc(shot.url, GALLERY_THUMB_PX)}
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
