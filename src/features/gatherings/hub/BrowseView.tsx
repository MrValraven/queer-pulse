import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const searchRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";

  const setQuery = (value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );

  const filtered = useMemo(() => {
    const cat = EVENT_CATEGORIES.find((c) => c.key === active);
    const byOrg = !cat?.colors ? events : events.filter((e) => cat.colors!.includes(e.orgColor));
    const q = query.trim().toLowerCase();
    if (!q) return byOrg;
    // Client-side filter over the ALREADY-LOADED events (the infinite-scroll
    // page set) — not a backend search. Honest for a small/loaded list.
    return byOrg.filter(
      (e) => e.title.toLowerCase().includes(q) || e.hood.toLowerCase().includes(q),
    );
  }, [active, events, query]);

  const months = useMemo(() => groupByMonth(filtered, fmt), [filtered, fmt]);

  useEffect(() => {
    if (params.get("focus") !== "1") return;
    searchRef.current?.focus();
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("focus");
        return next;
      },
      { replace: true },
    );
  }, [params, setParams]);

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

        <div className={styles.search}>
          <label className={styles.searchLabel} htmlFor="events-browse-search">
            {t("gatherings:hub.browse.searchLabel")}
          </label>
          <input
            id="events-browse-search"
            ref={searchRef}
            type="search"
            className={styles.searchInput}
            placeholder={t("gatherings:hub.browse.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

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
              <HubEmptyState
                titleKey={
                  query.trim() ? "gatherings:hub.browse.searchEmpty" : "gatherings:hub.browse.empty"
                }
                compact
              />
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
