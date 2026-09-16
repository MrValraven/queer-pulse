import { useEffect } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useUnreadMessages } from "../messages/api/useConversations";

/**
 * Set the installed app's icon badge to `count`, or clear it at zero. Feature
 * detected and fully guarded: the Badging API only exists in some installed
 * contexts, and a rejection (no permission, not installed) is not worth
 * surfacing.
 */
export function applyAppBadge(count: number): void {
  if (typeof navigator === "undefined") return;
  try {
    if (count > 0) {
      if (typeof navigator.setAppBadge === "function") {
        void navigator.setAppBadge(count).catch(() => {});
      }
    } else if (typeof navigator.clearAppBadge === "function") {
      void navigator.clearAppBadge().catch(() => {});
    }
  } catch {
    // Best-effort: see above.
  }
}

/**
 * PRD-335, page half. Mirrors the nav's unread-conversations count onto the
 * app icon while the app is open, in live and demo alike (the demo count is a
 * local filter, so this costs no network). The service worker sets the same
 * badge from its shown notifications while the app is closed; this corrects it
 * the moment the app knows the real count.
 *
 * Nothing is written while the session is still being checked, so a cold boot
 * does not wipe the worker's badge before the count has had a chance to load.
 * A signed-out device clears it. Re-applied when the tab becomes visible,
 * because the worker may have changed the badge while it was hidden without
 * the count itself changing.
 */
export function useAppBadge(): void {
  const { loggedIn, checking } = useAuth();
  const unreadCount = useUnreadMessages();
  const badgeCount = loggedIn ? unreadCount : 0;

  useEffect(() => {
    if (checking) return;
    applyAppBadge(badgeCount);
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") applyAppBadge(badgeCount);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [badgeCount, checking]);
}
