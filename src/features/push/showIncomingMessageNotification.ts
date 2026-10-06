import {
  INCOMING_MESSAGE_NOTIFICATION_BADGE,
  INCOMING_MESSAGE_NOTIFICATION_ICON,
} from "./incomingMessageBanner";

export interface IncomingMessageNotification {
  conversationId: string;
  conversationPath: string;
  title: string;
  body: string;
  /** True when the in-app chime already played, so the OS stays quiet. */
  isSilent?: boolean;
}

/**
 * Shown through the service worker registration so a tap runs the worker's
 * `notificationclick` (focus plus in-app navigation), and tagged with the
 * conversation id so a later real push, or the next message, replaces it and
 * `useCloseReadNotifications` closes it once the thread is read.
 */
export async function showIncomingMessageNotification(
  notification: IncomingMessageNotification,
): Promise<void> {
  try {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    await registration.showNotification(notification.title, {
      body: notification.body,
      tag: notification.conversationId,
      data: {
        conversationId: notification.conversationId,
        url: notification.conversationPath,
      },
      icon: INCOMING_MESSAGE_NOTIFICATION_ICON,
      badge: INCOMING_MESSAGE_NOTIFICATION_BADGE,
      silent: notification.isSilent,
    });
  } catch {
    // Best-effort: the inbox badge and unread row still carry the message.
  }
}
