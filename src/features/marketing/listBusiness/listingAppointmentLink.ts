import { anyDayOpen, type ListingDraft } from "./listBusiness.data";
import type { ListingEntryMode } from "./listingFacts.data";
import { listingKindOf, normalizeMobileDetails } from "./listingMobile.data";

/**
 * An out-and-about listing answers "by appointment" twice: the hours toggle
 * "By appointment only" (no hours are kept) and "How do people get in?". The
 * two stay in step: either one set to by appointment sets the other, moving
 * the way in to anything else turns the toggle off, and turning the toggle
 * off clears an appointment-only way in back to "Not saying". A place has no
 * appointment toggle and an online listing no way in, so on those each
 * answer changes alone.
 */

const APPOINTMENT_ONLY: ListingEntryMode = "appointmentOnly";

function withToggle(
  draft: ListingDraft,
  isByAppointment: boolean,
): ListingDraft {
  return {
    ...draft,
    mobileDetails: {
      ...normalizeMobileDetails(draft.mobileDetails),
      byAppointment: isByAppointment,
    },
  };
}

/** "How do people get in?" changed. */
export function withEntryModeLinked(
  draft: ListingDraft,
  entryMode: ListingEntryMode | null,
): ListingDraft {
  const next = { ...draft, entryMode };
  if (listingKindOf(draft) !== "mobile") return next;
  const isByAppointment = entryMode === APPOINTMENT_ONLY;
  const isToggleOn = normalizeMobileDetails(draft.mobileDetails).byAppointment;
  return isToggleOn === isByAppointment
    ? next
    : withToggle(next, isByAppointment);
}

/** The hours toggle "By appointment only" changed. */
export function withByAppointmentLinked(
  draft: ListingDraft,
  isByAppointment: boolean,
): ListingDraft {
  const next = withToggle(draft, isByAppointment);
  if (listingKindOf(draft) !== "mobile") return next;
  if (isByAppointment) return { ...next, entryMode: APPOINTMENT_ONLY };
  return draft.entryMode === APPOINTMENT_ONLY
    ? { ...next, entryMode: null }
    : next;
}

/** Whether the draft keeps any opening hours: an open day, a note or a
 *  dated override. */
function hasKeptHours(draft: ListingDraft): boolean {
  return (
    anyDayOpen(draft.hours ?? {}) ||
    (draft.hoursNote ?? "").trim() !== "" ||
    (draft.hoursExceptions ?? []).length > 0
  );
}

/** A loaded or newly out-and-about draft whose two answers disagree: the
 *  toggle on with no way in gets "By appointment only" as its way in, and
 *  "By appointment only" with the toggle off turns the toggle on while the
 *  draft keeps no hours. A by-appointment listing sends an empty week, so
 *  turning the toggle on over kept hours would wipe them on the next save;
 *  that pair stays apart. Any other pair, and every place or online draft,
 *  comes back as the same object. */
export function withAppointmentAnswersInStep(
  draft: ListingDraft,
): ListingDraft {
  if (listingKindOf(draft) !== "mobile") return draft;
  const isToggleOn = normalizeMobileDetails(draft.mobileDetails).byAppointment;
  const entryMode = draft.entryMode ?? null;
  if (isToggleOn && entryMode === null) {
    return { ...draft, entryMode: APPOINTMENT_ONLY };
  }
  if (!isToggleOn && entryMode === APPOINTMENT_ONLY && !hasKeptHours(draft)) {
    return withToggle(draft, true);
  }
  return draft;
}
