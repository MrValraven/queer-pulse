import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/useConnections";
import { useConnectionCounts } from "../../connect/api/useConnectionCounts";

/**
 * Count for the Messages inbox's "Requests" tab badge — the same incoming
 * connection-request count the Connections page's own Incoming tab badges
 * (a message request from a non-connection IS a pending connection request).
 * Demo mode reads the local `ConnectionsProvider` directly (mirrors
 * `useConnectionsList`'s demo branch); live mode reuses the cheap
 * `GET /connections/counts` the Connections page already fetches — no second
 * request, since it lives under the same `["connections", "counts", …]` key.
 */
export function useMessageRequestsCount(): number {
  const { demoMode } = useDemoMode();
  const { incoming } = useConnections();
  const counts = useConnectionCounts();
  return demoMode ? incoming.length : (counts.incoming ?? 0);
}
