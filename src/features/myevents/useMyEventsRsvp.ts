import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import type { MyEvent } from "./myEvents.types";
import {
  goingWhoText,
  useMyEventsInviteAnswers,
  type MyEventsInviteAnswers,
} from "./useMyEventsInviteAnswers";
import { useMyEventsRsvpMutations } from "./useMyEventsRsvpMutations";
import { useMyEventsSoftRemove } from "./useMyEventsSoftRemove";

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

/** The invite answers (accept, decline and the confirm dialog) come from
 *  `useMyEventsInviteAnswers` and are spread in unchanged. */
export interface MyEventsRsvp extends MyEventsInviteAnswers {
  setMaybe: (id: string) => void;
  setGoing: (id: string) => void;
  rsvpSaved: (id: string) => void;
  cantGo: (id: string) => void;
  leaveWaitlist: (id: string) => void;
  softRemove: (id: string, msg: string) => void;
  removingId: string | null;
  scope: { open: boolean; eventId: string | null; title: string };
  closeScope: () => void;
  scopeChoice: (which: "one" | "all") => void;
}

/**
 * RSVP lifecycle: reminders, maybe/going toggles, invite accept/decline,
 * can't-go / leave-waitlist (with the series-scope prompt), and the shared
 * soft-remove-with-undo. Scope modal state lives here too.
 *
 * The dual-mode mutations live in `useMyEventsRsvpMutations`, the
 * soft-remove-with-undo primitive in `useMyEventsSoftRemove`, and the invite
 * answers with their confirm state in `useMyEventsInviteAnswers`. All three
 * are composed in below.
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
  const { rsvpMutation, unrsvpMutation, respondInviteMutation } =
    useMyEventsRsvpMutations();
  const { softRemove, removingId } = useMyEventsSoftRemove({
    events,
    setEvents,
    toast,
    toastAction,
    t,
  });

  const inviteAnswers = useMyEventsInviteAnswers({
    setEvents,
    byId,
    softRemove,
    respondInviteMutation,
    t,
    fmt,
  });

  const [scope, setScope] = useState<{
    open: boolean;
    eventId: string | null;
    title: string;
  }>({ open: false, eventId: null, title: "" });

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
          onError: () =>
            patch(id, (e) => ({ ...e, maybe: prevMaybe ?? false })),
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
          onError: () =>
            patch(id, (e) => ({ ...e, maybe: prevMaybe ?? false })),
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
        // in the member's language and pluralizes properly. A gathering whose
        // host hid the count carries no `going`, and gets no attendee line.
        whoText: goingWhoText(e.going, t),
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
            onSuccess: () => softRemove(id, t("myevents:toast.skippedThisOne")),
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
    cantGo,
    leaveWaitlist,
    softRemove,
    removingId,
    ...inviteAnswers,
    scope,
    closeScope,
    scopeChoice,
  };
}
