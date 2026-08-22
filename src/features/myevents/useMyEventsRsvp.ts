import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import {
  respondInvite,
  rsvpEvent,
  unrsvpEvent,
  type SeriesScope,
} from "../gatherings/api/events.api";
import type { MyEvent } from "./myEvents.types";
import { parseDate, timeStr } from "./myEvents.helpers";

interface RsvpDeps {
  events: MyEvent[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  byId: (id: string) => MyEvent | undefined;
  toast: (msg: string, type?: "success" | "info") => void;
  toastAction: (msg: string, action: ToastAction) => void;
  t: TFunction;
  fmt: Formatters;
  /** Closes the row "more" menu (owned by the modals sub-hook). */
  closeMore: () => void;
}

export interface MyEventsRsvp {
  setMaybe: (id: string) => void;
  setGoing: (id: string) => void;
  rsvpSaved: (id: string) => void;
  acceptInvite: (id: string) => void;
  declineInvite: (id: string) => void;
  cantGo: (id: string) => void;
  leaveWaitlist: (id: string) => void;
  softRemove: (id: string, msg: string) => void;
  removingId: string | null;
  confirm: { open: boolean; title: string; meta: string };
  closeConfirm: () => void;
  scope: { open: boolean; eventId: string | null; title: string };
  closeScope: () => void;
  scopeChoice: (which: "one" | "all") => void;
}

/**
 * RSVP lifecycle: reminders, maybe/going toggles, invite accept/decline,
 * can't-go / leave-waitlist (with the series-scope prompt), and the shared
 * soft-remove-with-undo. Confirm + scope modal state live here too.
 */
export function useMyEventsRsvp({
  events,
  setEvents,
  byId,
  toast,
  toastAction,
  t,
  fmt,
  closeMore,
}: RsvpDeps): MyEventsRsvp {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // Every mutation below mirrors `gatherings/api/useEventMutations.ts`'s
  // dual-mode shape exactly (no-op in demo, real call + invalidate in live) —
  // it just can't reuse those hooks directly, since they close over ONE fixed
  // slug at hook-setup time and this hook drives RSVP actions across a whole
  // list of different events by id. `MyEvent.id` IS the event slug for every
  // category here except "invite" (id is the invite id — see
  // `eventInviteToMyEvent`), which is exactly why `acceptInvite`/
  // `declineInvite` go through `respondInviteMutation` instead of
  // `rsvpMutation`/`unrsvpMutation`.
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
  // MSG-16 — `scope` (optional) lives on the mutation variables so the
  // common single-occurrence cancel (`cantGo`/`leaveWaitlist` on a
  // standalone event) keeps calling `.mutate({ slug })` unchanged; only the
  // series "leave whole series" choice (`scopeChoice` below) sets it.
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
  const respondInviteMutation = useMutation<
    void,
    Error,
    { id: string; action: "accept" | "decline" }
  >({
    mutationFn: async ({ id, action }) => {
      if (demoMode) return;
      await respondInvite(id, action);
    },
    onSuccess: invalidateMyEvents,
  });

  const [confirm, setConfirm] = useState({ open: false, title: "", meta: "" });
  const [scope, setScope] = useState<{
    open: boolean;
    eventId: string | null;
    title: string;
  }>({ open: false, eventId: null, title: "" });
  const [removingId, setRemovingId] = useState<string | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear the pending soft-remove timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(removeTimer.current);
    },
    [],
  );

  // ── soft remove with undo ─────────────────────────
  // NOTE on "Undo": this purely restores the LOCAL card — cantGo/leaveWaitlist/
  // declineInvite only call this from the real cancel/decline mutation's
  // `onSuccess`, so the real call has ALREADY succeeded by the time this
  // timer's toast (and its Undo button) appear, and re-inserting the row
  // here does not re-issue a real RSVP/invite-response call to match. Declined
  // invites specifically CAN'T be un-declined server-side (the backend 409s a
  // second response to an already-answered invite), so a true undo isn't
  // available for every caller of this helper uniformly. Scoped out of this
  // pass; flagged here rather than left silently surprising.
  const softRemove = useCallback(
    (id: string, msg: string) => {
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      const idx = events.indexOf(ev);
      setRemovingId(id);
      clearTimeout(removeTimer.current);
      removeTimer.current = setTimeout(() => {
        setRemovingId(null);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        toastAction(msg, {
          label: t("myevents:bulk.undoCta"),
          onClick: () => {
            setEvents((prev) => {
              const copy = prev.slice();
              copy.splice(Math.min(idx, copy.length), 0, ev);
              return copy;
            });
            toast(t("myevents:bulk.broughtBackToast"), "info");
          },
        });
      }, 200);
    },
    [events, setEvents, t, toast, toastAction],
  );

  // ── rsvp lifecycle ────────────────────────────────
  const patch = useCallback(
    (id: string, fn: (e: MyEvent) => MyEvent) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
    },
    [setEvents],
  );

  // `id` is the event slug for every category here (`maybe`/going toggles only
  // ever apply to the "going" category — see `MyEventsRsvp`'s doc + the
  // `EventCardActions`/`MoreMenu` callers), so `rsvpMutation` (POST
  // /events/:slug/rsvp) is the right call in both directions.
  //
  // The card patches optimistically (immediate feedback on a toggle that
  // rarely fails), but the toast itself only fires from the mutation's
  // `onSuccess` — never unconditionally — and `onError` reverts the patch;
  // the global mutation-error toast (`errorHandling.ts`) covers telling the
  // member it failed. Mirrors `GatheringRsvpControl.handleGoing`'s pattern.
  const setMaybe = useCallback(
    (id: string) => {
      const prevMaybe = byId(id)?.maybe;
      patch(id, (e) => ({ ...e, maybe: true }));
      closeMore();
      rsvpMutation.mutate(
        { slug: id, status: "maybe" },
        {
          onSuccess: () => toast(t("myevents:toast.markedMaybe"), "info"),
          onError: () => patch(id, (e) => ({ ...e, maybe: prevMaybe ?? false })),
        },
      );
    },
    [byId, patch, closeMore, t, toast, rsvpMutation],
  );
  const setGoing = useCallback(
    (id: string) => {
      const prevMaybe = byId(id)?.maybe;
      patch(id, (e) => ({ ...e, maybe: false }));
      closeMore();
      rsvpMutation.mutate(
        { slug: id, status: "going" },
        {
          onSuccess: () => toast(t("myevents:toast.fullyIn"), "success"),
          onError: () => patch(id, (e) => ({ ...e, maybe: prevMaybe ?? false })),
        },
      );
    },
    [byId, patch, closeMore, t, toast, rsvpMutation],
  );

  // Bigger state change (category flip) than the toggle above, so the
  // rollback restores the whole previous event rather than one field.
  const rsvpSaved = useCallback(
    (id: string) => {
      const prevEvent = byId(id);
      patch(id, (e) => ({
        ...e,
        category: "going",
        // Same key the card badges already use, so the attendee line renders
        // in the member's language and pluralizes properly.
        whoText: t("myevents:badges.goingCount", { count: e.going }),
        who: [["YOU", "coral"]],
      }));
      rsvpMutation.mutate(
        { slug: id, status: "going" },
        {
          onSuccess: () => toast(t("myevents:toast.rsvpGoing"), "success"),
          onError: () => {
            if (prevEvent) patch(id, () => prevEvent);
          },
        },
      );
    },
    [byId, patch, t, toast, rsvpMutation],
  );

  // `id` here is the INVITE id, not the event slug — `eventInviteToMyEvent`
  // (myEvents.adapters.ts) keys the "invite" category's `MyEvent.id` off
  // `EventInviteDTO.id`, since a pending invite has no RSVP row of its own
  // yet. `respondInviteMutation` (PATCH /event-invites/:id) is the matching
  // endpoint, not `rsvpMutation`.
  //
  // The "you're confirmed" modal + the going-category patch are themselves
  // the success affordance here (there's no separate toast to gate), so both
  // wait for `onSuccess` — an already-answered invite (backend 409s a second
  // response) must never show a false "you're in" screen. `onError` leaves
  // the invite row exactly as it was so the member can retry.
  const acceptInvite = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (!ev) return;
      respondInviteMutation.mutate(
        { id, action: "accept" },
        {
          onSuccess: () => {
            const dt = parseDate(ev.date);
            setConfirm({
              open: true,
              title: ev.title,
              meta: `${fmt.date(dt, { weekday: "long", day: "numeric", month: "long" })} · ${timeStr(ev)} · ${ev.venue}`,
            });
            patch(id, (e) => ({
              ...e,
              category: "going",
              whoText: t("myevents:badges.goingCount", { count: e.going }),
              who: [["YOU", "coral"]],
            }));
          },
        },
      );
    },
    [byId, fmt, patch, respondInviteMutation, t],
  );
  const closeConfirm = useCallback(
    () => setConfirm((c) => ({ ...c, open: false })),
    [],
  );
  // `softRemove` (the optimistic row removal + "Undo" toast) only runs once
  // `respondInviteMutation` actually succeeds — a failed decline (e.g. the
  // invite was already answered elsewhere) must leave the invite row visible
  // rather than disappearing on a call that never took effect server-side.
  const declineInvite = useCallback(
    (id: string) => {
      respondInviteMutation.mutate(
        { id, action: "decline" },
        {
          onSuccess: () =>
            softRemove(id, t("myevents:toast.invitationDeclined")),
        },
      );
    },
    [softRemove, t, respondInviteMutation],
  );

  // MSG-16 — `ev.series` is now populated for both demo (its own mock
  // fixture) AND live (real `EventSummary.series`, mapped by
  // `eventCardToMyEvent`), so this branch is reachable in both modes: a
  // real recurring RSVP opens the real this-vs-whole-series prompt
  // (`scopeChoice` below) instead of cancelling outright. The plain path
  // calls the real DELETE /events/:slug/rsvp, which cancels a 'going' RSVP
  // exactly like `leaveWaitlist` cancels a 'waitlisted' one (same endpoint,
  // same effect either way).
  //
  // `softRemove` (optimistic row removal + "Undo" toast) only runs from the
  // mutation's `onSuccess` — cancelling a spot the backend refused to
  // release (e.g. the event already started) must leave the row in place,
  // not vanish under a false "released" toast.
  const cantGo = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (ev?.series) {
        setScope({ open: true, eventId: id, title: ev.title });
        return;
      }
      unrsvpMutation.mutate(
        { slug: id },
        { onSuccess: () => softRemove(id, t("myevents:toast.placeReleased")) },
      );
    },
    [byId, softRemove, t, unrsvpMutation],
  );
  const leaveWaitlist = useCallback(
    (id: string) => {
      unrsvpMutation.mutate(
        { slug: id },
        { onSuccess: () => softRemove(id, t("myevents:toast.leftWaitlist")) },
      );
    },
    [softRemove, t, unrsvpMutation],
  );
  const closeScope = useCallback(
    () => setScope((s) => ({ ...s, open: false })),
    [],
  );
  // MSG-16 — "just this date" cancels only this occurrence's RSVP (the
  // default `scope: "this"`, omitted); "leave whole series" cancels the
  // caller's own RSVP on this occurrence AND every future one in the series
  // (`scope: "future"` — see `RsvpService.cancelRsvp`, backend). Reachable
  // in both demo (a local-only no-op mutation, same as every other write
  // here) and live. As above, `softRemove` waits for the mutation to
  // actually succeed rather than firing alongside it.
  const scopeChoice = useCallback(
    (which: "one" | "all") => {
      const id = scope.eventId;
      setScope((s) => ({ ...s, open: false }));
      if (!id) return;
      if (which === "one") {
        unrsvpMutation.mutate(
          { slug: id },
          {
            onSuccess: () =>
              softRemove(id, t("myevents:toast.skippedThisOne")),
          },
        );
      } else {
        unrsvpMutation.mutate(
          { slug: id, scope: "future" },
          {
            onSuccess: () =>
              softRemove(id, t("myevents:toast.leftWholeSeries")),
          },
        );
      }
    },
    [scope.eventId, softRemove, t, unrsvpMutation],
  );

  return {
    setMaybe,
    setGoing,
    rsvpSaved,
    acceptInvite,
    declineInvite,
    cantGo,
    leaveWaitlist,
    softRemove,
    removingId,
    confirm,
    closeConfirm,
    scope,
    closeScope,
    scopeChoice,
  };
}
