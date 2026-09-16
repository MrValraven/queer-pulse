// src/features/messages/useAttachmentStaging.tsx
import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AttachmentCaptionScreen } from "./AttachmentCaptionScreen";
import { AttachmentPendingStrip } from "./AttachmentPendingStrip";
import {
  useAttachmentQueue,
  assertAttachmentQueueMounted,
} from "./attachmentQueueStore";
import { buildReplySnapshot } from "./useMessageSendActions";
import { hapticTap } from "../../shared/lib/haptics";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";

/** Reused whenever no `AttachmentQueueProvider` is mounted above this hook,
 *  so a render with no queue never allocates a fresh object every pass. */
const EMPTY_ITEMS_BY_CONVERSATION: Record<string, StagedAttachmentItem[]> = {};

export interface AttachmentStaging {
  /** Wired to `ComposerInputRow`'s `onSendGif`, stages instead of sending
   *  immediately. `undefined` exactly when the caller didn't wire a real GIF
   *  send path, keeping the attach menu's GIF row hidden as before staging. */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Hands picked image files (`ImageComposerButton`'s `multiple` input) to
   *  staging: each previews and starts uploading immediately (DES-198/199). */
  onImagePicked?: (files: File[]) => void;
  /** Same as `onImagePicked`, for documents. */
  onDocumentPicked?: (files: File[]) => void;
  /** The caption screen, or `false` while nothing is staged for the ACTIVE
   *  conversation (see the file doc: falsy, never mounted-but-empty). */
  screen: ReactNode;
  /** The compact strip above the input for items whose upload was still
   *  running when "Send" was pressed, filtered to the ACTIVE conversation;
   *  empty most of the time but always safe to render unconditionally. */
  pendingStrip: ReactNode;
}

/**
 * The per-thread VIEW onto the ambient `AttachmentQueueContext` store: defers
 * picked photos, documents and GIFs behind a full-screen caption step
 * (WhatsApp Web-style) instead of sending the instant a pick or upload
 * resolves (DES-198/DES-199). Called exactly ONCE per `ComposerDockContent`,
 * which persists across a thread switch, with `conversationId` following the
 * active thread. `Composer` remounts on every thread switch (keyed by
 * `active.id`), so calling this at `ComposerDockContent`'s level lets a
 * still-uploading item whose "Send" was already pressed survive that remount.
 *
 * The queue's own lifetime (the "abandon everything, toast not sent" teardown
 * for whatever's still uploading) belongs to `attachmentQueueStore.ts`.
 *
 * `AttachmentCaptionScreen` calls `useDismiss`, which locks scroll and joins
 * the shared modal stack while MOUNTED, so `screen` must stay falsy (never
 * mounted-but-empty) whenever nothing is staged for the active conversation.
 * A member can therefore never switch threads while the caption screen is
 * open, keeping `staged` (unlike `pendingSends`) safe to treat as thread-local.
 */
export function useAttachmentStaging({
  conversationId,
  active,
  replyDraft,
  onCancelReply,
  onSendGif,
  onSendImage,
  onSendDocument,
  textareaRef,
}: {
  conversationId: string;
  /** Resolves the reply-quote snapshot for `sendStaged` (see
   *  `buildReplySnapshot`), which needs the counterpart's name. */
  active: Conversation;
  /** The message currently being quoted for a reply, or null/absent. */
  replyDraft?: ChatMessage | null;
  /** Clears the reply draft the moment "Send" is pressed on the caption
   *  screen, mirroring the composer's own reply-preview banner close button. */
  onCancelReply?: () => void;
  onSendGif?: (attachment: GifAttachment) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
  /** The composer's message field; takes focus back once the screen closes,
   *  like `EmojiComposerButton`'s picker. Lifted here so it stays the SAME
   *  ref across a thread switch, see `ConversationComposerDock`. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}): AttachmentStaging {
  const { t } = useTranslation();
  // `AttachmentQueueProvider` is mounted exactly once, at the Messages page
  // level, so this should always read a real queue here (see the assertion).
  const queue = useAttachmentQueue();
  assertAttachmentQueueMounted(queue);
  const stagedByConversation =
    queue?.stagedByConversation ?? EMPTY_ITEMS_BY_CONVERSATION;
  const pendingByConversation =
    queue?.pendingByConversation ?? EMPTY_ITEMS_BY_CONVERSATION;
  const queueStageImageFiles = queue?.stageImageFiles;
  const queueStageDocumentFiles = queue?.stageDocumentFiles;
  const queueStageGif = queue?.stageGif;
  const queueSetCaption = queue?.setCaption;
  const queueRemoveItem = queue?.removeItem;
  const queueCloseAll = queue?.closeAll;
  const queueSendStaged = queue?.sendStaged;
  const queueCancelPending = queue?.cancelPending;
  const staged = stagedByConversation[conversationId] ?? [];
  const pendingSends = pendingByConversation[conversationId] ?? [];
  const wasOpenRef = useRef(false);

  // Runs AFTER the unmounted screen's `useDismiss` cleanup restores focus to
  // whichever attach row opened it (child cleanups run before parent passive
  // effects), so this call is the one that sticks. Skipped on a coarse
  // pointer, where forcing focus onto the composer pops the on-screen keyboard.
  useEffect(() => {
    const isOpen = staged.length > 0;
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (wasOpenRef.current && !isOpen && !isCoarsePointer) {
      textareaRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [staged.length, textareaRef]);

  const stageImageFiles = useCallback(
    (files: File[]) => queueStageImageFiles?.(conversationId, files),
    [queueStageImageFiles, conversationId],
  );
  const stageDocumentFiles = useCallback(
    (files: File[]) => queueStageDocumentFiles?.(conversationId, files),
    [queueStageDocumentFiles, conversationId],
  );
  const stageGif = useCallback(
    (attachment: GifAttachment) => queueStageGif?.(conversationId, attachment),
    [queueStageGif, conversationId],
  );
  const setCaption = useCallback(
    (id: string, caption: string) =>
      queueSetCaption?.(conversationId, id, caption),
    [queueSetCaption, conversationId],
  );
  const removeItem = useCallback(
    (id: string) => queueRemoveItem?.(conversationId, id),
    [queueRemoveItem, conversationId],
  );
  const closeAll = useCallback(
    () => queueCloseAll?.(conversationId),
    [queueCloseAll, conversationId],
  );
  // Snapshots the reply draft the MOMENT "Send" is pressed and clears it
  // right away, so the banner never sits open once the caption screen hands
  // its batch to the queue (see `sendStaged` in `useAttachmentQueueLifecycle`).
  // A haptic tick confirms the send (DES-210), only when something is staged.
  const sendStaged = useCallback(() => {
    if (staged.length > 0) hapticTap();
    const snapshot = buildReplySnapshot(replyDraft, active, t);
    if (replyDraft) onCancelReply?.();
    queueSendStaged?.(conversationId, snapshot);
  }, [
    staged.length,
    queueSendStaged,
    conversationId,
    replyDraft,
    active,
    t,
    onCancelReply,
  ]);
  const cancelPending = useCallback(
    (id: string) => queueCancelPending?.(conversationId, id),
    [queueCancelPending, conversationId],
  );

  return {
    onSendGif: onSendGif ? stageGif : undefined,
    onImagePicked: onSendImage ? stageImageFiles : undefined,
    onDocumentPicked: onSendDocument ? stageDocumentFiles : undefined,
    screen: staged.length > 0 && (
      <AttachmentCaptionScreen
        items={staged}
        onCaptionChange={setCaption}
        onRemove={removeItem}
        onSend={sendStaged}
        onClose={closeAll}
      />
    ),
    pendingStrip: (
      <AttachmentPendingStrip items={pendingSends} onCancel={cancelPending} />
    ),
  };
}
