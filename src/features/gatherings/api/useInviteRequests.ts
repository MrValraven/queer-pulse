import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { eventKeys } from "./eventKeys";
import { DEMO_INVITE_REQUESTS } from "./inviteRequests.data";
import {
  toInviteRequestView,
  type InviteRequestView,
} from "./memberInvites.adapters";
import { getInviteRequests } from "./memberInvites.api";

const NO_REQUESTS: InviteRequestView[] = [];

/**
 * The organiser's approval queue for one invite-only event: member invites
 * waiting for a host to approve or decline them.
 *
 * Demo mode serves `DEMO_INVITE_REQUESTS` from the same key the demo approve
 * and decline mutations patch, with an infinite stale time so a patch holds.
 */
export function useInviteRequests(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const query = useQuery<InviteRequestView[]>({
    queryKey: eventKeys.inviteRequests(slug, demoMode),
    enabled: Boolean(slug),
    ...(demoMode ? { staleTime: Infinity } : {}),
    queryFn: async () => {
      if (demoMode || !slug) return DEMO_INVITE_REQUESTS;
      const dtos = await getInviteRequests(slug);
      return dtos.map(toInviteRequestView);
    },
  });
  return {
    requests: query.data ?? NO_REQUESTS,
    isPending: query.isPending,
    isError: query.isError,
  };
}
