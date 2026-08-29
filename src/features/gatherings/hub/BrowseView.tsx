import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { Button, Reveal } from "../../../shared/components/ui";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEvent } from "../data";
import { useEvents } from "../api/useEvents";
import { BrowseFilterBar } from "./BrowseFilterBar";
import {
  hasActiveBrowseFilters,
  readBrowseFilters,
  toEventBrowseFilters,
  writeBrowseFilters,
  type BrowseFilterState,
} from "./browseFilters";
import { EventPosterCard } from "./EventPosterCard";
import { EventPosterSkeleton } from "./EventPosterSkeleton";
import { HubEmptyState, HubLoadingLine } from "./HubEmptyState";
import styles from "./BrowseView.module.css";

/** How long the search box waits before it becomes a request. Long enough that
 *  typing a neighbourhood name is one query, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 350;

/** One month's worth of events — a sticky subhead over a column of poster rows. */
function MonthGroup({
  label,
  events,
}: {
  label: string;
  events: CalendarEvent[];
}) {
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

function groupByMonth(
  events: CalendarEvent[],
  fmt: Formatters,
): [string, CalendarEvent[]][] {
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
 * Browse tab — filters, then a month-grouped, infinitely-scrolling list.
 *
 * FILTERING HAPPENS ON THE SERVER (LOC-17). This view used to receive the
 * hub's already-loaded pages and narrow them in JavaScript, keyed partly off
 * `orgColor`, a colour the demo registry assigns and the API never sends. So a
 * search under-reported until the member had scrolled the entire feed, and the
 * chips answered a question about the mock data model. It now runs its own
 * query with the filters attached, which means the counts are honest and page
 * two is filtered too.
 *
 * With no filters set, that query is byte-for-byte the hub's own
 * `filter=upcoming` fetch and react-query serves both from one request.
 */
export function BrowseView() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readBrowseFilters(params), [params]);
  // Captured once so the date presets resolve against a stable "now" instead
  // of a clock read during render, which would make the query key churn.
  const now = useMemo(() => new Date(), []);
  const browse = useMemo(
    () => toEventBrowseFilters(filters, now),
    [filters, now],
  );

  const { items, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useEvents({ filter: "upcoming", browse });

  // The search box is typed into far faster than it is worth querying, so the
  // input holds its own value and the URL (and therefore the request) catches
  // up once typing pauses.
  const [searchDraft, setSearchDraft] = useState(filters.query);
  const [lastAppliedQuery, setLastAppliedQuery] = useState(filters.query);
  if (lastAppliedQuery !== filters.query) {
    // A filter change from elsewhere (a cleared board, a shared link) wins.
    setLastAppliedQuery(filters.query);
    setSearchDraft(filters.query);
  }

  const applyFilters = useCallback(
    (next: BrowseFilterState) =>
      setParams((previous) => writeBrowseFilters(previous, next), {
        replace: true,
      }),
    [setParams],
  );

  useEffect(() => {
    if (searchDraft === filters.query) return;
    const timerId = window.setTimeout(
      () => applyFilters({ ...filters, query: searchDraft }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timerId);
  }, [searchDraft, filters, applyFilters]);

  const months = useMemo(() => groupByMonth(items, fmt), [items, fmt]);
  const isFiltered = hasActiveBrowseFilters(filters);

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

        <BrowseFilterBar
          filters={filters}
          onChange={applyFilters}
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
        />

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

            {/* Two different nothings, and saying the wrong one is a lie: with
                filters on, the list is narrowed and widening it may help; with
                none on, Lisbon simply has no upcoming gatherings posted and
                there is no filter to try. */}
            {items.length === 0 &&
              (isFiltered ? (
                <HubEmptyState
                  titleKey="gatherings:hub.browse.noMatch.title"
                  bodyKey="gatherings:hub.browse.noMatch.body"
                  compact
                />
              ) : (
                <HubEmptyState
                  titleKey="gatherings:hub.empty.title"
                  bodyKey="gatherings:hub.empty.body"
                  ctaLabelKey="gatherings:hub.host.cta"
                  ctaTo={routes.host}
                />
              ))}

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
