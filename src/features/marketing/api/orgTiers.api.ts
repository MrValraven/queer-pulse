import { apiGet } from "../../../shared/api/client";

export type OrgTierCtaType = "toast" | "link" | "propose";

export interface OrgTierDTO {
  slug: string;
  name: string;
  priceDisplay: string;
  pricePeriod: string;
  dek: string;
  bullets: string[];
  footnote: string;
  ctaType: OrgTierCtaType;
  ctaLabel: string;
  ctaTarget: string | null;
  featured: boolean;
}

/** GET /org-tiers — published partnership tiers, display order. */
export const getOrgTiers = () => apiGet<OrgTierDTO[]>("/org-tiers");
