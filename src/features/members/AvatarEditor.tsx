import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfileEdit.module.css";

/**
 * The hero portrait in edit mode: shows the current photo (or initials) with a
 * "Change photo" action and, when a photo is set, a "Remove" action. A freshly
 * picked photo shows instantly via a local preview URL (this component's own
 * state, revoked on replace/remove); `onChange` is called with the persistable
 * storage key, not the preview URL — the parent's `photo` prop stays the value
 * to submit and is what renders once it's a real, saved image.
 */
export function AvatarEditor({
  photo,
  initials,
  tint,
  name,
  onChange,
  onRemove,
}: {
  photo?: string;
  initials: string;
  tint: ImageSlotTint;
  name: string;
  onChange: (key: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadImage("avatar");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File) {
    setError(null);
    setProgress(0);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await uploadAvatar(file, {
        onProgress: (p) => setProgress(p),
      });
      // This editor shows one photo at a time, so the previous local preview
      // (if any) is now stale — revoke it ourselves rather than waiting for
      // the hook's unmount sweep to hold onto it for the rest of the session.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onChange(key);
    } catch (err) {
      setError(
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  const displayedPhoto = previewUrl ?? photo;

  return (
    <div className={styles.avatarWrap}>
      <ImageSlot
        tint={tint}
        src={displayedPhoto}
        initials={initials}
        height={430}
        radius={20}
        placeholder={name}
      />
      <div className={styles.avatarActions}>
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <FiCamera size={15} />
          {uploading
            ? t("members:avatar.uploading", { percent: progress })
            : displayedPhoto
              ? t("members:avatar.change")
              : t("members:avatar.add")}
        </button>
        {displayedPhoto && !uploading && (
          <button
            type="button"
            className={`${styles.avatarBtn} ${styles.avatarBtnGhost}`}
            aria-label={t("members:avatar.remove")}
            onClick={() => {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }
              onRemove();
            }}
          >
            <FiTrash2 size={15} />
          </button>
        )}
      </div>
      {error && (
        <p className={styles.avatarError} role="alert">
          {error}
        </p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
