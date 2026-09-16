// src/features/messages/useAttachmentSendQueue.ts
import { useCallback, useMemo, useRef, useState } from "react";
import {
  useAttachmentUploadResolution,
  type ItemsByConversation,
} from "./useAttachmentUploadResolution";
import { useAttachmentQueueActions } from "./useAttachmentQueueActions";
import { useAttachmentQueueLifecycle } from "./useAttachmentQueueLifecycle";
import { useAttachmentQueueTeardown } from "./useAttachmentQueueTeardown";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import type { ExplicitSendOptions } from "./useMessageSendActions";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";

/**
 * Owns EVERY conversation's staged-and-pending attachments at once, keyed by
 * conversation id, plus the single background upload queue behind them
 * (DES-198/DES-199). Instantiated exactly ONCE, by `useAttachmentQueueStore`
 * (see `AttachmentQueueContext.tsx`), which is meant to outlive any single
 * conversation panel, so an item that's already committed to send ("Send"
 * was pressed while it was still uploading) keeps uploading and lands in its
 * own thread even after the member has moved on to another one, or backed
 * out to the thread list on mobile. See `useAttachmentStaging`, the
 * per-thread VIEW built on top of this store.
 *
 * State lives in BOTH a `useState` (so React re-renders) and a same-shaped
 * ref that every mutation here writes to FIRST, synchronously, before
 * calling `setState` with that exact next value. That's what lets
 * `useAttachmentUploadResolution`'s async callbacks (an upload resolving,
 * possibly long after the originating `Composer` unmounted) read the CURRENT
 * list and decide what to do without waiting on a render, and what lets
 * `sendStaged` below read its own just-written state back out in the same
 * synchronous call when it needs to (the queue never uses React's `setState`
 * updater-function form at all, see `useAttachmentUploadResolution`'s own
 * doc for why that form is exactly what Strict Mode would double-invoke).
 */
export function useAttachmentSendQueue({
  onSendGif,
  onSendImage,
  onSendDocument,
}: {
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
  const [stagedByConversation, setStagedState] = useState<ItemsByConversation>(
    {},
  );
  const [pendingByConversation, setPendingState] =
    useState<ItemsByConversation>({});
  const stagedRef = useRef<ItemsByConversation>({});
  const pendingRef = useRef<ItemsByConversation>({});
  // id -> the conversation it was staged in. See `useAttachmentUploadResolution`.
  const itemConversationRef = useRef<Map<string, string>>(new Map());

  const setStaged = useCallback(
    (conversationId: string, list: StagedAttachmentItem[]) => {
      const next = { ...stagedRef.current, [conversationId]: list };
      stagedRef.current = next;
      setStagedState(next);
    },
    [],
  );

  const setPending = useCallback(
    (conversationId: string, list: StagedAttachmentItem[]) => {
      const next = { ...pendingRef.current, [conversationId]: list };
      pendingRef.current = next;
      setPendingState(next);
    },
    [],
  );

  const { startImageUpload, startDocumentUpload, abandon, flushPendingHead } =
    useAttachmentUploadResolution({
      itemConversationRef,
      stagedRef,
      pendingRef,
      setStaged,
      setPending,
      onSendGif,
      onSendImage,
      onSendDocument,
    });

  // Every mutating operation (stage/caption/remove/close/send/cancel/
  // abandon-everything/migrate-conversation) lives across these three
  // sibling hooks purely to keep this one under the line cap, see their own
  // docs.
  const stagingActions = useAttachmentQueueActions({
    stagedRef,
    pendingRef,
    setStaged,
    setPending,
    itemConversationRef,
    startImageUpload,
    startDocumentUpload,
  });
  const lifecycleActions = useAttachmentQueueLifecycle({
    stagedRef,
    pendingRef,
    setStaged,
    itemConversationRef,
    abandon,
    flushPendingHead,
  });
  const teardownActions = useAttachmentQueueTeardown({
    stagedRef,
    pendingRef,
    setStaged,
    setPending,
    itemConversationRef,
    abandon,
  });

  const { stageImageFiles, stageDocumentFiles, stageGif, setCaption } =
    stagingActions;
  const { removeItem, closeAll, cancelPending, sendStaged } = lifecycleActions;
  const { abandonEverything, migrateConversation } = teardownActions;

  // Every field below is either one of the three sibling hooks' own stable
  // `useCallback`s (unchanging across renders as long as their own
  // dependencies hold steady) or one of the two state maps above, so this
  // object keeps ITS OWN identity across a render that changed neither: a
  // progress tick legitimately changes `stagedByConversation`/
  // `pendingByConversation` (that's the point of a progress tick), so the
  // memo correctly produces a new object then, but an unrelated re-render of
  // whatever consumes `AttachmentQueueContext` (a toast firing, an i18n
  // namespace loading) no longer forces every consumer of the queue to
  // re-render too.
  return useMemo(
    () => ({
      stagedByConversation,
      pendingByConversation,
      stageImageFiles,
      stageDocumentFiles,
      stageGif,
      setCaption,
      removeItem,
      closeAll,
      cancelPending,
      sendStaged,
      abandonEverything,
      migrateConversation,
    }),
    [
      stagedByConversation,
      pendingByConversation,
      stageImageFiles,
      stageDocumentFiles,
      stageGif,
      setCaption,
      removeItem,
      closeAll,
      cancelPending,
      sendStaged,
      abandonEverything,
      migrateConversation,
    ],
  );
}

export type AttachmentSendQueue = ReturnType<typeof useAttachmentSendQueue>;
