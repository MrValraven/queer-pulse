// src/features/messages/useAttachmentQueueLifecycle.ts
import { useCallback, type RefObject } from "react";
import type {
  ConversationListSetter,
  ItemsByConversation,
} from "./useAttachmentUploadResolution";
import {
  createAttachmentBatchId,
  reassignReplyAfterRemoval,
  revokeIfBlobUrl,
  type StagedAttachmentItem,
} from "./AttachmentStagingTypes";
import type { ChatMessage } from "./data";

/**
 * The other half of `useAttachmentQueueActions` (split purely to stay under
 * the line cap): removing/cancelling one item or the whole staged batch, and
 * flushing "Send". The queue-wide operations, teardown ("abandon
 * everything") and conversation-id re-keying, live in the sibling
 * `useAttachmentQueueTeardown`, split out for the same reason. Owns no state
 * of its own, same as both siblings.
 */
export function useAttachmentQueueLifecycle({
  stagedRef,
  pendingRef,
  setStaged,
  itemConversationRef,
  abandon,
  flushPendingHead,
}: {
  stagedRef: RefObject<ItemsByConversation>;
  pendingRef: RefObject<ItemsByConversation>;
  setStaged: ConversationListSetter;
  itemConversationRef: RefObject<Map<string, string>>;
  abandon: (id: string) => void;
  /** Sends every already-`"uploaded"` item at the front of a pending list, in
   *  order, stopping at the first still uploading, then writes whatever's
   *  left. Re-run here after `cancelPending` removes an item, so cancelling
   *  the item blocking the head never strands an already-ready one behind
   *  it (see `useAttachmentUploadResolution`'s own doc). */
  flushPendingHead: (
    conversationId: string,
    resolvedList: StagedAttachmentItem[],
  ) => void;
}) {
  const removeItem = useCallback(
    (conversationId: string, id: string) => {
      const list = stagedRef.current?.[conversationId];
      const item = list?.find((entry) => entry.id === id);
      abandon(id);
      itemConversationRef.current?.delete(id);
      if (item) revokeIfBlobUrl(item.previewUrl);
      if (!list) return;
      setStaged(
        conversationId,
        list.filter((entry) => entry.id !== id),
      );
    },
    [stagedRef, abandon, itemConversationRef, setStaged],
  );

  // Discards the WHOLE staged batch (the caption screen's own close button,
  // Escape, backdrop tap): removing ONE item is `removeItem` above. Reads
  // every item and abandons/revokes it BEFORE touching state, so this list
  // of side effects runs exactly once for one close, independent of when
  // `setStaged` itself commits (see `useAttachmentUploadResolution`'s own
  // doc).
  const closeAll = useCallback(
    (conversationId: string) => {
      const list = stagedRef.current?.[conversationId] ?? [];
      for (const item of list) {
        abandon(item.id);
        itemConversationRef.current?.delete(item.id);
        revokeIfBlobUrl(item.previewUrl);
      }
      if (list.length > 0) setStaged(conversationId, []);
    },
    [stagedRef, abandon, itemConversationRef, setStaged],
  );

  const cancelPending = useCallback(
    (conversationId: string, id: string) => {
      const list = pendingRef.current?.[conversationId];
      const item = list?.find((entry) => entry.id === id);
      abandon(id);
      itemConversationRef.current?.delete(id);
      if (item) revokeIfBlobUrl(item.previewUrl);
      if (!list) return;
      // Cancelling the item currently blocking the head must not strand an
      // already-`"uploaded"` item sitting right behind it: flush, don't just
      // filter (see `flushPendingHead`'s own doc above). Its reply, if any,
      // moves to a batch-mate first (see `reassignReplyAfterRemoval`) so
      // cancelling never silently drops it.
      const withoutCancelled = list.filter((entry) => entry.id !== id);
      flushPendingHead(
        conversationId,
        item
          ? reassignReplyAfterRemoval(item, withoutCancelled)
          : withoutCancelled,
      );
    },
    [pendingRef, abandon, itemConversationRef, flushPendingHead],
  );

  // `replySnapshot`, when given, is the reply draft as it stood the MOMENT
  // "Send" was pressed (built by `useAttachmentStaging` before the live
  // reply draft is cleared): it rides along with ONLY the first item of
  // this batch, matching the one-quote-per-batch convention the caption
  // screen's own UI already implies. Every item of the batch is stamped
  // with the same fresh `batchId`, so a reply-carrying item that later
  // fails or is cancelled can hand the reply to a batch-mate instead of
  // losing it (see `reassignReplyAfterRemoval`).
  //
  // The whole batch always goes through `flushPendingHead`, appended behind
  // whatever's already pending for this conversation: an earlier batch that
  // hasn't fully sent yet keeps its items leaving in the order they were
  // sent, so a later batch that happens to finish uploading first never
  // cuts in front of it. When nothing is pending yet, this is exactly the
  // same "send what's already uploaded, queue the rest" behavior as before.
  const sendStaged = useCallback(
    (
      conversationId: string,
      replySnapshot?: { replyToId?: string; replyTo?: ChatMessage["replyTo"] },
    ) => {
      const items = stagedRef.current?.[conversationId] ?? [];
      if (items.length === 0) return;
      const batchId = createAttachmentBatchId();
      const carriesReply = Boolean(
        replySnapshot?.replyToId || replySnapshot?.replyTo,
      );
      const batchedItems = items.map((item, index) => ({
        ...item,
        batchId,
        replyToId:
          index === 0 && carriesReply
            ? replySnapshot?.replyToId
            : item.replyToId,
        replyTo:
          index === 0 && carriesReply ? replySnapshot?.replyTo : item.replyTo,
      }));
      setStaged(conversationId, []);
      flushPendingHead(conversationId, [
        ...(pendingRef.current?.[conversationId] ?? []),
        ...batchedItems,
      ]);
    },
    [stagedRef, pendingRef, setStaged, flushPendingHead],
  );

  return { removeItem, closeAll, cancelPending, sendStaged };
}
