import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCohostInvite, type CohostInviteDetailDTO } from "./events.api";
import { eventKeys } from "./eventKeys";
import { DEMO_COHOST_INVITE } from "../coHostInvite.data";

/**
 * GET /event-cohost-invites/:id: the recipient's (or sender's) own view of
 * a cohost invite. Demo mode returns a static mock; live mode calls the
 * endpoint. `retry: false` because a 403/404 here means the invite isn't
 * yours, or it's gone: a permanent state that retrying won't fix.
 */
export function useCohostInvite(inviteId: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<CohostInviteDetailDTO>({
    queryKey: eventKeys.cohostInvite(inviteId, demoMode),
    enabled: Boolean(inviteId),
    retry: false,
    queryFn: async () => {
      if (demoMode || !inviteId) return DEMO_COHOST_INVITE;
      return getCohostInvite(inviteId);
    },
  });
}
