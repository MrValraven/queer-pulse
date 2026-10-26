import { useAppBadge } from "./useAppBadge";
import { useCloseReadNotifications } from "./useCloseReadNotifications";
import { useDocumentTitleBadge } from "./useDocumentTitleBadge";
import { useIncomingMessageBanner } from "./useIncomingMessageBanner";
import { PushRecoveryBanner } from "./PushRecoveryBanner";
import { usePushSubscriptionSync } from "./usePushSubscriptionSync";
import { useServiceWorkerBridge } from "./useServiceWorkerBridge";

/**
 * App-wide push side effects, mounted once from AppChrome. Renders only the
 * dismissible "notifications stopped" banner, and only when push cannot
 * recover on its own.
 *
 * Lives inside DataProviders (through AppChrome) on purpose: `useAppBadge`
 * reads `useUnreadMessages`, which needs DeletedConversationsProvider. It is
 * also inside BrowserRouter, which the bridge and the banner need to navigate.
 */
export function PushAppEffects() {
  usePushSubscriptionSync();
  useAppBadge();
  useDocumentTitleBadge();
  useCloseReadNotifications();
  useServiceWorkerBridge();
  useIncomingMessageBanner();
  return <PushRecoveryBanner />;
}
