// src/features/messages/AttachmentPendingStrip.tsx
import { useEffect, useRef } from "react";
import { FiFile, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AttachmentUploadProgress } from "./AttachmentUploadProgress";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import styles from "./AttachmentPendingStrip.module.css";

/** The composer's own message field (`ComposerInputRow`'s `MentionTextarea`),
 *  reached by DOM id since this strip has no ref to it of its own, the
 *  fallback focus target once cancelling leaves no next row to land on. */
const COMPOSER_TEXTAREA_ID = "messages-composer";

/**
 * The compact strip above the composer input (DES-199's "send while
 * uploading" requirement): pressing "Send" on the caption screen while an
 * item is still mid-upload closes that screen right away and drops the item
 * here instead. `useAttachmentStaging` sends it the moment its upload
 * resolves and removes it from this strip, or toasts + removes it on
 * failure. Renders nothing (not even an empty wrapper) when there's nothing
 * pending, so it's always safe to mount unconditionally above `Composer`'s
 * input row.
 */
export function AttachmentPendingStrip({
  items,
  onCancel,
}: {
  items: StagedAttachmentItem[];
  onCancel: (id: string) => void;
}) {
  const { t } = useTranslation();
  // Focus follow-up for cancelling a row (item 9): capture which index is
  // being cancelled before it happens, then once `items` has actually
  // shrunk, land focus on the next row's own cancel button, or the composer
  // textarea once there's no row left to land on.
  const cancelButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const pendingFocusIndexRef = useRef<number | null>(null);
  useEffect(() => {
    const index = pendingFocusIndexRef.current;
    if (index === null) return;
    pendingFocusIndexRef.current = null;
    const nextId = items[Math.min(index, items.length - 1)]?.id;
    const nextButton = nextId
      ? cancelButtonsRef.current.get(nextId)
      : undefined;
    if (nextButton) nextButton.focus();
    else document.getElementById(COMPOSER_TEXTAREA_ID)?.focus();
  }, [items]);

  if (items.length === 0) return null;

  function handleCancel(id: string) {
    pendingFocusIndexRef.current = items.findIndex((item) => item.id === id);
    onCancel(id);
  }

  return (
    <div
      className={styles.strip}
      role="group"
      aria-label={t("messages:attachments.pendingStripLabel", {
        count: items.length,
      })}
    >
      {items.map((item) => (
        <div key={item.id} className={styles.row}>
          {item.kind === "document" ? (
            <span className={styles.thumbIcon} aria-hidden>
              <FiFile />
            </span>
          ) : (
            <img className={styles.thumb} src={item.previewUrl} alt="" />
          )}
          <div className={styles.info}>
            <span className={styles.name}>
              {item.kind === "document"
                ? item.fileName
                : t("messages:attachments.pendingPhotoLabel")}
            </span>
            <AttachmentUploadProgress
              percent={item.progress}
              label={
                item.kind === "document"
                  ? item.fileName
                  : t("messages:attachments.pendingPhotoLabel")
              }
              compact
            />
          </div>
          <button
            ref={(el) => {
              if (el) cancelButtonsRef.current.set(item.id, el);
              else cancelButtonsRef.current.delete(item.id);
            }}
            type="button"
            className={styles.cancelButton}
            aria-label={
              item.kind === "document"
                ? t("messages:attachments.cancelDocumentUpload", {
                    fileName: item.fileName,
                  })
                : t("messages:attachments.cancelPhotoUpload")
            }
            onClick={() => handleCancel(item.id)}
          >
            <FiX aria-hidden size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
