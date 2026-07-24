import type {
  OrgTierAdminDTO,
  OrgTierWriteBody,
} from "../marketing/api/adminOrgTiers.api";
import type { OrgTierCtaType } from "../marketing/api/orgTiers.api";

/**
 * Controlled-form mirror of `OrgTierWriteBody`. `bullets` is one bullet per
 * line here (split/joined on newline in the converters below) and `sortOrder`
 * stays a string so the input can be a simple controlled `<input>` —
 * `draftToWriteBody` converts everything back on submit.
 */
export interface OrgTierFormDraft {
  name: string;
  priceDisplay: string;
  pricePeriod: string;
  dek: string;
  bullets: string;
  footnote: string;
  ctaType: OrgTierCtaType;
  ctaLabel: string;
  ctaTarget: string;
  featured: boolean;
  sortOrder: string;
  published: boolean;
}

export const BLANK_ORG_TIER_DRAFT: OrgTierFormDraft = {
  name: "",
  priceDisplay: "",
  pricePeriod: "",
  dek: "",
  bullets: "",
  footnote: "",
  ctaType: "toast",
  ctaLabel: "",
  ctaTarget: "",
  featured: false,
  sortOrder: "0",
  published: false,
};

/** Seeds the form from an existing tier, or a blank draft for "New tier". */
export function draftFromOrgTier(
  tier: OrgTierAdminDTO | null,
): OrgTierFormDraft {
  if (!tier) return BLANK_ORG_TIER_DRAFT;
  return {
    name: tier.name,
    priceDisplay: tier.priceDisplay,
    pricePeriod: tier.pricePeriod,
    dek: tier.dek,
    bullets: tier.bullets.join("\n"),
    footnote: tier.footnote,
    ctaType: tier.ctaType,
    ctaLabel: tier.ctaLabel,
    ctaTarget: tier.ctaTarget ?? "",
    featured: tier.featured,
    sortOrder: String(tier.sortOrder),
    published: tier.published,
  };
}

/** Converts the controlled-input draft back into the API write shape. */
export function draftToOrgTierWriteBody(
  draft: OrgTierFormDraft,
): OrgTierWriteBody {
  return {
    name: draft.name.trim(),
    priceDisplay: draft.priceDisplay.trim(),
    pricePeriod: draft.pricePeriod.trim(),
    dek: draft.dek.trim(),
    bullets: draft.bullets
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    footnote: draft.footnote.trim(),
    ctaType: draft.ctaType,
    ctaLabel: draft.ctaLabel.trim(),
    ctaTarget: draft.ctaTarget.trim() || null,
    featured: draft.featured,
    sortOrder: Number(draft.sortOrder) || 0,
    published: draft.published,
  };
}
