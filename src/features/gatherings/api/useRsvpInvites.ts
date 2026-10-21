import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { eventKeys } from "./eventKeys";
import {
  toRsvpInviteView,
  type RsvpInviteView,
} from "./memberInvites.adapters";
import { getRsvpInvites } from "./memberInvites.api";
import { DEMO_RSVP_INVITES } from "./rsvpInvites.data";

const NO_INVITES: RsvpInviteView[] = [];

/** True for an invite that still holds a seat under the guest cap. */
export function isOpenRsvpInvite(invite: RsvpInviteView): boolean {
  return invite.status === "invited" || invite.status === "awaiting_host";
}

/**
 * The invites the caller sent from their RSVP to one event, and how many of
 * them are still open (`invited` or `awaiting_host`), the number the guest
 * cap counts.
 *
 * Demo mode serves `DEMO_RSVP_INVITES` from the same key the demo mutations
 * patch, with an infinite stale time so a patch is never refetched away.
 */
export function useRsvpInvites(
  slug: string | undefined,
  options?: { isEnabled?: boolean },
) {
  const { demoMode } = useDemoMode();
  const isEnabled = options?.isEnabled ?? true;
  const query = useQuery<RsvpInviteView[]>({
    queryKey: eventKeys.rsvpInvites(slug, demoMode),
    enabled: Boolean(slug) && isEnabled,
    ...(demoMode ? { staleTime: Infinity } : {}),
    queryFn: async () => {
      if (demoMode || !slug) return DEMO_RSVP_INVITES;
      const dtos = await getRsvpInvites(slug);
      return dtos.map(toRsvpInviteView);
    },
  });
  const invites = query.data ?? NO_INVITES;
  return {
    invites,
    openInviteCount: invites.filter(isOpenRsvpInvite).length,
    isPending: query.isPending,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
