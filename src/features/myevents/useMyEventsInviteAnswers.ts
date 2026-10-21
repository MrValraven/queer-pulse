import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import type {
  AcceptInviteDetailsDto,
  RespondInviteResultDTO,
} from "../gatherings/api/events.api";
import type { MyEvent } from "./myEvents.types";
import { joinWhenParts, myEventWhen } from "./myEvents.when";
import type { MyEventsRsvpMutations } from "./useMyEventsRsvpMutations";

/** What the accept modal hears back once the server has answered. */
export interface AcceptInviteCallbacks {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

/** The "you said yes" dialog. `isWaitlisted` swaps its eyebrow and title when
 *  the accept landed on a full event's waitlist. */
export interface AcceptConfirmState {
  open: boolean;
  title: string;
  meta: string;
  isWaitlisted: boolean;
}

interface InviteAnswersDeps {
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  byId: (id: string) => MyEvent | undefined;
  softRemove: (id: string, msg: string) => void;
  respondInviteMutation: MyEventsRsvpMutations["respondInviteMutation"];
  t: TFunction;
  fmt: Formatters;
}

export interface MyEventsInviteAnswers {
  acceptInvite: (
    id: string,
    details: AcceptInviteDetailsDto,
    callbacks: AcceptInviteCallbacks,
  ) => void;
  declineInvite: (id: string) => void;
  confirm: AcceptConfirmState;
  closeConfirm: () => void;
}

/** The "N going" attendee line, or nothing when the count is hidden. */
export function goingWhoText(
  goingCount: number | undefined,
  t: TFunction,
): string | undefined {
  if (typeof goingCount !== "number") return undefined;
  return t("myevents:badges.goingCount", { count: goingCount });
}

/** The confirm dialog's lines for an accepted invite. */
function acceptConfirmFor(
  ev: MyEvent,
  isWaitlisted: boolean,
  fmt: Formatters,
  t: TFunction,
): AcceptConfirmState {
  const when = myEventWhen(ev, fmt, t, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return {
    open: true,
    title: ev.title,
    meta: `${when.dateText} · ${joinWhenParts(when.timeText, when.nextDayNote)} · ${ev.venue}`,
    isWaitlisted,
  };
}

/** The invite card once accepted: on the waitlist when the server put the
 *  member there, going otherwise. Demo sends no RSVP back and reads as going. */
function acceptedInviteEvent(
  ev: MyEvent,
  acceptedRsvp: RespondInviteResultDTO["rsvp"],
  t: TFunction,
): MyEvent {
  if (acceptedRsvp?.status === "waitlisted") {
    return {
      ...ev,
      category: "waitlisted",
      position: acceptedRsvp.waitlistPosition ?? undefined,
    };
  }
  return {
    ...ev,
    category: "going",
    whoText: goingWhoText(ev.going, t),
    who: [["YOU", "coral"]],
  };
}

/**
 * Answering an invite from My Events: accept (with the details the modal
 * collected first) and decline, plus the "you said yes" confirm state.
 *
 * `id` here is the INVITE id, which `eventInviteToMyEvent`
 * (myEvents.adapters.ts) uses as the "invite" category's `MyEvent.id`, since a
 * pending invite has no RSVP row of its own yet. `respondInviteMutation`
 * (PATCH /event-invites/:id) is the matching endpoint.
 */
export function useMyEventsInviteAnswers({
  setEvents,
  byId,
  softRemove,
  respondInviteMutation,
  t,
  fmt,
}: InviteAnswersDeps): MyEventsInviteAnswers {
  const [confirm, setConfirm] = useState<AcceptConfirmState>({
    open: false,
    title: "",
    meta: "",
    isWaitlisted: false,
  });

  // The details modal sends the visibility choice and answers with the
  // accept, so the RSVP the server writes carries them from the start. The
  // "you're confirmed" dialog and the category patch are the success
  // affordance, so both wait for `onSuccess`: an already-answered or withdrawn
  // invite (the server answers 409) must never show a false "you're in"
  // screen. `onError` leaves the invite row as it was so the member can retry.
  // The server reports whether the accept landed on the waitlist; demo has no
  // result and reads as going.
  const acceptInvite = useCallback(
    (
      id: string,
      details: AcceptInviteDetailsDto,
      callbacks: AcceptInviteCallbacks,
    ) => {
      const ev = byId(id);
      if (!ev) {
        // The card left the list while the modal was open. Answer the modal
        // so its Accept button lets go.
        callbacks.onError(new Error("Invite not found"));
        return;
      }
      respondInviteMutation.mutate(
        { id, action: "accept", details },
        {
          onSuccess: (result) => {
            const acceptedRsvp = result ? result.rsvp : null;
            const isWaitlisted = acceptedRsvp?.status === "waitlisted";
            setConfirm(acceptConfirmFor(ev, isWaitlisted, fmt, t));
            setEvents((previous) =>
              previous.map((event) =>
                event.id === id
                  ? acceptedInviteEvent(event, acceptedRsvp, t)
                  : event,
              ),
            );
            callbacks.onSuccess();
          },
          onError: callbacks.onError,
        },
      );
    },
    [byId, fmt, respondInviteMutation, setEvents, t],
  );
  const closeConfirm = useCallback(
    () => setConfirm((current) => ({ ...current, open: false })),
    [],
  );
  // `softRemove` (the optimistic row removal + "Undo" toast) only runs once
  // `respondInviteMutation` actually succeeds. A failed decline (the invite
  // was already answered elsewhere, say) leaves the invite row visible, since
  // the call never took effect on the server.
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

  return { acceptInvite, declineInvite, confirm, closeConfirm };
}
