import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  checkInAttendee,
  undoCheckIn,
  type CheckInResultDTO,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import { attendeeToRow } from "./events.adapters";
import { isAttendanceWindowClosed } from "./checkInError";
import type { AttendeesResult } from "./useAttendees";

/** What the door is asking for: a name the host tapped, or a card they read. */
export type CheckInInput = { memberSlug: string } | { cardToken: string };

/**
 * The door (LOC-03).
 *
 * OPTIMISTIC, THEN RECONCILED. A host standing in front of a queue taps a name
 * and the row has to change under their thumb, so the cached roster is patched
 * immediately. The server answers with the attendee's real row plus the four
 * counts it computed itself, and that answer replaces the guess. A failure
 * rolls the row back and the caller raises it: a check-in that silently did
 * not happen is worse than one that visibly failed, because the host walks
 * away believing the list is right.
 *
 * Only a name can be checked in optimistically. A scanned card names nobody
 * until the server has read it, so that path simply waits.
 *
 * Demo mode never reaches the network: the demo dashboard keeps its own local
 * guest state, exactly as the prototype always did.
 */
export function useCheckIn(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = eventKeys.attendees(slug, demoMode);

  return useMutation<
    CheckInResultDTO | void,
    Error,
    CheckInInput,
    { previous: AttendeesResult | undefined }
  >({
    // The dashboard shows its own failure in place, next to the name that did
    // not go through, so the global duplicate toast stays quiet.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) return;
      return checkInAttendee(slug, input);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AttendeesResult>(key);
      if (previous && "memberSlug" in input) {
        queryClient.setQueryData<AttendeesResult>(
          key,
          patchArrival(previous, input.memberSlug, new Date()),
        );
      }
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
      // A closed attendance window means this tab is looking at a stale
      // roster: the gathering crossed its retention boundary while the page
      // sat open, or it was opened for a gathering that was already past it.
      // Refetch so the count flips to "no longer recorded" and the door's
      // affordances go with it, instead of leaving a live-looking button that
      // the server will refuse again. Failure path only, so the door's hot
      // path is untouched.
      if (isAttendanceWindowClosed(error)) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      applyServerResult(queryClient, key, result);
    },
  });
}

/** DELETE /events/:slug/check-ins/:memberSlug — undo, for the tap that landed
 *  on the wrong name. */
export function useUndoCheckIn(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = eventKeys.attendees(slug, demoMode);

  return useMutation<
    CheckInResultDTO | void,
    Error,
    string,
    { previous: AttendeesResult | undefined }
  >({
    meta: { silentError: true },
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      return undoCheckIn(slug, memberSlug);
    },
    onMutate: async (memberSlug) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AttendeesResult>(key);
      if (previous) {
        queryClient.setQueryData<AttendeesResult>(
          key,
          patchArrival(previous, memberSlug, null),
        );
      }
      return { previous };
    },
    onError: (_error, _memberSlug, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (result) => {
      if (!result) return;
      applyServerResult(queryClient, key, result);
    },
  });
}

/** Move one attendee's arrival stamp, and the door's arrived count with it. */
function patchArrival(
  roster: AttendeesResult,
  memberSlug: string,
  checkedInAt: Date | null,
): AttendeesResult {
  let delta = 0;
  const going = roster.going.map((attendee) => {
    if (attendee.slug !== memberSlug) return attendee;
    const wasHere = attendee.checkedInAt != null;
    const isHere = checkedInAt != null;
    if (wasHere !== isHere) delta = isHere ? 1 : -1;
    return { ...attendee, checkedInAt };
  });
  return {
    ...roster,
    going,
    // A count the platform no longer keeps stays unkept. `null + 1` is `1`,
    // which would conjure an arrival total for a gathering whose check-in
    // records were cleared. The live door always holds a real number here, so
    // this costs one comparison on the hot path.
    checkedInCount:
      roster.checkedInCount === null
        ? null
        : Math.max(0, roster.checkedInCount + delta),
  };
}

/** Replace the guess with the server's own row and its own four counts. */
function applyServerResult(
  queryClient: ReturnType<typeof useQueryClient>,
  key: readonly unknown[],
  result: CheckInResultDTO,
): void {
  queryClient.setQueryData<AttendeesResult>(key, (current) => {
    if (!current) return current;
    const index = current.going.findIndex(
      (attendee) => attendee.slug === result.attendee.slug,
    );
    const going = [...current.going];
    if (index >= 0) {
      // Keep the row's existing avatar tint (it is derived from its position
      // in the list) and take everything else from the server.
      const row = attendeeToRow(result.attendee, index);
      going[index] = {
        ...row,
        background: going[index]!.background,
        color: going[index]!.color,
      };
    }
    return {
      ...current,
      going,
      goingCount: result.goingCount,
      seatsTaken: result.seatsTaken,
      waitlistCount: result.waitlistCount,
      // The server's own answer, null included: it decides from the
      // gathering's date whether a check-in count can still be stated.
      checkedInCount: result.checkedInCount,
    };
  });
}
