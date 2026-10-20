import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getFlashDayEventOptions } from "./subprofiles.api";
import type { FlashDayEventRef } from "./subprofiles.api";

/** Upcoming events soonest first, then past events newest first. */
export function compareFlashDayEventRefs(
  left: FlashDayEventRef,
  right: FlashDayEventRef,
  now: number,
): number {
  const leftStart = new Date(left.startsAt).getTime();
  const rightStart = new Date(right.startsAt).getTime();
  const isLeftUpcoming = leftStart >= now;
  const isRightUpcoming = rightStart >= now;
  if (isLeftUpcoming !== isRightUpcoming) return isLeftUpcoming ? -1 : 1;
  return isLeftUpcoming ? leftStart - rightStart : rightStart - leftStart;
}

function toIsoOrNull(date: string, clock: string | undefined): string | null {
  if (!clock) return null;
  const parsed = new Date(`${date}T${clock}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Demo options with no network: the events the demo member hosts (going
 *  RSVPs never qualify), read from the My Events registry. */
export async function buildDemoFlashDayEventOptions(
  now: number = Date.now(),
): Promise<FlashDayEventRef[]> {
  const { INITIAL_EVENTS } = await import("../../myevents/myEvents.mock");
  const eventRefs: FlashDayEventRef[] = [];
  for (const event of INITIAL_EVENTS) {
    if (event.category !== "hosting" || event.cancelled || !event.slug)
      continue;
    const startsAt = toIsoOrNull(event.date, event.start || "00:00");
    if (startsAt === null) continue;
    eventRefs.push({
      slug: event.slug,
      title: event.title,
      startsAt,
      endsAt: toIsoOrNull(event.endDate ?? event.date, event.end),
      venue: event.venue || null,
      neighbourhood: null,
      isOnline: Boolean(event.online),
      imageUrl: null,
    });
  }
  return eventRefs.sort((left, right) =>
    compareFlashDayEventRefs(left, right, now),
  );
}

/**
 * The events a flash day may link to: the ones the persona's owner hosts,
 * co-hosts or performs at. Dual-mode: live calls
 * `GET /subprofiles/:id/flash-day-event-options`, demo derives the list from
 * the lazily imported My Events registry. The key has its own root so the
 * many `["subprofile", ...]` invalidations never touch it.
 */
export function useFlashDayEventOptions(
  subprofileId: string,
  isEnabled: boolean,
) {
  const { demoMode } = useDemoMode();
  return useQuery<FlashDayEventRef[]>({
    queryKey: ["subprofileFlashDayEventOptions", demoMode, subprofileId],
    enabled: isEnabled && Boolean(subprofileId),
    queryFn: ({ signal }) =>
      demoMode
        ? buildDemoFlashDayEventOptions()
        : getFlashDayEventOptions(subprofileId, signal),
  });
}
