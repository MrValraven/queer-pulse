import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, PullToRefresh } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEvents } from "./api/useEvents";
import { eventKeys } from "./api/eventKeys";
import { pickHighlights } from "./hub/pickHighlights";
import { FeaturedEventCard } from "./hub/FeaturedEventCard";
import { useEventsHubView } from "./hub/useEventsHubView";
import { HighlightsView } from "./hub/HighlightsView";
import { BrowseView } from "./hub/BrowseView";
import { CalendarView } from "./hub/CalendarView";
import styles from "./EventsHubPage.module.css";

/**
 * Canonical Events Hub content (`/events`) — merges the old Events /
 * Gatherings / Calendar pages into one utility panel: a compact "next up"
 * featured card above Highlights · Browse · Calendar view tabs. Fetches the
 * shared `useEvents({ filter: "upcoming" })` list ONCE here and threads the
 * same `items`/`now` into whichever view is active, so switching tabs never
 * re-fetches.
 *
 * The active view lives in `?view=` (see `useEventsHubView`). Its tablist is
 * NOT rendered here: it sits in the page header, beside the My events |
 * Discover switch, so both tab levels read as one row. This page only reads
 * the view and renders the matching panel.
 *
 * When the (live) `useEvents` fetch fails, `isError` swaps the whole board for a
 * branded error state with a "Try again" action (audit P1-14) — an outage must
 * not read as "nothing on in Lisbon". Demo mode never errors.
 *
 * This module exports two things:
 * - `EventsDiscover` — the shell-less board (no `PageShell`/`AppShell`), for
 *   the merged `/events` page to render inside its own single shell.
 * - `EventsHubPage` — a thin `PageShell`-wrapped standalone wrapper, kept for
 *   back-compat imports; the router no longer routes to it directly.
 */
export function EventsDiscover() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { view } = useEventsHubView();
  const now = useMemo(() => new Date(), []);
  const { items, isLoading, isError, refetch } = useEvents({
    filter: "upcoming",
  });
  const lead = useMemo(
    () => pickHighlights(items, now, { count: 1 })[0] ?? null,
    [items, now],
  );

  if (isError) {
    return (
      <div className={styles.root}>
        <div className="wrap">
          <EmptyState
            icon={<FiCalendar />}
            title={t("common:error.title")}
            description={t("common:error.description")}
            action={{ label: t("common:error.retry"), onClick: refetch }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <FeaturedEventCard lead={lead} />
      <div
        role="tabpanel"
        id={`events-hub-panel-${view}`}
        aria-labelledby={`events-hub-tab-${view}`}
        tabIndex={0}
      >
        {/* `eventKeys.listRoot` (`["events"]`) is the repo's own invalidation
            prefix for this domain — matches every `eventKeys.list(filter, mode)`
            variant, so a pull refresh refetches whichever view is active. */}
        <PullToRefresh
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: eventKeys.listRoot })
          }
        >
          {view === "highlights" && (
            <HighlightsView events={items} now={now} isLoading={isLoading} />
          )}
          {/* Browse runs its own server-filtered query (LOC-17), so it takes
              no page set from here: its filters have to reach the API, not a
              slice of already-loaded rows. With no filters set it shares this
              same request. */}
          {view === "browse" && <BrowseView />}
          {view === "calendar" && <CalendarView events={items} now={now} />}
        </PullToRefresh>
      </div>
    </div>
  );
}

/** Standalone route wrapper (kept for back-compat imports). The merged
 *  `/events` page renders `EventsDiscover` directly inside its own shell. */
export function EventsHubPage() {
  return (
    <PageShell>
      <EventsDiscover />
    </PageShell>
  );
}
