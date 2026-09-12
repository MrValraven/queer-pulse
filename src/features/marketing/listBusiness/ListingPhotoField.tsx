import { useId, useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import {
  ImageSlot,
  PhotoReframeModal,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ImageProcessingError,
  validateTypeAndSize,
} from "../../members/api/uploadProcessing";
import styles from "./ListBusinessPage.module.css";

interface ListingPhotoFieldProps {
  tint: ImageSlotTint;
  height: number;
  wide?: boolean;
  placeholder: string;
  /** Standing caption above the frame. The cover slot uses it to say the photo
   *  is the one the directory card shows — the `placeholder` caption can't,
   *  since it vanishes the moment a photo fills the slot. */
  note?: string;
  displayValue: string;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
  /** True when the last submit or save came back refusing THIS slot's photo.
   *  The form clears it once the slot's photo changes, so the message never
   *  outlives the photo it was about. */
  isRejectedByServer: boolean;
  onResolved: (persist: string, preview: string) => void;
  onRemove: () => void;
}

/**
 * One wizard photo slot: an `ImageSlot` preview with an Upload/Change button
 * and a Remove button. Uploading a file is the only way to fill a slot: the
 * file goes through the shared `useUploadImage` pipeline (owned at wizard
 * level, passed in as `uploadPhoto`), which stores it and hands back a storage
 * key. It then calls `onResolved(persist, preview)` — `persist` lands in
 * `draft.photos`, `preview` in `photoPreviews`.
 *
 * There is deliberately no "paste an image URL" input. A listing photo is
 * always a file the owner uploaded, so it cannot break later when someone
 * else's site moves or deletes the image, and it goes through the same
 * format/size/reframe pipeline as every other upload.
 *
 * Every way a photo can be refused is said on the slot itself: a file in a
 * format or size the upload pipeline refuses, an upload that failed, and a save
 * the server rejected because of this slot.
 */
export function ListingPhotoField({
  tint,
  height,
  wide,
  placeholder,
  note,
  displayValue,
  uploadPhoto,
  isRejectedByServer,
  onResolved,
  onRemove,
}: ListingPhotoFieldProps) {
  const { t } = useTranslation();
  const errorId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function describeUploadFailure(uploadFailure: unknown): string {
    return uploadFailure instanceof ImageProcessingError
      ? t(uploadFailure.i18nKey, uploadFailure.values)
      : t("marketing:listBusiness.step4.photo.uploadError");
  }

  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndApply(file: File, crop?: CropRect) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadPhoto(file, { crop });
      onResolved(key, previewUrl);
    } catch (uploadFailure) {
      setError(describeUploadFailure(uploadFailure));
    } finally {
      setUploading(false);
    }
  }

  function pickFile(file: File) {
    // Check the format and size first, so an unsupported file (a HEIC, an SVG,
    // a PDF) is named on this slot straight away instead of opening the
    // reframer on an image it cannot show. The upload pipeline checks again.
    try {
      validateTypeAndSize(file, "listing-photo");
    } catch (validationFailure) {
      setError(describeUploadFailure(validationFailure));
      return;
    }
    setError(null);
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

  function clear() {
    setError(null);
    onRemove();
  }

  const visibleError =
    error ??
    (isRejectedByServer
      ? t("marketing:listBusiness.step4.photo.serverRejected")
      : null);

  return (
    <div
      className={[styles.photoField, wide && styles.galWide]
        .filter(Boolean)
        .join(" ")}
    >
      {note && <p className={styles.photoNote}>{note}</p>}
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
          aria-describedby={visibleError ? errorId : undefined}
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
      {visibleError && (
        <p id={errorId} className={styles.photoError} role="alert">
          {visibleError}
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
