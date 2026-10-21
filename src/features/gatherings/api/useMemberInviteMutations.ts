import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MemberSelectPerson } from "../../../shared/components/ui/MemberSelectList";
import { eventKeys } from "./eventKeys";
import { DEMO_INVITE_REQUESTS } from "./inviteRequests.data";
import type {
  InviteRequestView,
  RsvpInviteView,
} from "./memberInvites.adapters";
import {
  approveInviteRequest,
  declineInviteRequest,
  sendRsvpInvites,
  withdrawEventInvite,
} from "./memberInvites.api";
import { DEMO_RSVP_INVITES } from "./rsvpInvites.data";

/** What one send did, for the confirmation the RSVP panel shows. */
export interface SendRsvpInvitesOutcome {
  sentCount: number;
  alreadyInvitedCount: number;
  notInvitableCount: number;
}

/** A demo invite row for one picked person, waiting for their answer. */
function demoInvitedRow(person: MemberSelectPerson): RsvpInviteView {
  return {
    id: `demo-rsvp-invite-${person.slug}`,
    slug: person.slug,
    name: person.name,
    ...(person.avatarUrl ? { avatarUrl: person.avatarUrl } : {}),
    status: "invited",
    canWithdraw: true,
  };
}

/** Demo send: append `invited` rows to the cached list, skipping anyone the
 *  list already holds, and report the skips as already invited. */
function sendDemoInvites(
  queryClient: QueryClient,
  slug: string,
  people: MemberSelectPerson[],
): SendRsvpInvitesOutcome {
  const queryKey = eventKeys.rsvpInvites(slug, true);
  const existing =
    queryClient.getQueryData<RsvpInviteView[]>(queryKey) ?? DEMO_RSVP_INVITES;
  const invitedSlugs = new Set(existing.map((invite) => invite.slug));
  const freshPeople = people.filter((person) => !invitedSlugs.has(person.slug));
  queryClient.setQueryData<RsvpInviteView[]>(queryKey, [
    ...existing,
    ...freshPeople.map(demoInvitedRow),
  ]);
  return {
    sentCount: freshPeople.length,
    alreadyInvitedCount: people.length - freshPeople.length,
    notInvitableCount: 0,
  };
}

/** POST /events/:slug/rsvp/invites, invite picked connections from the
 *  caller's RSVP. Demo mode patches the cached list and never hits the
 *  network. */
export function useSendRsvpInvites(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<SendRsvpInvitesOutcome, Error, MemberSelectPerson[]>({
    mutationFn: async (people) => {
      if (demoMode) return sendDemoInvites(queryClient, slug, people);
      const result = await sendRsvpInvites(
        slug,
        people.map((person) => person.slug),
      );
      return {
        sentCount: result.invites.length,
        alreadyInvitedCount: result.refused.filter(
          (refusal) => refusal.reason === "already_invited",
        ).length,
        notInvitableCount: result.refused.filter(
          (refusal) => refusal.reason === "not_invitable",
        ).length,
      };
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.rsvpInvites(slug, demoMode),
      });
    },
  });
}

/** POST /event-invites/:id/withdraw, take back an open invite the caller
 *  sent. Demo mode removes the row from the cached list. Live mode refetches
 *  whether or not it worked, so an invite answered in the meantime (a 409)
 *  shows its real state. */
export function useWithdrawRsvpInvite(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (inviteId) => {
      if (demoMode) {
        queryClient.setQueryData<RsvpInviteView[]>(
          eventKeys.rsvpInvites(slug, true),
          (current) =>
            (current ?? DEMO_RSVP_INVITES).filter(
              (invite) => invite.id !== inviteId,
            ),
        );
        return;
      }
      await withdrawEventInvite(inviteId);
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.rsvpInvites(slug, demoMode),
      });
    },
  });
}

/** Demo approve or decline: the request leaves the cached queue. */
function removeDemoRequest(
  queryClient: QueryClient,
  slug: string,
  requestId: string,
) {
  queryClient.setQueryData<InviteRequestView[]>(
    eventKeys.inviteRequests(slug, true),
    (current) =>
      (current ?? DEMO_INVITE_REQUESTS).filter(
        (request) => request.id !== requestId,
      ),
  );
}

/** One organiser answer to a request. Both answers share the same refresh:
 *  the queue, the inviter's own list and the guest list all change. The
 *  refresh runs on failure too: a 409 means the request was already
 *  answered or withdrawn elsewhere, so refetching drops the stale row
 *  and removes a button that would fail on every retry. */
function useAnswerInviteRequest(
  slug: string,
  answer: (requestId: string) => Promise<unknown>,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (requestId) => {
      if (demoMode) {
        removeDemoRequest(queryClient, slug, requestId);
        return;
      }
      await answer(requestId);
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.inviteRequests(slug, demoMode),
      });
      void queryClient.invalidateQueries({
        queryKey: eventKeys.rsvpInvites(slug, demoMode),
      });
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
    },
  });
}

/** POST /event-invites/:id/approve, an organiser lets a request through. */
export function useApproveInviteRequest(slug: string) {
  return useAnswerInviteRequest(slug, approveInviteRequest);
}

/** POST /event-invites/:id/decline-request, an organiser refuses a request. */
export function useDeclineInviteRequest(slug: string) {
  return useAnswerInviteRequest(slug, declineInviteRequest);
}
