import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useEvents } from "./api/useEvents";
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
 * `useEvents` (`api/useEvents.ts`) does not expose an `error`/`isError`
 * field on its `EventsResult` — only `isLoading` — so there is no distinct
 * error state to thread into the views here; each view's own
 * `isLoading`-gated empty/skeleton state is the only failure-adjacent UI
 * available today. (Noted per plan Task 8 Step 1 — not invented.)
 */
export function EventsHubPage() {
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
  const { items, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useEvents({ filter: "upcoming" });
  const lead = useMemo(
    () => pickHighlights(items, now, { count: 1 })[0] ?? null,
    [items, now],
  );

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
        </div>
      </div>
    </PageShell>
  );
}
