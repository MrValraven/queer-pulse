import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WorkItem } from "./data/members";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

const TINTS = ["coral", "jade", "plum"] as const;

/**
 * One editable "Selected work" card: an image picker (uploads via
 * `useUploadImage("work-image")`, which resolves to `{ key, previewUrl }` —
 * `previewUrl` renders instantly as this component's own local preview state,
 * `key` is what `onChange` persists onto `item.image`) plus title / category /
 * year fields, and a remove action. Mirrors `AvatarEditor`'s upload + error
 * handling.
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
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadWorkImage = useUploadImage("work-image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await uploadWorkImage(file);
      // Single-slot picker — the previous local preview (if any) is now
      // stale, so revoke it right away instead of leaving it to the hook's
      // unmount sweep.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onChange({ image: key });
    } catch (err) {
      setError(
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("members:workItem.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  const displayedImage = previewUrl ?? item.image;

  return (
    <article className={styles.workCard}>
      <div className={editStyles.workImageWrap}>
        <ImageSlot
          tint={TINTS[index % 3]}
          src={displayedImage}
          height={200}
          radius={14}
          placeholder={t("members:workItem.imagePlaceholder")}
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
            {uploading
              ? t("members:workItem.uploading")
              : displayedImage
                ? t("members:workItem.change")
                : t("members:workItem.add")}
          </button>
          {displayedImage && !uploading && (
            <button
              type="button"
              className={`${editStyles.avatarBtn} ${editStyles.avatarBtnGhost}`}
              aria-label={t("members:workItem.removeImage")}
              onClick={() => {
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
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
          if (f) void pick(f);
          e.target.value = "";
        }}
      />

      <input
        className={`${editStyles.inlineInput} ${editStyles.workCatInput}`}
        value={item.category}
        placeholder={t("members:workItem.categoryPlaceholder")}
        aria-label={t("members:workItem.categoryLabel")}
        onChange={(e) => onChange({ category: e.target.value })}
      />
      <input
        className={`${editStyles.inlineInput} ${editStyles.workTitleInput}`}
        value={item.title}
        placeholder={t("members:workItem.titlePlaceholder")}
        aria-label={t("members:workItem.titleLabel")}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      {item.link?.kind === "ref" ? (
        // A `ref` link points at an internal QueerPulse page (e.g. a curated
        // collection). There's no ref/entity picker in this editor (out of
        // scope), so rendering the external-URL input here would show a blank
        // box whose first keystroke silently downgrades and destroys the ref.
        // Show a read-only note instead — every other field stays editable.
        <p className={editStyles.workLinkNote}>
          {t("members:workItem.linkedNote")}
        </p>
      ) : (
        <input
          className={`${editStyles.inlineInput} ${editStyles.workLinkInput}`}
          value={item.link?.kind === "external" ? item.link.href : ""}
          placeholder={t("members:workItem.linkPlaceholder")}
          aria-label={t("members:workItem.linkLabel")}
          onChange={(e) => {
            const href = e.target.value.trim();
            onChange({ link: href ? { kind: "external", href } : undefined });
          }}
        />
      )}
      <div className={editStyles.workMetaRow}>
        <input
          className={`${editStyles.inlineInput} ${editStyles.workYearInput}`}
          value={item.year}
          placeholder={t("members:workItem.yearPlaceholder")}
          aria-label={t("members:workItem.yearLabel")}
          onChange={(e) => onChange({ year: e.target.value })}
        />
        <button
          type="button"
          className={editStyles.workRemove}
          onClick={onRemove}
        >
          <FiTrash2 size={14} aria-hidden /> {t("members:workItem.remove")}
        </button>
      </div>
    </article>
  );
}
