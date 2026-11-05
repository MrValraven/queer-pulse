import { useTranslation } from "../../../shared/i18n/useTranslation";
import { parseEventDate, type EventDateParts } from "../eventDates";
import styles from "./EventSheetContent.module.css";

/** One `Intl` part, upper-cased by the CSS, without the trailing full stop
 *  Portuguese short names carry ("sáb.", "nov."). */
function formatPart(
  moment: Date,
  language: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(language, options)
    .format(moment)
    .replace(/\.$/, "");
}

interface StampLines {
  weekday: string | null;
  /** The large line: the day number, or the month for a month-only date. */
  lead: string;
  foot: string;
}

function stampLines(parts: EventDateParts, language: string): StampLines {
  const { year, month, day } = parts;
  if (day === null) {
    const firstOfMonth = new Date(year, month - 1, 1);
    return {
      weekday: null,
      lead: formatPart(firstOfMonth, language, { month: "long" }),
      foot: String(year),
    };
  }
  const moment = new Date(year, month - 1, day);
  return {
    weekday: formatPart(moment, language, { weekday: "short" }),
    lead: String(day),
    foot: `${formatPart(moment, language, { month: "short" })} ${year}`,
  };
}

/**
 * The poster's date stamp, printed in the persona's accent: weekday, the day
 * number in Archivo Black, then month and year. A month-only date sets the
 * month large over its year and names no weekday. Free text the owner typed
 * instead of a date ("Sundays") prints as it is. The doors time follows
 * under the stamp.
 */
export function EventSheetDate({
  date,
  doors,
}: {
  date: string;
  doors: string | null;
}) {
  const { t, language } = useTranslation();
  const parts = parseEventDate(date);
  const freeText = date.trim();
  const doorsLabel = (doors ?? "").trim();
  if (!parts && !freeText && !doorsLabel) return null;
  const lines = parts ? stampLines(parts, language) : null;

  return (
    <div className={styles.when}>
      {lines ? (
        <p
          className={styles.stamp}
          data-month-only={parts?.day === null || undefined}
        >
          {lines.weekday && (
            <span className={styles.weekday}>{lines.weekday}</span>
          )}
          <span className={styles.stampLead}>{lines.lead}</span>
          <span className={styles.stampFoot}>{lines.foot}</span>
        </p>
      ) : (
        freeText && <p className={styles.freeDate}>{freeText}</p>
      )}
      {doorsLabel && (
        <p className={styles.doors}>
          {t("subprofiles:row.doors", { doors: doorsLabel })}
        </p>
      )}
    </div>
  );
}
