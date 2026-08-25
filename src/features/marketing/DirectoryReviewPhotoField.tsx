import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUploadImage } from "../members/api/useUploadImage";
import s from "./DirectorySpacePage.module.css";

interface Props {
  /** What to show right now: the review's existing photo, a fresh local
   *  preview, or null for "no photo attached". */
  previewUrl: string | null;
  /** `key` is the private storage key to persist, `previewUrl` a local blob
   *  safe to render immediately. */
  onUploaded: (key: string, previewUrl: string) => void;
  onRemove: () => void;
  isDisabled?: boolean;
}

/**
 * The optional photo on a review, in the composer.
 *
 * Goes through the shared `useUploadImage("listing-photo")` pipeline, the same
 * presigned direct-to-storage path the listing wizard uses. That helper is
 * also the ONLY place image metadata is stripped anywhere in the product (the
 * backend never sees the bytes), so a review photo must never take a shortcut
 * around it.
 */
export function DirectoryReviewPhotoField({
  previewUrl,
  onUploaded,
  onRemove,
  isDisabled = false,
}: Props) {
  const { t } = useTranslation();
  const uploadPhoto = useUploadImage("listing-photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFilePicked(file: File) {
    setErrorMessage(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadPhoto(file);
      onUploaded(uploaded.key, uploaded.previewUrl);
    } catch (uploadFailure) {
      setErrorMessage(
        uploadFailure instanceof ImageProcessingError
          ? t(uploadFailure.i18nKey, uploadFailure.values)
          : t("marketing:directory.detail.review.photo.error"),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={s.reviewPhotoField}>
      {previewUrl && (
        <img
          className={s.reviewPhotoPreview}
          src={previewUrl}
          alt={t("marketing:directory.detail.review.photo.previewAlt")}
          referrerPolicy="no-referrer"
        />
      )}
      <div className={s.reviewPhotoActions}>
        <button
          type="button"
          className={s.reviewPhotoBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled || isUploading}
        >
          <FiCamera size={14} aria-hidden />
          {isUploading
            ? t("marketing:directory.detail.review.photo.uploading")
            : previewUrl
              ? t("marketing:directory.detail.review.photo.change")
              : t("marketing:directory.detail.review.photo.add")}
        </button>
        {previewUrl && !isUploading && (
          <button
            type="button"
            className={s.reviewPhotoBtn}
            onClick={onRemove}
            disabled={isDisabled}
          >
            <FiTrash2 size={14} aria-hidden />
            {t("marketing:directory.detail.review.photo.remove")}
          </button>
        )}
      </div>
      {errorMessage && (
        <p className={s.reviewPhotoError} role="alert">
          {errorMessage}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label={t("marketing:directory.detail.review.photo.add")}
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
