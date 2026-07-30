import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import { conversations as mockConversations, type Conversation } from "../data";
import { getConversations, getConversationsUnreadCount } from "./messages.api";
import { conversationToView } from "./messages.adapters";

/**
 * Inbox list. Demo mode returns the scripted `conversations` mock (pixel-
 * identical to today); live mode calls GET /conversations and adapts each row.
 * `queryKey` includes `demoMode` so cache entries never cross the boundary.
 */
export function useConversations() {
  const { demoMode } = useDemoMode();
  const { deletedIds } = useDeletedConversations();
  // Stable, order-independent token so the demo query re-derives when a chat is
  // deleted. Live mode never writes deletedIds, so this stays "".
  const deletedToken = [...deletedIds].sort().join(",");
  return useQuery<Conversation[]>({
    queryKey: ["conversations", demoMode, deletedToken],
    queryFn: async () => {
      if (demoMode) {
        return mockConversations.filter(
          (conversation) => !deletedIds.has(conversation.id),
        );
      }
      const rows = await getConversations();
      return rows.map(conversationToView);
    },
  });
}

/** Query key for the nav DM-badge count. Deliberately NOT under the
 *  `["conversations", …]` prefix: the realtime layer fuzzy-writes
 *  `["conversations"]` with a `Conversation[]` updater (messageCache.ts), and a
 *  number entry sharing that prefix would be corrupted by it. This isolated key
 *  is invalidated explicitly at every unread-changing point instead (see below).
 */
export const UNREAD_COUNT_KEY = "conversations-unread-count";

/**
 * Unread-messages badge for the nav (`Navbar` MessagesLink / `SidebarFooter`).
 *
 * PERF: this badge must NOT pull the whole DM inbox on every route just to show
 * a number. It now fetches the dedicated cheap `GET /conversations/unread-count`
 * endpoint (the count of conversations with unread messages — the same thing the
 * demo badge counts), mirroring `notifications/api/useUnreadCount`. So the badge
 * is accurate app-wide before the member has even opened `/messages`, without
 * ever loading the full list. The realtime socket keeps it live by invalidating
 * `[UNREAD_COUNT_KEY]` on `message:new` / `conversation:new` (realtime.ts) and
 * `useMarkRead` invalidates it when the member reads a thread.
 *
 * AUTH GATE: the endpoint is behind `ActiveMemberGuard`, so live mode only
 * fetches once the session is settled AND the member is active — otherwise the
 * badge would 401 (logged out) / 403 (pending) on every public page. Until then
 * it stays 0. Demo mode is always enabled (the mock count is a local filter —
 * zero network cost — so the scripted badge renders everywhere as before).
 *
 * `retry:false` keeps the badge from hard-failing the app if the count can't
 * load. Mirrors notifications/useUnreadCount.
 */
export function useUnreadMessages(): number {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const { deletedIds } = useDeletedConversations();
  // Stable, order-independent token so the demo count re-derives when a chat is
  // deleted. Live mode never writes deletedIds, so this stays "".
  const deletedToken = [...deletedIds].sort().join(",");
  const { data } = useQuery<number>({
    queryKey: [UNREAD_COUNT_KEY, demoMode, deletedToken],
    queryFn: async () => {
      if (demoMode) {
        // Count unread conversations, honouring locally-deleted chats — the
        // exact number the badge showed before, at zero network cost.
        return mockConversations.filter(
          (conversation) =>
            conversation.unread && !deletedIds.has(conversation.id),
        ).length;
      }
      return getConversationsUnreadCount();
    },
    // Live: only once the session is settled and the member is active, so the
    // badge never 401s (logged out) / 403s (pending) on public routes.
    enabled: demoMode || (!checking && loggedIn && status === "active"),
    retry: false,
  });
  return data ?? 0;
}
