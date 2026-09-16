// src/features/messages/attachmentConversationMigration.ts

type MigrationListener = (
  oldConversationId: string,
  newConversationId: string,
) => void;

const listeners = new Set<MigrationListener>();

/**
 * Tells every mounted attachment queue that a brand-new conversation's
 * placeholder id has been replaced by its real server id, so photos and files
 * staged while `POST /conversations` was still in flight move with it.
 *
 * A module-level channel keeps the wiring out of the controller chain:
 * `useThreadCreation` runs inside `useMessagesController`, during
 * `MessagesPage`'s own render, before the page-level `AttachmentQueueProvider`
 * it returns has mounted, and that provider in turn needs the controller's send
 * functions. Each queue subscribes in `useAttachmentQueueStore`.
 */
export function notifyAttachmentConversationMigrated(
  oldConversationId: string,
  newConversationId: string,
): void {
  for (const listener of listeners) {
    listener(oldConversationId, newConversationId);
  }
}

/** Registers `listener` and returns its unsubscribe function. */
export function subscribeAttachmentConversationMigration(
  listener: MigrationListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
