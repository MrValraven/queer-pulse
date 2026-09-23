// src/features/messages/replyQuoteSource.ts
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import type { ChatMessage } from "./data";

/** What a reply quote needs to describe its parent, whichever side it comes
 *  from: the bubble reads it off `ChatMessage.replyTo` (the server's quote
 *  DTO), the composer's reply preview derives it from the whole message being
 *  replied to. One shape so both places render through `ReplyQuoteContent`. */
export interface ReplyQuoteSource {
  kind: NonNullable<ChatMessage["kind"]>;
  /** The parent's text body (a `user`/`system` quote's snippet). */
  text: string;
  /** A gif/image/sticker preview to show as the trailing thumbnail, else
   *  null. */
  thumbnailUrl: string | null;
  /** A document's original file name, else null. */
  fileName: string | null;
  isDeleted: boolean;
}

/** The bubble side. Demo and optimistic quotes carry no `kind`, so they read
 *  as a plain text quote, exactly as before. */
export function replyQuoteSourceFromReplyTo(
  replyTo: NonNullable<ChatMessage["replyTo"]>,
): ReplyQuoteSource {
  return {
    kind: replyTo.kind ?? "user",
    text: replyTo.snippet,
    thumbnailUrl: replyTo.thumbnailUrl ?? null,
    fileName: replyTo.fileName ?? null,
    isDeleted: replyTo.deleted,
  };
}

/** The composer side: the full message is at hand, so its own `attachment`
 *  (or, for an outbox entry whose blob preview was stripped, its resend
 *  payload) supplies the thumbnail and file name directly. */
export function replyQuoteSourceFromMessage(
  message: ChatMessage,
): ReplyQuoteSource {
  const attachment = message.attachment ?? message.sendAttachment;
  const documentAttachment = isDocumentAttachment(attachment)
    ? attachment
    : null;
  // Only the rendered `attachment` holds a paintable URL; `sendAttachment`
  // is a private storage key, so it never becomes a thumbnail.
  const mediaAttachment =
    message.attachment && !isDocumentAttachment(message.attachment)
      ? message.attachment
      : null;
  return {
    kind: message.kind ?? "user",
    text: message.text,
    thumbnailUrl: mediaAttachment
      ? mediaAttachment.previewUrl || mediaAttachment.url || null
      : null,
    fileName: documentAttachment?.fileName || null,
    isDeleted: !!message.deletedAt,
  };
}
