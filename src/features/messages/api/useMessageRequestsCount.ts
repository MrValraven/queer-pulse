import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/useConnections";
import { useConnectionCounts } from "../../connect/api/useConnectionCounts";
import { useGroupInvites } from "./useGroupInvites";

/**
 * Count for the Messages inbox's "Requests" tab badge — the same incoming
 * connection-request count the Connections page's own Incoming tab badges
 * (a message request from a non-connection IS a pending connection request),
 * PLUS (PRD-353) any pending group invite addressed to the caller, since both
 * now render as rows in the same Requests tab. Demo mode reads the local
 * `ConnectionsProvider` directly (mirrors `useConnectionsList`'s demo branch);
 * live mode reuses the cheap `GET /connections/counts` the Connections page
 * already fetches — no second request, since it lives under the same
 * `["connections", "counts", …]` key. `useGroupInvites` is its own cached
 * query either way, so this never double-fetches against
 * `MessagesRequestsPanel`'s own call to the same hook.
 */
export function useMessageRequestsCount(): number {
  const { demoMode } = useDemoMode();
  const { incoming } = useConnections();
  const counts = useConnectionCounts();
  const groupInvites = useGroupInvites();
  const pendingGroupInvitesCount = groupInvites.data?.length ?? 0;
  const connectionRequestsCount = demoMode
    ? incoming.length
    : (counts.incoming ?? 0);
  return connectionRequestsCount + pendingGroupInvitesCount;
}
