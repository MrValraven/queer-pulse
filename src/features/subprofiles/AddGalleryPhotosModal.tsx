import { useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import { Modal, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUploadImage } from "../members/api/useUploadImage";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";
import { GalleryPastUploadsGrid } from "./GalleryPastUploadsGrid";
import styles from "./AddGalleryPhotosModal.module.css";

/** One picked-but-not-yet-committed photo. Identity is `key`. */
interface StagedPhoto {
  key: string;
  previewUrl: string;
}

export interface AddGalleryPhotosModalProps {
  /** Free gallery slots. The modal is only opened when this is >= 1. */
  remaining: number;
  onClose: () => void;
  /** Commit the staged storage keys; the modal then closes itself. */
  onAdd: (imageKeys: string[]) => void;
}

/**
 * Stage-then-commit modal for adding several photos to a persona's gallery at
 * once, capped at `remaining` free slots. Two sources feed one staged set: a
 * multi-file device upload and the member's own past uploads (tap to toggle).
 * Nothing lands in the gallery until "Add … to gallery" is pressed.
 */
export function AddGalleryPhotosModal({
  remaining,
  onClose,
  onAdd,
}: AddGalleryPhotosModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage("work-image");

  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);

  const stagedKeys = new Set(staged.map((photo) => photo.key));
  const atCapacity = staged.length >= remaining;

  function toggleExisting(item: MyMediaItem) {
    setSkippedCount(0);
    setStaged((current) => {
      if (current.some((photo) => photo.key === item.key)) {
        return current.filter((photo) => photo.key !== item.key);
      }
      if (current.length >= remaining) return current;
      return [
        ...current,
        { key: item.key, previewUrl: resolveMyMediaUrl(item.fileUrl) },
      ];
    });
  }

  async function handleFiles(files: File[]) {
    setUploadError(null);
    const free = remaining - staged.length;
    if (free <= 0) return;
    const toUpload = files.slice(0, free);
    setSkippedCount(files.length > free ? files.length - free : 0);
    setUploading(true);
    setProgress(0);
    for (const file of toUpload) {
      try {
        const result = await uploadImage(file, { onProgress: setProgress });
        // Guard against a race where earlier files already filled the gallery.
        setStaged((current) =>
          current.length >= remaining || current.some((p) => p.key === result.key)
            ? current
            : [...current, result],
        );
      } catch (error) {
        // Report per-file so one bad image doesn't lose the rest of the batch.
        setUploadError(
          error instanceof ImageProcessingError
            ? t(error.i18nKey, error.values)
            : t("members:avatar.error.generic"),
        );
      }
    }
    setUploading(false);
    setProgress(0);
  }

  const footer = (
    <Button
      variant="primary"
      disabled={staged.length === 0}
      onClick={() => {
        onAdd(staged.map((photo) => photo.key));
        onClose();
      }}
    >
      {t("subprofiles:gallery.addCta", { count: staged.length })}
    </Button>
  );

  return (
    <Modal
      title={t("subprofiles:gallery.addTitle")}
      sub={t("subprofiles:gallery.remaining", { count: remaining })}
      onClose={onClose}
      wide
      footer={footer}
    >
      <div className={styles.sources}>
        <button
          type="button"
          className={styles.sourceBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || atCapacity}
        >
          <FiCamera size={16} aria-hidden />
          {uploading
            ? t("subprofiles:gallery.uploading", { percent: progress })
            : t("subprofiles:gallery.fromDevice")}
        </button>
      </div>

      {uploadError && (
        <p className={styles.error} role="alert">
          {uploadError}
        </p>
      )}
      {skippedCount > 0 && (
        <p className={styles.note} role="status">
          {t("subprofiles:gallery.someSkipped", { count: skippedCount })}
        </p>
      )}

      <h3 className={styles.sectionTitle}>
        {t("subprofiles:gallery.pastUploads")}
      </h3>

      <GalleryPastUploadsGrid
        stagedKeys={stagedKeys}
        canStageMore={!atCapacity}
        onToggle={toggleExisting}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label={t("subprofiles:gallery.fromDevice")}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) void handleFiles(files);
          event.target.value = "";
        }}
      />
    </Modal>
  );
}
