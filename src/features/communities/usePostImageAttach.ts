import { useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";

export interface StagedPostImage {
  /** The value to send as the post/reply's `image` field: a storage key in
   *  live mode, a local blob URL in demo mode (see `useUploadImage`). */
  key: string;
  /** Instantly-renderable local preview — safe as an `<img src>` in both modes. */
  previewUrl: string;
}

/**
 * Shared "attach an image to a post" behaviour for the Pulse and Discussion
 * composers — a single file-picker input, a staged preview + remove
 * affordance, and upload/validation error surfacing. Reuses the SAME
 * presigned-upload pipeline every other image slot in the app uses
 * (`useUploadImage` → client-side EXIF strip + downscale in
 * `uploadProcessing.ts` → presigned PUT), no new upload path.
 *
 * `kind: "work-image"` is reused rather than adding a new upload kind: it's
 * the only existing kind that's both freeform-aspect (no locked crop, fits a
 * casual social photo) and lenient enough on minimum dimensions for a phone
 * snapshot. Its `GET /files/*` visibility is "logged in" (not scoped to the
 * community's own members), matching how the platform already serves cover
 * images and other non-session-gated photos — see the storage-kind reuse note
 * in `useUploadImage`.
 */
export function usePostImageAttach() {
  const { t } = useTranslation();
  const upload = useUploadImage("work-image");
  const [image, setImage] = useState<StagedPostImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await upload(file);
      setImage({ key: result.key, previewUrl: result.previewUrl });
    } catch (err) {
      setError(
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("communities:common.imageUploadError"),
      );
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    setImage(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return { image, uploading, error, inputRef, handleFile, remove };
}
