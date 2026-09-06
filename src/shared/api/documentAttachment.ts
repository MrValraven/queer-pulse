// A message-composer document attachment (PRD-226): a lease PDF, a flyer, a
// spreadsheet, or a plain-text file — never a video/audio/voice format, which
// is a deliberate scope boundary (see `DocumentComposerButton`). Mirrors the
// backend's `DocumentAttachment` (`queerpulse-backend/src/messaging/entities/
// message.entity.ts`) field-for-field.
import type { GifAttachment } from "./gifs";

export interface DocumentAttachment {
  /**
   * Live mode: a private `message-document` storage key on SEND, the resolved
   * `GET /files/<key>` URL once the server response comes back (see
   * `resolveAttachment` on the backend). Demo mode: a local `blob:` object URL
   * — never persisted, never a fetchable key.
   */
  url: string;
  /** The ORIGINAL, member-supplied file name (e.g. "lease.pdf") — display
   *  only. Never used to derive a storage key or a download's saved
   *  filename (see the backend's own doc for why). */
  fileName: string;
  byteSize: number;
  contentType: string;
  /** Mirrors `GifAttachment.provider` — always `"upload"` today. */
  provider: string;
}

/**
 * Discriminates a `ChatMessage.attachment`/`MessageResponse.attachment`
 * (`GifAttachment | DocumentAttachment`) purely structurally, the same way
 * the backend's own `isDocumentAttachment` does: a `DocumentAttachment` is
 * the only one of the two that carries `fileName`.
 *
 * Typed against the concrete `GifAttachment | DocumentAttachment` union
 * (never a bare `{ fileName?: unknown }`) — narrowing a WEAK type (one where
 * every property is optional) against `GifAttachment` trips TypeScript's
 * "no properties in common" check, since `GifAttachment` shares no key with
 * `{ fileName?: unknown }` at all.
 */
export function isDocumentAttachment(
  attachment: GifAttachment | DocumentAttachment | null | undefined,
): attachment is DocumentAttachment {
  return attachment != null && "fileName" in attachment;
}
