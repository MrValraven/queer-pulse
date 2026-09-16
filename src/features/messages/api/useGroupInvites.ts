import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getGroupInvites, type GroupInviteSummary } from "./messages.api";
import { minutesAgo } from "../demoTimeline.data";

/** Isolated query-key prefix (mirrors `UNREAD_COUNT_KEY` in
 *  `useConversations.ts`): `["group-invites", demoMode]`. Exported so
 *  `useGroupManagementMutations.ts` can invalidate it after accept/decline/
 *  revoke without either file importing the other's internals. */
export const GROUP_INVITES_KEY = "group-invites";

/** One fabricated pending invite, reusing an existing demo contact (Anika,
 *  from `demoDirectThreads.data.ts`) as the inviter, cheap, and consistent
 *  with how the rest of the demo seed borrows the same handful of contacts
 *  across threads. Deliberately points at a group that ISN'T already one of
 *  the viewer's demo conversations (unlike `brunchCrewConversation` etc,
 *  which the viewer already belongs to, has left, or was removed from, none
 *  of those states describe a PENDING invite). */
const DEMO_GROUP_INVITES: GroupInviteSummary[] = [
  {
    id: "demo-group-invite-hikers",
    conversationId: "demo-group-invite-hikers-conversation",
    title: "Queer Hikers Lisboa",
    avatarUrl: null,
    memberCount: 18,
    inviter: {
      handle: "anika",
      displayName: "Anika Kovač",
      avatarUrl: null,
    },
    createdAt: minutesAgo(45),
  },
];

/**
 * GET /conversations/group-invites: pending group invites addressed to the
 * caller (PRD-353), rendered as the Requests tab's group-invite rows.
 *
 * Demo: one fabricated invite (above), so the Requests tab has something to
 * accept/decline without a backend. Live: hydrates from the endpoint, gated
 * on a signed-in member (mirrors `useUnreadMessages`'s auth gate) so it never
 * fires 401/403 on a public route.
 */
export function useGroupInvites() {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  return useQuery<GroupInviteSummary[]>({
    queryKey: [GROUP_INVITES_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_GROUP_INVITES;
      return getGroupInvites();
    },
    enabled: demoMode || (!checking && loggedIn && status === "active"),
  });
}
