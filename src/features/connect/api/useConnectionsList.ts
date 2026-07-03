import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/ConnectionsProvider";
import { useSocial } from "../../../app/providers/SocialProvider";
import { useVouch } from "../../../app/providers/VouchProvider";
import {
  CONNECTION_META,
  connectionViews,
  type ConnectionView,
  type TabId,
} from "../connections.data";
import { getConnections } from "./connections.api";
import { API_TAB, connectionDtoToView } from "./connections.adapters";

export interface ConnectionsListResult {
  /** The cards to render for this tab. */
  views: ConnectionView[];
  /** True while the first live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

/**
 * The list source for one connections tab.
 *
 * Demo mode returns the mock relationships exactly as the page built them
 * before this hook existed — resolved from ConnectionsProvider / SocialProvider
 * / VouchProvider through the member registry — so the demo experience is
 * byte-for-byte unchanged and never touches the network.
 *
 * Live mode calls GET /connections?tab=… and adapts each record to the same
 * `ConnectionView` the cards already render. The "blocked" tab has no API
 * counterpart (it's owned by SocialProvider), so it always resolves locally.
 */
export function useConnectionsList(tab: TabId): ConnectionsListResult {
  const { demoMode } = useDemoMode();
  const { connected, incoming, sent } = useConnections();
  const { blocked } = useSocial();
  const { vouched } = useVouch();

  // Slugs the mock/demo path renders for each tab.
  const demoSlugs = useMemo(() => {
    switch (tab) {
      case "all":
        return connected;
      case "incoming":
        return incoming;
      case "sent":
        return sent;
      case "blocked":
        return blocked;
      case "vouched": {
        const set = new Set<string>(vouched);
        for (const [slug, meta] of Object.entries(CONNECTION_META)) {
          if (meta.vouchBadge) set.add(slug);
        }
        return [...set];
      }
      default:
        return [];
    }
  }, [tab, connected, incoming, sent, blocked, vouched]);

  const apiTab = API_TAB[tab];

  const query = useQuery<ConnectionView[]>({
    queryKey: ["connections", tab, demoMode],
    // Blocked has no endpoint; demo mode never fetches. In both cases we short
    // out to the locally-resolved views below and keep the query idle.
    enabled: !demoMode && apiTab !== undefined,
    queryFn: async () => {
      const res = await getConnections(apiTab!);
      return res.items.map(connectionDtoToView);
    },
  });

  const demoViews = useMemo(() => connectionViews(demoSlugs), [demoSlugs]);

  // Demo, or a tab with no live endpoint (blocked): resolve from local state.
  if (demoMode || apiTab === undefined) {
    return { views: demoViews, loading: false };
  }
  return { views: query.data ?? [], loading: query.isPending };
}
