import { useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";

export type TopTab = "mine" | "discover";

/**
 * Owns the top-level "My communities | Discover" tab state for the merged
 * `/communities` page. The tab lives in `?tab=`; when absent we pick a smart
 * default — the member hub if they belong to any community, otherwise the
 * directory, so an empty hub never greets a brand-new member. An explicit
 * `?tab=` always wins, so deep links and refreshes are stable.
 *
 * Hash exception: homepage spotlight links deep-link to a directory card
 * (`/communities#queer-social`). When a hash is present we default to
 * `discover` so the anchor still resolves.
 *
 * The membership fetch is only needed when the smart default itself is
 * needed — i.e. no explicit `?tab=` and no hash — so it's gated on
 * `needsDefault` (mirroring `useEventsTopTab`), and `resolving` stays true
 * while that fetch is in flight so the page can hold on the "My communities"
 * body instead of flashing "Discover" first for a live member who turns out
 * to have communities once the fetch lands.
 */
export function useCommunitiesTopTab(): {
  tab: TopTab;
  setTab: (next: TopTab) => void;
  resolving: boolean;
} {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const raw = params.get("tab");
  const explicit: TopTab | null =
    raw === "mine" || raw === "discover" ? raw : null;

  const needsDefault = raw === null && !hash;

  // The hub body fetches memberships anyway; react-query dedupes so reading it
  // here adds no request when the hub is mounted. Skip the fetch entirely when
  // the smart default isn't needed (an explicit `?tab=` or a `#hash` is
  // present), so this hook alone never fires `GET /me/communities` for a
  // result that's never used.
  const memberships = useMyCommunities({ enabled: needsDefault });
  const hasCommunities = Object.keys(memberships).length > 0;
  const loading = useMyCommunitiesResolving({ enabled: needsDefault });

  const tab: TopTab =
    explicit ?? (hash ? "discover" : hasCommunities ? "mine" : "discover");
  const resolving = needsDefault && loading;

  const setTab = useCallback(
    (next: TopTab) => {
      setParams(
        (previous) => {
          const nextParams = new URLSearchParams(previous);
          nextParams.set("tab", next);
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { tab, setTab, resolving };
}
