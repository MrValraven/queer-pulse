import { useEffect } from "react";
import { useAuth } from "../../app/providers/authContext";
import { setDocumentTitleBadge } from "../../shared/seo/documentTitleBadge";
import { useUnreadMessages } from "../messages/api/useConversations";
import { useUnreadCount } from "../notifications/api/useUnreadCount";

/**
 * Tab-title counterpart of `useAppBadge`: prefixes the browser tab title with
 * the unread count, WhatsApp style ("(3) QueerPulse"). It counts unread chats
 * plus unread notifications, the two nav badges together, whereas the app icon
 * counts chats only. Works in live and demo alike.
 *
 * Nothing is written while the session is still being checked, so a cold boot
 * does not flash a count that is about to change. A signed-out device clears it.
 */
export function useDocumentTitleBadge(): void {
  const { loggedIn, checking } = useAuth();
  const unreadMessages = useUnreadMessages();
  const unreadNotifications = useUnreadCount();
  const titleCount = loggedIn ? unreadMessages + unreadNotifications : 0;

  useEffect(() => {
    if (checking) return;
    setDocumentTitleBadge(titleCount);
  }, [titleCount, checking]);
}
