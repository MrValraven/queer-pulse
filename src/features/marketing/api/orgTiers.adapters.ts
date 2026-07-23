import type { OrgTierDTO } from "./orgTiers.api";
import type { OrgTier, OrgTierCta } from "../orgTiers.data";

function toCta(dto: OrgTierDTO): OrgTierCta {
  if (dto.ctaType === "link") {
    return { kind: "link", label: dto.ctaLabel, to: dto.ctaTarget ?? "/" };
  }
  if (dto.ctaType === "propose") {
    return { kind: "propose", label: dto.ctaLabel };
  }
  return { kind: "toast", label: dto.ctaLabel };
}

export function dtoToOrgTier(dto: OrgTierDTO): OrgTier {
  return {
    slug: dto.slug,
    name: dto.name,
    priceDisplay: dto.priceDisplay,
    pricePeriod: dto.pricePeriod,
    dek: dto.dek,
    bullets: dto.bullets,
    footnote: dto.footnote,
    featured: dto.featured,
    cta: toCta(dto),
  };
}
