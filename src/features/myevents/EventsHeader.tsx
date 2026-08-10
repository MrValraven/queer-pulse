import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { EventsTopTabs } from "./EventsTopTabs";
import type { TopTab } from "./useEventsTopTab";
import styles from "./EventsHeader.module.css";

/**
 * Compact, utility-first header for the merged `/events` page. Carries the
 * page's single <h1>, the My events | Discover switch, a search jump, and the
 * persistent Host action. Reserves the top nav band (the job the old hero did —
 * see `src/styles/nav-mode.css`), so the switch clears the floating nav instead
 * of hiding behind it. Not sticky; the Discover sub-tabs stay sticky.
 */
export function EventsHeader({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  // Jump to Discover → Browse and ask BrowseView to focus its search field.
  const goToSearch = () => {
    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        nextParams.set("tab", "discover");
        nextParams.set("view", "browse");
        nextParams.set("focus", "1");
        return nextParams;
      },
      { replace: true },
    );
  };

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.row}>
          <div className={styles.identity}>
            <h1 className={styles.title}>
              {t("myevents:eventsHeader.title")} <FeatureHelp id="events.hub" />
            </h1>
            <EventsTopTabs active={active} onChange={onChange} />
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.searchBtn}
              aria-label={t("myevents:eventsHeader.searchAria")}
              onClick={goToSearch}
            >
              <FiSearch aria-hidden />
            </button>
            <Button variant="primary" to={routes.host}>
              {t("myevents:eventsHeader.hostCta")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
