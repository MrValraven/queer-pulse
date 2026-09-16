// src/features/messages/AttachmentQueueContext.tsx
import type { ReactNode } from "react";
import {
  AttachmentQueueContext,
  useAttachmentQueueStore,
  type AttachmentQueueSendFunctions,
} from "./attachmentQueueStore";

/**
 * Provides `useAttachmentQueueStore`'s value to every `useAttachmentStaging`
 * view below it, so `ConversationComposerDock` never needs the queue's props
 * threaded through `ConversationPanel`. Mounted ONCE, at the Messages page
 * level (see `MessagesPage.tsx`), so its lifetime matches the page's own:
 * it survives a mobile back-to-list, the active thread going null, and the
 * desktop/mobile breakpoint flipping, exactly as `useAttachmentQueueStore`'s
 * own doc (in `attachmentQueueStore.ts`) describes.
 *
 * The context object, the store hook, and `useAttachmentQueue` itself live in
 * `attachmentQueueStore.ts` (no JSX there), so this file exports only this
 * one component and Fast Refresh can update it without remounting the
 * provider and abandoning whatever is still uploading underneath it.
 */
export function AttachmentQueueProvider({
  children,
  onSendGif,
  onSendImage,
  onSendDocument,
}: AttachmentQueueSendFunctions & { children: ReactNode }) {
  const queue = useAttachmentQueueStore({
    onSendGif,
    onSendImage,
    onSendDocument,
  });
  return (
    <AttachmentQueueContext.Provider value={queue}>
      {children}
    </AttachmentQueueContext.Provider>
  );
}
