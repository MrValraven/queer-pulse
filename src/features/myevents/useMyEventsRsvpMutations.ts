import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  respondInvite,
  rsvpEvent,
  unrsvpEvent,
  type AcceptInviteDetailsDto,
  type RespondInviteResultDTO,
  type SeriesScope,
} from "../gatherings/api/events.api";

/** What an invite answer sends. `details` rides only on an accept, carrying
 *  the visibility choice and the answers the invitee gave first. */
export interface RespondInviteVariables {
  id: string;
  action: "accept" | "decline";
  details?: AcceptInviteDetailsDto;
}

export interface MyEventsRsvpMutations {
  rsvpMutation: ReturnType<
    typeof useMutation<void, Error, { slug: string; status: "going" | "maybe" }>
  >;
  unrsvpMutation: ReturnType<
    typeof useMutation<void, Error, { slug: string; scope?: SeriesScope }>
  >;
  respondInviteMutation: ReturnType<
    typeof useMutation<
      RespondInviteResultDTO | void,
      Error,
      RespondInviteVariables
    >
  >;
}

/**
 * The three dual-mode mutations `useMyEventsRsvp` drives its RSVP actions
 * through. Every mutation mirrors `gatherings/api/useEventMutations.ts`'s
 * dual-mode shape exactly (no-op in demo, real call + invalidate in live) —
 * it just can't reuse those hooks directly, since they close over ONE fixed
 * slug at hook-setup time and this hook drives RSVP actions across a whole
 * list of different events by id. `MyEvent.id` IS the event slug for every
 * category here except "invite" (id is the invite id — see
 * `eventInviteToMyEvent`), which is exactly why `acceptInvite`/
 * `declineInvite` go through `respondInviteMutation` instead of
 * `rsvpMutation`/`unrsvpMutation`.
 *
 * `unrsvpMutation`'s optional `scope` variable (MSG-16) lets the common
 * single-occurrence cancel (`cantGo`/`leaveWaitlist` on a standalone event)
 * keep calling `.mutate({ slug })` unchanged; only the series "leave whole
 * series" choice in `useMyEventsRsvp` sets it.
 */
export function useMyEventsRsvpMutations(): MyEventsRsvpMutations {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const invalidateMyEvents = useCallback(() => {
    if (demoMode) return;
    void queryClient.invalidateQueries({ queryKey: ["my-events"] });
  }, [demoMode, queryClient]);

  const rsvpMutation = useMutation<
    void,
    Error,
    { slug: string; status: "going" | "maybe" }
  >({
    mutationFn: async ({ slug, status }) => {
      if (demoMode) return;
      await rsvpEvent(slug, status);
    },
    onSuccess: invalidateMyEvents,
  });
  const unrsvpMutation = useMutation<
    void,
    Error,
    { slug: string; scope?: SeriesScope }
  >({
    mutationFn: async ({ slug, scope }) => {
      if (demoMode) return;
      await unrsvpEvent(slug, scope);
    },
    onSuccess: invalidateMyEvents,
  });
  // Demo has no server, so it resolves with nothing and the caller reads an
  // accept as going. Live refetches on failure too: an invite answered or
  // withdrawn elsewhere (409) must leave the list, so no card remains whose
  // every answer fails.
  const respondInviteMutation = useMutation<
    RespondInviteResultDTO | void,
    Error,
    RespondInviteVariables
  >({
    mutationFn: async ({ id, action, details }) => {
      if (demoMode) return;
      return respondInvite(id, action, details);
    },
    onSettled: invalidateMyEvents,
  });

  return { rsvpMutation, unrsvpMutation, respondInviteMutation };
}
