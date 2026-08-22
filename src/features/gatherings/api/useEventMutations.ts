import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  bookmarkEvent,
  cancelEvent,
  createCohostInvite,
  createEvent,
  inviteToEvent,
  promoteAttendee,
  removeAttendee,
  removeCohost,
  respondCohostInvite,
  respondInvite,
  rsvpEvent,
  unbookmarkEvent,
  unrsvpEvent,
  updateEvent,
  updateRsvpDetails,
  type CreateCohostInviteDto,
  type CreateEventDto,
  type RsvpDetailsDTO,
  type SeriesScope,
  type UpdateEventDto,
  type UpdateRsvpDetailsDto,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import type { AttendeesResult } from "./useAttendees";
import type { EventResult } from "./useEvent";

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

/** PATCH /events/:slug — edit details / inline edits / manage page.
 *  `seriesScope` (MSG-10, optional) rides on the mutation variables rather
 *  than as a separate hook argument, so every existing plain-`UpdateEventDto`
 *  call site keeps working unchanged (defaults to `"this"`) — only the
 *  manage dashboard's "this vs. this and future" prompt needs to set it. */
export function useUpdateEvent(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateEventDto & { seriesScope?: SeriesScope }>({
    mutationFn: async ({ seriesScope, ...dto }) => {
      if (demoMode) return;
      await updateEvent(slug, dto, seriesScope);
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

/** POST /events/:slug/cancel — manage → GatheringCancelledPage. `scope`
 *  (MSG-10, optional — pass `undefined` for the plain "this occurrence
 *  only" case) mirrors `cancelEvent`'s own optional `scope`. */
export function useCancelEvent(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, SeriesScope | undefined>({
    mutationFn: async (scope) => {
      if (demoMode) return;
      await cancelEvent(slug, scope);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
    },
  });
}

/**
 * What the member is asking for when they RSVP.
 *
 * `"waitlisted"` is a CLIENT-side intent, not a wire value: the request body
 * still says `"going"` (capacity, and therefore waitlist placement, is the
 * backend's call), but it tells `onMutate` this RSVP will NOT land in the
 * going list — so the optimistic head-count stays put instead of flashing
 * "41 going" on a 40-cap gathering until the refetch snaps it back.
 */
export type RsvpIntent = "going" | "maybe" | "waitlisted";

/**
 * POST /events/:slug/rsvp — EventRsvpCard / RsvpPage.
 *
 * Optimistic: the going head-count bumps immediately (and rolls back if the
 * request fails), then `onSettled` re-syncs from the server. The attendees
 * query is keyed via `eventKeys.attendees(slug, demoMode)`, so we patch that
 * exact key. Only a `"going"` intent bumps it — see `RsvpIntent`.
 */
export function useRsvp(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, RsvpIntent, RsvpContext>({
    mutationFn: async (intent) => {
      if (demoMode) return;
      await rsvpEvent(slug, intent === "waitlisted" ? "going" : intent);
    },
    onMutate: async (intent) => {
      const key = eventKeys.attendees(slug, demoMode);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<AttendeesResult>(key);
      if (prev && intent === "going") {
        queryClient.setQueryData<AttendeesResult>(key, {
          ...prev,
          goingCount: prev.goingCount + 1,
        });
      }
      return { key, prev };
    },
    onError: (_e, _intent, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => {
      // Demo keeps the optimistic head-count patch (no server to reconcile
      // with, see useToggleEventBookmark below); refetching would overwrite it
      // from the static mock's untouched goingCount.
      if (demoMode) return;
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
      // Demo keeps the optimistic head-count patch (see useRsvp above).
      if (demoMode) return;
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

/** Rollback context for the optimistic bookmark patch on the detail query. */
interface BookmarkContext {
  key: readonly unknown[];
  prev: EventResult | undefined;
}

/**
 * POST/DELETE /events/:slug/bookmark — the event-detail "Save" toggle.
 *
 * `next` is the desired saved state. Optimistic: the mounted detail query's
 * `gathering.bookmarked` flips immediately (rolling back on error), then live
 * mode re-syncs from the server and refreshes the `filter=saved` list so the
 * My Events "Saved" tab reflects the change. `param` is the raw route param the
 * detail query is keyed on (`<slug>-<shortId>`); `slug` is the real slug the API
 * expects. Demo mode never hits the network and skips the invalidation, so the
 * optimistic patch simply persists in local cache — demo behaviour unchanged.
 */
export function useToggleEventBookmark(
  slug: string,
  param: string | undefined,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, boolean, BookmarkContext>({
    mutationFn: async (next) => {
      if (demoMode) return;
      if (next) await bookmarkEvent(slug);
      else await unbookmarkEvent(slug);
    },
    onMutate: async (next) => {
      const key = eventKeys.detail(param, demoMode);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<EventResult>(key);
      if (prev) {
        queryClient.setQueryData<EventResult>(key, {
          ...prev,
          gathering: { ...prev.gathering, bookmarked: next },
        });
      }
      return { key, prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: () => {
      // Demo keeps the optimistic local patch (no server to reconcile with);
      // refetching would overwrite it from the static mock. Live re-syncs the
      // detail and the Saved (filter=saved) list.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
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

/** POST /events/:slug/cohost-invites: send a cohost invite (manage to cohost composer). */
export function useSendCohostInvite(slug: string) {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, CreateCohostInviteDto>({
    mutationFn: async (dto) => {
      if (demoMode) return;
      await createCohostInvite(slug, dto);
    },
  });
}

/** PATCH /event-cohost-invites/:id: accept / decline an incoming cohost invite. */
export function useRespondCohostInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; action: "accept" | "decline" }
  >({
    mutationFn: async ({ id, action }) => {
      if (demoMode) return;
      await respondCohostInvite(id, action);
    },
    onSuccess: (_data, { action }) => {
      void queryClient.invalidateQueries({
        queryKey: eventKeys.cohostInviteRoot,
      });
      if (action === "accept") {
        void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      }
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

/** DELETE /events/:slug/attendees/:memberSlug — manage-attendees "Remove". */
export function useRemoveAttendee(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      await removeAttendee(slug, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}

/** POST /events/:slug/waitlist/:memberSlug/promote — manage-attendees /
 *  guest-list "Promote". */
export function usePromoteAttendee(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      await promoteAttendee(slug, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}

/** PATCH /events/:slug/rsvp/details — `RsvpDetailsModal`'s "Save". `slug` may
 *  be `undefined` briefly while the modal's target event is still resolving;
 *  the mutation simply no-ops in live mode until it's set. */
export function useUpdateRsvpDetails(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<RsvpDetailsDTO | void, Error, UpdateRsvpDetailsDto>({
    mutationFn: async (dto) => {
      if (demoMode || !slug) return;
      return updateRsvpDetails(slug, dto);
    },
    onSuccess: () => {
      if (demoMode || !slug) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.rsvpDetails(slug, demoMode),
      });
    },
  });
}
