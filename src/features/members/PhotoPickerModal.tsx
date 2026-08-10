import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import {
  Modal,
  ConfirmDialog,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage } from "./api/useUploadImage";
import { useMyMedia, useDeleteMyMedia } from "../settings/api/useMyMedia";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";
import styles from "./PhotoPickerModal.module.css";

const LOADING_SKELETON_CELLS = 6;

interface PhotoPickerModalProps {
  onClose: () => void;
  googlePhoto?: string;
  /** The value currently applied in the editor (last thing passed to
   * `onPick`/`onPickGoogle`) — used to tell whether a deleted gallery item is
   * the one currently showing, so the hero can be cleared with it. */
  currentValue?: string;
  /** value = key to persist, previewUrl = absolute/blob URL to show now. */
  onPick: (value: string, previewUrl: string) => void;
  onPickGoogle: (url: string) => void;
  /** Called when the deleted photo was the one currently applied — the
   * caller should clear the hero the same way its own Remove action does. */
  onDeletedCurrent?: () => void;
}

/**
 * "Choose a photo" modal: upload-from-device, use-Google-photo, and a grid of
 * the member's own past uploads (with delete). A single `onPick(value,
 * previewUrl)` covers both device-upload (value=key, preview=blob) and
 * gallery-selection (value=item.key, preview=item.fileUrl); Google stays
 * separate because its value IS a URL, not a storage key.
 */
export function PhotoPickerModal({
  onClose,
  googlePhoto,
  currentValue,
  onPick,
  onPickGoogle,
  onDeletedCurrent,
}: PhotoPickerModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadImage("avatar");
  const { items, isLoading, isError, refetch } = useMyMedia();
  const deleteMedia = useDeleteMyMedia();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MyMediaItem | null>(null);

  async function handleFile(file: File) {
    setUploadError(null);
    setProgress(0);
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadAvatar(file, {
        onProgress: (percent) => setProgress(percent),
      });
      onPick(key, previewUrl);
      onClose();
    } catch (error) {
      setUploadError(
        error instanceof ImageProcessingError
          ? t(error.i18nKey, error.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const deletedKey = pendingDelete.key;
    deleteMedia.mutate(deletedKey, {
      onSuccess: () => {
        showToast(t("members:avatar.picker.deleted"), "success");
        // If this was the photo currently applied in the editor, clear the
        // hero too — otherwise it'd keep pointing at a deleted upload.
        if (deletedKey === currentValue) onDeletedCurrent?.();
      },
      onError: () => {
        showToast(t("members:avatar.picker.deleteError"), "error");
      },
    });
    setPendingDelete(null);
  }

  return (
    <Modal title={t("members:avatar.picker.title")} onClose={onClose} wide>
      <div className={styles.sources}>
        <button
          type="button"
          className={styles.sourceBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <FiCamera size={16} />
          {uploading
            ? t("members:avatar.uploading", { percent: progress })
            : t("members:avatar.picker.upload")}
        </button>
        {googlePhoto && (
          <button
            type="button"
            className={styles.sourceBtn}
            onClick={() => {
              onPickGoogle(googlePhoto);
              onClose();
            }}
            disabled={uploading}
          >
            <FcGoogle size={16} />
            {t("members:avatar.useGoogle")}
          </button>
        )}
      </div>

      {uploadError && (
        <p className={styles.error} role="alert">
          {uploadError}
        </p>
      )}

      <h3 className={styles.sectionTitle}>
        {t("members:avatar.picker.yourPhotos")}
      </h3>

      {isLoading && (
        <ul className={styles.grid} aria-busy="true">
          {Array.from({ length: LOADING_SKELETON_CELLS }, (_, index) => (
            <li key={index} className={styles.cell}>
              <SkeletonLine height="100%" style={{ borderRadius: 12 }} />
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <div className={styles.emptyState}>
          <p>{t("members:avatar.picker.loadError")}</p>
          <button
            type="button"
            className={styles.sourceBtn}
            onClick={() => void refetch()}
          >
            {t("members:avatar.picker.retry")}
          </button>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className={styles.emptyState}>{t("members:avatar.picker.empty")}</p>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.key} className={styles.cell}>
              <button
                type="button"
                className={styles.thumbBtn}
                aria-label={t("members:avatar.picker.useThis")}
                onClick={() => {
                  onPick(item.key, resolveMyMediaUrl(item.fileUrl));
                  onClose();
                }}
                disabled={uploading}
              >
                <ImageSlot
                  tint="coral"
                  src={resolveMyMediaUrl(item.fileUrl)}
                  initials=""
                  width="100%"
                  height="100%"
                  radius={12}
                  srcSize={220}
                />
              </button>
              {item.inUse && (
                <span className={styles.inUse}>
                  {t("members:avatar.picker.inUse")}
                </span>
              )}
              <button
                type="button"
                className={styles.deleteBtn}
                aria-label={t("members:avatar.picker.delete")}
                onClick={() => setPendingDelete(item)}
                disabled={uploading}
              >
                <FiTrash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        aria-label={t("members:avatar.picker.upload")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {pendingDelete && (
        <ConfirmDialog
          open
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          title={t("members:avatar.picker.deleteConfirmTitle")}
          description={
            pendingDelete.usedAs
              ? t("members:avatar.picker.deleteConfirmBodyInUse", {
                  usedAs: t(`settings:uploads.usedAs.${pendingDelete.usedAs}`),
                })
              : t("members:avatar.picker.deleteConfirmBody")
          }
          confirmLabel={t("members:avatar.picker.deleteConfirmCta")}
          tone="destructive"
          loading={deleteMedia.isPending}
        />
      )}
    </Modal>
  );
}
