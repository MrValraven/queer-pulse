// src/features/messages/AttachmentStagingTypes.ts
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { DocumentProcessingError } from "./documentUploadProcessing";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import type { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChatMessage } from "./data";

/** `useAttachmentUploadQueue` only ever runs an upload for these two kinds.
 *  A GIF is already a resolved `GifAttachment` the moment it's staged (picked
 *  from `GifPicker`), so there's nothing to upload. */
export type UploadableAttachmentKind = "image" | "document";

/** The kinds `sendResolvedItem` can actually dispatch: the two uploadable
 *  kinds above, plus `"gif"` for an already-resolved item that never entered
 *  the upload queue at all. */
export type SendableAttachmentKind = UploadableAttachmentKind | "gif";

/** One item sitting in the caption screen or, once "Send" was pressed while
 *  it was still mid-upload, in the compact pending-uploads strip above the
 *  composer. `status` never reaches a persisted "failed" state: a failed
 *  upload is toasted and removed from whichever list holds it the instant it
 *  happens (see `useAttachmentSendQueue`), so nothing here has to render a
 *  failure state of its own. */
export interface StagedItemCommon {
  id: string;
  /** Member-written caption, typed while this item is the caption screen's
   *  selected item. Never sent as an empty string (trimmed at send time). */
  caption: string;
  /** A local, instantly-available preview (`URL.createObjectURL` of the
   *  RAW picked file), set the moment the item is staged, before its
   *  upload even starts, so the caption screen never waits on the network to
   *  show what was picked. */
  previewUrl: string;
  status: "uploading" | "uploaded";
  /** 0-100. Meaningless once `status` is `"uploaded"`. */
  progress: number;
  /** Identifies which single press of "Send" this item shipped with,
   *  assigned to every item of the batch at once in
   *  `useAttachmentQueueLifecycle.sendStaged`. Undefined for anything still
   *  in the caption screen (nothing has been sent yet, so there is no batch
   *  to belong to). Lets a reply that was carried by an item removed from
   *  the pending strip (a failed or cancelled upload) find its way to
   *  another item from the SAME send instead of vanishing with it, see
   *  `reassignReplyAfterRemoval`. */
  batchId?: string;
  /** The reply this item's send should carry, snapshotted once at the
   *  moment "Send" was pressed and set ONLY on the first item of that batch
   *  (see `useAttachmentQueueLifecycle.sendStaged`). Undefined for every
   *  other item, and for anything still in the caption screen. Carried
   *  along even while this item sits in the pending strip, so a reply
   *  survives an upload that was still running when Send was pressed, and
   *  moves to a batch-mate (see `batchId` above) if THAT item is the one
   *  that ends up failing or getting cancelled instead. */
  replyToId?: string;
  replyTo?: ChatMessage["replyTo"];
}

export interface StagedImageItem extends StagedItemCommon {
  kind: "image";
  /** Read from the raw picked file right after staging (async, non-blocking,
   *  see `readImageDimensions`); 0 until that resolves. Only used for the
   *  SENT attachment's aspect-ratio metadata, never to gate the preview. */
  width: number;
  height: number;
  /** Set once the background upload resolves. */
  sendAttachment?: GifAttachment;
  localAttachment?: GifAttachment;
}

export interface StagedDocumentItem extends StagedItemCommon {
  kind: "document";
  fileName: string;
  byteSize: number;
  contentType: string;
  sendAttachment?: DocumentAttachment;
  localAttachment?: DocumentAttachment;
}

export interface StagedGifItem extends StagedItemCommon {
  kind: "gif";
  width: number;
  height: number;
  /** A GIF never uploads: both are set the instant it's staged. */
  sendAttachment: GifAttachment;
  localAttachment: GifAttachment;
}

export type StagedAttachmentItem =
  StagedImageItem | StagedDocumentItem | StagedGifItem;

let stagedIdSequence = 0;

/** A client-only id (never sent anywhere) that identifies one staged item
 *  across the caption screen, the pending-uploads strip, and the upload
 *  queue's own bookkeeping. */
export function createStagedAttachmentId(): string {
  stagedIdSequence += 1;
  return `staged-attachment-${Date.now()}-${stagedIdSequence}`;
}

let attachmentBatchIdSequence = 0;

/** A client-only id (never sent anywhere) minted once per press of "Send",
 *  see `StagedItemCommon.batchId`. */
export function createAttachmentBatchId(): string {
  attachmentBatchIdSequence += 1;
  return `attachment-batch-${Date.now()}-${attachmentBatchIdSequence}`;
}

/** Reads a decoded image's intrinsic pixel size from its (already local,
 *  zero-network-cost) preview URL, mirroring the GIF picker's provider-
 *  supplied dimensions, see `MessageBubbleBody`'s aspect-ratio handling. */
export function readImageDimensions(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("dimension-read-failed"));
    image.src = url;
  });
}

/** `1.2 MB` / `340 KB` / `48 B`, no i18n needed (units read the same in
 *  EN/PT), mirrors `MessageDocumentAttachment`'s own formatter so a staged
 *  file card and its sent bubble agree on the number. */
export function formatStagedDocumentSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`;
  if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(1)} KB`;
  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
}

/** Builds the final `{ sendAttachment, localAttachment }` pair for a
 *  resolved upload from the item's OWN, LATEST fields (width/height for an
 *  image, file metadata for a document) plus the upload's `{ key,
 *  previewUrl }`. A plain function (never a hook), so callers can call it
 *  fresh at the exact moment they read the item (send time, or
 *  upload-resolve time), always working off the item's current fields
 *  instead of a state snapshot that might already be stale.
 *
 * The backend's `width`/`height` are optional (`@IsOptional() @Min(1)` on
 * `GifAttachmentDto`), so a width/height that's still 0 (the async
 * `readImageDimensions` read hasn't resolved yet, or failed) is left off the
 * built attachment entirely, since a literal 0 would fail the server's
 * `@Min(1)` guard outright. */
export function buildResolvedAttachments(
  item: StagedAttachmentItem,
  key: string,
  previewUrl: string,
): {
  sendAttachment: GifAttachment | DocumentAttachment;
  localAttachment: GifAttachment | DocumentAttachment;
} {
  if (item.kind === "document") {
    const base = {
      fileName: item.fileName,
      byteSize: item.byteSize,
      contentType: item.contentType,
      provider: "upload",
    };
    return {
      sendAttachment: { ...base, url: key },
      localAttachment: { ...base, url: previewUrl },
    };
  }
  const { width, height } = item;
  const dimensions = width > 0 && height > 0 ? { width, height } : {};
  return {
    sendAttachment: {
      url: key,
      previewUrl: key,
      ...dimensions,
      provider: "upload",
    } as GifAttachment,
    localAttachment: {
      url: previewUrl,
      previewUrl,
      ...dimensions,
      provider: "upload",
    } as GifAttachment,
  };
}

/** Patches a resolved item back into place as `"uploaded"` with its send/
 *  local attachment pair attached, the counterpart to
 *  `buildResolvedAttachments` above. */
export function withResolvedResult(
  item: StagedAttachmentItem,
  sendAttachment: GifAttachment | DocumentAttachment,
  localAttachment: GifAttachment | DocumentAttachment,
): StagedAttachmentItem {
  if (item.kind === "document") {
    return {
      ...item,
      status: "uploaded",
      progress: 100,
      sendAttachment: sendAttachment as DocumentAttachment,
      localAttachment: localAttachment as DocumentAttachment,
    };
  }
  return {
    ...item,
    status: "uploaded",
    progress: 100,
    sendAttachment: sendAttachment as GifAttachment,
    localAttachment: localAttachment as GifAttachment,
  };
}

/** Patches one item's progress in a list, returning the SAME array
 *  reference when the id isn't in this particular list. An item is only
 *  ever in ONE conversation's staged/pending list at a time, and returning
 *  `prev` unchanged lets React bail out of re-rendering a list that doesn't
 *  hold it instead of re-rendering every list on every progress tick. */
export function patchStagedProgress(
  prev: StagedAttachmentItem[],
  id: string,
  percent: number,
): StagedAttachmentItem[] {
  const index = prev.findIndex((item) => item.id === id);
  if (index === -1) return prev;
  const next = [...prev];
  next[index] = { ...next[index]!, progress: percent };
  return next;
}

/** Rebuilds an already-resolved item's `{ sendAttachment, localAttachment }`
 *  pair from its LATEST width/height at the exact moment it's actually
 *  dispatched (send time, or its turn coming up in the pending queue), not
 *  from whatever was known when the upload first resolved. The async
 *  `readImageDimensions` read can settle after an upload finishes; when it
 *  does, `useAttachmentSendQueue` patches the item's own `width`/`height`
 *  wherever it currently lives, but the item's pre-built `sendAttachment`
 *  (baked at upload-resolve time, possibly still missing them) stays frozen
 *  until this runs. A no-op for anything that already carries a size, or
 *  that has none to carry (a document has no pixels; a GIF's dimensions are
 *  known upfront and never patched). */
export function withLatestDimensions(item: StagedAttachmentItem): {
  sendAttachment: GifAttachment | DocumentAttachment;
  localAttachment: GifAttachment | DocumentAttachment;
} {
  const fallbackSend = item.sendAttachment as
    GifAttachment | DocumentAttachment;
  const fallbackLocal = item.localAttachment ?? fallbackSend;
  if (item.kind === "document" || item.kind === "gif") {
    return { sendAttachment: fallbackSend, localAttachment: fallbackLocal };
  }
  const hasDimensions = item.width > 0 && item.height > 0;
  if (!hasDimensions)
    return { sendAttachment: fallbackSend, localAttachment: fallbackLocal };
  const dimensions = { width: item.width, height: item.height };
  return {
    sendAttachment: { ...fallbackSend, ...dimensions },
    localAttachment: { ...fallbackLocal, ...dimensions },
  };
}

/** Revokes a staged item's local preview when it's a `blob:` URL created by
 *  `URL.createObjectURL` (every image/document preview), and no-ops for a
 *  GIF's provider URL, which was never created here and this queue never
 *  owns. Safe to call more than once for the same URL. */
export function revokeIfBlobUrl(url: string): void {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

/** Resolves an upload failure to the SAME toast copy the pre-staging
 *  `ImageComposerButton`/`DocumentComposerButton` always showed (DES-199
 *  keeps today's error messages): a typed processing error's own catalog
 *  key, or the kind's generic retry fallback for anything else (a network
 *  failure, an aborted-but-not-abandoned edge case). */
export function resolveUploadErrorMessage(
  kind: UploadableAttachmentKind,
  err: unknown,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (kind === "image" && err instanceof ImageProcessingError) {
    return t(err.i18nKey, err.values);
  }
  if (kind === "document" && err instanceof DocumentProcessingError) {
    return t(err.i18nKey, err.values);
  }
  return kind === "image"
    ? t("members:upload.error.retry")
    : t("messages:attachments.documentError.retry");
}

/** Carries a reply forward when the item that held it falls out of the
 *  pending strip before it can send (an upload error, in
 *  `useAttachmentUploadHandlers`, or a cancel, in
 *  `useAttachmentQueueLifecycle.cancelPending`): the next remaining item
 *  from the SAME "Send" batch (same `batchId`, in staged order) inherits
 *  `replyToId`/`replyTo` instead of losing them. `remainingList` is the
 *  list with the failed/cancelled item already filtered out. Returns
 *  `remainingList` unchanged when the removed item carried no reply, and
 *  also when no batch-mate is left to carry it, which simply drops the
 *  reply: the batch had nothing left to send. */
export function reassignReplyAfterRemoval(
  removedItem: StagedAttachmentItem,
  remainingList: StagedAttachmentItem[],
): StagedAttachmentItem[] {
  if (!removedItem.replyToId && !removedItem.replyTo) return remainingList;
  const nextIndex = remainingList.findIndex(
    (entry) => entry.batchId === removedItem.batchId,
  );
  if (nextIndex === -1) return remainingList;
  const next = [...remainingList];
  next[nextIndex] = {
    ...next[nextIndex]!,
    replyToId: removedItem.replyToId,
    replyTo: removedItem.replyTo,
  };
  return next;
}
