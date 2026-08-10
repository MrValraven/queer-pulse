import { MyEventsProvider } from "./MyEventsProvider";
import { MyEventsBody } from "./MyEventsBody";

/**
 * "Your events" dashboard body — pills/agenda/calendar + modals, inside its
 * provider. The page shell now lives in `EventsPage` (the merged `/events`
 * surface); this is rendered as the "My events" tab there.
 */
export function MyEventsDashboard() {
  return (
    <MyEventsProvider>
      <MyEventsBody />
    </MyEventsProvider>
  );
}
