import { useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { Modal, Button, PhotoReframeModal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GalleryPastUploadsGrid } from "./GalleryPastUploadsGrid";
import { useGalleryUploadQueue } from "./useGalleryUploadQueue";
import styles from "./AddGalleryPhotosModal.module.css";

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
  // Staging, per-file upload and the one-at-a-time reframe queue all live in
  // the hook; this component is the markup around them.
  const {
    staged,
    stagedKeys,
    atCapacity,
    uploading,
    progress,
    uploadError,
    skippedCount,
    reframeQueue,
    toggleExisting,
    handleFiles,
    resolveQueueHead,
  } = useGalleryUploadQueue(remaining);

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
