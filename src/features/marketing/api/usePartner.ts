import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getPartner } from "./partners.api";
import { detailToPartner } from "./partners.adapters";
import { getPartner as getMockPartner } from "../partnerDetails";
import type { Partner } from "../partnerDetails.types";

export interface PartnerResult {
  partner: Partner | undefined;
  /** True when the slug resolves to no APPROVED partner (mock miss or a 404). */
  notFound: boolean;
}

/**
 * Single partner detail. Demo mode resolves the `:slug` against the mock
 * `PARTNERS` registry (a miss → notFound, exactly as the prototype's redirect
 * does today); live mode calls GET /partners/:slug and adapts it. A 404 means
 * the partner isn't approved (partners are hidden until triaged) — so we map it
 * to the not-found path, NOT a query error. Other statuses propagate as errors.
 */
export function usePartner(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<PartnerResult>({
    queryKey: ["partner", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return { partner: undefined, notFound: true };
      if (demoMode) {
        const partner = getMockPartner(slug);
        return { partner, notFound: !partner };
      }
      try {
        const dto = await getPartner(slug);
        return { partner: detailToPartner(dto), notFound: false };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return { partner: undefined, notFound: true };
        }
        throw err;
      }
    },
  });
}
