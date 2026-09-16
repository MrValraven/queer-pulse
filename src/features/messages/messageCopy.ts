// src/features/messages/messageCopy.ts
import type { ChatMessage } from "./data";

/** Message kinds that render as an attachment (photo/GIF/document) instead
 *  of a plain text bubble. */
const MEDIA_KINDS = new Set(["gif", "image", "document"]);

/** True for a `kind:"gif"`/`"image"`/`"document"` message. Shared by
 *  `MessageActionOverlay` (branches its lifted clone between the media
 *  layout and the plain text bubble) and `useMessageActionMenu` (gates the
 *  Copy caption logic), so the two definitions can't drift apart. */
export function isMediaMessage(message: ChatMessage): boolean {
  return !!message.kind && MEDIA_KINDS.has(message.kind);
}

/** The caption riding alongside a `kind:"gif"`/`"image"`/`"document"`
 *  message's attachment (see `GifAttachment.caption`/`DocumentAttachment.
 *  caption`). Reads `attachment` first (the live/resolved value), falling
 *  back to `sendAttachment` (the resend payload) for a restored outbox entry
 *  whose blob preview was stripped before persisting. Mirrors the exact
 *  fallback `MessageBubbleBody` uses so Copy and the overlay clone never
 *  disagree with what's actually rendered. Absent (never an empty string)
 *  when the sender left no caption. */
export function attachmentCaption(message: ChatMessage): string | undefined {
  return message.attachment?.caption ?? message.sendAttachment?.caption;
}

/** DES-203: whether "Copy" should be offered for `message` at all. Ordinary
 *  text always has something to copy; a media message only has something
 *  worth copying when the sender wrote a caption. Its `text` is just the
 *  send-time fallback word ("Photo"/"GIF"/"Document"), and copying that would
 *  copy a placeholder the sender never wrote (WhatsApp hides Copy entirely
 *  for captionless media for the same reason). */
export function canCopyMessage(message: ChatMessage): boolean {
  if (isMediaMessage(message)) {
    return !!attachmentCaption(message);
  }
  return true;
}
