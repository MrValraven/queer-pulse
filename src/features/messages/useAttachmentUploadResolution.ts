// src/features/messages/useAttachmentUploadResolution.ts
import { useCallback, type RefObject } from "react";
import { useAttachmentUploadQueue } from "./useAttachmentUploadQueue";
import { useAttachmentUploadHandlers } from "./useAttachmentUploadHandlers";
import {
  revokeIfBlobUrl,
  withLatestDimensions,
  type SendableAttachmentKind,
  type StagedAttachmentItem,
} from "./AttachmentStagingTypes";
import type { ChatMessage } from "./data";
import type { ExplicitSendOptions } from "./useMessageSendActions";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";

export type ItemsByConversation = Record<string, StagedAttachmentItem[]>;
/** Writes the full next list for ONE conversation, synchronously, both to
 *  the caller's ref mirror (so the very next synchronous read sees it) and
 *  to React state (so it renders). Plain values in, never an updater
 *  function: see this file's own doc for why that matters. */
export type ConversationListSetter = (
  conversationId: string,
  list: StagedAttachmentItem[],
) => void;

/** Everything `sendResolvedItem` needs to dispatch ONE resolved item: which
 *  kind of attachment it is, the built send/local attachment pair, its
 *  trimmed caption, the conversation it belongs to, and, for the first item
 *  of a batch only, the reply it was sent with (see
 *  `useAttachmentQueueLifecycle.sendStaged`). */
export interface SendResolvedItemParams {
  kind: SendableAttachmentKind;
  sendAttachment: GifAttachment | DocumentAttachment;
  localAttachment: GifAttachment | DocumentAttachment;
  caption: string | undefined;
  conversationId: string;
  replyToId?: string;
  replyTo?: ChatMessage["replyTo"];
}

/**
 * Wires `useAttachmentUploadQueue`'s progress/success/error callbacks (via
 * the sibling `useAttachmentUploadHandlers`) onto `useAttachmentSendQueue`'s
 * two per-conversation item stores: still-in-the-caption-screen `staged`,
 * and already-sent-but-still-uploading `pending` (DES-199's "send while
 * uploading" case). Owned by `useAttachmentSendQueue`, which lives in
 * `AttachmentQueueContext`'s `useAttachmentQueueStore` and is meant to
 * outlive any single conversation panel, not just a thread switch.
 *
 * Every handler in `useAttachmentUploadHandlers` reads its item from the REF
 * mirrors the caller keeps synchronously current
 * (`stagedRef`/`pendingRef`/`itemConversationRef`) and performs the actual
 * send as a single, plain function call before writing any state.
 * `ConversationListSetter` never takes React's `setState` updater-function
 * form: passing a function there would make React's Strict Mode invoke it
 * twice per commit (by design, to catch exactly this kind of mistake), which
 * would fire a real side effect like sending a message twice. Writing the
 * next list explicitly, once, up front keeps every side effect here to a
 * single, predictable call.
 */
export function useAttachmentUploadResolution({
  itemConversationRef,
  stagedRef,
  pendingRef,
  setStaged,
  setPending,
  onSendGif,
  onSendImage,
  onSendDocument,
}: {
  /** id -> the conversation it was staged in, set the moment an image or
   *  document starts uploading and cleared once its upload settles. The
   *  routing table that lets a resolution fired long after a thread switch
   *  still land on the right conversation's lists. */
  itemConversationRef: RefObject<Map<string, string>>;
  stagedRef: RefObject<ItemsByConversation>;
  pendingRef: RefObject<ItemsByConversation>;
  setStaged: ConversationListSetter;
  setPending: ConversationListSetter;
  onSendGif?: (
    attachment: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
    options?: ExplicitSendOptions,
  ) => void;
}) {
  /** The one place a resolved item actually gets sent: an item whose turn in
   *  the pending queue has come up (from `flushPendingHead` below), or an
   *  item that was already uploaded, or a GIF that never uploads at all, AT
   *  the moment "Send" was pressed (from
   *  `useAttachmentQueueLifecycle.sendStaged`). Always carries the
   *  conversation it was staged in explicitly, so a send that resolves after
   *  the member has switched threads still lands in its own thread, and
   *  carries `replyToId`/`replyTo` only for the first item of its batch (see
   *  `SendResolvedItemParams`). */
  const sendResolvedItem = useCallback(
    ({
      kind,
      sendAttachment,
      localAttachment,
      caption,
      conversationId,
      replyToId,
      replyTo,
    }: SendResolvedItemParams) => {
      const options: ExplicitSendOptions = {
        conversationId,
        replyToId,
        replyTo,
      };
      if (kind === "document") {
        onSendDocument?.(
          { ...(sendAttachment as DocumentAttachment), caption },
          { ...(localAttachment as DocumentAttachment), caption },
          options,
        );
      } else if (kind === "gif") {
        onSendGif?.({ ...(sendAttachment as GifAttachment), caption }, options);
      } else {
        onSendImage?.(
          { ...(sendAttachment as GifAttachment), caption },
          { ...(localAttachment as GifAttachment), caption },
          options,
        );
      }
    },
    [onSendGif, onSendImage, onSendDocument],
  );

  /** Sends every already-`"uploaded"` item at the FRONT of `conversationId`'s
   *  pending queue, so items always send in staged order: one that finishes
   *  uploading early (DES-198) still waits for every earlier item in the
   *  same batch to go first, stopping the flush at the first item still
   *  uploading. `resolvedList` is the list to flush from (the caller already
   *  has it in hand after patching one item), so this always works off the
   *  exact list a sibling call already produced instead of re-reading a ref
   *  that call might have moved on from. */
  const flushPendingHead = useCallback(
    (conversationId: string, resolvedList: StagedAttachmentItem[]) => {
      let flushIndex = 0;
      while (flushIndex < resolvedList.length) {
        const candidate = resolvedList[flushIndex]!;
        if (candidate.status !== "uploaded" || !candidate.sendAttachment) break;
        const { sendAttachment, localAttachment } =
          withLatestDimensions(candidate);
        sendResolvedItem({
          kind: candidate.kind,
          sendAttachment,
          localAttachment,
          caption: candidate.caption.trim() || undefined,
          conversationId,
          replyToId: candidate.replyToId,
          replyTo: candidate.replyTo,
        });
        // Sent: the raw staged preview blob served only the pending strip,
        // which stops showing this item the moment it's flushed (the sent
        // bubble renders the upload's OWN local blob instead, see
        // `buildResolvedAttachments`).
        revokeIfBlobUrl(candidate.previewUrl);
        flushIndex += 1;
      }
      setPending(conversationId, resolvedList.slice(flushIndex));
    },
    [sendResolvedItem, setPending],
  );

  const { handleUploadSuccess, handleUploadError, handleUploadProgress } =
    useAttachmentUploadHandlers({
      itemConversationRef,
      stagedRef,
      pendingRef,
      setStaged,
      setPending,
      flushPendingHead,
    });

  const queue = useAttachmentUploadQueue({
    onProgress: handleUploadProgress,
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
  });

  return { ...queue, sendResolvedItem, flushPendingHead };
}
