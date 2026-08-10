import { AppShell } from "../../shared/components/layout";
import { EventsDiscover } from "../gatherings/EventsHubPage";
import { EventsHeader } from "./EventsHeader";
import { MyEventsDashboard } from "./MyEventsPage";
import { useEventsTopTab } from "./useEventsTopTab";

/**
 * Merged `/events` surface. A top-level "My events | Discover" switch sits
 * above two reused bodies: the personal dashboard (MyEventsDashboard) and the
 * discovery hub (EventsDiscover). The active tab lives in `?tab=`, defaulting
 * smartly to the dashboard when the member has events and discovery when they
 * don't. Both surfaces are auth-gated, so there is no signed-out case.
 */
export function EventsPage() {
  const { tab, setTab, resolving } = useEventsTopTab();
  // While the smart default is still resolving (no explicit ?tab= and the
  // member's events are still loading), show the dashboard — its provider owns
  // an honest loading state — rather than flashing Discover then swapping.
  const active = resolving ? "mine" : tab;

  return (
    <AppShell>
      <EventsHeader active={active} onChange={setTab} />
      <div
        role="tabpanel"
        id={`events-top-panel-${active}`}
        aria-labelledby={`events-top-tab-${active}`}
        tabIndex={0}
      >
        {active === "mine" ? <MyEventsDashboard /> : <EventsDiscover />}
      </div>
    </AppShell>
  );
}
