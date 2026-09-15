// src/features/messages/AttachmentCaptionScreen.tsx
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiSend, FiX } from "react-icons/fi";
import { useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useComposerAutoGrow } from "./useComposerAutoGrow";
import type { StagedAttachment } from "./useAttachmentStaging";
import styles from "./AttachmentCaptionScreen.module.css";

/** Fallback intrinsic size for a staged attachment whose own width/height are
 *  missing or zero (a provider or upload dimension read that failed). Mirrors
 *  `GifPicker`'s own `FALLBACK_TILE_DIMENSION`, so the media box is never a
 *  literal 0x0 that would hide the image entirely before it decodes. */
const FALLBACK_MEDIA_DIMENSION = 320;

interface AttachmentCaptionScreenProps {
  staged: StagedAttachment;
  /** Sends the staged item with the trimmed caption, or `undefined` when the
   *  field was left blank (never an empty string). */
  onSend: (caption: string | undefined) => void;
  /** Discards the staged item without sending. */
  onClose: () => void;
}

/**
 * WhatsApp Web-style full-screen caption step for a picked GIF or uploaded
 * photo: the media large in the middle, a caption field underneath, a close
 * button top-left, a round send button bottom-right. Sending produces ONE
 * message, the media bubble with the caption rendered underneath it by
 * `AttachmentCaption` in `MessageBubbleBody`, and an empty caption sends the
 * media alone, exactly like today. Closing discards the staged item; the
 * upload (for a photo) already happened by this point, so an orphaned object
 * is acceptable, the same as any other abandoned/failed send.
 *
 * Only ever mounted while a caption screen is actually open (see
 * `useAttachmentStaging`'s own doc for why). `useDismiss` gives it the same
 * scroll-lock, focus trap, focus restore, and modal-stack-aware Escape every
 * other full-screen dialog in the thread already has.
 */
export function AttachmentCaptionScreen({
  staged,
  onSend,
  onClose,
}: AttachmentCaptionScreenProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  useComposerAutoGrow(textareaRef, caption);

  // `useDismiss` lands initial focus on the first focusable element in the
  // dialog (the close button); the caption field is the more useful place to
  // start typing right away, so this steals focus back to it right after mount.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const previewUrl =
    staged.kind === "image"
      ? (staged.localAttachment?.previewUrl ?? staged.attachment.previewUrl)
      : staged.attachment.previewUrl;
  const mediaWidth = staged.attachment.width || FALLBACK_MEDIA_DIMENSION;
  const mediaHeight = staged.attachment.height || FALLBACK_MEDIA_DIMENSION;

  function handleSend() {
    onSend(caption.trim() || undefined);
  }

  // Mirrors `Composer`'s own `handleComposerKeyDown`: Enter sends on a fine
  // pointer, Shift+Enter (or Enter on touch) inserts a newline instead.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
      event.preventDefault();
      handleSend();
    }
  }

  return createPortal(
    <div className={styles.scrim} role="presentation">
      <div className={styles.scrimWash} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t("messages:attachments.captionScreenLabel")}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("messages:attachments.captionDiscard")}
          onClick={onClose}
        >
          <FiX aria-hidden size={22} />
        </button>
        <div className={styles.stage}>
          <img
            className={styles.media}
            src={previewUrl}
            width={mediaWidth}
            height={mediaHeight}
            alt=""
          />
        </div>
        <textarea
          ref={textareaRef}
          className={styles.captionField}
          rows={1}
          maxLength={1000}
          value={caption}
          placeholder={t("messages:attachments.captionPlaceholder")}
          aria-label={t("messages:attachments.captionPlaceholder")}
          onChange={(event) => setCaption(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.bottomBar}>
          <img
            className={styles.thumbnail}
            src={previewUrl}
            width={56}
            height={56}
            alt=""
          />
          <button
            type="button"
            className={styles.sendButton}
            aria-label={t("messages:attachments.captionSend")}
            onClick={handleSend}
          >
            <FiSend aria-hidden size={22} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
