import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvents, type EventFilter } from "./events.api";
import { cardToCalendarEvent } from "./events.adapters";
import { calendarEvents, type CalendarEvent } from "../data";

export interface EventsResult {
  items: CalendarEvent[];
  total: number;
}

/**
 * Events list source. Demo mode returns the page's own `calendarEvents`
 * registry (full fidelity for the "this season" board + filters); live mode
 * calls GET /events?filter=… and adapts each card to the same view-model.
 *
 * The `filter` maps the EventsPage / My-Events tabs onto the backend's
 * upcoming|going|hosting|waitlisted|past|saved dimension. In demo mode the
 * filter is ignored (the page's own category chips do the client-side split).
 */
export function useEvents(
  params: { filter?: EventFilter; page?: number } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery<EventsResult>({
    queryKey: ["events", demoMode, params],
    queryFn: async () => {
      if (demoMode) {
        return { items: calendarEvents, total: calendarEvents.length };
      }
      const res = await getEvents(params);
      return { items: res.items.map(cardToCalendarEvent), total: res.total };
    },
  });
}
