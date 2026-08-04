import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, PullToRefresh } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEvents } from "./api/useEvents";
import { eventKeys } from "./api/eventKeys";
import { pickHighlights } from "./hub/pickHighlights";
import { EventsHubHero } from "./hub/EventsHubHero";
import { EventsHubTabs } from "./hub/EventsHubTabs";
import { HighlightsView } from "./hub/HighlightsView";
import { BrowseView } from "./hub/BrowseView";
import { CalendarView } from "./hub/CalendarView";
import styles from "./EventsHubPage.module.css";

type HubView = "highlights" | "browse" | "calendar";

/**
 * Canonical Events Hub (`/events`) — merges the old Events / Gatherings /
 * Calendar pages into one poster-forward shell with Highlights · Browse ·
 * Calendar view tabs. Fetches the shared `useEvents({ filter: "upcoming" })`
 * list ONCE here and threads the same `items`/`now` into whichever view is
 * active, so switching tabs never re-fetches.
 *
 * The active view round-trips through `?view=` (`browse` | `calendar`), with
 * `replace: true` so tab-switches don't pile up in browser history; the
 * `highlights` default is never written to the URL (an explicit
 * `?view=highlights` still resolves to it via the fallback below, it's just
 * not the form `setView` produces). This is also the redirect target for the
 * old `/calendar` route (`?view=calendar`) — see Task 9.
 *
 * When the (live) `useEvents` fetch fails, `isError` swaps the whole board for a
 * branded error state with a "Try again" action (audit P1-14) — an outage must
 * not read as "nothing on in Lisbon". Demo mode never errors.
 */
export function EventsHubPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const raw = params.get("view");
  const view: HubView =
    raw === "browse" || raw === "calendar" ? raw : "highlights";
  const setView = (next: HubView) => {
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === "highlights") nextParams.delete("view");
        else nextParams.set("view", next);
        return nextParams;
      },
      { replace: true },
    );
  };
  const now = useMemo(() => new Date(), []);
  const {
    items,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useEvents({ filter: "upcoming" });
  const lead = useMemo(
    () => pickHighlights(items, now, { count: 1 })[0] ?? null,
    [items, now],
  );

  if (isError) {
    return (
      <PageShell>
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
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.root}>
        <EventsHubHero lead={lead} now={now} onSeeAll={() => setView("browse")} />
        <EventsHubTabs active={view} onChange={setView} />
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
            {view === "browse" && (
              <BrowseView
                events={items}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
            {view === "calendar" && <CalendarView events={items} now={now} />}
          </PullToRefresh>
        </div>
      </div>
    </PageShell>
  );
}
