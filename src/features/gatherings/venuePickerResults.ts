import type { DirectoryPlace } from "../marketing/directoryPlaces";

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

/** A venue is a place people can walk into. Online-only listings have no
 *  door, and the server refuses them and 18+ listings as a venue, so neither
 *  is offered. A place that also sells online keeps its door and stays. */
function isAttachableVenue(place: DirectoryPlace): boolean {
  return place.online !== true && place.isAdultsOnly !== true;
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
