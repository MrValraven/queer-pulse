import { useMemo } from "react";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import type { ChatMessage } from "./data";

/** One entry in the conversation's photo sequence, already resolved to
 *  everything the viewer paints: the pixels, who sent it, and when. */
export interface ViewerPhoto {
  /** The source message, so the viewer's Reply/Forward/Star act on the real
   *  thing rather than on a copy. */
  message: ChatMessage;
  url: string;
  /** Intrinsic size when the attachment carries one, else 0. The stage sets
   *  these as `width`/`height` on the `<img>` (omitted when 0) so the
   *  browser can reserve the letterbox before decode. */
  width: number;
  height: number;
  /** The GIF's own text, so the viewer's alt matches the bubble's instead of
   *  falling back to the generic "Photo message". Undefined for an uploaded
   *  image, where the stage falls back to `messages:attachments.imageAlt`.
   *  Optional so the other `ViewerPhoto` literals in ChatImageViewer.test.tsx
   *  keep compiling without it. */
  alt?: string;
  senderName: string;
  /** The day bucket the message sits in ("Today", "Yesterday", a date). */
  dayLabel: string;
  timeLabel: string;
  /** React key: the client-generated `localId` when there is one (stable
   *  across the optimistic-to-acked transition, since the server echoes it
   *  back on the same message), else the server id, else a positional
   *  fallback (demo messages have neither). Preferring `localId` over `id`
   *  keeps one photo's identity fixed for its whole life instead of flipping
   *  the moment a send is acked, which used to reset the viewer's zoom/pan
   *  mid-gesture. */
  key: string;
}

interface CollectOptions {
  /** Display name for a received message in a DM, where the message itself
   *  carries no `senderName` (only group messages do). */
  counterpartName: string;
  /** Localised "You", for own messages. */
  youLabel: string;
}

/**
 * Whether a message is a photo the viewer can actually open. Excludes
 * documents (a file card has no pixels), soft-deleted messages, and the
 * restored-outbox case where the local blob preview was stripped on persist
 * and only `sendAttachment` survives, which is precisely why that branch
 * renders a placeholder rather than an `<img>`.
 */
export function isViewablePhoto(message: ChatMessage): boolean {
  if (message.kind !== "image" && message.kind !== "gif") return false;
  if (message.deletedAt) return false;
  const attachment = message.attachment;
  return !!attachment && !isDocumentAttachment(attachment);
}

/**
 * Flattens the day-bucketed groups into one ordered photo sequence, oldest
 * first, matching the order the photos appear in the log.
 */
export function collectThreadPhotos(
  groups: { day: string; items: ChatMessage[] }[],
  { counterpartName, youLabel }: CollectOptions,
): ViewerPhoto[] {
  const photos: ViewerPhoto[] = [];
  for (const group of groups) {
    for (const message of group.items) {
      if (!isViewablePhoto(message)) continue;
      const attachment = message.attachment;
      if (!attachment || isDocumentAttachment(attachment)) continue;
      photos.push({
        message,
        url: attachment.url,
        width: attachment.width,
        height: attachment.height,
        alt: message.kind === "gif" ? message.text : undefined,
        senderName:
          message.from === "me"
            ? youLabel
            : (message.senderName ?? counterpartName),
        dayLabel: group.day,
        timeLabel: message.time ?? "",
        key:
          message.localId ??
          message.id ??
          `${group.day}-${photos.length}-${attachment.url}`,
      });
    }
  }
  return photos;
}

/**
 * Index of `message` in `photos`, or -1. A live message matches on its server
 * id; a demo or optimistic one has none, so object identity is tried next
 * (the gallery holds the very objects the log rendered), with the attachment
 * URL as the last resort.
 */
export function findPhotoIndex(
  photos: ViewerPhoto[],
  message: ChatMessage,
): number {
  if (message.id) {
    const byId = photos.findIndex((photo) => photo.message.id === message.id);
    if (byId >= 0) return byId;
  }
  const byIdentity = photos.findIndex((photo) => photo.message === message);
  if (byIdentity >= 0) return byIdentity;
  const attachment = message.attachment;
  if (!attachment || isDocumentAttachment(attachment)) return -1;
  return photos.findIndex((photo) => photo.url === attachment.url);
}

/**
 * The open conversation's photo sequence, recomputed only when the loaded
 * groups change. Covers the LOADED history only: paging further back extends
 * the gallery on the next render, and the viewer never fetches by itself.
 */
export function useThreadImageGallery(
  groups: { day: string; items: ChatMessage[] }[],
  options: CollectOptions,
): ViewerPhoto[] {
  const { counterpartName, youLabel } = options;
  return useMemo(
    () => collectThreadPhotos(groups, { counterpartName, youLabel }),
    [groups, counterpartName, youLabel],
  );
}
