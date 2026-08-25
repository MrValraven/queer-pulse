import { type DirectoryPlace } from "./directoryPlaces";
import { GOODFOR_LABEL_KEYS } from "./listBusiness/listBusiness.data";

const ACCESS_KEYWORDS = [
  "wheelchair",
  "step-free",
  "step free",
  "gender-neutral",
  "gender neutral",
  "accessible",
  "ramp",
  "lift access",
  "ground floor",
  "quiet",
  "low-sensory",
];

function matchesAccessKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ACCESS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/** The canonical amenity ids on this listing that are both switched on and
 *  accessibility-flavoured, in the order the owner's own `goodFor` list holds
 *  them. Exported so a section wrapper can ask "is there anything to say
 *  here?" without duplicating the filter or rendering an empty heading. */
export function accessibilityLabelIds(place: DirectoryPlace): string[] {
  return place.goodFor
    .filter(
      (item) =>
        item.yes &&
        GOODFOR_LABEL_KEYS[item.label] &&
        matchesAccessKeyword(item.label),
    )
    .map((item) => item.label);
}
