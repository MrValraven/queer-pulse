import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage, type UploadKind } from "../members/api/useUploadImage";
import styles from "./SubprofileEditor.module.css";

interface ImageUploadFieldProps {
  value: string;
  onChange: (key: string) => void;
  /** Which upload surface — sets size/dimension limits (avatar vs work image). */
  kind: UploadKind;
  circle?: boolean;
  size?: number;
  placeholder?: string;
}

/**
 * Image picker used across the editor: an image slot plus add / change / remove.
 * Uploads via `useUploadImage`, which resolves to `{ key, previewUrl }`. This
 * component shows `previewUrl` (its own local state) for an instant preview
 * and calls `onChange` with `key` — the value that actually gets persisted.
 * The local preview is revoked on replace / remove.
 */
export function ImageUploadField({
  value,
  onChange,
  kind,
  circle = false,
  size = 150,
  placeholder,
}: ImageUploadFieldProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage(kind);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedPlaceholder =
    placeholder ?? t("subprofiles:imageUpload.defaultPlaceholder");

  async function pick(file: File) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await upload(file);
      // Single-slot field — the previous local preview (if any) is now
      // stale, so revoke it right away instead of leaving it to the hook's
      // unmount sweep.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onChange(key);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("subprofiles:imageUpload.error"),
      );
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange("");
  }

  const displayedValue = previewUrl ?? value;

  return (
    <div className={`${styles.imgField} ${circle ? styles.avatarField : ""}`}>
      <ImageSlot
        tint="plum"
        shape={circle ? "circle" : "rounded"}
        src={displayedValue || undefined}
        width={circle ? size : "100%"}
        height={size}
        radius={14}
        placeholder={resolvedPlaceholder}
      />
      <div className={styles.imgActions}>
        <button
          type="button"
          className={styles.smallBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <FiCamera size={14} aria-hidden />
          {uploading
            ? t("subprofiles:imageUpload.uploading")
            : displayedValue
              ? t("subprofiles:imageUpload.change")
              : t("subprofiles:imageUpload.add")}
        </button>
        {displayedValue && !uploading && (
          <button
            type="button"
            className={styles.smallBtn}
            aria-label={t("subprofiles:imageUpload.remove")}
            onClick={clear}
          >
            <FiTrash2 size={14} aria-hidden />
          </button>
        )}
      </div>
      {error && (
        <p className={styles.imgError} role="alert">
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
