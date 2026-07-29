import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Reveal } from "../../../shared/components/ui";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { EVENT_CATEGORIES } from "../eventsPage.data";
import type { CalendarEvent } from "../data";
import { EventPosterCard } from "./EventPosterCard";
import { EventPosterSkeleton } from "./EventPosterSkeleton";
import { HubEmptyState, HubLoadingLine } from "./HubEmptyState";
import styles from "./BrowseView.module.css";

interface BrowseViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

/** Org filter chips (All / QueerPulse / Community) — ported from `EventsPage`. */
function FilterChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.filters}
      role="tablist"
      aria-label={t("gatherings:events.filterAriaLabel")}
    >
      {EVENT_CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          type="button"
          role="tab"
          aria-selected={active === cat.key}
          className={`${styles.chip} ${active === cat.key ? styles.chipActive : ""}`}
          onClick={() => onChange(cat.key)}
        >
          <span className={styles.chipDot} style={{ background: cat.dot }} aria-hidden />
          {t(cat.labelKey)}
        </button>
      ))}
    </div>
  );
}

/** One month's worth of events — a sticky subhead over a column of poster rows. */
function MonthGroup({ label, events }: { label: string; events: CalendarEvent[] }) {
  return (
    <section className={styles.monthGroup}>
      <h2 className={styles.monthHeading}>{label}</h2>
      <div className={styles.rows}>
        {events.map((event, index) => (
          <Reveal
            key={`${event.title}-${event.date.toISOString()}`}
            as="div"
            className={styles.row}
            delay={Math.min(index, 8) * 40}
          >
            <EventPosterCard event={event} variant="list" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className={styles.rows} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.row}>
          <EventPosterSkeleton variant="list" />
        </div>
      ))}
    </div>
  );
}

function groupByMonth(events: CalendarEvent[], fmt: Formatters): [string, CalendarEvent[]][] {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = fmt.date(event.date, { month: "long", year: "numeric" });
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }
  return [...map.entries()];
}

/**
 * Browse tab — org filter chips + month-grouped, infinitely-scrolling event
 * list. Each row is an `EventPosterCard variant="list"`, which is
 * parent-sized: `.row` gives it an explicit `display: flex; width: 100%` row
 * context (see `BrowseView.module.css`) so it never collapses to 0-width.
 */
export function BrowseView({
  events,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: BrowseViewProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [active, setActive] = useState("all");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const cat = EVENT_CATEGORIES.find((c) => c.key === active);
    if (!cat?.colors) return events;
    return events.filter((e) => cat.colors!.includes(e.orgColor));
  }, [active, events]);

  const months = useMemo(() => groupByMonth(filtered, fmt), [filtered, fmt]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={styles.body}>
      <div className="wrap">
        <h2 className={styles.heading}>{t("gatherings:hub.browse.heading")}</h2>

        <FilterChips active={active} onChange={setActive} />

        {isLoading ? (
          <>
            <HubLoadingLine labelKey="gatherings:hub.loading" />
            <SkeletonRows count={5} />
          </>
        ) : (
          <>
            {months.map(([label, monthEvents]) => (
              <MonthGroup key={label} label={label} events={monthEvents} />
            ))}

            {!isLoading && filtered.length === 0 && (
              <HubEmptyState titleKey="gatherings:hub.browse.empty" compact />
            )}

            {isFetchingNextPage && <SkeletonRows count={3} />}

            <div ref={sentinelRef} aria-hidden className={styles.sentinel} />

            {hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isFetchingNextPage}
                  onClick={fetchNextPage}
                >
                  {t("gatherings:hub.browse.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
