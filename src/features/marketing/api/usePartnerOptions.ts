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
  return usePartnerOptionsQuery().options;
}

export interface PartnerOptionsResult {
  options: PartnerOption[];
  isLoading: boolean;
  /** True when the options read failed (DES-22). A picker that silently offers
   *  nothing looks like "there are no partners", so a caller that renders these
   *  as content must be able to say otherwise. */
  isError: boolean;
  /** Re-run the failed read. */
  refetch: () => void;
}

/**
 * The same read as `usePartnerOptions`, with the query state attached (DES-22).
 * `usePartnerOptions` stays the array-returning convenience for pickers that
 * fail quietly.
 */
export function usePartnerOptionsQuery(): PartnerOptionsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<PartnerOption[]>({
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
  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
