import { useEffect, useState } from "react";
import { FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { calendarLegend, type CalendarEvent } from "../data";
import { MonthGrid, AllUpcomingEvents } from "../CalendarGrid";
import { sameDay } from "../calendarGrid.helpers";
import { CalendarSidebar } from "../CalendarSidebar";
import styles from "./CalendarView.module.css";

/**
 * The Calendar tab of the Events Hub. Lifted straight out of the old
 * `CalendarPage` composition (month grid + selected-day sidebar + upcoming
 * list + legend) — only the page-level hero chrome was dropped, since the
 * featured card + `EventsHubTabs` already own that above this view.
 * `now` replaces the old page's hardcoded `CALENDAR_TODAY` for the initial
 * month and the "upcoming" cutoff, so the hub's one shared clock wins.
 *
 * PAGINATION (PRD-184). The grid lets a member walk forward month by month
 * forever, but the hub only ever fetched page 1 of `filter=upcoming` — twenty
 * rows, soonest first. Past twenty gatherings, next month's grid and the whole
 * "all upcoming" list read as empty, which says "nothing is on in Lisbon" when
 * the truth is "we stopped asking". So the view pulls the next page whenever
 * the month it is showing sits at or beyond the end of what has been loaded,
 * and the upcoming list offers the same thing explicitly.
 */
export function CalendarView({
  events,
  now,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: {
  events: CalendarEvent[];
  now: Date;
  /** Another page of upcoming gatherings is available server-side. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState<Date | null>(null);

  // The last instant currently loaded. A viewed month that reaches past it may
  // be genuinely empty or merely unfetched, and the two are indistinguishable
  // from here — so ask for more and let the server settle it.
  const loadedThrough = events.reduce(
    (latest, event) => Math.max(latest, event.date.getTime()),
    0,
  );
  const viewedMonthEnd = new Date(
    view.year,
    view.month + 1,
    0,
    23,
    59,
    59,
  ).getTime();
  const needsMore =
    hasMore && !isLoadingMore && viewedMonthEnd >= loadedThrough;
  useEffect(() => {
    if (needsMore) onLoadMore?.();
    // `onLoadMore` is a fresh closure each render; `needsMore` is the real
    // trigger and already folds in `hasMore`/`isLoadingMore`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMore]);

  function eventsForDate(date: Date) {
    return events.filter((event) => sameDay(event.date, date));
  }

  function changeMonth(delta: number) {
    setSelected(null);
    setView((current) => {
      let month = current.month + delta;
      let year = current.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  const upcoming = events
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const selectedEvents = selected ? eventsForDate(selected) : [];

  return (
    <section className={styles.section}>
      <div className={`wrap ${styles.wrap}`}>
        <FadeIn as="div" className={styles.head}>
          <h2 className={styles.heading}>
            {t("gatherings:hub.calendar.heading")}
          </h2>
          <div className={styles.legend}>
            {calendarLegend.map((item) => (
              <div key={item.labelKey} className={styles.legItem}>
                <span
                  className={styles.legDot}
                  style={{ background: item.color }}
                />
                {t(item.labelKey)}
              </div>
            ))}
          </div>
        </FadeIn>

        <div className={styles.layout}>
          <div>
            <MonthGrid
              view={view}
              selected={selected}
              eventsForDate={eventsForDate}
              changeMonth={changeMonth}
              onSelect={setSelected}
            />
            <AllUpcomingEvents
              loading={false}
              upcoming={upcoming}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
            />
          </div>

          <CalendarSidebar
            selected={selected}
            selectedEvents={selectedEvents}
          />
        </div>
      </div>
    </section>
  );
}
