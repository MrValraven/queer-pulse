import type { TFunction } from "../../../shared/i18n/types";
import {
  isCardUnreadable,
  isCheckInMaybe,
  isCheckInWaitlisted,
  isMemberNotFound,
  isNotOnGuestList,
} from "../api/checkInError";

/**
 * Translating a door refusal into copy, kept out of `LiveDoorDashboard.tsx`
 * itself so that component stays under this repo's 200-line function cap.
 *
 * Never the server's own English sentence: a coded failure gets this
 * screen's own translated copy, keyed off the same `error.data.code` field
 * `isAttendanceWindowClosed` reads (that one predicate stays read directly in
 * the component, since it drives a whole UI state change: the sticky
 * closed-window notice). An uncoded failure falls back to the plain retry
 * toast.
 */
function genericFailureMessage(t: TFunction): string {
  return t("gatherings:door.failedToast");
}

/**
 * Shown as a toast from check-in by name. It resolves a member first, so it
 * can come back "no such member" or "resolved, but never on the guest list",
 * then verifies the resolved member's RSVP, so it can additionally come back
 * waitlisted or maybe.
 */
export function checkInFailureToast(t: TFunction, error: unknown): string {
  if (isMemberNotFound(error)) {
    return t("gatherings:door.checkInRefusedToast");
  }
  if (isNotOnGuestList(error)) {
    return t("gatherings:door.checkInNotOnListToast");
  }
  if (isCheckInWaitlisted(error)) {
    return t("gatherings:door.checkInWaitlistedToast");
  }
  if (isCheckInMaybe(error)) {
    return t("gatherings:door.checkInMaybeToast");
  }
  return genericFailureMessage(t);
}

/**
 * Shown as a toast from undo. Undo resolves a member the same plain way (no
 * account-status check, unlike check-in) and then only confirms an RSVP row
 * exists, so it can come back "no such member" or "resolved, but never on
 * the guest list", each with its own copy written for an undo. A host who
 * just tapped Undo, and watched the row roll back to "arrived", reads
 * check-in's own copy as describing the wrong action.
 */
export function undoFailureToast(t: TFunction, error: unknown): string {
  if (isMemberNotFound(error)) {
    return t("gatherings:door.undoRefusedToast");
  }
  if (isNotOnGuestList(error)) {
    return t("gatherings:door.checkInNotOnListToast");
  }
  return genericFailureMessage(t);
}

/**
 * Shown inline in the scan modal's own field, alongside its camera-permission
 * hints (`door.scan.*Hint`). A scanned card can additionally fail to verify
 * at all, which check-in by name never can.
 */
export function cardScanFailureHint(t: TFunction, error: unknown): string {
  if (isCardUnreadable(error)) {
    return t("gatherings:door.scan.cardUnreadableHint");
  }
  if (isNotOnGuestList(error)) {
    return t("gatherings:door.scan.checkInNotOnListHint");
  }
  if (isCheckInWaitlisted(error)) {
    return t("gatherings:door.scan.checkInWaitlistedHint");
  }
  if (isCheckInMaybe(error)) {
    return t("gatherings:door.scan.checkInMaybeHint");
  }
  return genericFailureMessage(t);
}
