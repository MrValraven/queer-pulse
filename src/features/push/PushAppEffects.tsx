import { useAppBadge } from "./useAppBadge";
import { useCloseReadNotifications } from "./useCloseReadNotifications";
import { useIncomingMessageBanner } from "./useIncomingMessageBanner";
import { usePushSubscriptionSync } from "./usePushSubscriptionSync";
import { useServiceWorkerBridge } from "./useServiceWorkerBridge";

/**
 * App-wide push side effects, mounted once from AppChrome. Renders nothing.
 *
 * Lives inside DataProviders (through AppChrome) on purpose: `useAppBadge`
 * reads `useUnreadMessages`, which needs DeletedConversationsProvider. It is
 * also inside BrowserRouter, which the bridge and the banner need to navigate.
 */
export function PushAppEffects() {
  usePushSubscriptionSync();
  useAppBadge();
  useCloseReadNotifications();
  useServiceWorkerBridge();
  useIncomingMessageBanner();
  return null;
}
