import { FiFile } from "react-icons/fi";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import type { ChatMessage } from "./data";
import styles from "./ForwardPickerModal.module.css";

/** Text excerpts longer than this are clamped with an ellipsis. Long enough
 *  to identify the message, short enough that the picker's preview stays
 *  smaller than the recipient list below it. */
const EXCERPT_LIMIT = 140;

/**
 * The WhatsApp-style "what you're forwarding" card at the top of
 * `ForwardPickerModal`: a text excerpt for a plain message, or a photo/GIF
 * thumbnail, or the document's file name for the two attachment cases,
 * since there's a real thumbnail or file name to show in place of the raw
 * `kind`-fallback body text data.ts documents (a localized "Photo"/"GIF"
 * placeholder). Purely presentational; owns no state.
 */
export function ForwardMessagePreview({ message }: { message: ChatMessage }) {
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
  const excerpt =
    message.text.length > EXCERPT_LIMIT
      ? `${message.text.slice(0, EXCERPT_LIMIT).trimEnd()}…`
      : message.text;
  return (
    <div className={styles.preview}>
      <span className={styles.previewText}>{excerpt}</span>
    </div>
  );
}
