import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../../shared/components/layout";
import { useEvents } from "../api/useEvents";
import { pickHighlights } from "./pickHighlights";
import { EventsHubHero } from "./EventsHubHero";
import { EventsHubTabs } from "./EventsHubTabs";
import { HighlightsView } from "./HighlightsView";
import { BrowseView } from "./BrowseView";
import { CalendarView } from "./CalendarView";
import styles from "./EventsHubPage.module.css";

type HubView = "highlights" | "browse" | "calendar";

/** Read `?view=` into a known view, defaulting to Highlights. */
function viewFromParam(raw: string | null): HubView {
  return raw === "browse" || raw === "calendar" ? raw : "highlights";
}

/**
 * The one Events Hub — merges the former /events, /gatherings, and /calendar
 * surfaces into a single poster-forward page. One `useEvents` call feeds three
 * views (Highlights · Browse · Calendar); the active view lives in the URL as
 * `?view=` so tabs are shareable and back/forward work, and the `/calendar`
 * redirect can land straight on `?view=calendar`.
 */
export function EventsHubPage() {
  const [params, setParams] = useSearchParams();
  const view = viewFromParam(params.get("view"));

  const setView = (next: HubView) => {
    setParams(
      (previous) => {
        const nextParams = new URLSearchParams(previous);
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
          className={styles.panel}
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
