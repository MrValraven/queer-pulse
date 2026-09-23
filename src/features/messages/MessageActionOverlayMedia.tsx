// src/features/messages/MessageActionOverlayMedia.tsx
import { FiFile, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import { renderWithLinks } from "./linkify";
import {
  AttachmentPreviewUnavailable,
  MessageDocumentAttachment,
} from "./MessageDocumentAttachment";
import { attachmentCaption } from "./messageCopy";
import type { ChatMessage } from "./data";
import sharedStyles from "./MessagesPage.module.css";
import styles from "./MessageActionOverlay.module.css";

/**
 * DES-203: the lifted clone's media branch. A `kind:"gif"`/`"image"`/
 * `"document"` message used to lift as a plain text bubble reading its
 * send-time fallback word ("Photo"/"GIF"/"Document"); this instead mirrors
 * exactly what `MessageBubbleBody` renders for the real bubble (photo/GIF at
 * its true aspect ratio, or a document file-card), plus the caption when the
 * sender wrote one. Duplicates `MessageBubbleBody`'s own document/image
 * branches inline, since those are unexported internals of a file owned by
 * another task. Split out of `MessageActionOverlay` purely to keep that file
 * under the 200-line cap.
 */
export function MessageActionOverlayMedia({
  message,
  isSent,
}: {
  message: ChatMessage;
  isSent: boolean;
}) {
  const { t } = useTranslation();
  const caption = attachmentCaption(message);
  const captionNode = caption ? (
    <div
      className={[
        sharedStyles.attachmentCaption,
        isSent
          ? sharedStyles.attachmentCaptionSent
          : sharedStyles.attachmentCaptionReceived,
      ].join(" ")}
    >
      <MentionText text={caption} renderText={renderWithLinks} />
    </div>
  ) : null;
  const groupClassName = [
    sharedStyles.attachmentGroup,
    styles.overlayMediaClone,
  ].join(" ");

  // A sticker clone: just the sticker itself, no caption row (it never
  // carries one) and no tap target. This clone is a static visual for the
  // duration of the long-press overlay; Save and the photo viewer stay off
  // it, since neither applies to a sticker.
  if (message.kind === "sticker") {
    const stickerAttachment =
      message.attachment && isStickerAttachment(message.attachment)
        ? message.attachment
        : null;
    if (!stickerAttachment) return null;
    return (
      <div className={groupClassName}>
        <img
          className={sharedStyles.stickerImage}
          src={stickerAttachment.url}
          alt={t("messages:sticker.imageAlt", {
            label: stickerAttachment.label,
          })}
        />
      </div>
    );
  }

  if (message.kind === "document") {
    const documentAttachment =
      message.attachment && isDocumentAttachment(message.attachment)
        ? message.attachment
        : null;
    return (
      <div className={groupClassName}>
        {documentAttachment ? (
          <MessageDocumentAttachment
            attachment={documentAttachment}
            isSent={isSent}
          />
        ) : (
          <AttachmentPreviewUnavailable
            icon={<FiFile aria-hidden size={20} />}
            label={t("messages:attachments.documentPreviewUnavailable")}
          />
        )}
        {captionNode}
      </div>
    );
  }

  // `kind:"gif"` / `kind:"image"`: both render an inline photo, identical
  // markup either way (see MessageBubbleBody's own note on this).
  const attachment =
    message.attachment && !isDocumentAttachment(message.attachment)
      ? message.attachment
      : null;
  if (!attachment) {
    return (
      <div className={groupClassName}>
        <AttachmentPreviewUnavailable
          icon={<FiImage aria-hidden size={20} />}
          label={t("messages:attachments.previewUnavailable")}
        />
        {captionNode}
      </div>
    );
  }
  const { url, width, height } = attachment;
  // Reserve the clone's final box BEFORE the image decodes, exactly like the
  // real bubble. A missing/zero dimension falls back to a plain 1:1 box,
  // keeping an intrinsic size at all times (see MessageBubbleBody).
  const aspectRatio = width > 0 && height > 0 ? width / height : 1;
  const imageAlt =
    message.kind === "image"
      ? t("messages:attachments.imageAlt")
      : message.text;
  return (
    <div className={groupClassName}>
      <img
        className={sharedStyles.gifBubble}
        src={url}
        width={width || undefined}
        height={height || undefined}
        style={{ aspectRatio: String(aspectRatio) }}
        alt={imageAlt}
      />
      {captionNode}
    </div>
  );
}
