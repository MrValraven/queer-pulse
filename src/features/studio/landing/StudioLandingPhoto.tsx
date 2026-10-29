import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingPhotoView } from "../api/studioLanding.adapters";
import styles from "./StudioLandingPhoto.module.css";

/** Intrinsic size hint so the browser reserves the box before the file loads;
 *  CSS fills whatever box the caller gives the figure. */
const PHOTO_WIDTH = 1600;
const PHOTO_HEIGHT = 1067;

interface StudioLandingPhotoProps {
  photo: StudioLandingPhotoView;
  /** True for the first photo on screen (the hero): loads eagerly. */
  isPriority?: boolean;
  className?: string;
}

/**
 * A curated photo from the Studio landing's two slots (hero and manifesto).
 * The figure fills a box its caller sizes and the image covers it. The alt
 * text follows the site language and falls back to English; the photographer
 * credit shows as a quiet caption when the slot has one.
 */
export function StudioLandingPhoto({
  photo,
  isPriority = false,
  className,
}: StudioLandingPhotoProps) {
  const { t, language } = useTranslation();
  const altText = photo.altText[language] || photo.altText.en;
  const figureClass = className
    ? `${styles.figure} ${className}`
    : styles.figure;
  return (
    <figure className={figureClass}>
      <img
        className={styles.image}
        src={photo.url}
        alt={altText}
        width={PHOTO_WIDTH}
        height={PHOTO_HEIGHT}
        decoding="async"
        loading={isPriority ? "eager" : "lazy"}
        fetchPriority={isPriority ? "high" : "auto"}
      />
      {photo.credit ? (
        <figcaption className={styles.credit}>
          {t("studio:landing.photoCredit", { credit: photo.credit })}
        </figcaption>
      ) : null}
    </figure>
  );
}
