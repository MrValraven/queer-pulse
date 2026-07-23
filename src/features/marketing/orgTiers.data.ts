export type OrgTierCta =
  | { kind: "toast"; label: string }
  | { kind: "link"; label: string; to: string }
  | { kind: "propose"; label: string };

export interface OrgTier {
  slug: string;
  name: string;
  priceDisplay: string;
  pricePeriod: string;
  dek: string;
  bullets: string[];
  footnote: string;
  featured: boolean;
  cta: OrgTierCta;
}

// Demo fallback — illustrative tiers matching the seed. Sample figures only.
export const ORG_TIERS_DEMO: OrgTier[] = [
  {
    slug: "employer",
    name: "Employer",
    priceDisplay: "€2.4k",
    pricePeriod: "per year",
    dek: "For workplaces that want to back the community materially, not with a logo.",
    bullets: [
      "A verified employer profile members can vouch for",
      "Two open clinic / advice nights a year",
      "Quarterly impact note (no vanity metrics)",
      "Named contact for member escalations",
      "Illustrative tier — figures are sample values",
    ],
    footnote: "Reviewed annually. Either side can end it.",
    featured: false,
    cta: { kind: "toast", label: "Request a review" },
  },
  {
    slug: "partner",
    name: "Operational partner",
    priceDisplay: "Custom",
    pricePeriod: "scoped per partnership",
    dek: "A committed operational seam — the partnership this whole page is about.",
    bullets: [
      "Specific operational changes, agreed in writing",
      "Joint case-bridge or referral pathway",
      "Shared reporting, member-visible",
      "A year-long build, not a launch",
      "Illustrative tier — terms are sample values",
    ],
    footnote: "Proposed, not purchased. We say no often.",
    featured: true,
    cta: { kind: "propose", label: "Propose a partnership" },
  },
  {
    slug: "funder",
    name: "Programme funder",
    priceDisplay: "€15k+",
    pricePeriod: "per year",
    dek: "For funders backing a specific programme, with real accountability.",
    bullets: [
      "Restricted grant to a named programme",
      "Quarterly reports + annual audit",
      "No say over moderation or editorial",
      "Public funding-transparency entry",
      "Illustrative tier — figures are sample values",
    ],
    footnote: "Multi-year commitments preferred.",
    featured: false,
    cta: { kind: "toast", label: "Discuss funding" },
  },
];
