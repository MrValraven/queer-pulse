import { useState } from "react";
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
 * list + legend) — only the page-level hero chrome was dropped, since
 * `EventsHubHero` + `EventsHubTabs` already own that above this view.
 * `now` replaces the old page's hardcoded `CALENDAR_TODAY` for the initial
 * month and the "upcoming" cutoff, so the hub's one shared clock wins.
 */
export function CalendarView({
  events,
  now,
}: {
  events: CalendarEvent[];
  now: Date;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState<Date | null>(null);

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
            <AllUpcomingEvents loading={false} upcoming={upcoming} />
          </div>

          <CalendarSidebar selected={selected} selectedEvents={selectedEvents} />
        </div>
      </div>
    </section>
  );
}
