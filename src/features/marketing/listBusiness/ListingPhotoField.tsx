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
import {
  PASTED_IMAGE_URL_PROBLEM_KEYS,
  pastedImageUrlProblem,
} from "./listBusiness.data";
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
 * One wizard photo slot: an `ImageSlot` preview with an Upload/Change button, a
 * Remove button, and an "or paste an image URL" input. Upload goes through the
 * shared `useUploadImage` pipeline (owned at wizard level, passed in as
 * `uploadPhoto`); a pasted URL is applied live. Both call `onResolved(persist,
 * preview)` — `persist` lands in `draft.photos`, `preview` in `photoPreviews`.
 *
 * Every way a photo can be refused is said on the slot itself: a file in a
 * format or size the upload pipeline refuses, a pasted link the backend's
 * `@IsImageReference` would refuse, a pasted link that does not load an image,
 * and a save the server rejected because of this slot.
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
  const [urlText, setUrlText] = useState("");
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
      setUrlText("");
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

  function applyUrl(nextUrl: string) {
    setUrlText(nextUrl);
    const trimmed = nextUrl.trim();
    if (!trimmed) {
      setError(null);
      onRemove();
      return;
    }
    const problem = pastedImageUrlProblem(trimmed);
    if (problem) {
      setError(t(PASTED_IMAGE_URL_PROBLEM_KEYS[problem]));
      return;
    }
    setError(null);
    onResolved(trimmed, trimmed);
  }

  /** A pasted link that passed the checks but did not load an image (a web
   *  page, a 404) is dropped so it cannot be saved as a broken photo. A photo
   *  that was already on the listing is left alone: one failed load may just
   *  be the network. */
  function handleLoadError() {
    const pastedUrl = urlText.trim();
    if (!pastedUrl || pastedUrl !== displayValue) return;
    setError(t("marketing:listBusiness.step4.photo.urlDidNotLoad"));
    onRemove();
  }

  function clear() {
    setUrlText("");
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
        onLoadError={handleLoadError}
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
        aria-invalid={visibleError ? true : undefined}
        aria-describedby={visibleError ? errorId : undefined}
        placeholder={t("marketing:listBusiness.step4.photo.urlPlaceholder")}
        value={urlText}
        onChange={(event) => applyUrl(event.target.value)}
        disabled={uploading}
      />
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
