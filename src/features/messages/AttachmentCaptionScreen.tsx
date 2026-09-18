// src/features/messages/AttachmentCaptionScreen.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiSend, FiX } from "react-icons/fi";
import { useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useComposerAutoGrow } from "./useComposerAutoGrow";
import { AttachmentCaptionThumbnails } from "./AttachmentCaptionThumbnails";
import { AttachmentDocumentPreview } from "./AttachmentDocumentPreview";
import { AttachmentUploadProgress } from "./AttachmentUploadProgress";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import styles from "./AttachmentCaptionScreen.module.css";

/** Fallback intrinsic size for a staged image/GIF whose own width/height are
 *  still 0 (the async dimension read hasn't resolved, or failed), mirrors
 *  `GifPicker`'s own `FALLBACK_TILE_DIMENSION`, so the media box is never a
 *  literal 0x0 that would hide the image entirely before it decodes. */
const FALLBACK_MEDIA_DIMENSION = 320;

interface AttachmentCaptionScreenProps {
  /** One or more staged photos/documents/GIFs, in pick order. */
  items: StagedAttachmentItem[];
  onCaptionChange: (id: string, caption: string) => void;
  /** Removes ONE item (the thumbnail strip's per-item badge). Removing the
   *  last item leaves `items` empty, which unmounts this screen entirely:
   *  see `useAttachmentStaging`. */
  onRemove: (id: string) => void;
  /** Sends every item (its own message each, in order); an item still
   *  uploading moves to the pending strip and sends itself once its upload
   *  resolves (DES-199). */
  onSend: () => void;
  /** Discards the WHOLE batch without sending. The screen's own close
   *  button, Escape, and backdrop tap all funnel here via `useDismiss`. */
  onClose: () => void;
}

/**
 * WhatsApp Web-style full-screen caption step for one or several staged
 * photos, documents and GIFs (DES-198/DES-199): a big stage in the middle
 * showing whichever item is selected, a caption field per item, a thumbnail
 * strip to switch between items once there are 2+, a close button top-left,
 * and a round send button bottom-right. Each item sends as its OWN message,
 * in staged order, carrying its own caption, see `AttachmentBubbleBody`/the
 * DTO's `caption` field, already wired end to end.
 *
 * Only ever mounted while at least one item is staged (see
 * `useAttachmentStaging`'s own doc for why). `useDismiss` gives it the same
 * scroll-lock, focus trap, focus restore, and modal-stack-aware Escape every
 * other full-screen dialog in the thread already has.
 */
export function AttachmentCaptionScreen({
  items,
  onCaptionChange,
  onRemove,
  onSend,
  onClose,
}: AttachmentCaptionScreenProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  // Falls back to the first item whenever `selectedId` no longer names one
  // still in `items` (its own item was just removed). Nothing else needs to
  // reset `selectedId` itself for that, since this fallback runs every render.
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];

  useComposerAutoGrow(textareaRef, selectedItem?.caption ?? "");

  // `useDismiss` lands initial focus on the first focusable element in the
  // dialog (the close button); the caption field is the more useful place to
  // start typing right away, so this steals focus back to it right after mount.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Focus follow-up for the thumbnail strip's remove badge (item 9): capture
  // WHICH index is being removed before it happens, then once `items` has
  // actually shrunk, land focus on the thumbnail that slid into that same
  // slot, or the caption field once removing it dropped the strip below 2
  // items (it stops rendering at all), never leaving focus stranded on a
  // now-detached button.
  const thumbnailButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const pendingFocusIndexRef = useRef<number | null>(null);
  useEffect(() => {
    const index = pendingFocusIndexRef.current;
    if (index === null) return;
    pendingFocusIndexRef.current = null;
    if (items.length <= 1) {
      textareaRef.current?.focus();
      return;
    }
    const neighbourId = items[Math.min(index, items.length - 1)]?.id;
    const neighbourButton = neighbourId
      ? thumbnailButtonsRef.current.get(neighbourId)
      : undefined;
    neighbourButton?.focus();
  }, [items]);
  const handleRemove = useCallback(
    (id: string) => {
      pendingFocusIndexRef.current = items.findIndex((item) => item.id === id);
      onRemove(id);
    },
    [items, onRemove],
  );
  const registerThumbnailRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) thumbnailButtonsRef.current.set(id, el);
      else thumbnailButtonsRef.current.delete(id);
    },
    [],
  );

  if (!selectedItem) return null;

  // Mirrors `Composer`'s own `handleComposerKeyDown`: Enter sends on a fine
  // pointer, Shift+Enter (or Enter on touch) inserts a newline instead.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
      event.preventDefault();
      onSend();
    }
  }

  // Documents render as a file card with no intrinsic size, so only a photo or
  // GIF reads its own dimensions.
  const mediaWidth =
    selectedItem.kind === "document"
      ? FALLBACK_MEDIA_DIMENSION
      : selectedItem.width || FALLBACK_MEDIA_DIMENSION;
  const mediaHeight =
    selectedItem.kind === "document"
      ? FALLBACK_MEDIA_DIMENSION
      : selectedItem.height || FALLBACK_MEDIA_DIMENSION;

  return createPortal(
    <div className={styles.scrim} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t("messages:attachments.captionScreenLabel")}
        tabIndex={-1}
      >
        <div className={styles.stage}>
          {selectedItem.kind === "document" ? (
            <AttachmentDocumentPreview item={selectedItem} />
          ) : (
            <img
              className={styles.media}
              src={selectedItem.previewUrl}
              width={mediaWidth}
              height={mediaHeight}
              alt=""
            />
          )}
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("messages:attachments.captionDiscard")}
          onClick={onClose}
        >
          <FiX aria-hidden size={22} />
        </button>
        <div className={styles.bottomOverlay}>
          {selectedItem.status === "uploading" && (
            <div className={styles.uploadProgress}>
              <AttachmentUploadProgress
                percent={selectedItem.progress}
                label={
                  selectedItem.kind === "document"
                    ? selectedItem.fileName
                    : t("messages:attachments.pendingPhotoLabel")
                }
              />
            </div>
          )}
          {items.length > 1 && (
            <AttachmentCaptionThumbnails
              items={items}
              selectedId={selectedItem.id}
              onSelect={setSelectedId}
              onRemove={handleRemove}
              onTileRef={registerThumbnailRef}
            />
          )}
          <div className={styles.captionRow}>
            {selectedItem.kind === "document" && (
              <div className={styles.bottomBarDocument}>
                <AttachmentDocumentPreview item={selectedItem} compact />
              </div>
            )}
            <textarea
              ref={textareaRef}
              className={styles.captionField}
              rows={1}
              maxLength={1000}
              value={selectedItem.caption}
              placeholder={t("messages:attachments.captionPlaceholder")}
              aria-label={t("messages:attachments.captionPlaceholder")}
              onChange={(event) =>
                onCaptionChange(selectedItem.id, event.target.value)
              }
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className={styles.sendButton}
              aria-label={t("messages:attachments.captionSend")}
              onClick={onSend}
            >
              <FiSend aria-hidden size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
