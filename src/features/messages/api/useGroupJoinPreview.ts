import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getGroupJoinPreview, type GroupJoinPreview } from "./messages.api";
import { bookSwapConversation } from "../demoGroupThreads.data";

/** Any token in demo mode resolves to the SAME fixed preview: the group the
 *  viewer already left (`bookSwapConversation`, PRD-358: previewing an
 *  invite link is exactly the flow a former member follows to rejoin). No
 *  network, no token-specific branching, matching how the rest of the demo
 *  seed answers a fixed scripted state rather than simulating a real
 *  per-token lookup. */
function demoGroupJoinPreview(): GroupJoinPreview {
  return {
    conversationId: bookSwapConversation.id,
    title: bookSwapConversation.name,
    avatarUrl: bookSwapConversation.avatarUrl ?? null,
    description:
      "Swap paperbacks, queer lit recs and the odd overdue library fine.",
    memberCount: bookSwapConversation.memberCount ?? 0,
    isMember: false,
  };
}

/**
 * GET /conversations/join/:token: the join-link landing preview (PRD-358):
 * title/avatar/description/member count, plus whether the caller is already
 * an active member (so the landing page can offer "Open chat" instead of
 * "Join"). 404s `INVITE_LINK_INVALID` for an unknown or dissolved link, that
 * error is left for the consuming screen to map via `groupErrorMessages.ts`,
 * not swallowed here.
 *
 * Demo: the fixed preview above, so the join-link landing page renders
 * without a backend. Live: hydrates from the endpoint; enabled only once a
 * non-empty token is known (a route param that hasn't resolved yet must not
 * fire a request for `undefined`) AND the caller is a signed-in member (the
 * link is only ever meant for a member to accept, and the pre-auth window
 * around a fresh page load must not fire a request that 401s), same auth
 * gate as `useConversations`/`useGroupInvites`. */
export function useGroupJoinPreview(token: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  return useQuery<GroupJoinPreview>({
    queryKey: ["group-join-preview", demoMode, token],
    queryFn: async () => {
      if (demoMode) return demoGroupJoinPreview();
      return getGroupJoinPreview(token!);
    },
    enabled: demoMode || (Boolean(token) && !checking && loggedIn),
    retry: false,
  });
}
