import { routes } from "../../app/routeMap";

/**
 * Static shape for `/local/arriving` (LOC-13).
 *
 * Nothing user-facing is written in English here any more: every card carries
 * an i18n `keyPrefix` and the component resolves `<prefix>.title` /
 * `.body` / `.note` through `t()`, so the whole page translates. What stays in
 * this file is the non-translatable spine: proper nouns (Lisbon neighbourhood
 * names, organisation names), real destinations, icons, and the colour tone
 * each card wears.
 *
 * The page is Lisbon-only by product decision, so nothing here is
 * parameterised by city.
 */

/** Which tinted chip/icon treatment a card wears. Resolved to a CSS-module
 *  class in the component, since the class map depends on the CSS import. */
export type ArrivingTone = "coral" | "jade" | "violet" | "neutral";

export interface Hood {
  /** Stable id, also the i18n leaf: `marketing:arriving.hoods.<id>.*`. */
  id: string;
  /** Neighbourhood name. A Lisbon proper noun, identical in both languages. */
  name: string;
  tone: ArrivingTone;
}

export interface ArrivingLink {
  href: string;
  /** External sites open in a new tab and get the external-link icon. */
  isExternal?: boolean;
  /** True when the destination is inside QueerPulse and needs an account, so
   *  a logged-out reader is told before they click rather than after. */
  isMemberOnly?: boolean;
}

export interface Org {
  /** Stable id, also the i18n leaf: `marketing:arriving.orgs.items.<id>.body`. */
  id: string;
  /** Organisation name. A proper noun, identical in both languages. */
  name: string;
  initials: string;
  tone: ArrivingTone;
  /** The organisation's own site. Real, public, and reachable logged out,
   *  which is the point: a newcomer can act on it before they have an invite. */
  website: string;
  /** Bare domain, shown as the visible link text. */
  domain: string;
}

export interface ChecklistStep {
  /** Stable id. Also the i18n leaf AND the token persisted to localStorage,
   *  so renaming one silently un-ticks it. Append, don't rename. */
  id: string;
  link?: ArrivingLink;
}

/**
 * Six neighbourhoods, each a real Lisbon freguesia or bairro. The notes used
 * to name-drop demo personas ("Inês Tavares (designer)"), who exist in no live
 * database and could not be linked to a profile. They now say something true
 * about the place instead.
 */
export const HOODS: Hood[] = [
  { id: "principeReal", name: "Príncipe Real", tone: "coral" },
  { id: "mouraria", name: "Mouraria", tone: "neutral" },
  { id: "bairroAlto", name: "Bairro Alto", tone: "jade" },
  { id: "caisDoSodre", name: "Cais do Sodré", tone: "coral" },
  { id: "arroios", name: "Arroios", tone: "jade" },
  { id: "marvila", name: "Marvila", tone: "neutral" },
];

/**
 * The three organisations most useful in a first month. Each row links to the
 * organisation's OWN site rather than to a QueerPulse index page: these are
 * outside bodies with no listing slug to resolve, and their site is the thing
 * a newcomer can actually use on day one.
 */
export const ORGS: Org[] = [
  {
    id: "ilga",
    name: "ILGA Portugal",
    initials: "IL",
    tone: "jade",
    website: "https://ilga-portugal.pt",
    domain: "ilga-portugal.pt",
  },
  {
    id: "opusDiversus",
    name: "Opus Diversus",
    initials: "OD",
    tone: "coral",
    website: "https://opusdiversus.org",
    domain: "opusdiversus.org",
  },
  {
    id: "redeExAequo",
    name: "Rede ex aequo",
    initials: "Re",
    tone: "violet",
    website: "https://rea.pt",
    domain: "rea.pt",
  },
];

/**
 * The practical first-fortnight list. Every step points somewhere real: a
 * public QueerPulse guide, an official Portuguese service, or an organisation's
 * own site. Ticks live in this browser only (see `ArrivingChecklist`).
 */
export const CHECKLIST_STEPS: ChecklistStep[] = [
  { id: "nif", link: { href: routes.visas } },
  {
    id: "sns",
    link: { href: "https://www.sns.gov.pt", isExternal: true },
  },
  { id: "doctor", link: { href: routes.transHealthcare } },
  { id: "room", link: { href: routes.housing, isMemberOnly: true } },
  { id: "rights", link: { href: routes.tenantRights, isMemberOnly: true } },
  {
    id: "crisis",
    link: { href: "https://ilga-portugal.pt", isExternal: true },
  },
  { id: "gathering", link: { href: routes.gatherings, isMemberOnly: true } },
  { id: "community", link: { href: routes.communities, isMemberOnly: true } },
];
