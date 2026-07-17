import { routes } from "../../app/routeMap";

export interface Guide {
  title: string;
  desc: string;
  cat: string;
  catLabel: string;
  meta: string;
  to: string;
}

/**
 * i18n Pattern A — `id` is the stored filter value; `labelKey` resolves via
 * `t()` for the filter chips. `label` is kept as a plain-English fallback
 * used only by `resources.adapters.ts` to derive a live-mode guide's
 * `catLabel` badge text outside a component (no `t()` there) — a documented
 * gap: that badge doesn't localize in live mode yet, matching the demo
 * `GUIDES` mock's own English `catLabel` values (see the scope rule: those
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
    cat: "legal",
    catLabel: "Legal",
    title: "Workplace discrimination — the full guide",
    desc: "What Portugal's Labour Code protects, how to document incidents, and a template complaint letter for the ACT.",
    meta: "Guide · 12 min · PT / EN",
    to: routes.legal,
  },
  {
    cat: "legal",
    catLabel: "Legal",
    title: "Rental discrimination & your rights",
    desc: "A landlord refusing you on grounds of identity is acting illegally. How to gather evidence and where to report it.",
    meta: "Guide · 9 min · PT / EN",
    to: routes.legal,
  },
  {
    cat: "legal",
    catLabel: "Legal",
    title: "Legal name & gender marker change",
    desc: "Step-by-step through Portugal's self-determination process — documents, timelines, and what changed in 2018.",
    meta: "Guide · 15 min · PT / EN",
    to: routes.transHub,
  },
  {
    cat: "housing",
    catLabel: "Housing",
    title: "Finding queer-friendly housing in Lisbon",
    desc: "Neighbourhoods, red flags in listings, and how the QueerPulse housing board vets landlords.",
    meta: "Guide · 11 min",
    to: routes.housing,
  },
  {
    cat: "housing",
    catLabel: "Housing",
    title: "Flatmate agreements that protect you",
    desc: "A plain-language template for shared tenancies — chosen-family arrangements included.",
    meta: "Template · 6 min",
    to: routes.flatmates,
  },
  {
    cat: "health",
    catLabel: "Health",
    title: "Navigating the SNS as a queer patient",
    desc: "Registering, finding affirming GPs, and what to do if a provider refuses or mistreats you.",
    meta: "Guide · 10 min",
    to: routes.wellbeing,
  },
  {
    cat: "health",
    catLabel: "Health",
    title: "PrEP access in Portugal",
    desc: "Eligibility, the clinics most welcoming in Lisbon, and how to get it at no cost through the SNS.",
    meta: "Guide · 8 min",
    to: routes.sexualHealth,
  },
  {
    cat: "health",
    catLabel: "Health",
    title: "Harm reduction, without judgement",
    desc: "Practical safety for chemsex, substances, and recovery — written by and for the community.",
    meta: "Guide · 9 min",
    to: routes.harmReduction,
  },
  {
    cat: "trans",
    catLabel: "Trans life",
    title: "Starting hormone therapy on the SNS",
    desc: "Referral pathways, waiting lists, and a guide to the consultations — plus what private costs to expect.",
    meta: "Guide · 14 min",
    to: routes.transHealthcare,
  },
  {
    cat: "trans",
    catLabel: "Trans life",
    title: "Updating documents after transition",
    desc: "Bank, employer, GP, landlord — the order to do things in, with letter templates for each.",
    meta: "Checklist · 7 min",
    to: routes.transHub,
  },
  {
    cat: "finance",
    catLabel: "Finance",
    title: "Micro-grants & solidarity funds",
    desc: "What QueerPulse funds, how to apply, and how the community sliding scale works.",
    meta: "Guide · 6 min",
    to: routes.microGrants,
  },
  {
    cat: "finance",
    catLabel: "Finance",
    title: "Money for freelancers & artists",
    desc: "Invoicing basics in Portugal, recibos verdes, and the funds open to queer creatives.",
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
