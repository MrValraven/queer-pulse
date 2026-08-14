import { useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import { Modal, Button, PhotoReframeModal } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
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
  // Guards `resolveQueueHead` against re-entrancy: the reframe modal for
  // `reframeQueue[0]` stays mounted (and its Save/Cancel buttons don't
  // disable) for the whole async upload, so a second click while one is in
  // flight must be ignored rather than kicking off a second concurrent
  // upload of the same file.
  const processingRef = useRef(false);

  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  // Non-GIF files picked in this batch, awaiting the one-at-a-time reframe
  // step. The head of the queue is what's currently shown in the reframe
  // modal; it's popped once that file is resolved (confirmed or cancelled).
  const [reframeQueue, setReframeQueue] = useState<File[]>([]);

  const stagedKeys = new Set(staged.map((photo) => photo.key));
  // Reserve capacity for files already queued for reframing, not just the
  // ones already staged, so a second pick can't over-commit past `remaining`.
  const atCapacity = staged.length + reframeQueue.length >= remaining;

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

  /** Shared tail of every upload path in this batch: direct GIF upload,
   * post-reframe confirm, and reframe-cancelled (uncropped) upload. Reports
   * per-file so one bad image doesn't lose the rest of the batch. */
  async function uploadAndStage(file: File, crop?: CropRect) {
    setUploading(true);
    try {
      const result = await uploadImage(file, { onProgress: setProgress, crop });
      // Guard against a race where earlier files already filled the gallery.
      setStaged((current) =>
        current.length >= remaining || current.some((p) => p.key === result.key)
          ? current
          : [...current, result],
      );
    } catch (error) {
      setUploadError(
        error instanceof ImageProcessingError
          ? t(error.i18nKey, error.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function handleFiles(files: File[]) {
    setUploadError(null);
    const free = remaining - staged.length - reframeQueue.length;
    if (free <= 0) {
      setSkippedCount(files.length);
      return;
    }
    const toProcess = files.slice(0, free);
    setSkippedCount(files.length > free ? files.length - free : 0);

    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, one at a time, as before.
    const gifFiles = toProcess.filter((file) => file.type === "image/gif");
    const reframeFiles = toProcess.filter((file) => file.type !== "image/gif");

    if (reframeFiles.length > 0) {
      setReframeQueue((current) => [...current, ...reframeFiles]);
    }

    for (const file of gifFiles) {
      await uploadAndStage(file);
    }
  }

  /** Resolves the head of the reframe queue — used on both Save (with a crop)
   * and Cancel (uncropped, so "add everything I picked" still holds and one
   * photo's cancel never blocks the rest). `processingRef` makes this
   * sequential and re-entrancy-safe: a second Confirm/Cancel click while an
   * upload is already in flight is ignored outright (the reframe modal stays
   * mounted with live buttons for the whole await, so nothing else stops a
   * double-click). The file stays at `reframeQueue[0]` — and so still counts
   * against `atCapacity`/`free` — until its upload actually resolves, and
   * only ONE upload ever runs at a time, so the shared `uploading`/`progress`
   * state can't be stomped by an overlapping second upload's `finally`. The
   * queue only advances (in `finally`, so a failed upload still advances)
   * once that upload settles. */
  async function resolveQueueHead(crop?: CropRect) {
    if (processingRef.current) return;
    const file = reframeQueue[0];
    if (!file) return;
    processingRef.current = true;
    try {
      await uploadAndStage(file, crop);
    } finally {
      processingRef.current = false;
      setReframeQueue((current) => current.slice(1));
    }
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

      {reframeQueue[0] && (
        <PhotoReframeModal
          // One PhotoReframeModal instance is reused across the whole queue
          // (unlike the single-file pickers, which unmount/remount per
          // file), so it needs an explicit per-file key to fully remount —
          // and reset its internal `rect` — on every queue advance. Without
          // this, `rect` stays non-undefined across files (Save enables
          // immediately, before the next image's onLoad reseeds it via
          // ImageReframer's own key), so a fast Save on the next photo could
          // apply the previous photo's crop.
          key={`${reframeQueue.length}:${reframeQueue[0].name}`}
          file={reframeQueue[0]}
          kind="work-image"
          onCancel={() => void resolveQueueHead()}
          onConfirm={(crop) => void resolveQueueHead(crop)}
        />
      )}
    </Modal>
  );
}
