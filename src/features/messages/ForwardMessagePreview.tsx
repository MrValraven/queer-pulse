import { FiFile } from "react-icons/fi";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChatMessage } from "./data";
import { studioSharePreviewText } from "./studioSharePreview";
import styles from "./ForwardPickerModal.module.css";

/** Text excerpts longer than this are clamped with an ellipsis. Long enough
 *  to identify the message, short enough that the picker's preview stays
 *  smaller than the recipient list below it. */
const EXCERPT_LIMIT = 140;

/**
 * The WhatsApp-style "what you're forwarding" card at the top of
 * `ForwardPickerModal`: a text excerpt for a plain message, or a photo/GIF/
 * sticker thumbnail, or the document's file name for the attachment cases,
 * since there's a real thumbnail or file name to show in place of the raw
 * `kind`-fallback body text data.ts documents (a localized "Photo"/"GIF"/
 * "Sticker" placeholder). Purely presentational; owns no state.
 */
export function ForwardMessagePreview({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  if (message.kind === "sticker" && message.attachment) {
    const stickerAttachment = isStickerAttachment(message.attachment)
      ? message.attachment
      : null;
    if (stickerAttachment) {
      return (
        <div className={styles.preview}>
          <img
            className={styles.previewThumb}
            src={stickerAttachment.previewUrl || stickerAttachment.url}
            alt=""
            aria-hidden="true"
          />
          {/* `message.text` carries the sticker's name in the reader's
           *  language, resolved by `stickerLabelIn`: a locally-sent
           *  optimistic sticker sets it directly (`useMessageSendActions.
           *  sendSticker`), and a received one gets it from `messages.
           *  adapters.ts`'s `messageDisplayText`, which replaces the always-
           *  blank server `body` with that label. A sticker carries no
           *  caption to show here. */}
          <span className={styles.previewText}>{message.text}</span>
        </div>
      );
    }
  }
  if (message.attachment && isDocumentAttachment(message.attachment)) {
    return (
      <div className={styles.preview}>
        <span className={styles.previewDocIcon} aria-hidden="true">
          <FiFile size={18} />
        </span>
        <span className={styles.previewText}>
          {message.attachment.fileName}
        </span>
      </div>
    );
  }
  if (
    (message.kind === "gif" || message.kind === "image") &&
    message.attachment &&
    !isDocumentAttachment(message.attachment)
  ) {
    return (
      <div className={styles.preview}>
        <img
          className={styles.previewThumb}
          src={message.attachment.previewUrl || message.attachment.url}
          alt=""
          aria-hidden="true"
        />
        {/* `message.text` already carries the localized "Photo"/"GIF"
         *  fallback (see data.ts's own doc on `ChatMessage.kind`), so this
         *  component doesn't repeat that label. */}
        <span className={styles.previewText}>{message.text}</span>
      </div>
    );
  }
  const readableText = studioSharePreviewText(message.text, t);
  const excerpt =
    readableText.length > EXCERPT_LIMIT
      ? `${readableText.slice(0, EXCERPT_LIMIT).trimEnd()}…`
      : readableText;
  return (
    <div className={styles.preview}>
      <span className={styles.previewText}>{excerpt}</span>
    </div>
  );
}
