import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvents, type EventCardDTO } from "./events.api";

/** How many other upcoming gatherings the recap page's re-engagement CTA
 *  shows — a short, scannable list, not a full browse page. */
const LIMIT = 3;

/**
 * `GatheringRecapPage`'s "more from this host" CTA — up to `LIMIT` other
 * upcoming, published gatherings by the same host, soonest first, excluding
 * the one the recap is already about. A real query against `GET
 * /events?filter=upcoming&hostSlug=&excludeSlug=` (see `ListEventsQuery`).
 *
 * MSG-10/16 note: when the recapped gathering is part of a recurring series,
 * its next occurrence is itself a real `Event` row by the same host, so it
 * already surfaces in this same query — no separate series lookup needed.
 * `MoreFromHost` (the caller) recognizes that case via each card's own
 * `EventCardDTO.series` and reframes the section accordingly.
 *
 * Demo mode never fetches — the recap page's demo experience stays the
 * static prototype it always was.
 */
export function useMoreFromHost(hostSlug: string, excludeSlug: string) {
  const { demoMode } = useDemoMode();
  return useQuery<EventCardDTO[]>({
    queryKey: ["more-from-host", hostSlug, excludeSlug, demoMode],
    enabled: !demoMode && hostSlug !== "",
    queryFn: async () => {
      const page = await getEvents({
        filter: "upcoming",
        hostSlug,
        excludeSlug,
      });
      return page.items.slice(0, LIMIT);
    },
  });
}
