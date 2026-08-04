import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  addCohost,
  cancelEvent,
  createEvent,
  inviteToEvent,
  removeCohost,
  respondInvite,
  rsvpEvent,
  unrsvpEvent,
  updateEvent,
  type CreateEventDto,
  type UpdateEventDto,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import type { AttendeesResult } from "./useAttendees";

/** Rollback context carried from onMutate → onError for the attendee-count optimism. */
interface RsvpContext {
  key: readonly unknown[];
  prev: AttendeesResult | undefined;
}

/**
 * Every mutation branches on `demoMode`: in demo it's a no-op (the calling
 * component keeps the optimistic change in local state, exactly as the
 * prototype already does), and in live mode it calls the API then invalidates
 * the affected query keys. Demo mode must never hit the network.
 */

/** POST /events — create-gathering wizard submit. */
export function useCreateEvent() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ slug?: string }, Error, CreateEventDto>({
    // CreateGatheringPage toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return {};
      const res = await createEvent(dto);
      return { slug: res.slug };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/** PATCH /events/:slug — edit details / inline edits / manage page. */
export function useUpdateEvent(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateEventDto>({
    mutationFn: async (dto) => {
      if (demoMode) return;
      await updateEvent(slug, dto);
    },
    // The detail query is keyed on the raw route param (`<slug>-<shortId>`),
    // which may differ from this mutation's `slug`, so invalidate the whole
    // detail root — guaranteed to match the mounted detail regardless of mode.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/** POST /events/:slug/cancel — manage → GatheringCancelledPage. */
export function useCancelEvent(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode) return;
      await cancelEvent(slug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/**
 * POST /events/:slug/rsvp — EventRsvpCard / RsvpPage.
 *
 * Optimistic: the going head-count bumps immediately (and rolls back if the
 * request fails), then `onSettled` re-syncs from the server. The attendees
 * query is keyed via `eventKeys.attendees(slug, demoMode)`, so we patch that
 * exact key.
 */
export function useRsvp(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, "going" | "maybe", RsvpContext>({
    mutationFn: async (status) => {
      if (demoMode) return;
      await rsvpEvent(slug, status);
    },
    onMutate: async (status) => {
      const key = eventKeys.attendees(slug, demoMode);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<AttendeesResult>(key);
      if (prev && status === "going") {
        queryClient.setQueryData<AttendeesResult>(key, {
          ...prev,
          goingCount: prev.goingCount + 1,
        });
      }
      return { key, prev };
    },
    onError: (_e, _status, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      // Scope to THIS event's attendees only — the app-wide `attendeesRoot`
      // prefix would refetch every mounted attendees dashboard and reset each
      // one's `loadMore` paging (including this one's) back to page 1.
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/** DELETE /events/:slug/rsvp — cancel an RSVP. Optimistic head-count decrement. */
export function useUnrsvp(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void, RsvpContext>({
    mutationFn: async () => {
      if (demoMode) return;
      await unrsvpEvent(slug);
    },
    onMutate: async () => {
      const key = eventKeys.attendees(slug, demoMode);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<AttendeesResult>(key);
      if (prev) {
        queryClient.setQueryData<AttendeesResult>(key, {
          ...prev,
          goingCount: Math.max(0, prev.goingCount - 1),
        });
      }
      return { key, prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      // Scope to THIS event's attendees only (see useRsvp) — avoids resetting
      // every mounted attendees dashboard's `loadMore` paging.
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/** POST /events/:slug/cohosts — CoHostInvitePage / manage cohosts. */
export function useAddCohost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (cohostSlug) => {
      if (demoMode) return;
      await addCohost(slug, cohostSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}

/** DELETE /events/:slug/cohosts/:cohostSlug — remove a cohost. */
export function useRemoveCohost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (cohostSlug) => {
      if (demoMode) return;
      await removeCohost(slug, cohostSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}

/** POST /events/:slug/invites — invite members (≤100 slugs). */
export function useInviteMembers(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({
    mutationFn: async (slugs) => {
      if (demoMode) return;
      await inviteToEvent(slug, slugs);
    },
    onSuccess: () => {
      // Scope to THIS event's attendees only (see useRsvp).
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
    },
  });
}

/** PATCH /event-invites/:id — accept / decline an incoming invite. */
export function useRespondInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; action: "accept" | "decline" }>(
    {
      mutationFn: async ({ id, action }) => {
        if (demoMode) return;
        await respondInvite(id, action);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
      },
    },
  );
}
