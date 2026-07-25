import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_TRUST_GRAPH_DATA } from "../adminVouchGraph.data";
import type { TrustGraphData } from "../trustGraph/trustGraphModel";
import { getAdminTrustNetwork } from "./adminTrustNetwork.api";
import { trustNetworkDtoToData } from "./adminTrustNetwork.adapters";

/**
 * The whole admin trust network. Demo mode returns the colocated fixture graph
 * (so the demo story stays intact and no live fetch fires); live mode fetches
 * `/admin/trust-network` and adapts it. Never reads the fixture in live mode.
 */
export function useTrustNetwork() {
  const { demoMode } = useDemoMode();
  return useQuery<TrustGraphData>({
    queryKey: ["admin-trust-network", demoMode],
    initialData: demoMode ? DEMO_TRUST_GRAPH_DATA : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_TRUST_GRAPH_DATA;
      return trustNetworkDtoToData(await getAdminTrustNetwork());
    },
  });
}
