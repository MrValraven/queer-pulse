import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ProfileEventItem } from "./api/profileEvents.adapters";
import { ProfileEventRail, ProfileEventRow } from "./ProfileEventRow";
import styles from "./ProfileEventsSection.module.css";

/**
 * The member's past events, latest first, folded away until asked for. The
 * toggle is the group's header, set like the "Upcoming events" label, and
 * the region it controls stays mounted, so `aria-controls` always points at
 * a real node while the posters inside it open and close: the grid, or in a
 * narrow column (`isRail`) the same sideways rail the upcoming events use.
 * Every poster is marked past, so none says "Coming up".
 */
export function ProfileEventsPast({
  items,
  isRail,
}: {
  items: ProfileEventItem[];
  isRail: boolean;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`${styles.group} ${styles.pastGroup}`}>
      <h3 className={styles.labelHeading}>
        <button
          type="button"
          className={`${styles.label} ${styles.headerToggle}`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          {t("members:profileEvents.pastToggle")}
          <FiChevronDown
            aria-hidden
            className={
              isOpen
                ? `${styles.chevron} ${styles.chevronOpen}`
                : styles.chevron
            }
          />
        </button>
      </h3>
      <div id={panelId} className={styles.pastPanel}>
        <Collapse isOpen={isOpen}>
          {isRail ? (
            <ProfileEventRail items={items} isPast />
          ) : (
            <div className={styles.grid}>
              {items.map((item) => (
                <ProfileEventRow
                  key={item.event.slug ?? item.event.to}
                  item={item}
                  isPast
                />
              ))}
            </div>
          )}
        </Collapse>
      </div>
    </div>
  );
}
