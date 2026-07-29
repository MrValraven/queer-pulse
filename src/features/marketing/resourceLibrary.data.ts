import { routes } from "../../app/routeMap";

export interface Resource {
  cat: string;
  name: string;
  description: string;
  cost: "free" | "sliding";
  internal: boolean;
  link: string;
  tags: string[];
}

// `c` is the canonical (English, stored/filter) category id — never
// translate the id itself, only `labelKey`'s resolved value.
export const CATS = [
  {
    c: "all",
    labelKey: "marketing:resourceLibrary.category.all",
    dot: "var(--plum)",
  },
  {
    c: "health",
    labelKey: "marketing:resourceLibrary.category.health",
    dot: "var(--jade)",
  },
  {
    c: "legal",
    labelKey: "marketing:resourceLibrary.category.legal",
    dot: "var(--accent-ink)",
  },
  {
    c: "housing",
    labelKey: "marketing:resourceLibrary.category.housing",
    dot: "var(--plum)",
  },
  {
    c: "money",
    labelKey: "marketing:resourceLibrary.category.money",
    dot: "var(--jade)",
  },
  {
    c: "identity",
    labelKey: "marketing:resourceLibrary.category.identity",
    dot: "var(--violet)",
  },
  {
    c: "safety",
    labelKey: "marketing:resourceLibrary.category.safety",
    dot: "var(--accent-ink)",
  },
  {
    c: "community",
    labelKey: "marketing:resourceLibrary.category.community",
    dot: "var(--jade)",
  },
];

export const CAT_META: Record<string, { labelKey: string; dot: string }> =
  Object.fromEntries(
    CATS.filter((cat) => cat.c !== "all").map((cat) => [
      cat.c,
      { labelKey: cat.labelKey, dot: cat.dot },
    ]),
  );

export const RESOURCES: Resource[] = [
  {
    cat: "health",
    name: "Trans Healthcare Journey Map",
    description: "Step-by-step guide to HRT via the SNS, private care, legal name change, and surgery access in Portugal.",
    cost: "free",
    internal: true,
    link: routes.transHub,
    tags: ["trans", "HRT", "SNS"],
  },
  {
    cat: "health",
    name: "Harm Reduction Guide",
    description: "Honest, non-judgmental information about substances, naloxone, and safer clubbing.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["harm reduction", "naloxone"],
  },
  {
    cat: "health",
    name: "GAT Lisboa",
    description: "Free HIV and STI testing, naloxone, harm reduction, and trans health services. Walk-in welcome.",
    cost: "free",
    internal: false,
    link: "https://www.gat.org.pt",
    tags: ["HIV", "STI", "trans"],
  },
  {
    cat: "health",
    name: "Checkpoint Lisboa",
    description: "Rapid HIV/STI testing, PrEP consultations, walk-in appointments. No referral needed.",
    cost: "free",
    internal: false,
    link: "https://checkpointlx.com",
    tags: ["HIV", "PrEP", "testing"],
  },
  {
    cat: "health",
    name: "Mental Health Directory",
    description: "Queer-affirming therapists and counsellors, including sliding-scale options.",
    cost: "sliding",
    internal: true,
    link: routes.wellbeing,
    tags: ["therapy", "counselling"],
  },
  {
    cat: "legal",
    name: "Hate Crime Reporting Guide",
    description: "Right now, documenting, PSP reporting, ILGA Portugal, EU mechanisms, and Portuguese law.",
    cost: "free",
    internal: true,
    link: routes.legal,
    tags: ["hate crime", "PSP", "legal"],
  },
  {
    cat: "legal",
    name: "ILGA Portugal",
    description: "Legal support, hate crime monitoring, advocacy, and community programmes.",
    cost: "free",
    internal: false,
    link: "https://ilga-portugal.pt",
    tags: ["legal", "advocacy"],
  },
  {
    cat: "legal",
    name: "APAV — Victim Support",
    description: "Free, confidential support for crime victims. 24-hour line: 116 006.",
    cost: "free",
    internal: false,
    link: "https://apav.pt",
    tags: ["victims", "support"],
  },
  {
    cat: "legal",
    name: "Visas & Residency Guide",
    description: "D7, NHR, digital nomad visa, and residency for LGBTQ+ people in Portugal.",
    cost: "free",
    internal: true,
    link: routes.legal,
    tags: ["visa", "NHR", "D7"],
  },
  {
    cat: "housing",
    name: "Housing Resources",
    description: "Rights, emergency housing, and queer-friendly landlords in Lisbon.",
    cost: "free",
    internal: true,
    link: routes.housing,
    tags: ["housing", "rights", "emergency"],
  },
  {
    cat: "housing",
    name: "Queer Flatmates",
    description: "Community-curated flatmate matching — safe, vetted, connected to the network.",
    cost: "free",
    internal: true,
    link: routes.housing,
    tags: ["flatmates", "rooms"],
  },
  {
    cat: "housing",
    name: "Safe Spaces",
    description: "Physical spaces in Lisbon where you are guaranteed to be safe and welcome.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["safe space", "community"],
  },
  {
    cat: "money",
    name: "Micro Grants",
    description: "Small grants (€200–2000) for queer community projects in Lisbon. Transparent allocation.",
    cost: "free",
    internal: true,
    link: routes.grants,
    tags: ["grants", "funding"],
  },
  {
    cat: "money",
    name: "Barter & Skill Exchange",
    description: "Trade skills instead of money. Design for cooking, coding for legal advice.",
    cost: "free",
    internal: true,
    link: routes.barter,
    tags: ["barter", "skills", "free"],
  },
  {
    cat: "money",
    name: "Gig Workers Portugal",
    description: "Practical guides to recibos verdes, IRS, and social security for freelancers.",
    cost: "free",
    internal: false,
    link: "#",
    tags: ["freelance", "tax"],
  },
  {
    cat: "identity",
    name: "Trans Hub",
    description: "Resources, community, and support specifically for trans and non-binary people.",
    cost: "free",
    internal: true,
    link: routes.transHub,
    tags: ["trans", "non-binary"],
  },
  {
    cat: "identity",
    name: "Queer 101",
    description: "Introductory resource for people exploring their identity or new to the community.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["identity", "coming out"],
  },
  {
    cat: "identity",
    name: "Family Resources",
    description: "For queer people navigating family — estrangement, coming out, chosen family.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["family", "chosen family"],
  },
  {
    cat: "safety",
    name: "Safety & Visibility Guide",
    description: "How to manage visibility online and offline — for people who need to be careful.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["safety", "privacy"],
  },
  {
    cat: "safety",
    name: "Report to QueerPulse",
    description: "Report a member, incident, or safeguarding concern to the platform team.",
    cost: "free",
    internal: true,
    link: routes.governance,
    tags: ["report", "safeguarding"],
  },
  {
    cat: "safety",
    name: "Emergency",
    description: "Immediate safety resources — crisis lines, emergency housing, urgent support.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["emergency", "crisis"],
  },
  {
    cat: "community",
    name: "Reading Groups",
    description: "Small queer book clubs across Lisbon and online — fiction, theory, memoir, poetry.",
    cost: "free",
    internal: true,
    link: routes.communities,
    tags: ["reading", "social"],
  },
  {
    cat: "community",
    name: "Monthly Magazine",
    description: "Interviews, essays, reviews, and community life — published the first of every month.",
    cost: "free",
    internal: true,
    link: routes.magazine,
    tags: ["magazine", "culture"],
  },
  {
    cat: "community",
    name: "Activism & Organising",
    description: "Community organising resources, campaigns, and how to get involved in queer activism.",
    cost: "free",
    internal: true,
    link: routes.activism,
    tags: ["activism", "organising"],
  },
  {
    cat: "community",
    name: "Volunteer",
    description: "Ways to give time to the QueerPulse community and partner organisations.",
    cost: "free",
    internal: true,
    link: routes.volunteer,
    tags: ["volunteer", "giving"],
  },
];

export const LIBRARY_SUBPAGES = [
  {
    labelKey: "marketing:resourceLibrary.subpages.queer101.label",
    to: routes.queer101,
    blurbKey: "marketing:resourceLibrary.subpages.queer101.blurb",
  },
  {
    labelKey: "marketing:resourceLibrary.subpages.glossary.label",
    to: routes.glossary,
    blurbKey: "marketing:resourceLibrary.subpages.glossary.blurb",
  },
  {
    labelKey: "marketing:resourceLibrary.subpages.intersectionality.label",
    to: routes.intersectionality,
    blurbKey: "marketing:resourceLibrary.subpages.intersectionality.blurb",
  },
];
