import { useCallback } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoAnsweredCollabInvite,
  DEMO_COLLAB_INVITE,
} from "../collabInvite.data";
import {
  getCollabInvite,
  leaveCollab,
  respondCollabInvite,
  type CollabDecision,
  type EventCommunityInviteDetailDTO,
} from "./eventCommunities.api";
import {
  eventCommunityKeys,
  invalidateHostingReaders,
} from "./eventCommunityKeys";
import { eventKeys } from "./eventKeys";
import type { EventResult } from "./useEvent";

/**
 * `GET /event-communities/:id`. `retry: false` because a 403 or 404 here is
 * permanent (the invite is gone, or belongs to a community the viewer does
 * not run). Demo returns `DEMO_COLLAB_INVITE`.
 */
export function useCollabInvite(inviteId: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<EventCommunityInviteDetailDTO>({
    queryKey: eventCommunityKeys.collabInvite(inviteId, demoMode),
    enabled: Boolean(inviteId),
    retry: false,
    queryFn: async () => {
      if (demoMode || !inviteId) return DEMO_COLLAB_INVITE;
      return getCollabInvite(inviteId);
    },
  });
}

/** `POST /event-communities/:id/respond`. A 409 (answered meanwhile, the
 *  gathering cancelled or past, the community frozen) reaches the app-wide
 *  mutation error toast, and the live invite refetches on any error so the
 *  page swaps to its resolved state. */
export function useRespondCollabInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    EventCommunityInviteDetailDTO,
    Error,
    { id: string; decision: CollabDecision }
  >({
    mutationFn: async ({ id, decision }) => {
      if (demoMode) return demoAnsweredCollabInvite(decision);
      return respondCollabInvite(id, decision);
    },
    onSuccess: (answeredInvite, { id }) => {
      if (demoMode) {
        // The demo query function always returns the pending fixture, so a
        // refetch would undo the answer. Keep the answered invite in cache.
        queryClient.setQueryData(
          eventCommunityKeys.collabInvite(id, true),
          answeredInvite,
        );
      } else {
        void queryClient.invalidateQueries({
          queryKey: eventCommunityKeys.collabInviteRoot,
        });
      }
      invalidateHostingReaders(queryClient);
    },
    onError: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventCommunityKeys.collabInviteRoot,
      });
    },
  });
}

/** What "Remove our community" sends: the collab row's id, and the
 *  gathering's slug when the caller knows it. */
export interface LeaveCollabVariables {
  id: string;
  /** Narrows the detail cache patch to this gathering. Without it, every
   *  cached gathering detail that lists the guest drops it. */
  eventSlug?: string;
}

export interface LeaveCollabOptions {
  /** False when the caller runs `useSyncAfterLeaveCollab`'s sync itself,
   *  once the guest's row has folded away. Defaults to true. */
  shouldSyncOnSuccess?: boolean;
}

/** `DELETE /event-communities/:id`: "Remove our community" on the gathering
 *  page. Silent on the server; demo makes no request. On success the cached
 *  gathering detail drops the guest (see `useSyncAfterLeaveCollab`), so the
 *  hero's "With …" line stops naming it before any refetch lands. */
export function useLeaveCollab({
  shouldSyncOnSuccess = true,
}: LeaveCollabOptions = {}) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const syncAfterLeave = useSyncAfterLeaveCollab();
  return useMutation<void, Error, LeaveCollabVariables>({
    mutationFn: async ({ id }) => {
      if (demoMode) return;
      await leaveCollab(id);
    },
    onSuccess: (_result, variables) => {
      if (shouldSyncOnSuccess) syncAfterLeave(variables);
    },
    onError: () => {
      // A 404 or 409 (removed by the organisers, the gathering cancelled or
      // past) means the page is out of date: show what the server holds.
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventCommunityKeys.collabInviteRoot,
      });
      invalidateHostingReaders(queryClient);
    },
  });
}

/** Brings the caches in line once a guest community has left: the cached
 *  gathering detail drops the guest at once, then live refetches the invite
 *  and every hosting reader. Demo stops after the patch, since a demo refetch
 *  would rebuild the detail from its static mock and bring the guest back.
 *  The guest row calls it after its fold, because the patch unmounts it. */
export function useSyncAfterLeaveCollab(): (
  variables: LeaveCollabVariables,
) => void {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useCallback(
    ({ id, eventSlug }: LeaveCollabVariables) => {
      dropGuestFromCachedDetails(queryClient, id, eventSlug);
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventCommunityKeys.collabInviteRoot,
      });
      invalidateHostingReaders(queryClient);
    },
    [demoMode, queryClient],
  );
}

/** Removes the guest community `guestId` from every cached gathering detail
 *  that lists it (only `eventSlug`'s, when given). */
function dropGuestFromCachedDetails(
  queryClient: QueryClient,
  guestId: string,
  eventSlug: string | undefined,
): void {
  queryClient.setQueriesData<EventResult>(
    { queryKey: eventKeys.detailRoot },
    (cached) => {
      const guests = cached?.gathering.guestCommunities;
      if (!cached || !guests) return cached;
      if (eventSlug !== undefined && cached.gathering.slug !== eventSlug) {
        return cached;
      }
      if (!guests.some((guest) => guest.id === guestId)) return cached;
      return {
        ...cached,
        gathering: {
          ...cached.gathering,
          guestCommunities: guests.filter((guest) => guest.id !== guestId),
        },
      };
    },
  );
}
