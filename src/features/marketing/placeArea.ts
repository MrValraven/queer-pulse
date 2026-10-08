import type { TFunction } from "../../shared/i18n/types";
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

/** The city as the reader's language names it. A missing city and a stored
 *  "Lisbon" (the English name the server and the demo data keep) both read
 *  through the catalog ("Lisboa" in Portuguese); any other city shows as
 *  stored. Display only: the stored value is never rewritten. */
export function cityLabelOf(t: TFunction, city: string | null | undefined) {
  const trimmedCity = city?.trim() ?? "";
  if (trimmedCity === "" || trimmedCity.toLowerCase() === "lisbon") {
    return t("marketing:directory.city.lisbon");
  }
  return trimmedCity;
}

/** The neighbourhood and city that complete the address, each only when the
 *  street line doesn't already carry it (demo addresses end in "· Graça", or
 *  in the city under either its stored or its translated name).
 *  Shared by the address cell's copied address and the visit card's subline. */
export function placeAreaParts(place: DirectoryPlace, t: TFunction): string[] {
  const lowerStreet = placeStreetLine(place).toLowerCase();
  const storedCity = place.city?.trim() || "Lisbon";
  const isCityInStreet =
    lowerStreet.includes(storedCity.toLowerCase()) ||
    lowerStreet.includes(cityLabelOf(t, place.city).toLowerCase());
  const cityPart = isCityInStreet ? "" : cityLabelOf(t, place.city);
  return [place.hood, cityPart].filter(
    (part): part is string =>
      !!part?.trim() && !lowerStreet.includes(part.trim().toLowerCase()),
  );
}
