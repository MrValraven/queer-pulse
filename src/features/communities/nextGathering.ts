import { gatheringDetails } from "../gatherings/data";
import type { SpotsLabel } from "../gatherings/data";
import type { CommunityDetail } from "./communityDetails";
import type { CommunityEvent } from "./community.model";

// A flagship community's next gathering IS a real entry in the gatherings
// registry, so both the sidebar "Next Gathering" card and the Events tab derive
// their upcoming event from it here — the card, the tab row and their RSVP
// destination (`/gatherings/:slug`) then always describe the same event.

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * A plain-English rendering of a gathering's spots label. The gathering page
 * resolves the same `SpotsLabel` through i18n (`spotsText`), but the community
 * cards — like the rest of the English-only demo registry — show a flat string,
 * so we map the small set of keys the flagship gatherings use.
 */
function spotsPlain(spots: SpotsLabel): string {
  const count = spots.values?.count;
  switch (spots.key) {
    case "gatherings:spots.seatsLeft":
      return `${count} seats left`;
    case "gatherings:spots.going":
      return `${count} going`;
    case "gatherings:spots.allPaces":
      return "All paces welcome";
    case "gatherings:spots.familyFriendly":
      return "Family-friendly";
    case "gatherings:spots.online":
      return "Online";
    case "gatherings:spots.ages1625":
      return "Ages 16–25";
    case "gatherings:spots.openToAll":
    default:
      return "Open to all";
  }
}

/** Fields shared by both event shapes, mirrored from a real gathering. The
 *  organiser is already shown separately in the community UI, so the meta line
 *  stays to weekday + neighbourhood. */
function fieldsFromGathering(slug: string) {
  const gathering = gatheringDetails[slug]!;
  const date = gathering.date;
  return {
    slug,
    dd: String(date.getDate()),
    mm: MONTHS_SHORT[date.getMonth()]!,
    title: gathering.title,
    meta: `${WEEKDAYS_LONG[date.getDay()]} · ${gathering.hood}`,
    spots: spotsPlain(gathering.spots),
  };
}

/** The sidebar "Next Gathering" card, mirrored from a real gathering. */
export function nextEventFromGathering(
  slug: string,
): CommunityDetail["nextEvent"] {
  return fieldsFromGathering(slug);
}

/** An Events-tab row, mirrored from a real gathering (carries a stable id). */
export function communityEventFromGathering(
  id: string,
  slug: string,
): CommunityEvent {
  return { id, ...fieldsFromGathering(slug) };
}
