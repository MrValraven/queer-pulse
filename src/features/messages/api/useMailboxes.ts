import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import {
  mailboxesQueryKey,
  type MailboxSummary,
} from "../../../shared/api/mailboxViewer";
import { applyConversationPrefs } from "../conversationPrefs";
import { conversations as mockConversations } from "../data";
import { demoMailboxSummaries } from "../demoBusinessThreads.data";
import { getMailboxes } from "./mailboxes.api";

/**
 * Every mailbox the member may read and answer: their own profile first, then
 * each persona, listing and company they staff. Demo mode serves the demo
 * viewer's switcher and never touches the network.
 */
export function useMailboxes() {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const { deletedIds } = useDeletedConversations();
  // Stable, order-independent token so the demo switcher's counts re-derive
  // exactly when `useUnreadMessages`' badge does (a demo archive, mark-unread
  // or delete). Live mode never writes deletedIds, so this stays "", and the
  // token joins the demo key only.
  const deletedToken = [...deletedIds].sort().join(",");
  return useQuery<MailboxSummary[]>({
    queryKey: demoMode
      ? ([...mailboxesQueryKey(demoMode), deletedToken] as const)
      : mailboxesQueryKey(demoMode),
    queryFn: () =>
      demoMode
        ? Promise.resolve(
            demoMailboxSummaries(
              applyConversationPrefs(mockConversations).filter(
                (conversation) => !deletedIds.has(conversation.id),
              ),
            ),
          )
        : getMailboxes(),
    // Same gate as the nav badge: the route is ActiveMemberGuard-only.
    enabled: demoMode || (!checking && loggedIn && status === "active"),
    retry: false,
  });
}
