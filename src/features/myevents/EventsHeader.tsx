import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EventsHubTabs } from "../gatherings/hub/EventsHubTabs";
import { useEventsHubView } from "../gatherings/hub/useEventsHubView";
import { EventsTopTabs } from "./EventsTopTabs";
import { HostChoiceModal } from "./HostChoiceModal";
import type { TopTab } from "./useEventsTopTab";
import styles from "./EventsHeader.module.css";

/** The app's mobile cutover (`--mobile` in tokens/breakpoints.css), where the
 *  header stacks and the Host action shrinks to fit beside the title. */
const PHONE_HEADER_QUERY = "(max-width: 860px)";

/**
 * Compact, utility-first header for the merged `/events` page, and the only
 * header either tab has: the page's single <h1>, the My events | Discover
 * switch, the Discover sub-tabs (Highlights · Browse · Calendar, on that tab
 * only) and the persistent Host action. From 860px up they share one row, so
 * both tab levels read as a hierarchy instead of two separate bars. Below
 * that the title and a small Host action share the first row and the two tab
 * levels sit under them, each at full width on a phone (see the
 * stylesheet). The sub-tabs fold in and out with the Discover tab. Not
 * sticky. The Host action opens HostChoiceModal, which offers the
 * how-to-host guide or the event form; `AnimatePresence` lets the dialog
 * play its exit on close.
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
  const [isHostChoiceOpen, setIsHostChoiceOpen] = useState(false);
  const isPhoneHeader = useMediaQuery(PHONE_HEADER_QUERY);

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.row}>
          <div className={styles.identity}>
            <h1 className={styles.title}>{t("myevents:eventsHeader.title")}</h1>
            <div className={styles.tabs}>
              <EventsTopTabs active={active} onChange={onChange} />
              <Collapse
                isOpen={active === "discover"}
                className={styles.hubTabs}
              >
                <EventsHubTabs active={view} onChange={setView} />
              </Collapse>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size={isPhoneHeader ? "sm" : "md"}
              onClick={() => setIsHostChoiceOpen(true)}
              aria-haspopup="dialog"
            >
              {t("myevents:eventsHeader.hostCta")}
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isHostChoiceOpen && (
          <HostChoiceModal
            key="host-choice"
            onClose={() => setIsHostChoiceOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
