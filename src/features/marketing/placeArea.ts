import { type DirectoryPlace } from "./directoryPlaces";

/** The street line, when the listing has a real one. Some listings arrive with
 *  no real street address: often the venue name repeated into the field. The
 *  street counts only when it is something other than the name. */
export function placeStreetLine(place: DirectoryPlace): string {
  const address = place.address?.trim() ?? "";
  const hasStreet =
    address !== "" && address.toLowerCase() !== place.name.trim().toLowerCase();
  return hasStreet ? address : "";
}

/** The neighbourhood and city that complete the address, each only when the
 *  street line doesn't already carry it (demo addresses end in "· Graça").
 *  Shared by the address cell's copied address and the visit card's subline. */
export function placeAreaParts(place: DirectoryPlace): string[] {
  const lowerStreet = placeStreetLine(place).toLowerCase();
  return [place.hood, place.city ?? "Lisbon"].filter(
    (part): part is string =>
      !!part?.trim() && !lowerStreet.includes(part.trim().toLowerCase()),
  );
}
