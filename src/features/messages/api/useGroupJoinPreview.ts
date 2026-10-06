import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getGroupJoinPreview, type GroupJoinPreview } from "./messages.api";
import { bookSwapConversation } from "../demoGroupThreads.data";
import { ApiError } from "../../../shared/api/client";

/** PRD-400: the demo token that previews as an expired link
 *  (`/messages/join/demo-expired-link`). Every other demo token resolves to
 *  the fixed preview below. */
export const DEMO_EXPIRED_INVITE_TOKEN = "demo-expired-link";

/** PRD-400 (use cap): the demo token that previews as a used-up link
 *  (`/messages/join/demo-used-up-link`). */
export const DEMO_USED_UP_INVITE_TOKEN = "demo-used-up-link";

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
      if (demoMode) {
        // PRD-400: one scripted token answers the way a live link past its
        // 7-day window does, so the expired landing state is reachable in
        // demo too.
        if (token === DEMO_EXPIRED_INVITE_TOKEN) {
          throw new ApiError(410, "This invite link has expired", {
            code: "INVITE_LINK_EXPIRED",
          });
        }
        // PRD-400 (use cap): likewise for a link that has seated as many
        // people as its max uses allow.
        if (token === DEMO_USED_UP_INVITE_TOKEN) {
          throw new ApiError(410, "This invite link has been used up", {
            code: "INVITE_LINK_USED_UP",
          });
        }
        return demoGroupJoinPreview();
      }
      return getGroupJoinPreview(token!);
    },
    enabled: demoMode || (Boolean(token) && !checking && loggedIn),
    retry: false,
  });
}
