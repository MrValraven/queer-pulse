import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import {
  ImageSlot,
  PhotoReframeModal,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../../members/api/uploadProcessing";
import { isPastableImageUrl } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

interface ListingPhotoFieldProps {
  tint: ImageSlotTint;
  height: number;
  wide?: boolean;
  placeholder: string;
  displayValue: string;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
  onResolved: (persist: string, preview: string) => void;
  onRemove: () => void;
}

/**
 * One wizard photo slot: an `ImageSlot` preview with an Upload/Change button, a
 * Remove button, and an "or paste an image URL" input. Upload goes through the
 * shared `useUploadImage` pipeline (owned at wizard level, passed in as
 * `uploadPhoto`); a pasted URL is applied live. Both call `onResolved(persist,
 * preview)` — `persist` lands in `draft.photos`, `preview` in `photoPreviews`.
 */
export function ListingPhotoField({
  tint,
  height,
  wide,
  placeholder,
  displayValue,
  uploadPhoto,
  onResolved,
  onRemove,
}: ListingPhotoFieldProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlText, setUrlText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndApply(file: File, crop?: CropRect) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadPhoto(file, { crop });
      setUrlText("");
      onResolved(key, previewUrl);
    } catch (uploadFailure) {
      setError(
        uploadFailure instanceof ImageProcessingError
          ? t(uploadFailure.i18nKey, uploadFailure.values)
          : t("marketing:listBusiness.step4.photo.uploadError"),
      );
    } finally {
      setUploading(false);
    }
  }

  function pickFile(file: File) {
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      void uploadAndApply(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndApply(fileToUpload, crop);
  }

  function applyUrl(nextUrl: string) {
    setUrlText(nextUrl);
    const trimmed = nextUrl.trim();
    if (!trimmed) {
      setError(null);
      onRemove();
      return;
    }
    if (!isPastableImageUrl(trimmed)) {
      setError(t("marketing:listBusiness.step4.photo.urlInvalid"));
      return;
    }
    setError(null);
    onResolved(trimmed, trimmed);
  }

  function clear() {
    setUrlText("");
    setError(null);
    onRemove();
  }

  return (
    <div
      className={[styles.photoField, wide && styles.galWide]
        .filter(Boolean)
        .join(" ")}
    >
      <ImageSlot
        tint={tint}
        radius={14}
        height={height}
        srcSize={wide ? 1280 : 640}
        src={displayValue || undefined}
        placeholder={placeholder}
      />
      <div className={styles.photoActions}>
        <button
          type="button"
          className={styles.photoBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <FiCamera size={14} aria-hidden />
          {uploading
            ? t("marketing:listBusiness.step4.photo.uploading")
            : displayValue
              ? t("marketing:listBusiness.step4.photo.change")
              : t("marketing:listBusiness.step4.photo.upload")}
        </button>
        {displayValue && !uploading && (
          <button
            type="button"
            className={styles.photoBtn}
            aria-label={t("marketing:listBusiness.step4.photo.remove")}
            onClick={clear}
          >
            <FiTrash2 size={14} aria-hidden />
          </button>
        )}
      </div>
      <input
        type="url"
        className={styles.photoUrlInput}
        aria-label={t("marketing:listBusiness.step4.photo.urlPlaceholder")}
        placeholder={t("marketing:listBusiness.step4.photo.urlPlaceholder")}
        value={urlText}
        onChange={(event) => applyUrl(event.target.value)}
        disabled={uploading}
      />
      {error && (
        <p className={styles.photoError} role="alert">
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label={t("marketing:listBusiness.step4.photo.upload")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) pickFile(file);
          event.target.value = "";
        }}
      />
      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="listing-photo"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}
    </div>
  );
}
