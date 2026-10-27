import { ImageSlot } from "../../../../shared/components/ui/ImageSlot";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SampleAlbumPhoto } from "./communitiesSample.data";
import styles from "./SamplePhotoAlbum.module.css";

/**
 * The event's photo album after the night: a heading and a mosaic of the
 * photos the hosts added. The first photo spans two cells, the way an album
 * leads with one picture.
 */
export function SamplePhotoAlbum({
  photos,
}: {
  photos: readonly SampleAlbumPhoto[];
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.album}>
      <header className={styles.head}>
        <h3 className={styles.title}>{t("forCommunities:album.title")}</h3>
        <span className={styles.count}>
          {t("forCommunities:album.count", { count: photos.length })}
        </span>
      </header>
      <ul className={styles.grid}>
        {photos.map((photo, index) => (
          <li
            key={photo.photoId}
            className={index === 0 ? styles.lead : styles.tile}
          >
            <ImageSlot
              src={photo.src}
              tint={photo.tint}
              width="100%"
              height="100%"
              radius={0}
              srcSize={index === 0 ? 640 : 320}
              style={{ border: "none" }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
