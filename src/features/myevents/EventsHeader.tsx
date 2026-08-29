import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { EventsHubTabs } from "../gatherings/hub/EventsHubTabs";
import { useEventsHubView } from "../gatherings/hub/useEventsHubView";
import { EventsTopTabs } from "./EventsTopTabs";
import type { TopTab } from "./useEventsTopTab";
import styles from "./EventsHeader.module.css";

/**
 * Compact, utility-first header for the merged `/events` page, and the only
 * header either tab has: the page's single <h1>, the My events | Discover
 * switch, the Discover sub-tabs (Highlights · Browse · Calendar, on that tab
 * only) and the persistent Host action, on one row, so both tab levels read
 * as a hierarchy instead of two separate bars. Not sticky.
 */
export function EventsHeader({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const { view, setView } = useEventsHubView();

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.row}>
          <div className={styles.identity}>
            <h1 className={styles.title}>
              {t("myevents:eventsHeader.title")} <FeatureHelp id="events.hub" />
            </h1>
            <EventsTopTabs active={active} onChange={onChange} />
            {active === "discover" && (
              <EventsHubTabs active={view} onChange={setView} />
            )}
          </div>
          <div className={styles.actions}>
            <Button variant="primary" to={routes.host}>
              {t("myevents:eventsHeader.hostCta")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
