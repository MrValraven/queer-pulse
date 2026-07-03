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
    mutationFn: async (dto) => {
      if (demoMode) return {};
      const res = await createEvent(dto);
      return { slug: res.slug };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/** POST /events/:slug/rsvp — EventRsvpCard / RsvpPage. */
export function useRsvp(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, "going" | "maybe">({
    mutationFn: async (status) => {
      if (demoMode) return;
      await rsvpEvent(slug, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      queryClient.invalidateQueries({ queryKey: ["attendees", slug] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/** DELETE /events/:slug/rsvp — cancel an RSVP. */
export function useUnrsvp(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode) return;
      await unrsvpEvent(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      queryClient.invalidateQueries({ queryKey: ["attendees", slug] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["attendees", slug] });
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
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    },
  );
}
