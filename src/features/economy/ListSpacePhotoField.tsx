import { useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PhotoPickerModal } from "../members/PhotoPickerModal";
import { LIST_SPACE_MAX_PHOTOS, type ListSpaceForm } from "./useListSpaceForm";
import styles from "./ListSpaceFields.module.css";

/**
 * The gallery on the "list a space" form: up to
 * {@link LIST_SPACE_MAX_PHOTOS} photos, the first one being the cover the
 * board shows.
 *
 * "Add a photo" opens the shared `PhotoPickerModal`, the same picker every
 * other photo slot in the product uses: the lister uploads from their device
 * or reuses a past upload from "Your photos". The picker skips its reframe
 * step here because a listing gallery stores no crop.
 *
 * A device upload still runs through `useUploadImage("listing-photo")` inside
 * the picker. That helper strips image metadata and FAILS CLOSED:
 * `processImage` re-encodes the pixels and throws
 * `members:upload.error.stripFailed` if it cannot, so a photo whose EXIF could
 * not be removed is never uploaded. A reused past upload was stripped the same
 * way when it was first uploaded. A home listing is exactly the photo set
 * where an embedded GPS tag would publish where a member lives, so no path
 * into this gallery may skip that pipeline.
 *
 * Removing a photo asks for confirmation first, like `ImageUploadField`.
 */
export function ListSpacePhotoField({ form }: { form: ListSpaceForm }) {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingRemovalReference, setPendingRemovalReference] = useState<
    string | null
  >(null);

  const photos = form.values.photos;
  const isAtCap = photos.length >= LIST_SPACE_MAX_PHOTOS;

  /** The gallery entry holding this storage key. On the edit flow a stored
   *  photo is seeded with its resolved `<apiBaseUrl>/files/<key>` URL, so the
   *  bare key the picker hands back is matched against that form too. */
  function findPhotoReference(key: string): string | undefined {
    return photos.find(
      (photo) =>
        photo.reference === key || photo.reference.endsWith(`/files/${key}`),
    )?.reference;
  }

  function handlePick(key: string, previewUrl: string) {
    // Picking a photo the gallery already holds would show the same photo
    // twice, so a repeat pick is ignored.
    if (findPhotoReference(key) !== undefined) return;
    form.addPhoto({ reference: key, previewUrl });
  }

  function handleDeleted(key: string) {
    // The lister deleted this past upload from "Your photos": drop it from the
    // gallery too, so the listing never points at a deleted file.
    const matchingReference = findPhotoReference(key);
    if (matchingReference !== undefined) form.removePhoto(matchingReference);
  }

  return (
    <div className={styles.photoField} aria-busy={isPickerOpen || undefined}>
      <p className={styles.photoLabel} id="ls-photos-label">
        {t("economy:listSpace.photos.label")}
      </p>
      <p className={styles.fieldHint} id="ls-photos-hint">
        {t("economy:listSpace.photos.hint", { max: LIST_SPACE_MAX_PHOTOS })}
      </p>

      {photos.length > 0 && (
        <ul className={styles.photoGrid} aria-labelledby="ls-photos-label">
          {photos.map((photo, photoIndex) => (
            <li key={photo.reference} className={styles.photoItem}>
              <img
                className={styles.photoImage}
                src={photo.previewUrl}
                alt={t("economy:listSpace.photos.previewAlt", {
                  position: photoIndex + 1,
                })}
                referrerPolicy="no-referrer"
              />
              {photoIndex === 0 && (
                <span className={styles.photoCover}>
                  {t("economy:listSpace.photos.cover")}
                </span>
              )}
              <button
                type="button"
                className={styles.photoRemove}
                onClick={() => setPendingRemovalReference(photo.reference)}
                aria-label={t("economy:listSpace.photos.remove", {
                  position: photoIndex + 1,
                })}
              >
                <FiTrash2 aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="ghost"
        size="md"
        disabled={isAtCap}
        onClick={() => setIsPickerOpen(true)}
      >
        <FiImage aria-hidden />
        {isAtCap
          ? t("economy:listSpace.photos.full")
          : t("economy:listSpace.photos.add")}
      </Button>

      <ConfirmDialog
        open={pendingRemovalReference !== null}
        tone="destructive"
        onClose={() => setPendingRemovalReference(null)}
        onConfirm={() => {
          if (pendingRemovalReference !== null) {
            form.removePhoto(pendingRemovalReference);
          }
          setPendingRemovalReference(null);
        }}
        title={t("subprofiles:imageUpload.removeConfirm.title")}
        description={t("subprofiles:imageUpload.removeConfirm.body")}
        confirmLabel={t("subprofiles:imageUpload.removeConfirm.confirm")}
        cancelLabel={t("subprofiles:imageUpload.removeConfirm.cancel")}
      />

      {isPickerOpen && (
        <PhotoPickerModal
          kind="listing-photo"
          shouldReframe={false}
          onPick={(key, previewUrl) => handlePick(key, previewUrl)}
          onDeleted={handleDeleted}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
