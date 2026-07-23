import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPartners } from "./partners.api";
import { cardToPartner } from "./partners.adapters";
import { FEATURED_PARTNERS_DEMO } from "../forOrganisationsProof.data";
import type { Partner } from "../partnerDetails.types";
import type { PartnerTestimonial } from "../partnerDetails.types";

export interface FeaturedPartnersResult {
  partners: Partner[];
  /** The first featured partner that carries a quote (null when none do). */
  testimonial: PartnerTestimonial | null;
  isLoading: boolean;
}

/** Pick the first featured partner with a testimonial for the quote card. */
function firstTestimonial(partners: Partner[]): PartnerTestimonial | null {
  return partners.find((partner) => partner.testimonial)?.testimonial ?? null;
}

/**
 * Featured partners for the For Organisations proof rail. Demo mode returns
 * the colocated FEATURED_PARTNERS_DEMO; live mode calls GET /partners?featured=true
 * (approved + featured only) and adapts each card.
 */
export function useFeaturedPartners(): FeaturedPartnersResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<Partner[]>({
    queryKey: ["featured-partners", demoMode],
    queryFn: async () => {
      if (demoMode) return FEATURED_PARTNERS_DEMO;
      const page = await getPartners({ featured: true });
      return page.items.map(cardToPartner);
    },
  });
  const partners = query.data ?? [];
  return {
    partners,
    testimonial: firstTestimonial(partners),
    isLoading: query.isLoading,
  };
}
