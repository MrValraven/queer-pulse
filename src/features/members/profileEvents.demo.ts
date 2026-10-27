import { calendarEvents, gatheringDetails } from "../gatherings/data";
import { filterDemoEvents } from "../gatherings/api/useEvents";
import type {
  ProfileEventItem,
  ProfileEventsVM,
} from "./api/profileEvents.adapters";

/** The live endpoint's caps, so demo lists stay the same length as live. */
const UPCOMING_CAP = 12;
const PAST_CAP = 6;

function asHostItem(event: ProfileEventItem["event"]): ProfileEventItem {
  return { event, role: "host" };
}

/**
 * The demo answer to `GET /profiles/:slug/events`. A demo board row carries no
 * host (its `hostSlug` is live only), so each row is matched by slug to its
 * `gatheringDetails` entry, which names the host. The time split is the one
 * the demo Events Hub uses. The demo registry has no co-hosts, so every row
 * reads as hosted.
 */
export function demoProfileEvents(
  memberSlug: string,
  now: Date,
): ProfileEventsVM {
  if (memberSlug === "") return { upcoming: [], past: [] };
  const hostedRows = calendarEvents.filter(
    (event) =>
      event.slug !== undefined &&
      gatheringDetails[event.slug]?.hostSlug === memberSlug,
  );
  const upcoming = filterDemoEvents(hostedRows, "upcoming", undefined, now)
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, UPCOMING_CAP)
    .map(asHostItem);
  const past = filterDemoEvents(hostedRows, "past", undefined, now)
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .slice(0, PAST_CAP)
    .map(asHostItem);
  return { upcoming, past };
}
