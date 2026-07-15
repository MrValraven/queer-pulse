import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Reveal } from "../../shared/components/ui";
import { calendarLegend } from "./data";
import { useEvents } from "./api/useEvents";
import { CALENDAR_TODAY } from "./calendar.data";
import { MonthGrid, AllUpcomingEvents, sameDay } from "./CalendarGrid";
import { CalendarSidebar } from "./CalendarSidebar";
import styles from "./CalendarPage.module.css";

export function CalendarPage() {
  const [view, setView] = useState({ year: 2026, month: 5 });
  const [selected, setSelected] = useState<Date | null>(null);
  const { items: calendarEvents, isLoading: loading } = useEvents({
    filter: "upcoming",
  });

  function eventsForDate(date: Date) {
    return calendarEvents.filter((e) => sameDay(e.date, date));
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

  const upcoming = calendarEvents
    .filter((e) => e.date >= CALENDAR_TODAY)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const selectedEvents = selected ? eventsForDate(selected) : [];

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eyebrow}>
            Community Calendar
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            Everything happening <em>in one place.</em>
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={120}>
            QueerPulse gatherings, ILGA Portugal events, Rede ex aequo, Opus
            Diversus, community screenings, and more — all in one shared
            calendar.
          </Reveal>
          <Reveal className={styles.legend} delay={160}>
            {calendarLegend.map((item) => (
              <div key={item.label} className={styles.legItem}>
                <span
                  className={styles.legDot}
                  style={{ background: item.color }}
                />
                {item.label}
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <MonthGrid
                view={view}
                selected={selected}
                eventsForDate={eventsForDate}
                changeMonth={changeMonth}
                onSelect={setSelected}
              />
              <AllUpcomingEvents loading={loading} upcoming={upcoming} />
            </div>

            <CalendarSidebar
              selected={selected}
              selectedEvents={selectedEvents}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
