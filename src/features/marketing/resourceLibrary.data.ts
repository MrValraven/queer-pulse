import { routes } from "../../app/routeMap";

/**
 * CNT-11: this page's old static `RESOURCES`/`CATS` mock (24 entries across an
 * 8-category taxonomy that didn't match the backend's real `Resource.category`
 * values) was retired. `/resources` now renders the same real, backend-driven
 * guide grid as the resources feature's `useLibraryData()` — see
 * `../resources/library.data.ts` for the `Guide` shape and the real
 * `CATEGORIES` taxonomy (housing/health/legal/finance/trans), which mirrors
 * the backend `Resource.category` values exactly.
 *
 * What's left here is genuinely different content, not guide data:
 *  - `ORGANISATIONS`: a short, hand-curated list of REAL external Lisbon /
 *    Portugal LGBTQ+ organisations (their own sites, not authored or
 *    verified by QueerPulse) — kept separate from the editorial guide grid
 *    rather than merged into one fake-homogeneous taxonomy. Not gated by
 *    `demoMode`: these are genuine curated links, not fabricated demo
 *    profiles, so they render the same in demo and live.
 *  - `LIBRARY_SUBPAGES`: pointers to Queer 101 / Glossary / Intersectionality
 *    — real in-app pages, not resource data.
 */
export interface Organisation {
  name: string;
  description: string;
  url: string;
  tags: string[];
}

export const ORGANISATIONS: Organisation[] = [
  {
    name: "GAT Lisboa",
    description:
      "Free HIV and STI testing, naloxone, harm reduction, and trans health services. Walk-in welcome.",
    url: "https://www.gat.org.pt",
    tags: ["HIV", "STI", "trans"],
  },
  {
    name: "Checkpoint Lisboa",
    description:
      "Rapid HIV/STI testing, PrEP consultations, walk-in appointments. No referral needed.",
    url: "https://checkpointlx.com",
    tags: ["HIV", "PrEP", "testing"],
  },
  {
    name: "ILGA Portugal",
    description:
      "Legal support, hate crime monitoring, advocacy, and community programmes.",
    url: "https://ilga-portugal.pt",
    tags: ["legal", "advocacy"],
  },
  {
    name: "APAV",
    description:
      "Free, confidential support for crime victims. 24-hour line: 116 006.",
    url: "https://apav.pt",
    tags: ["victim support", "24h line"],
  },
];

/** Dot colour per real guide category, for the filter chips and card tag. */
export const CATEGORY_DOT: Record<string, string> = {
  housing: "var(--plum)",
  health: "var(--jade)",
  legal: "var(--accent-ink)",
  finance: "var(--jade)",
  trans: "var(--violet)",
};

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
