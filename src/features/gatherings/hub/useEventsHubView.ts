import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type HubView = "highlights" | "browse" | "calendar";

/**
 * Owns the Discover sub-tab state (Highlights · Browse · Calendar) for the
 * merged `/events` page. The view round-trips through `?view=`, with
 * `replace: true` so tab-switches don't pile up in browser history; the
 * `highlights` default is never written to the URL (an explicit
 * `?view=highlights` still resolves to it via the fallback below, it's just
 * not the form `setView` produces). `?view=calendar` is also the redirect
 * target for the old `/calendar` route.
 *
 * It lives in a hook rather than inside `EventsDiscover` because the tablist
 * renders up in `EventsHeader` (beside the My events | Discover switch) while
 * the panels render down in `EventsDiscover`; both read the same `?view=`.
 */
export function useEventsHubView(): {
  view: HubView;
  setView: (next: HubView) => void;
} {
  const [params, setParams] = useSearchParams();
  const raw = params.get("view");
  const view: HubView =
    raw === "browse" || raw === "calendar" ? raw : "highlights";

  const setView = useCallback(
    (next: HubView) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          if (next === "highlights") nextParams.delete("view");
          else nextParams.set("view", next);
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { view, setView };
}
