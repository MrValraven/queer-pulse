import { useEffect, useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useUploadImage, type UploadKind } from "../members/api/useUploadImage";
import styles from "./SubprofileEditor.module.css";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** Which upload surface — sets size/dimension limits (avatar vs work image). */
  kind: UploadKind;
  circle?: boolean;
  size?: number;
  placeholder?: string;
}

/**
 * Image picker used across the editor: an image slot plus add / change / remove.
 * Uploads via `useUploadImage` — a local object-URL preview in demo mode, a real
 * storage upload in live mode. Revokes its preview URL on replace / unmount.
 */
export function ImageUploadField({
  value,
  onChange,
  kind,
  circle = false,
  size = 150,
  placeholder = "Image",
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const createdUrl = useRef<string | null>(null);
  const upload = useUploadImage(kind);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
    },
    [],
  );

  async function pick(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await upload(file);
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
      createdUrl.current = url.startsWith("blob:") ? url : null;
      onChange(url);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't add that image. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    if (createdUrl.current) {
      URL.revokeObjectURL(createdUrl.current);
      createdUrl.current = null;
    }
    onChange("");
  }

  return (
    <div className={`${styles.imgField} ${circle ? styles.avatarField : ""}`}>
      <ImageSlot
        tint="plum"
        shape={circle ? "circle" : "rounded"}
        src={value || undefined}
        width={circle ? size : "100%"}
        height={size}
        radius={14}
        placeholder={placeholder}
      />
      <div className={styles.imgActions}>
        <button
          type="button"
          className={styles.smallBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <FiCamera size={14} aria-hidden />
          {uploading ? "Uploading…" : value ? "Change" : "Add image"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            className={styles.smallBtn}
            aria-label="Remove image"
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
