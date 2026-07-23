import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { TabId } from "../connections.data";
import { getConnectionCounts } from "./connections.api";

/**
 * Summary totals for the tab badges, fetched once so every tab shows an accurate
 * number on first paint — not just the tabs the user has opened.
 *
 * Live only: a single GET /connections/counts. Demo mode derives exact counts
 * from the local providers in the page, so this query stays idle and returns an
 * empty map (the page never reads it in demo). The query lives under the
 * ["connections"] key, so the existing action invalidation in
 * `useConnectionActions` refreshes it after accept / decline / withdraw / send.
 *
 * "blocked" is deliberately absent — SocialProvider owns that count in both
 * modes, and the page reads it locally rather than from here.
 */
export function useConnectionCounts(): Partial<Record<TabId, number>> {
  const { demoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ["connections", "counts", demoMode],
    enabled: !demoMode,
    queryFn: getConnectionCounts,
  });

  const counts = query.data;
  if (demoMode || !counts) return {};

  // Map the backend's tab keys onto the page's TabIds ("outgoing" → "sent").
  return {
    all: counts.all,
    incoming: counts.incoming,
    sent: counts.outgoing,
    vouched: counts.vouched,
  };
}
