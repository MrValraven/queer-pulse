import type { DirectoryPlace } from "../marketing/directoryPlaces";
import { listingKindOf } from "../marketing/listBusiness/listingMobile.data";

const MAX_RESULTS = 8;

function matchesQuery(place: DirectoryPlace, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return (
    place.name.toLowerCase().includes(normalizedQuery) ||
    place.hood.toLowerCase().includes(normalizedQuery) ||
    place.cat.toLowerCase().includes(normalizedQuery)
  );
}

/** A venue is somewhere people walk into. Online-only and out-and-about
 *  listings have no door, and the server refuses them and 18+ listings as a
 *  venue, so none is offered. An out-and-about business links to a gathering
 *  through "Run by" instead. A place that also sells online keeps its door and
 *  stays. */
function isAttachableVenue(place: DirectoryPlace): boolean {
  return (
    place.online !== true &&
    listingKindOf(place) !== "mobile" &&
    place.isAdultsOnly !== true
  );
}

/** True when `query` names a listing the picker hides because it is online
 *  only or out and about, so the host can be pointed to "Run by". An 18+
 *  listing does not count: "Run by" would not take it either. */
export function hasHiddenRunByMatch(
  places: readonly DirectoryPlace[],
  query: string,
): boolean {
  if (!query.trim()) return false;
  return places.some(
    (place) =>
      !isAttachableVenue(place) &&
      place.isAdultsOnly !== true &&
      matchesQuery(place, query),
  );
}

/** The directory places `VenuePicker` offers for `query`, capped at `limit`:
 *  eight for the dropdown's popover, more for the inline layout's tall list. */
export function venuePickerResults(
  places: readonly DirectoryPlace[],
  query: string,
  limit: number = MAX_RESULTS,
): DirectoryPlace[] {
  return places
    .filter((place) => isAttachableVenue(place) && matchesQuery(place, query))
    .slice(0, limit);
}
