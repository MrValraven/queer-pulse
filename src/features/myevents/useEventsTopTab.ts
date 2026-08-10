import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMyEventsData } from "./api/useMyEventsData";

export type TopTab = "mine" | "discover";

/**
 * Owns the top-level "My events | Discover" tab state for the merged
 * `/events` page. The tab lives in `?tab=`; when it is absent we pick a
 * smart default — the dashboard if the member has any events, otherwise
 * discovery so an empty dashboard never greets a new member. An explicit
 * `?tab=` always wins, so deep links and refreshes are stable.
 *
 * `?tab=` is deliberately separate from EventsHub's own `?view=` sub-tab
 * param, so nothing about the Highlights/Browse/Calendar tabs changes.
 */
export function useEventsTopTab(): {
  tab: TopTab;
  setTab: (next: TopTab) => void;
  resolving: boolean;
} {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const explicit: TopTab | null =
    raw === "mine" || raw === "discover" ? raw : null;

  // The dashboard fetches this anyway; react-query dedupes so reading it here
  // adds no request when the dashboard is also mounted. But when an explicit
  // `?tab=` is present (e.g. a `/calendar` deep link into `?tab=discover`),
  // the smart default is never computed, so skip the fetch entirely here —
  // otherwise this hook alone would fire the whole batch (5x GET /events +
  // invites + notifications) for a result that's never used.
  const { events, loading } = useMyEventsData({ enabled: raw === null });
  const hasEvents = events.length > 0;

  const tab: TopTab = explicit ?? (hasEvents ? "mine" : "discover");
  const resolving = explicit === null && loading;

  const setTab = useCallback(
    (next: TopTab) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set("tab", next);
          if (next === "mine") nextParams.delete("view");
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { tab, setTab, resolving };
}
