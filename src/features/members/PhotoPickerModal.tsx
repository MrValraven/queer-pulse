import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import {
  Modal,
  ConfirmDialog,
  ImageSlot,
  PhotoReframeModal,
  SkeletonLine,
} from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage, type UploadKind } from "./api/useUploadImage";
import { useMyMedia, useDeleteMyMedia } from "../settings/api/useMyMedia";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";
import { mediaReferenceLabelKey } from "../../shared/media/mediaReferences";
import styles from "./PhotoPickerModal.module.css";

const LOADING_SKELETON_CELLS = 6;

interface PastUploadsSectionProps {
  items: MyMediaItem[];
  isLoading: boolean;
  isError: boolean;
  /** Disabled while a device upload is in flight. */
  uploading: boolean;
  onRetry: () => void;
  onSelect: (item: MyMediaItem) => void;
  onRequestDelete: (item: MyMediaItem) => void;
}

/**
 * The "Your photos" grid of the member's own past uploads, with its own loading
 * (skeletons), error (retry), and empty states. Selecting a thumbnail picks it;
 * the trash affordance requests a delete (the parent owns the confirm dialog).
 */
function PastUploadsSection({
  items,
  isLoading,
  isError,
  uploading,
  onRetry,
  onSelect,
  onRequestDelete,
}: PastUploadsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
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
          <button type="button" className={styles.sourceBtn} onClick={onRetry}>
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
                onClick={() => onSelect(item)}
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
              {item.references.length > 0 && (
                <span className={styles.inUse}>
                  {t("members:avatar.picker.inUse")}
                </span>
              )}
              <button
                type="button"
                className={styles.deleteBtn}
                aria-label={t("members:avatar.picker.delete")}
                onClick={() => onRequestDelete(item)}
                disabled={uploading}
              >
                <FiTrash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

interface PhotoPickerModalProps {
  onClose: () => void;
  /** Which upload surface to store under — sets size/dimension limits (avatar
   * vs cover vs work image). Defaults to `"avatar"` for the profile hero. */
  kind?: UploadKind;
  googlePhoto?: string;
  /** The value currently applied in the editor (last thing passed to
   * `onPick`/`onPickGoogle`) — used to tell whether a deleted gallery item is
   * the one currently showing, so the hero can be cleared with it. */
  currentValue?: string;
  /** value = key to persist, previewUrl = absolute/blob URL to show now, crop =
   *  the reframe crop just applied to this upload (undefined for a past-upload
   *  or Google pick, which carry no fresh crop). */
  onPick: (value: string, previewUrl: string, crop?: CropRect) => void;
  /** Only relevant when a `googlePhoto` is offered; omit for slots (persona
   * avatar/cover/item image) that have no Google source. */
  onPickGoogle?: (url: string) => void;
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
  kind = "avatar",
  googlePhoto,
  currentValue,
  onPick,
  onPickGoogle,
  onDeletedCurrent,
}: PhotoPickerModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage(kind);
  const { items, isLoading, isError, refetch } = useMyMedia();
  const deleteMedia = useDeleteMyMedia();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MyMediaItem | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  /** Shared tail of both upload paths (direct GIF path + post-reframe path):
   * runs the upload, hands the result to the caller's `onPick`, and closes
   * the picker on success; surfaces `ImageProcessingError` via `t()` on
   * failure. */
  async function uploadAndFinish(file: File, crop?: CropRect) {
    setUploadError(null);
    setProgress(0);
    setUploading(true);
    try {
      const { key, previewUrl, crop: appliedCrop } = await uploadImage(file, {
        onProgress: (percent) => setProgress(percent),
        crop,
      });
      onPick(key, previewUrl, appliedCrop);
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

  async function handleFile(file: File) {
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      await uploadAndFinish(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndFinish(fileToUpload, crop);
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
              onPickGoogle?.(googlePhoto);
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

      <PastUploadsSection
        items={items}
        isLoading={isLoading}
        isError={isError}
        uploading={uploading}
        onRetry={() => void refetch()}
        onSelect={(item) => {
          onPick(item.key, resolveMyMediaUrl(item.fileUrl));
          onClose();
        }}
        onRequestDelete={setPendingDelete}
      />

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

      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind={kind}
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          open
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          title={t("members:avatar.picker.deleteConfirmTitle")}
          description={
            pendingDelete.references.length > 0
              ? t("members:avatar.picker.deleteConfirmBodyInUse", {
                  usedAs: pendingDelete.references
                    .map((reference) => t(mediaReferenceLabelKey(reference.type)))
                    .join(", "),
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
