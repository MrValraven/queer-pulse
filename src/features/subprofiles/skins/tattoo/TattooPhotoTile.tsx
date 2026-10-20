import type { ReactNode } from "react";
import { ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { BlurredPhoto } from "../../BlurredPhoto";
import { isItemPhotoBlurred } from "./tattooItemImages";
import styles from "./TattooPortfolio.module.css";

interface TattooPhotoTileProps {
  item: SubprofileItemView;
  imageUrl: string;
  alt: string;
  onOpen?: () => void;
  caption?: ReactNode;
}

/**
 * One portfolio photo in a box with a definite width and aspect ratio. A
 * photo the item blurs sits in BlurredPhoto (keyed by the image url); any
 * other photo renders directly so it fills the frame. With onOpen the image is a button; BlurredPhoto makes the media
 * inert while the photo is concealed, so the button is unreachable until the
 * viewer shows the photo, and no button nests in another.
 */
export function TattooPhotoTile({
  item,
  imageUrl,
  alt,
  onOpen,
  caption,
}: TattooPhotoTileProps) {
  const { t } = useTranslation();
  const image = (
    <ImageSlot src={imageUrl} alt={alt} width="100%" height="100%" radius={0} />
  );
  const media = onOpen ? (
    <button
      type="button"
      className={styles.openButton}
      aria-label={t("subprofiles:tattoo.photo.open", { title: item.title })}
      onClick={onOpen}
    >
      {image}
    </button>
  ) : (
    image
  );
  const isBlurred = imageUrl !== "" && isItemPhotoBlurred(item);
  return (
    <figure className={styles.tile}>
      <div className={styles.frame}>
        {isBlurred ? (
          <BlurredPhoto isBlurred revealKey={imageUrl}>
            {media}
          </BlurredPhoto>
        ) : (
          media
        )}
      </div>
      {caption ? (
        <figcaption className={styles.caption}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}
