import { useRef, useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUploadImage } from "../members/api/useUploadImage";
import { LIST_SPACE_MAX_PHOTOS, type ListSpaceForm } from "./useListSpaceForm";
import styles from "./ListSpaceFields.module.css";

/**
 * The gallery on the "list a space" form: up to
 * {@link LIST_SPACE_MAX_PHOTOS} photos, the first one being the cover the
 * board shows.
 *
 * Every photo goes through the shared `useUploadImage("listing-photo")`
 * pipeline, the same presigned direct-to-storage path every other image slot
 * in the product uses. That helper is also where image metadata is stripped,
 * and it FAILS CLOSED: `processImage` re-encodes the pixels and throws
 * `members:upload.error.stripFailed` if it cannot, so a photo whose EXIF could
 * not be removed is never uploaded. A home listing is exactly the photo set
 * where an embedded GPS tag would publish where a member lives, so this path
 * must never be worked around.
 */
export function ListSpacePhotoField({ form }: { form: ListSpaceForm }) {
  const { t } = useTranslation();
  const uploadPhoto = useUploadImage("listing-photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const photos = form.values.photos;
  const isAtCap = photos.length >= LIST_SPACE_MAX_PHOTOS;

  async function handleFilePicked(file: File) {
    setErrorMessage(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadPhoto(file);
      form.addPhoto({
        reference: uploaded.key,
        previewUrl: uploaded.previewUrl,
      });
    } catch (uploadFailure) {
      setErrorMessage(
        uploadFailure instanceof ImageProcessingError
          ? t(uploadFailure.i18nKey, uploadFailure.values)
          : t("economy:listSpace.photos.error"),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={styles.photoField}>
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
                onClick={() => form.removePhoto(photo.reference)}
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
        disabled={isUploading || isAtCap}
        onClick={() => fileInputRef.current?.click()}
      >
        <FiImage aria-hidden />
        {isUploading
          ? t("economy:listSpace.photos.uploading")
          : isAtCap
            ? t("economy:listSpace.photos.full")
            : t("economy:listSpace.photos.add")}
      </Button>

      {errorMessage && (
        <p className={styles.fieldError} role="alert">
          {errorMessage}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label={t("economy:listSpace.photos.add")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFilePicked(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
