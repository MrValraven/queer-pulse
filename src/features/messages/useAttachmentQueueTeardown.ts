// src/features/messages/useAttachmentQueueTeardown.ts
import { useCallback, type RefObject } from "react";
import type {
  ConversationListSetter,
  ItemsByConversation,
} from "./useAttachmentUploadResolution";
import {
  revokeIfBlobUrl,
  type StagedAttachmentItem,
} from "./AttachmentStagingTypes";

/**
 * The queue-wide operations that touch every conversation at once, split out
 * of `useAttachmentQueueLifecycle` purely to stay under the line cap: the
 * owner's own full teardown ("abandon everything", see
 * `AttachmentQueueContext`'s `useAttachmentQueueStore`) and re-keying a
 * conversation id (a fresh DM placeholder swapping for its real server id
 * once the server responds). Owns no state of its own, same as its sibling.
 */
export function useAttachmentQueueTeardown({
  stagedRef,
  pendingRef,
  setStaged,
  setPending,
  itemConversationRef,
  abandon,
}: {
  stagedRef: RefObject<ItemsByConversation>;
  pendingRef: RefObject<ItemsByConversation>;
  setStaged: ConversationListSetter;
  setPending: ConversationListSetter;
  itemConversationRef: RefObject<Map<string, string>>;
  abandon: (id: string) => void;
}) {
  /** Every item still in flight across EVERY conversation, for the queue
   *  owner's own teardown (`AttachmentQueueContext`'s
   *  `useAttachmentQueueStore`): abandons each, reports it as not sent
   *  instead of silently dropping it, and resets every conversation's
   *  staged/pending list plus the routing table so nothing stale lingers if
   *  the caller somehow stays mounted past this call. */
  const abandonEverything = useCallback(() => {
    const abandonedItems: StagedAttachmentItem[] = [];
    for (const list of Object.values(stagedRef.current ?? {})) {
      abandonedItems.push(...list);
    }
    for (const list of Object.values(pendingRef.current ?? {})) {
      abandonedItems.push(...list);
    }
    for (const item of abandonedItems) {
      abandon(item.id);
      revokeIfBlobUrl(item.previewUrl);
    }
    itemConversationRef.current?.clear();
    for (const conversationId of Object.keys(stagedRef.current ?? {})) {
      setStaged(conversationId, []);
    }
    for (const conversationId of Object.keys(pendingRef.current ?? {})) {
      setPending(conversationId, []);
    }
    return abandonedItems;
  }, [
    stagedRef,
    pendingRef,
    abandon,
    itemConversationRef,
    setStaged,
    setPending,
  ]);

  /** Re-keys ONE conversation's staged/pending items and their
   *  `itemConversationRef` entries from `oldConversationId` to
   *  `newConversationId` (PRD placeholder-to-real-id swap, mirrors
   *  `useMessageOutbox.migrateOutboxConversation`): a fresh DM's optimistic
   *  placeholder id becoming the server's real conversation id once
   *  `startConversation` resolves. A no-op when nothing is staged/pending
   *  under the old id. */
  const migrateConversation = useCallback(
    (oldConversationId: string, newConversationId: string) => {
      const movedStaged = stagedRef.current?.[oldConversationId] ?? [];
      const movedPending = pendingRef.current?.[oldConversationId] ?? [];
      if (movedStaged.length === 0 && movedPending.length === 0) return;
      for (const [id, conversationId] of itemConversationRef.current ?? []) {
        if (conversationId === oldConversationId) {
          itemConversationRef.current?.set(id, newConversationId);
        }
      }
      if (movedStaged.length > 0) {
        setStaged(oldConversationId, []);
        setStaged(newConversationId, [
          ...(stagedRef.current?.[newConversationId] ?? []),
          ...movedStaged,
        ]);
      }
      if (movedPending.length > 0) {
        setPending(oldConversationId, []);
        setPending(newConversationId, [
          ...(pendingRef.current?.[newConversationId] ?? []),
          ...movedPending,
        ]);
      }
    },
    [stagedRef, pendingRef, itemConversationRef, setStaged, setPending],
  );

  return { abandonEverything, migrateConversation };
}
