import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import styles from "./EventSheetPager.module.css";

export interface EventSheetPagerProps {
  events: SubprofileItemView[];
  /** Where the open event sits in `events`; -1 renders nothing. */
  eventIndex: number;
  onGoTo: (index: number) => void;
}

/**
 * The foot of the sheet, like the poem reader's: "Previous event" and "Next
 * event", each naming its target, then "3 of 9". At either end only the link
 * that leads somewhere shows. The buttons stay mounted while the sheet pages,
 * so a keyboard user who pressed Next keeps focus on it; only the titles
 * inside fade over.
 */
export function EventSheetPager({
  events,
  eventIndex,
  onGoTo,
}: EventSheetPagerProps) {
  const { t } = useTranslation();
  if (eventIndex < 0 || events.length < 2) return null;
  const previousEvent = events[eventIndex - 1];
  const nextEvent = events[eventIndex + 1];

  return (
    <div className={styles.pager}>
      {previousEvent && (
        <button
          type="button"
          className={styles.link}
          onClick={() => onGoTo(eventIndex - 1)}
        >
          <span className={styles.label}>
            <FiArrowLeft aria-hidden /> {t("subprofiles:event.sheet.previous")}
          </span>
          <span key={previousEvent.id} className={styles.title}>
            {previousEvent.title}
          </span>
        </button>
      )}
      {nextEvent && (
        <button
          type="button"
          className={cx(styles.link, styles.linkNext)}
          onClick={() => onGoTo(eventIndex + 1)}
        >
          <span className={styles.label}>
            {t("subprofiles:event.sheet.next")} <FiArrowRight aria-hidden />
          </span>
          <span key={nextEvent.id} className={styles.title}>
            {nextEvent.title}
          </span>
        </button>
      )}
      <p className={styles.position}>
        {t("subprofiles:event.sheet.position", {
          index: eventIndex + 1,
          total: events.length,
        })}
      </p>
    </div>
  );
}
