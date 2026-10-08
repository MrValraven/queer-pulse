import type {
  ManagedListingItem,
  ManagedListingMeetingPoint,
} from "../marketing/listBusiness/api/managedListings.api";
import { HOODS } from "./createGathering.data";
import { ONLINE_HOOD_VALUE } from "./steps/dateNotes.data";

/** What a gathering shows of the business that runs it. */
export interface RunByListingView {
  ref: string;
  slug: string;
  name: string;
}

/** A pick in the "Run by" picker: the id a save sends, and what the screen
 *  shows meanwhile. Both null means "No business". */
export interface RunBySelection {
  listingId: string | null;
  listing: RunByListingView | null;
}

/** The manage overview's "Run by" row id (see `OverviewDetailRows`). */
export const RUN_BY_DETAIL_ROW_ID = "runBy";

export function runBySelectionOf(
  item: ManagedListingItem | null,
): RunBySelection {
  if (!item) return { listingId: null, listing: null };
  return {
    listingId: item.id,
    listing: { ref: item.ref, slug: item.slug, name: item.name },
  };
}

const OTHER_IN_LISBON_VALUE = "Other in Lisbon";

/** A listing neighbourhood as the gathering form's own list reads it. That
 *  list is shorter, so anything it lacks files under "Other in Lisbon". */
export function hoodValueForListingHood(hood: string): string {
  return HOODS.some((option) => option.value === hood)
    ? hood
    : OTHER_IN_LISBON_VALUE;
}

/**
 * What picking a business with a meeting point fills in: only the fields
 * the host has left empty, so nothing they typed is lost, and nothing at all
 * for an online gathering, which has no door.
 */
export function meetingPointPrefill(
  current: { hood: string; address: string },
  meetingPoint: ManagedListingMeetingPoint | null,
): { hood?: string; address?: string } {
  if (!meetingPoint || current.hood === ONLINE_HOOD_VALUE) return {};
  return {
    ...(current.hood === "" && meetingPoint.hood
      ? { hood: hoodValueForListingHood(meetingPoint.hood) }
      : {}),
    ...(current.address.trim() === "" && meetingPoint.address
      ? { address: meetingPoint.address }
      : {}),
  };
}
