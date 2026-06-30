import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  Eyebrow,
  Reveal,
  SectionHead,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { calendarEvents, type CalendarEvent } from "./data";
import { MONTHS, MSHORT } from "./calendar.data";
import { EVENT_CATEGORIES, eventsHeader } from "./eventsPage.data";
import styles from "./EventsPage.module.css";

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <Link to={event.to} className={styles.card}>
      <div className={styles.date}>
        <span className={styles.day}>{event.date.getDate()}</span>
        <span className={styles.month} style={{ color: event.orgColor }}>
          {MSHORT[event.date.getMonth()]}
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.orgRow}>
          <span className={styles.org} style={{ color: event.orgColor }}>
            {event.org}
          </span>
          <Tag
            className={
              event.kind === "event" ? styles.badgeEvent : styles.badgeGathering
            }
          >
            {event.kind === "event" ? "Event" : "Gathering"}
          </Tag>
        </div>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <div className={styles.meta}>
          <span>{event.hood}</span>
          <span className={styles.dot} aria-hidden />
          <span>{event.time}</span>
        </div>
      </div>
      <span className={styles.cta} aria-hidden>
        →
      </span>
    </Link>
  );
}

function EventSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.date}>
        <SkeletonLine width={28} height={28} />
      </div>
      <div className={styles.cardBody} style={{ flex: 1 }}>
        <SkeletonLine width="35%" height={12} />
        <SkeletonLine width="80%" height={18} style={{ marginTop: 10 }} />
        <SkeletonLine width="55%" height={12} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

export function EventsPage() {
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const cat = EVENT_CATEGORIES.find((c) => c.key === active);
    if (!cat?.colors) return calendarEvents;
    return calendarEvents.filter((e) => cat.colors!.includes(e.orgColor));
  }, [active]);

  const months = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filtered) {
      const key = `${MONTHS[event.date.getMonth()]} ${event.date.getFullYear()}`;
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Eyebrow>{eventsHeader.eyebrow}</Eyebrow>
          <SectionHead
            title={
              <>
                Everything happening <em>this season</em>
              </>
            }
            subtitle={eventsHeader.subtitle}
            action={
              <Button variant="ghost" to={routes.calendar}>
                View as calendar
              </Button>
            }
          />
        </div>
      </header>

      <main className={styles.body}>
        <div className="wrap">
          <div
            className={styles.filters}
            role="tablist"
            aria-label="Filter events"
          >
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active === cat.key}
                className={`${styles.chip} ${active === cat.key ? styles.chipActive : ""}`}
                onClick={() => setActive(cat.key)}
              >
                <span
                  className={styles.chipDot}
                  style={{ background: cat.dot }}
                  aria-hidden
                />
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.list}>
              {Array.from({ length: 5 }).map((_, i) => (
                <EventSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {months.map(([label, events]) => (
                <section key={label} className={styles.group}>
                  <h2 className={styles.groupTitle}>{label}</h2>
                  <div className={styles.list}>
                    {events.map((event, index) => (
                      <Reveal
                        key={`${event.title}-${event.date.toISOString()}`}
                        delay={index * 40}
                      >
                        <EventCard event={event} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}

              {filtered.length === 0 && (
                <EmptyState
                  icon={<FiCalendar />}
                  title="Nothing in this category yet"
                  description="No events match this filter for the season. Try another category, or browse everything that's on."
                  action={{
                    label: "Show all events",
                    onClick: () => setActive("all"),
                  }}
                  secondaryAction={{
                    label: "View as calendar",
                    to: "/calendar",
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}
