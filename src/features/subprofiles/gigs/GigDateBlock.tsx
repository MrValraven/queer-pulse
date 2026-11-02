import { FiCalendar } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gigDateParts } from "./gigDate";
import styles from "./GigDateBlock.module.css";

/**
 * The ~56px date block at the leading edge of a gig row. Every stored date
 * shape has a face: a day ("MAR / 14 / SAT"), a month or year only, free text
 * the parser cannot read (shown raw, full text in the title attribute) and no
 * date at all (a coral "No date" chip). Upcoming blocks carry an accent wash,
 * past blocks the neutral wash.
 */
export function GigDateBlock({ rawDate }: { rawDate: string }) {
  const { t, language } = useTranslation();
  const parts = gigDateParts(rawDate, language);
  const blockClassName = [
    styles.block,
    parts.isUpcoming ? styles.upcoming : styles.past,
  ].join(" ");

  if (parts.precision === "none") {
    return (
      <div className={blockClassName}>
        <FiCalendar className={styles.icon} aria-hidden />
        <span className={styles.noDate}>
          {t("subprofiles:gigEditor.row.noDate")}
        </span>
      </div>
    );
  }

  if (parts.precision === "unknown") {
    return (
      <div className={blockClassName} title={parts.rawText}>
        <FiCalendar className={styles.icon} aria-hidden />
        <span className={styles.rawText}>{parts.rawText}</span>
      </div>
    );
  }

  if (parts.precision === "day") {
    return (
      <div className={blockClassName}>
        <span className={styles.month}>{parts.monthLabel}</span>
        <span className={styles.day}>{parts.dayLabel}</span>
        <span className={styles.bottom}>{parts.bottomLabel}</span>
      </div>
    );
  }

  return (
    <div className={blockClassName}>
      {parts.monthLabel && (
        <span className={styles.month}>{parts.monthLabel}</span>
      )}
      <FiCalendar className={styles.icon} aria-hidden />
      <span className={styles.bottom}>{parts.bottomLabel}</span>
    </div>
  );
}
