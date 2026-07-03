import { useEffect, useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import type { WorkItem } from "./data/members";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

const TINTS = ["coral", "jade", "plum"] as const;

/**
 * One editable "Selected work" card: an image picker (uploads via
 * `useUploadImage("work-image")` — demo returns an object-URL preview, live
 * uploads to storage and returns the public URL) plus title / category / year
 * fields, and a remove action. Mirrors `AvatarEditor`'s upload + error handling.
 */
export function WorkItemEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WorkItem;
  index: number;
  onChange: (patch: Partial<WorkItem>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const createdUrl = useRef<string | null>(null);
  const uploadWorkImage = useUploadImage("work-image");
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
      const url = await uploadWorkImage(file);
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
      createdUrl.current = url.startsWith("blob:") ? url : null;
      onChange({ image: url });
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

  return (
    <article className={styles.workCard}>
      <div className={editStyles.workImageWrap}>
        <ImageSlot
          tint={TINTS[index % 3]}
          src={item.image}
          height={200}
          radius={14}
          placeholder="Work"
          style={{ marginBottom: 14 }}
        />
        <div className={editStyles.workImageActions}>
          <button
            type="button"
            className={editStyles.avatarBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <FiCamera size={14} />
            {uploading ? "Uploading…" : item.image ? "Change" : "Add image"}
          </button>
          {item.image && !uploading && (
            <button
              type="button"
              className={`${editStyles.avatarBtn} ${editStyles.avatarBtnGhost}`}
              aria-label="Remove image"
              onClick={() => {
                if (createdUrl.current) {
                  URL.revokeObjectURL(createdUrl.current);
                  createdUrl.current = null;
                }
                onChange({ image: undefined });
              }}
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className={editStyles.avatarError} role="alert">
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

      <input
        className={`${editStyles.inlineInput} ${editStyles.workCatInput}`}
        value={item.category}
        placeholder="Category (e.g. Identity)"
        aria-label="Work category"
        onChange={(e) => onChange({ category: e.target.value })}
      />
      <input
        className={`${editStyles.inlineInput} ${editStyles.workTitleInput}`}
        value={item.title}
        placeholder="Title"
        aria-label="Work title"
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <div className={editStyles.workMetaRow}>
        <input
          className={`${editStyles.inlineInput} ${editStyles.workYearInput}`}
          value={item.year}
          placeholder="Year"
          aria-label="Work year"
          onChange={(e) => onChange({ year: e.target.value })}
        />
        <button
          type="button"
          className={editStyles.workRemove}
          onClick={onRemove}
        >
          <FiTrash2 size={14} aria-hidden /> Remove
        </button>
      </div>
    </article>
  );
}
