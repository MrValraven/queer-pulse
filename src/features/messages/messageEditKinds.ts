// src/features/messages/messageEditKinds.ts
import type { MessageResponse } from "../../shared/contracts/contracts";
import { attachmentCaption } from "./messageCopy";
import type { ChatMessage } from "./data";

type MessageKind = MessageResponse["kind"] | undefined;

/** ENG-405: the kinds whose Edit rewrites the attachment caption. Their
 *  `body` is the send-time "Photo"/"Document"/"GIF" fallback the bubble
 *  never shows (a GIF is sent like a photo: the fixed "GIF" body plus an
 *  optional member caption), so the edit field seeds from the caption and
 *  saving updates it. Mirrors `CAPTION_EDIT_MESSAGE_KINDS` in the backend's
 *  `messaging.constants.ts`. */
const CAPTION_EDIT_KINDS: ReadonlySet<string> = new Set([
  "image",
  "document",
  "gif",
]);

/** ENG-405: the kinds the edit endpoint refuses. A sticker is stored with an
 *  empty `body` and no caption, so it carries no member-written text.
 *  Mirrors `UNEDITABLE_MESSAGE_KINDS` in the backend's
 *  `messaging.constants.ts`. */
const UNEDITABLE_KINDS: ReadonlySet<string> = new Set(["sticker"]);

/** The longest caption the server stores, matching the send DTO's
 *  `GifAttachmentDto.caption` `@MaxLength(1000)` and the caption screen's
 *  own `maxLength`. The inline editor holds a caption edit to it. */
export const ATTACHMENT_CAPTION_MAX_LENGTH = 1000;

/** False for a sticker. The server's `canEdit` already withholds Edit from
 *  it; this is the client's second line, so a stale flag can never open an
 *  editor the endpoint would refuse. */
export function isEditableMessageKind(kind: MessageKind): boolean {
  return !kind || !UNEDITABLE_KINDS.has(kind);
}

/** True for a photo, document or GIF, whose Edit targets the caption. */
export function isCaptionEditKind(kind: MessageKind): boolean {
  return !!kind && CAPTION_EDIT_KINDS.has(kind);
}

/** The text an author edits on `message`: the caption of a photo, document
 *  or GIF (empty when it has none; the "Photo"/"Document"/"GIF" fallback in
 *  `text` stays out of the editor), else the body. */
export function editableTextOf(message: ChatMessage): string {
  return isCaptionEditKind(message.kind)
    ? (attachmentCaption(message) ?? "")
    : message.text;
}

/** `editableTextOf` for a server `MessageResponse` (a `message:updated`
 *  frame, or the edit endpoint's own response): the caption of a photo,
 *  document or GIF, else the body. */
export function editedTextOfResponse(message: MessageResponse): string {
  if (!isCaptionEditKind(message.kind)) return message.body;
  const attachment = message.attachment;
  if (!attachment || "stickerId" in attachment) return "";
  return attachment.caption ?? "";
}
