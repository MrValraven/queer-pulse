import { ApiError } from "../../../shared/api/client";

/**
 * Why a door check-in was refused (LOC-03).
 *
 * `POST /events/:slug/check-ins` answers 403 once a gathering is past its
 * attendance window, on both the tapped-name and the scanned-card variant.
 * Honouring it then would write a fresh `checked_in_at` onto a row the
 * retention sweep has already cleared, re-creating the exact personal data the
 * published privacy policy promises to have deleted and leaving one
 * re-identifying arrival among the erased ones.
 *
 * ## The contract: `code`, never the prose
 *
 * ```json
 * { "statusCode": 403, "error": "Forbidden",
 *   "code": "EVENT_ATTENDANCE_WINDOW_CLOSED",
 *   "message": "Arrivals are only recorded for 30 days after a gathering..." }
 * ```
 *
 * `code` is the contract; `message` is a human fallback for a client that has
 * not been taught the code, and the number inside it comes from a configurable
 * retention window. So the door renders its OWN copy
 * (`gatherings:door.checkInClosedNotice`) and reads nothing but the code, the
 * same way `classifyReportSubmissionError` reads `REPORT_FLOOD_CAP` and the
 * same way `INVITE_QUOTA_EXCEEDED`, `PLATFORM_LOCKED` and
 * `BANNED_FROM_COMMUNITY` are read elsewhere in this app. Matching English
 * prose breaks the moment the copy is reworded or localised.
 *
 * `DELETE /events/:slug/check-ins/:memberSlug` is deliberately NOT guarded and
 * keeps working past the window, so an undo affordance stays live on a cleared
 * row: refusing it would strand a stray arrival stamp the sweep has not reached
 * yet with nobody allowed to remove it.
 */

/** The backend's typed discriminator, mirroring
 *  `EVENT_ATTENDANCE_WINDOW_CLOSED_CODE` in its `events/event-attendance-window.ts`. */
const EVENT_ATTENDANCE_WINDOW_CLOSED_CODE = "EVENT_ATTENDANCE_WINDOW_CLOSED";

/**
 * Whether this failure is the deterministic "that gathering's check-in window
 * has closed" refusal, rather than something a second tap might get through.
 *
 * Pure and dependency-free so it can be unit tested and called from both the
 * mutation's own `onError` and the door's per-call handlers. Reads the parsed
 * body off `ApiError.data`, which the API client already filled in.
 *
 * Runs on the failure path only: the happy path never calls it, so a door desk
 * mid-gathering pays nothing for it.
 */
export function isAttendanceWindowClosed(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  return code === EVENT_ATTENDANCE_WINDOW_CLOSED_CODE;
}

/**
 * Round 3: the door's other five refusals, each now coded the same way
 * (`event-check-in-codes.ts` on the backend, sibling to
 * `EVENT_ATTENDANCE_WINDOW_CLOSED_CODE`) so none of them has to be told apart
 * by matching the server's own English sentence. `checkIn` by name and
 * `undoCheckIn` each resolve a member through their own lookup, so
 * `isMemberNotFound` (unmatched slug) reaches both, though only `checkIn`'s
 * lookup also refuses a non-active account; `checkIn` by card never raises it
 * at all, since a scanned card that fails to verify raises `isCardUnreadable`
 * instead. `checkIn` and `undoCheckIn` can each find the resolved member
 * missing from the guest list (`isNotOnGuestList`), though only `checkIn`
 * additionally verifies the RSVP status that produces `isCheckInWaitlisted`
 * and `isCheckInMaybe`.
 */
const CHECK_IN_CARD_UNREADABLE_CODE = "CHECK_IN_CARD_UNREADABLE";
const CHECK_IN_WAITLISTED_CODE = "CHECK_IN_WAITLISTED";
const CHECK_IN_MAYBE_CODE = "CHECK_IN_MAYBE";
const CHECK_IN_NOT_ON_GUEST_LIST_CODE = "CHECK_IN_NOT_ON_GUEST_LIST";
const CHECK_IN_MEMBER_NOT_FOUND_CODE = "CHECK_IN_MEMBER_NOT_FOUND";

/** The same `error.data.code` read `isAttendanceWindowClosed` does above, for
 *  the five predicates below. Not exported: a caller asks for one of the
 *  named predicates below, keeping the raw code string private to this
 *  file. */
function checkInCode(error: unknown): unknown {
  if (!(error instanceof ApiError)) return undefined;
  return (error.data as { code?: unknown } | null | undefined)?.code;
}

/**
 * `resolveByCardToken` (400): the scanned code never verified to a card at
 * all, for any of several reasons (malformed, tampered, wrong signing key,
 * superseded version, missing card, missing programme, missing community).
 * One message for all of them there, so one message for all of them here.
 */
export function isCardUnreadable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    checkInCode(error) === CHECK_IN_CARD_UNREADABLE_CODE
  );
}

/** `checkIn` (400), reachable by name or by card: the member resolved fine,
 *  but their RSVP for this gathering is `Waitlisted`, so the host has a seat
 *  decision to make before this desk can honour the tap. */
export function isCheckInWaitlisted(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    checkInCode(error) === CHECK_IN_WAITLISTED_CODE
  );
}

/** `checkIn` (400), reachable by name or by card: the member resolved fine,
 *  but their RSVP for this gathering is `Maybe`, so no seat is held for them
 *  yet. */
export function isCheckInMaybe(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    checkInCode(error) === CHECK_IN_MAYBE_CODE
  );
}

/** `checkIn` (by name or by card) and `undoCheckIn` (404): the member
 *  resolved fine, but has no RSVP row for this gathering. `checkIn` treats a
 *  cancelled RSVP the same way; `undoCheckIn` does not check RSVP status at
 *  all, so it only throws when the row is missing outright. */
export function isNotOnGuestList(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    checkInCode(error) === CHECK_IN_NOT_ON_GUEST_LIST_CODE
  );
}

/**
 * `checkIn` (by name) and `undoCheckIn` (404): the tapped slug does not
 * resolve to a profile. `checkIn`'s resolver (`resolveByMemberSlugForCheckIn`)
 * also folds in a profile whose account is no longer active, so unknown and
 * non-active collapse into the one code: whether a member was suspended or is
 * deactivating their own account is exactly the kind of status the platform
 * keeps private from other members everywhere else, and this door does not
 * spell it out either. `undoCheckIn`'s resolver (`resolveByMemberSlug`) only
 * checks that the profile exists, whatever the account's status: an undo only
 * clears a timestamp a host already recorded, so it stays available there.
 */
export function isMemberNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    checkInCode(error) === CHECK_IN_MEMBER_NOT_FOUND_CODE
  );
}
