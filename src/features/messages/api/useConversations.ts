import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import { conversations as mockConversations, type Conversation } from "../data";
import { getConversations } from "./messages.api";
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

/**
 * Unread-messages badge for `AppShell.unreadCount`. Shares the exact same cache
 * entry as `useConversations()` (identical queryKey + queryFn) and derives the
 * count with `select`, so the nav badge reuses the already-fetched inbox instead
 * of firing a second request. `retry:false` keeps the badge from hard-failing
 * the app when the inbox can't load. Mirrors notifications/useUnreadCount.
 */
export function useUnreadMessages(): number {
  const { demoMode } = useDemoMode();
  const { deletedIds } = useDeletedConversations();
  // Stable, order-independent token so the demo query re-derives when a chat is
  // deleted. Live mode never writes deletedIds, so this stays "".
  const deletedToken = [...deletedIds].sort().join(",");
  const { data } = useQuery<Conversation[], Error, number>({
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
    select: (list) => list.filter((c) => c.unread).length,
    retry: false,
  });
  return data ?? 0;
}
