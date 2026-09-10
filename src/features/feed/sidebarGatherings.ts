import { gatheringHasEnded, type CalendarEvent } from "../gatherings/data";
import type { SidebarGathering } from "./feed.data";

/** How many rows the sidebar's "Upcoming" widget shows. */
const SIDEBAR_GATHERING_LIMIT = 3;

/**
 * The feed sidebar's "Upcoming" rows: the gatherings the viewer is going to
 * that have not ended, soonest first, capped to a short list.
 *
 * The cut is the END instant. This used to keep only gatherings whose START
 * was still ahead, so a gathering the member is going to TONIGHT dropped out
 * of the widget the moment its doors opened, which is the one moment they most
 * need the link to it. A gathering with no stated end reads exactly as it did
 * before, since `gatheringHasEnded` treats its start as its end.
 */
export function pickSidebarGatherings(
  events: CalendarEvent[],
  now: Date,
  limit: number = SIDEBAR_GATHERING_LIMIT,
): SidebarGathering[] {
  return events
    .filter((event) => !gatheringHasEnded(event, now))
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, limit)
    .map((event) => ({
      to: event.to,
      date: event.date,
      name: event.title,
      venue: event.hood,
    }));
}
