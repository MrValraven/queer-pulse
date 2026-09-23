// A message-composer sticker attachment: a published catalogue sticker sent
// bare (no caption, no upload). Mirrors the backend's `StickerAttachment`
// (`queerpulse-backend/src/messaging/entities/message.entity.ts`) field-for-
// field via `StickerAttachmentResponse` (`shared/contracts/contracts.ts`).
import type { StickerAttachmentResponse } from "../contracts/contracts";
import type { GifAttachment } from "./gifs";
import type { DocumentAttachment } from "./documentAttachment";

/** Discriminates the sticker shape from the other two the `attachment` field
 *  can hold. Tested BEFORE `isDocumentAttachment` everywhere, so the most
 *  specific shape wins.
 *
 *  Requires BOTH `provider === "sticker"` AND a `stickerId` field.
 *  `provider` alone is client-forgeable input the backend's `SendMessageDto`
 *  bounds only as a free-form string, so an ordinary photo/GIF/document
 *  could be forged with `provider: "sticker"`. `stickerId` is only ever
 *  present on a real `StickerAttachmentResponse` (the backend bakes it from
 *  a resolved `Sticker` row, mirroring `isStickerAttachment` on
 *  `queerpulse-backend/src/messaging/entities/message.entity.ts`, which
 *  requires the same pair for the same reason), so requiring it here keeps a
 *  forged attachment reading as whatever it actually is everywhere this
 *  guard gates rendering.
 *
 *  Typed against `ChatMessage["attachment"]`'s own constituents (never the
 *  wire `MessageResponse["attachment"]` directly): the wire shape's
 *  `caption` is nullable (`string | null`) while this file's `caption` is
 *  optional-only (`string | undefined`), so a caller sitting on the wire
 *  shape (the adapter boundary, `messages.adapters.ts`) narrows with its own
 *  structural `"stickerId" in attachment` check instead of calling this. */
export function isStickerAttachment(
  attachment: GifAttachment | DocumentAttachment | StickerAttachmentResponse,
): attachment is StickerAttachmentResponse {
  return (
    "provider" in attachment &&
    attachment.provider === "sticker" &&
    "stickerId" in attachment
  );
}
