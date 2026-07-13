import { useEffect, useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfileEdit.module.css";

/**
 * The hero portrait in edit mode: shows the current photo (or initials) with a
 * "Change photo" action and, when a photo is set, a "Remove" action. Object URLs
 * created from picked files are revoked when replaced or on unmount.
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
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const createdUrl = useRef<string | null>(null);
  const uploadAvatar = useUploadImage("avatar");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
    },
    [],
  );

  // Demo mode: `uploadAvatar` returns a local object URL (kept for revoking).
  // Live mode: it uploads to storage and returns the stable public URL, so no
  // object URL is created and there's nothing to revoke.
  async function pick(file: File) {
    setError(null);
    setProgress(0);
    setUploading(true);
    try {
      const url = await uploadAvatar(file, {
        onProgress: (p) => setProgress(p),
      });
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
      createdUrl.current = url.startsWith("blob:") ? url : null;
      onChange(url);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't add that photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.avatarWrap}>
      <ImageSlot
        tint={tint}
        src={photo}
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
            ? `Uploading… ${progress}%`
            : photo
              ? "Change photo"
              : "Add photo"}
        </button>
        {photo && !uploading && (
          <button
            type="button"
            className={`${styles.avatarBtn} ${styles.avatarBtnGhost}`}
            aria-label="Remove photo"
            onClick={() => {
              if (createdUrl.current) {
                URL.revokeObjectURL(createdUrl.current);
                createdUrl.current = null;
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
