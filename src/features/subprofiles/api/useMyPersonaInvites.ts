import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  acceptPersonaInvite,
  declinePersonaInvite,
  listMyPersonaInvites,
  type MyInviteDTO,
} from "./subprofiles.api";

/**
 * The current member's own incoming co-owner invites, across all personas —
 * feeds the dashboard "you've been invited to co-own…" banner. Demo returns
 * the scripted mock; live calls GET /subprofiles/invites/mine.
 *
 * AUTH GATE: mirrors `useUnreadMessages` (`messages/api/useConversations.ts`)
 * exactly — demo mode is always enabled (the mock is a local, network-free
 * read), but live mode only fires once the session is settled, the member is
 * signed in, AND their status is `"active"`. The live endpoint sits behind
 * `ActiveMemberGuard`, so a logged-out/visitor viewer never hits it, and nor
 * does a signed-in-but-suspended/pending member — without the status check
 * that case would 403 repeatedly. `retry: false` for the same reason as
 * `useUnreadMessages`: don't hard-retry a guard rejection.
 */
export function useMyPersonaInvites() {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const queryClient = useQueryClient();

  const invalidateAfterResolve = () => {
    void queryClient.invalidateQueries({ queryKey: ["my-persona-invites"] });
    void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    void queryClient.invalidateQueries({ queryKey: ["subprofile"] });
  };

  const query = useQuery<MyInviteDTO[]>({
    queryKey: ["my-persona-invites", demoMode],
    enabled: demoMode || (!checking && loggedIn && status === "active"),
    retry: false,
    queryFn: async () => {
      if (demoMode) {
        const { mockMyPersonaInvites } = await import("../data/subprofiles.data");
        return mockMyPersonaInvites();
      }
      return listMyPersonaInvites();
    },
  });

  const accept = useMutation<{ ok: true }, Error, string>({
    // The invite banner toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (inviteId) =>
      demoMode ? { ok: true } : acceptPersonaInvite(inviteId),
    // Accepting hands the member co-ownership of a persona: invalidate the
    // subprofile lists too so it shows up on the dashboard right away, not
    // just the invite banner clearing.
    onSuccess: invalidateAfterResolve,
  });

  const decline = useMutation<{ ok: true }, Error, string>({
    // The invite banner toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (inviteId) =>
      demoMode ? { ok: true } : declinePersonaInvite(inviteId),
    onSuccess: invalidateAfterResolve,
  });

  return { ...query, accept, decline };
}
