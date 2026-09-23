// src/features/messages/messageAlbums.ts
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import { isSameSender } from "./messageRuns";
import type { ChatMessage } from "./data";

/** Longest gap between two photos of one burst, by `at`, that still keeps
 *  them in the same album. */
export const ALBUM_WINDOW_MS = 60_000;

/** Tiles an album paints before the last visible one turns into "+N". */
export const ALBUM_VISIBLE_TILES = 4;

/** One piece of a sender run as `MessageRun` renders it: an ordinary bubble,
 *  or an album of two or more photos collapsed into one grid. `index` and
 *  `startIndex` are positions in the run's own `items`, so the run's
 *  per-bubble logic (receipt index, group corners) keeps reading them. */
export type RunSegment =
  | { kind: "message"; message: ChatMessage; index: number }
  | { kind: "album"; messages: ChatMessage[]; startIndex: number };

/**
 * True when `message` may sit inside an album. Only an uploaded photo with
 * pixels to paint qualifies (GIFs, documents and stickers never join; two
 * stickers in a row stay two separate stickers), and anything that carries
 * its own per-message chrome breaks out to its own bubble so that chrome
 * stays visible: a reaction with a count above 0, a pin, a star, a failed
 * send (its Retry is an action), a reply quote, the forwarded label, a
 * non-empty caption, or a soft delete.
 *
 * The `message.kind !== "image"` check above already excludes a sticker at
 * runtime (its own `kind` is `"sticker"`), but `attachment`'s STATIC type
 * still carries the sticker shape regardless of `kind`, and that shape has
 * no `caption` property at all. `isStickerAttachment` narrows it out here
 * the same way `isDocumentAttachment` narrows out a document, so the
 * `attachment.caption` read below stays on a plain `GifAttachment`.
 */
export function canJoinAlbum(message: ChatMessage): boolean {
  if (message.kind !== "image") return false;
  if (message.deletedAt) return false;
  const attachment = message.attachment;
  if (!attachment || isDocumentAttachment(attachment)) return false;
  if (isStickerAttachment(attachment)) return false;
  const caption = attachment.caption ?? message.sendAttachment?.caption;
  if (caption?.trim()) return false;
  if (message.reactions?.some((reaction) => reaction.count > 0)) return false;
  if (message.pinnedAt || message.starred) return false;
  if (message.status === "failed") return false;
  if (message.replyTo || message.forwarded) return false;
  return true;
}

/** True when `message` follows `previousMessage` closely enough to share its
 *  album. A message without `at` (an optimistic send in the same burst) counts
 *  as inside the window. */
function isWithinAlbumWindow(
  previousMessage: ChatMessage,
  message: ChatMessage,
): boolean {
  if (!previousMessage.at || !message.at) return true;
  const gapMs =
    new Date(message.at).getTime() - new Date(previousMessage.at).getTime();
  return Math.abs(gapMs) <= ALBUM_WINDOW_MS;
}

/**
 * Splits one sender run's items into segments: two or more CONSECUTIVE photos
 * that each pass `canJoinAlbum`, come from the same sender (`isSameSender`,
 * so it holds even when called on a list that is not already one run) and sit
 * within `ALBUM_WINDOW_MS` of the photo before them collapse into one album;
 * everything else, including a lone qualifying photo, stays an ordinary
 * message segment. Order is preserved and every item lands in exactly one
 * segment.
 */
export function groupIntoAlbums(items: ChatMessage[]): RunSegment[] {
  const segments: RunSegment[] = [];
  let pendingPhotos: ChatMessage[] = [];
  let pendingStartIndex = 0;
  const flushPending = () => {
    if (pendingPhotos.length >= 2) {
      segments.push({
        kind: "album",
        messages: pendingPhotos,
        startIndex: pendingStartIndex,
      });
    } else if (pendingPhotos.length === 1) {
      segments.push({
        kind: "message",
        message: pendingPhotos[0]!,
        index: pendingStartIndex,
      });
    }
    pendingPhotos = [];
  };
  items.forEach((message, index) => {
    if (!canJoinAlbum(message)) {
      flushPending();
      segments.push({ kind: "message", message, index });
      return;
    }
    const previousPhoto = pendingPhotos[pendingPhotos.length - 1];
    const isContinuation =
      previousPhoto !== undefined &&
      isSameSender(previousPhoto, message) &&
      isWithinAlbumWindow(previousPhoto, message);
    if (!isContinuation) {
      flushPending();
      pendingStartIndex = index;
    }
    pendingPhotos.push(message);
  });
  flushPending();
  return segments;
}
