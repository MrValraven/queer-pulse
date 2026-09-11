import { useCallback, useMemo, useState } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GalleryLightbox } from "./skins/GalleryLightbox";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import styles from "./CredentialProofThumb.module.css";

// 4:3, the usual shape of a photographed certificate.
const THUMB_WIDTH = 72;
const THUMB_HEIGHT = 54;

// The viewer holds a single photo, so there is nowhere to move to.
const stayOnPhoto = () => undefined;

/**
 * The certificate or diploma photo on a `credentials` / `trainings` row (see
 * `CREDENTIAL_PHOTO_SECTIONS`). On the live page it is a button that opens
 * the photo full size in the shared `GalleryLightbox`, holding just this one
 * item. In the editor preview (`interactive === false`) it is a plain image.
 * Renders nothing when the item has no photo.
 */
export function CredentialProofThumb({
  item,
  interactive,
}: {
  item: SubprofileItemView;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  // Stable identities: `useLightboxDialog` re-runs its focus/keyboard setup
  // whenever the callbacks it receives change.
  const viewerItems = useMemo(() => [item], [item]);
  const closeViewer = useCallback(() => setIsViewerOpen(false), []);

  if (!item.imageUrl) return null;

  const caption = t("subprofiles:credentialPhoto.alt", { title: item.title });
  const photo = (
    <span className={styles.frame}>
      <ImageSlot
        src={item.imageUrl}
        alt={caption}
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        radius={0}
        loading="lazy"
      />
    </span>
  );

  if (!interactive) return <span className={styles.thumb}>{photo}</span>;

  return (
    <>
      <button
        type="button"
        className={`${styles.thumb} ${styles.button}`}
        onClick={() => setIsViewerOpen(true)}
        aria-label={t("subprofiles:credentialPhoto.openAria", {
          title: item.title,
        })}
      >
        {photo}
      </button>
      {isViewerOpen && (
        <GalleryLightbox
          items={viewerItems}
          index={0}
          name={item.title}
          altText={caption}
          dialogLabel={caption}
          onClose={closeViewer}
          onMove={stayOnPhoto}
        />
      )}
    </>
  );
}
