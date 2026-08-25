import { useState } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryLightbox } from "./DirectoryLightbox";
import s from "./DirectorySpacePage.module.css";

interface Props {
  photoUrl: string;
  /** The reviewer's display name, so the photo's alt text says whose it is. */
  reviewerName: string;
  /** The listing's name, for the lightbox heading. */
  placeName: string;
}

/**
 * The photo a reviewer attached, shown under their words. Opens the same
 * `DirectoryLightbox` the listing gallery uses, so it is keyboard-operable and
 * dismissible in exactly the way the rest of the page already is.
 */
export function DirectoryReviewPhoto({
  photoUrl,
  reviewerName,
  placeName,
}: Props) {
  const { t } = useTranslation();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const altText = t("marketing:directory.detail.reviews.photoAlt", {
    name: reviewerName,
  });

  return (
    <>
      <button
        type="button"
        className={s.revPhotoBtn}
        onClick={() => setIsLightboxOpen(true)}
        aria-label={t("marketing:directory.detail.reviews.photoOpen", {
          name: reviewerName,
        })}
      >
        <img
          src={resolveAvatarSrc(photoUrl, 640)}
          alt={altText}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </button>
      {isLightboxOpen && (
        <DirectoryLightbox
          shots={[{ url: photoUrl, alt: altText }]}
          startIndex={0}
          placeName={placeName}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
