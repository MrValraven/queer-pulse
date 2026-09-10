import { gatheringHasEnded, type CalendarEvent } from "../gatherings/data";

/** How many gatherings the /arriving "Your first step" section shows. */
export const ARRIVING_SHOWN_COUNT = 2;

/**
 * The next two gatherings for the /arriving section, soonest first.
 *
 * Split out of `ArrivingGatherings.tsx` so that file only exports components
 * (react-refresh/only-export-components), the same reason `sameDay` lives
 * beside `CalendarGrid.tsx` rather than inside it.
 *
 * The cut is the END instant. This used to keep only gatherings whose START
 * was still ahead, so a gathering running right now dropped off the page while
 * it was happening, and `filter=upcoming` deliberately sends those. A gathering
 * with no stated end reads exactly as it did before, since `gatheringHasEnded`
 * treats its start as its end.
 *
 * `isDemoRegistry` covers one honest exception: the demo registry is a frozen
 * fixture whose gatherings are dated to a fixed prototype season, so once real
 * time passes it every date is behind us. Demo mode then shows the two earliest
 * rows so the prototype still paints. Live mode never falls back: an empty
 * upcoming list renders the empty state and says so.
 *
 * `now` is a parameter so a test can pin the clock. Callers pass none.
 */
export function pickNextGatherings(
  events: CalendarEvent[],
  isDemoRegistry: boolean,
  now: Date = new Date(),
): CalendarEvent[] {
  const sorted = [...events].sort(
    (first, second) => first.date.getTime() - second.date.getTime(),
  );
  const stillToCome = sorted.filter((event) => !gatheringHasEnded(event, now));
  if (stillToCome.length > 0) return stillToCome.slice(0, ARRIVING_SHOWN_COUNT);
  return isDemoRegistry ? sorted.slice(0, ARRIVING_SHOWN_COUNT) : [];
}
