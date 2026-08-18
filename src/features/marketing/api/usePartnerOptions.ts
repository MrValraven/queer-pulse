import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPartners } from "./partners.api";

export interface PartnerOption {
  slug: string;
  name: string;
}

/**
 * A lean `{slug,name}[]` of approved partner orgs, for pickers that link
 * something a member is posting (a volunteering opportunity) to an existing
 * partner. Mirrors `useMyCommunityOptions`'s shape/purpose for the sibling
 * "community" half of the combined organization picker.
 *
 * Demo mode reads the static `PARTNERS` registry; live mode calls the first
 * page of GET /partners — a picker, not the full paginated directory
 * `usePartners` backs.
 */
export function usePartnerOptions(): PartnerOption[] {
  const { demoMode } = useDemoMode();
  const { data } = useQuery<PartnerOption[]>({
    queryKey: ["partnerOptions", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { PARTNERS } = await import("../partnerDetails");
        return PARTNERS.map((partner) => ({
          slug: partner.slug,
          name: partner.name,
        }));
      }
      const res = await getPartners();
      return res.items.map((partner) => ({
        slug: partner.slug,
        name: partner.name,
      }));
    },
  });
  return data ?? [];
}
