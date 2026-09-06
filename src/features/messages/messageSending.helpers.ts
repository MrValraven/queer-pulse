import type { ChatMessage } from "./data";

/** The three attachment send kinds: a picked provider GIF or a member-uploaded
 *  image (both carry a `GifAttachment` and render identically, inline, in the
 *  bubble) or a member-uploaded document (carries a `DocumentAttachment` and
 *  renders as a file-card, PRD-226); only this tag (and the DTO/DB kind it
 *  becomes) tells them apart. */
export type MediaKind = "gif" | "image" | "document";

/** `ChatMessage.kind` → the `MediaKind` its attachment was sent as, or
 *  undefined for a plain text/system message. Used by `retrySend`/the outbox
 *  replay loop to resend a media message as the SAME kind it was, rather than
 *  re-deriving it from "an attachment is present" (which can't distinguish
 *  gif from image from document). */
export function mediaKindOf(message: ChatMessage): MediaKind | undefined {
  return message.kind === "gif" ||
    message.kind === "image" ||
    message.kind === "document"
    ? message.kind
    : undefined;
}

/** Release a still-optimistic image send's local `blob:` preview (see
 *  `ImageComposerButton`) once nothing will ever render it again — the
 *  server's own copy takes over the bubble with a resolved URL, so the object
 *  URL this tab created is now pure leak. A no-op for GIFs/text (no local
 *  blob was ever minted) and for an already-revoked/foreign URL. */
export function revokeBlobPreview(message: ChatMessage | undefined): void {
  if (message?.attachment?.url.startsWith("blob:")) {
    URL.revokeObjectURL(message.attachment.url);
  }
}
