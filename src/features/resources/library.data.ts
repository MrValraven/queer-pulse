import { routes } from "../../app/routeMap";

export interface Guide {
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  meta: string;
  to: string;
}

/**
 * i18n Pattern A — `id` is the stored filter value; `labelKey` resolves via
 * `t()` for the filter chips. `label` is kept as a plain-English fallback
 * used only by `resources.adapters.ts` to derive a live-mode guide's
 * `categoryLabel` badge text outside a component (no `t()` there) — a documented
 * gap: that badge doesn't localize in live mode yet, matching the demo
 * `GUIDES` mock's own English `categoryLabel` values (see the scope rule: those
 * mirror the live-fetched `Resource.category`, so they're content).
 */
export const CATEGORIES = [
  {
    id: "all",
    label: "All guides",
    labelKey: "resources:library.category.all",
  },
  {
    id: "housing",
    label: "Housing",
    labelKey: "resources:library.category.housing",
  },
  {
    id: "health",
    label: "Health",
    labelKey: "resources:library.category.health",
  },
  { id: "legal", label: "Legal", labelKey: "resources:library.category.legal" },
  {
    id: "finance",
    label: "Finance",
    labelKey: "resources:library.category.finance",
  },
  {
    id: "trans",
    label: "Trans life",
    labelKey: "resources:library.category.trans",
  },
] as const;

export const GUIDES: Guide[] = [
  {
    category: "legal",
    categoryLabel: "Legal",
    title: "Workplace discrimination — the full guide",
    description: "What Portugal's Labour Code protects, how to document incidents, and a template complaint letter for the ACT.",
    meta: "Guide · 12 min · PT / EN",
    to: routes.legal,
  },
  {
    category: "legal",
    categoryLabel: "Legal",
    title: "Rental discrimination & your rights",
    description: "A landlord refusing you on grounds of identity is acting illegally. How to gather evidence and where to report it.",
    meta: "Guide · 9 min · PT / EN",
    to: routes.legal,
  },
  {
    category: "legal",
    categoryLabel: "Legal",
    title: "Legal name & gender marker change",
    description: "Step-by-step through Portugal's self-determination process — documents, timelines, and what changed in 2018.",
    meta: "Guide · 15 min · PT / EN",
    to: routes.transHub,
  },
  {
    category: "housing",
    categoryLabel: "Housing",
    title: "Finding queer-friendly housing in Lisbon",
    description: "Neighbourhoods, red flags in listings, and how the QueerPulse housing board vets landlords.",
    meta: "Guide · 11 min",
    to: routes.housing,
  },
  {
    category: "housing",
    categoryLabel: "Housing",
    title: "Flatmate agreements that protect you",
    description: "A plain-language template for shared tenancies — chosen-family arrangements included.",
    meta: "Template · 6 min",
    to: routes.flatmates,
  },
  {
    category: "health",
    categoryLabel: "Health",
    title: "Navigating the SNS as a queer patient",
    description: "Registering, finding affirming GPs, and what to do if a provider refuses or mistreats you.",
    meta: "Guide · 10 min",
    to: routes.wellbeing,
  },
  {
    category: "health",
    categoryLabel: "Health",
    title: "PrEP access in Portugal",
    description: "Eligibility, the clinics most welcoming in Lisbon, and how to get it at no cost through the SNS.",
    meta: "Guide · 8 min",
    to: routes.sexualHealth,
  },
  {
    category: "health",
    categoryLabel: "Health",
    title: "Harm reduction, without judgement",
    description: "Practical safety for chemsex, substances, and recovery — written by and for the community.",
    meta: "Guide · 9 min",
    to: routes.harmReduction,
  },
  {
    category: "trans",
    categoryLabel: "Trans life",
    title: "Starting hormone therapy on the SNS",
    description: "Referral pathways, waiting lists, and a guide to the consultations — plus what private costs to expect.",
    meta: "Guide · 14 min",
    to: routes.transHealthcare,
  },
  {
    category: "trans",
    categoryLabel: "Trans life",
    title: "Updating documents after transition",
    description: "Bank, employer, GP, landlord — the order to do things in, with letter templates for each.",
    meta: "Checklist · 7 min",
    to: routes.transHub,
  },
  {
    category: "finance",
    categoryLabel: "Finance",
    title: "Micro-grants & solidarity funds",
    description: "What QueerPulse funds, how to apply, and how the community sliding scale works.",
    meta: "Guide · 6 min",
    to: routes.microGrants,
  },
  {
    category: "finance",
    categoryLabel: "Finance",
    title: "Money for freelancers & artists",
    description: "Invoicing basics in Portugal, recibos verdes, and the funds open to queer creatives.",
    meta: "Guide · 10 min",
    to: routes.grants,
  },
];

export const POPULAR = [
  "Legal name change",
  "PrEP access",
  "Workplace rights",
  "Finding housing",
  "Starting HRT",
];
