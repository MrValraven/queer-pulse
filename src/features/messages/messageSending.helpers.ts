import type { ChatMessage } from "./data";

/** The four kinds a `deliver` call can carry: a picked provider GIF or a
 *  member-uploaded image (both carry a `GifAttachment` and render
 *  identically, inline, in the bubble), a member-uploaded document (carries a
 *  `DocumentAttachment` and renders as a file-card, PRD-226), or a catalogue
 *  sticker (carries no attachment at all, only a `stickerId`; see
 *  `useMessageDeliverCore.ts`'s own doc for why the send kind is resolved
 *  explicitly rather than inferred). */
export type MediaKind = "gif" | "image" | "document" | "sticker";

/** `ChatMessage.kind` → the `MediaKind` its attachment was sent as, or
 *  undefined for a plain text/system message. Used by `retrySend`/the outbox
 *  replay loop to resend a media message as the SAME kind it was, rather than
 *  re-deriving it from "an attachment is present" (which can't distinguish
 *  gif from image from document from sticker). A sticker retry also needs its
 *  `stickerId`, which this alone can't carry; see `retrySend`'s own call site
 *  for how it pairs this with the id pulled off the message's attachment. */
export function mediaKindOf(message: ChatMessage): MediaKind | undefined {
  return message.kind === "gif" ||
    message.kind === "image" ||
    message.kind === "document" ||
    message.kind === "sticker"
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
