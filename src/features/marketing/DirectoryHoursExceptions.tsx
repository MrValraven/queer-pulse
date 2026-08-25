import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  formatExceptionHours,
  isoDateOf,
  parseListingDate,
  upcomingHoursExceptions,
  type ListingHoursException,
} from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/**
 * The one-off dates that override the weekly grid: holiday closures and
 * special hours, soonest first, capped by `upcomingHoursExceptions`.
 *
 * Only dates that have not passed appear. A closure last Christmas tells a
 * visitor nothing. Today's own exception stays in the list, because it is the
 * one most likely to change someone's plans, and it is also the one already
 * driving the "open now" chip above.
 *
 * `venueNow` is the venue's own clock (`zonedNow(place.timezone)`), so "has it
 * passed?" is answered on the venue's calendar rather than the visitor's.
 */
export function DirectoryHoursExceptions({
  exceptions,
  venueNow,
}: {
  exceptions: ListingHoursException[] | undefined;
  venueNow: Date;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const upcoming = upcomingHoursExceptions(exceptions, venueNow);
  if (upcoming.length === 0) return null;

  const todayIso = isoDateOf(venueNow);

  return (
    <div className={s.exceptions}>
      <h3 className={s.exceptionsTitle}>
        {t("marketing:directory.detail.exceptions.title")}
      </h3>
      <ul className={s.exceptionList}>
        {upcoming.map((exception) => {
          const day = parseListingDate(exception.date);
          const hours = formatExceptionHours(exception);
          const note = exception.note?.trim();
          return (
            <li key={exception.date} className={s.exceptionRow}>
              <span className={s.exceptionDate}>
                {day
                  ? fmt.date(day, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : exception.date}
                {exception.date === todayIso && (
                  <span className={s.todayTag}>
                    {t("marketing:directory.detail.today")}
                  </span>
                )}
              </span>
              <span
                className={
                  hours
                    ? s.exceptionValue
                    : `${s.exceptionValue} ${s.exceptionClosed}`
                }
              >
                {hours ?? t("marketing:directory.detail.hoursClosed")}
              </span>
              {note && <span className={s.exceptionNote}>{note}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
