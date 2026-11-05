import type {
  ManagedListingItem,
  ManagedListingMeetingPoint,
} from "../marketing/listBusiness/api/managedListings.api";
import { HOODS } from "./createGathering.data";
import { ONLINE_HOOD_VALUE } from "./steps/dateNotes.data";
import type { VenueSelection } from "./VenuePicker";

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

/** The venue a "Run by" pick linked on its own, remembered so a later pick
 *  can tell it apart from a venue the host chose. */
export interface RunByLinkedVenue {
  listingId: string;
  slug: string;
}

/** What a "Run by" pick does to the venue: the new venue to set, if any, and
 *  the auto-linked venue to remember from now on. */
export interface RunByVenueChange {
  /** Absent when the venue stays as it is. */
  selection?: VenueSelection;
  linkedVenue: RunByLinkedVenue | null;
}

const EMPTY_VENUE: VenueSelection = {
  text: "",
  listingId: null,
  venueListing: null,
};

/**
 * A business with a door runs the gathering at its own address unless the
 * host says otherwise, so picking a place business links it as the venue,
 * the way the venue picker links a directory listing. The venue's address
 * then fills in through `useVenueAddress`.
 *
 * Only an empty venue, or the venue an earlier pick linked and the host has
 * left alone, is touched. A venue the host picked or typed stays. Moving the
 * pick to another business, or to none, takes the earlier auto-linked venue
 * away with it. Online and mobile businesses link nothing, and an online
 * gathering has no venue at all.
 */
export function runByVenueChange(
  current: Pick<VenueSelection, "text" | "venueListing"> & { hood: string },
  linkedVenue: RunByLinkedVenue | null,
  picked: ManagedListingItem | null,
): RunByVenueChange {
  const isStillAutoLinked =
    linkedVenue !== null && current.venueListing?.slug === linkedVenue.slug;
  const isVenueEmpty =
    current.text.trim() === "" && current.venueListing === null;
  const isLinkable =
    picked !== null &&
    picked.kind === "place" &&
    current.hood !== ONLINE_HOOD_VALUE;
  if (isLinkable && (isVenueEmpty || isStillAutoLinked)) {
    return {
      selection: {
        text: picked.name,
        listingId: picked.id,
        venueListing: { slug: picked.slug, name: picked.name },
      },
      linkedVenue: { listingId: picked.id, slug: picked.slug },
    };
  }
  if (isStillAutoLinked) return { selection: EMPTY_VENUE, linkedVenue: null };
  return { linkedVenue: null };
}
