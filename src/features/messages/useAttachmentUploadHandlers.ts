// src/features/messages/useAttachmentUploadHandlers.ts
import { useCallback, type RefObject } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  buildResolvedAttachments,
  patchStagedProgress,
  reassignReplyAfterRemoval,
  resolveUploadErrorMessage,
  withResolvedResult,
  type StagedAttachmentItem,
  type UploadableAttachmentKind,
} from "./AttachmentStagingTypes";
import type {
  ConversationListSetter,
  ItemsByConversation,
} from "./useAttachmentUploadResolution";

/**
 * Turns `useAttachmentUploadQueue`'s raw progress/success/error callbacks
 * into patches on `useAttachmentSendQueue`'s `staged`/`pending` item stores,
 * split out of `useAttachmentUploadResolution` purely to stay under the line
 * cap. `flushPendingHead` (built by that sibling) is handed in as a prop, so
 * a resolved item at the front of the pending queue and a resolved item
 * still in the caption screen both funnel through the exact same "is the
 * next one ready too" check.
 */
export function useAttachmentUploadHandlers({
  itemConversationRef,
  stagedRef,
  pendingRef,
  setStaged,
  setPending,
  flushPendingHead,
}: {
  itemConversationRef: RefObject<Map<string, string>>;
  stagedRef: RefObject<ItemsByConversation>;
  pendingRef: RefObject<ItemsByConversation>;
  setStaged: ConversationListSetter;
  setPending: ConversationListSetter;
  flushPendingHead: (
    conversationId: string,
    resolvedList: StagedAttachmentItem[],
  ) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleUploadSuccess = useCallback(
    (
      id: string,
      // `useAttachmentUploadQueue`'s callback contract carries `kind`, but
      // the item itself (staged or pending) already knows its own kind, so
      // `flushPendingHead`/the staged branch below read `item.kind` directly
      // and leave this parameter unused.
      _kind: UploadableAttachmentKind,
      key: string,
      previewUrl: string,
    ) => {
      const conversationId = itemConversationRef.current?.get(id);
      itemConversationRef.current?.delete(id);
      if (!conversationId) return;

      const pendingList = pendingRef.current?.[conversationId];
      const pendingIndex =
        pendingList?.findIndex((entry) => entry.id === id) ?? -1;
      if (pendingList && pendingIndex !== -1) {
        const { sendAttachment, localAttachment } = buildResolvedAttachments(
          pendingList[pendingIndex]!,
          key,
          previewUrl,
        );
        const nextList = [...pendingList];
        nextList[pendingIndex] = withResolvedResult(
          nextList[pendingIndex]!,
          sendAttachment,
          localAttachment,
        );
        flushPendingHead(conversationId, nextList);
        return;
      }

      const stagedList = stagedRef.current?.[conversationId];
      const stagedIndex =
        stagedList?.findIndex((entry) => entry.id === id) ?? -1;
      if (!stagedList || stagedIndex === -1) return;
      const { sendAttachment, localAttachment } = buildResolvedAttachments(
        stagedList[stagedIndex]!,
        key,
        previewUrl,
      );
      const nextStaged = [...stagedList];
      nextStaged[stagedIndex] = withResolvedResult(
        nextStaged[stagedIndex]!,
        sendAttachment,
        localAttachment,
      );
      setStaged(conversationId, nextStaged);
    },
    [itemConversationRef, pendingRef, stagedRef, flushPendingHead, setStaged],
  );

  const handleUploadError = useCallback(
    (id: string, kind: UploadableAttachmentKind, err: unknown) => {
      const conversationId = itemConversationRef.current?.get(id);
      itemConversationRef.current?.delete(id);
      showToast(resolveUploadErrorMessage(kind, err, t), "error");
      if (!conversationId) return;
      const pendingList = pendingRef.current?.[conversationId];
      const failedItem = pendingList?.find((entry) => entry.id === id);
      if (pendingList && failedItem) {
        // Drop the failed item, carry its reply (if any) to a batch-mate,
        // THEN flush: if it was blocking the head of the queue, whatever's
        // now at the front may already be `"uploaded"` and waiting its turn
        // (see `flushPendingHead`), so a failure never leaves a ready item
        // stranded behind it.
        const withoutFailed = pendingList.filter((entry) => entry.id !== id);
        flushPendingHead(
          conversationId,
          reassignReplyAfterRemoval(failedItem, withoutFailed),
        );
      }
      const stagedList = stagedRef.current?.[conversationId];
      if (stagedList?.some((entry) => entry.id === id)) {
        setStaged(
          conversationId,
          stagedList.filter((entry) => entry.id !== id),
        );
      }
    },
    [
      itemConversationRef,
      pendingRef,
      stagedRef,
      showToast,
      t,
      flushPendingHead,
      setStaged,
    ],
  );

  const handleUploadProgress = useCallback(
    (id: string, percent: number) => {
      const conversationId = itemConversationRef.current?.get(id);
      if (!conversationId) return;
      const stagedList = stagedRef.current?.[conversationId];
      if (stagedList) {
        const next = patchStagedProgress(stagedList, id, percent);
        if (next !== stagedList) setStaged(conversationId, next);
      }
      const pendingList = pendingRef.current?.[conversationId];
      if (pendingList) {
        const next = patchStagedProgress(pendingList, id, percent);
        if (next !== pendingList) setPending(conversationId, next);
      }
    },
    [itemConversationRef, stagedRef, pendingRef, setStaged, setPending],
  );

  return { handleUploadSuccess, handleUploadError, handleUploadProgress };
}
