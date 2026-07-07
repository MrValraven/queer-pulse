import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPartners, type Region } from "./partners.api";
import { cardToPartner } from "./partners.adapters";
import { PARTNERS } from "../partnerDetails";
import type { Partner } from "../partnerDetails.types";

export interface PartnersResult {
  items: Partner[];
  total: number;
}

/**
 * Partners listing source (approved partners only). Demo mode returns the page's
 * own `PARTNERS` registry (full fidelity for the region filter, which runs
 * client-side); live mode calls GET /partners?region= and adapts each card onto
 * the same `Partner` view-model.
 *
 * In demo mode the params are ignored — the page's own region chips do the
 * client-side split, exactly as the prototype renders today.
 */
export function usePartners(params: { region?: Region; page?: number } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<PartnersResult>({
    queryKey: ["partners", demoMode, params],
    queryFn: async () => {
      if (demoMode) {
        return { items: PARTNERS, total: PARTNERS.length };
      }
      const res = await getPartners(params);
      return { items: res.items.map(cardToPartner), total: res.total };
    },
  });
}
