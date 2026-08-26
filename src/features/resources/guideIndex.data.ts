import { routes } from "../../app/routeMap";
import type { ResourceIndexEntryDTO } from "./api/resources.api";

/**
 * Demo manifest for the guide index (CON-10): EVERY guide route the app
 * ships, grouped by the same category keys the live `resources` rows carry.
 *
 * Seventeen of these had no `routes.*` reference anywhere in the app. Their
 * only inbound links were hardcoded path strings inside a demo-only fixture
 * registry, so `/resources/spoon-theory`, `/resources/coming-out-at-work`,
 * `/resources/queer-paediatricians`, `/resources/school-forms-guide`,
 * `/resources/disability-healthcare` and a dozen others were reachable only
 * by typing the URL. The orphans skewed towards the least-served audiences:
 * disabled members, parents, QTIPOC, older members.
 *
 * Live mode reads the same list from GET /resources/index instead. This
 * fixture is code-split out of the live bundle via the demo-gated dynamic
 * import in `useGuideIndex`, and its `description` values mirror each page's
 * own meta description.
 */
export const GUIDE_INDEX_DEMO: ResourceIndexEntryDTO[] = [
  {
    slug: "legal",
    category: "legal",
    title: "Legal rights and legal aid in Portugal",
    description:
      "Workplace and housing discrimination, hate crime, and where to find legal support.",
    routePath: routes.legal,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "school-forms-guide",
    category: "legal",
    title: "School forms for two-parent and trans families",
    description:
      "Getting both parents onto the intake form, and what to do when a school pushes back.",
    routePath: routes.schoolFormsGuide,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "safety",
    category: "safety",
    title: "How QueerPulse protects your privacy and safety",
    description:
      "How visibility levels, vouching, and data protection work on the platform.",
    routePath: routes.safety,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "community-privacy",
    category: "safety",
    title: "QueerPulse privacy: what's visible, and to whom",
    description:
      "What shows on your public profile, what stays inside a community, and what only mods see.",
    routePath: routes.communityPrivacy,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "mental-health",
    category: "health",
    title: "Affirming mental health support in Lisbon",
    description:
      "Therapists, crisis lines, and what affirming care should actually feel like.",
    routePath: routes.mentalHealth,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "wellbeing",
    category: "health",
    title: "Wellbeing: the whole health hub",
    description:
      "Where every health guide, helpline and directory on QueerPulse starts.",
    routePath: routes.wellbeing,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "harm-reduction",
    category: "health",
    title: "Harm reduction, without judgement",
    description:
      "Practical, non-moralising harm reduction for chems, alcohol and everything around them.",
    routePath: routes.harmReduction,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "sober",
    category: "health",
    title: "Sober and sober-curious in queer Lisbon",
    description:
      "Alcohol-free gatherings, sober hosts, and nightlife that does not run on drinking.",
    routePath: routes.sober,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "sexual-health",
    category: "health",
    title: "Sexual health: testing, PrEP and clinics",
    description:
      "Where to test in Lisbon, how PrEP access works, and what each clinic actually offers.",
    routePath: routes.sexualHealth,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "peer-support",
    category: "health",
    title: "Peer support for trans people in Lisbon: how it works",
    description:
      "Not therapy, not advice: someone who gets it, and how the Hub pairs you.",
    routePath: routes.peerSupport,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "disability-healthcare",
    category: "health",
    title: "Disabled and queer: navigating healthcare",
    description:
      "Getting taken seriously by Portuguese healthcare as a disabled queer person.",
    routePath: routes.disabilityHealthcare,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "queer-paediatricians",
    category: "health",
    title: "Paediatricians who get queer families",
    description:
      "Doctors other QueerPulse parents recommend, and what made them worth recommending.",
    routePath: routes.queerPaediatricians,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "spoon-theory",
    category: "health",
    title: "Spoon theory explained: how this community uses it",
    description:
      "Hybrid events by default, no-penalty drop-outs, and permission to say you are low on spoons.",
    routePath: routes.spoonTheory,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "trans-hub",
    category: "trans",
    title: "The Trans Hub",
    description:
      "Everything the Hub holds: peer support, healthcare pathways, paperwork and community.",
    routePath: routes.transHub,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "trans-healthcare",
    category: "trans",
    title:
      "Trans healthcare in Lisbon: clinics, name changes and where to start",
    description:
      "SNS and private HRT pathways, legal name and gender marker change, and surgery access.",
    routePath: routes.transHealthcare,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "micro-grants",
    category: "finance",
    title: "Community micro-grants",
    description:
      "Small grants for queer projects: what they fund, who decides, and how to apply.",
    routePath: routes.microGrants,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "queer-101",
    category: "community",
    title: "Queer 101",
    description:
      "The vocabulary, the history, and the reading list, for anyone starting anywhere.",
    routePath: routes.queer101,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "pronouns-guide",
    category: "community",
    title: "Pronouns and chosen name on QueerPulse: a practical guide",
    description:
      "How chosen names and pronouns work across the platform, and what updates when.",
    routePath: routes.pronounsGuide,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "intersectionality",
    category: "community",
    title: "Intersectionality, in practice",
    description:
      "What the word actually asks of a community, beyond the poster version.",
    routePath: routes.intersectionality,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "accessible-lisbon",
    category: "community",
    title: "Accessible Lisbon",
    description:
      "Step-free routes, quiet venues, and places that have actually been checked.",
    routePath: routes.accessibleLisbon,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "coming-out-at-work",
    category: "community",
    title: "Coming out at work in Portugal",
    description:
      "What the law protects, how other members did it, and what to do when it goes badly.",
    routePath: routes.comingOutAtWork,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "first-meetup-guide",
    category: "community",
    title: "Your first QueerPulse meetup: what to expect",
    description:
      "What actually happens, what 'no agenda' means, and the nervous questions answered.",
    routePath: routes.firstMeetupGuide,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "lgbtq-aging-guide",
    category: "community",
    title: "LGBTQ+ aging in Portugal: healthcare after 50",
    description:
      "Finding a GP who does not make it weird, hospitals, elder care and later-life support.",
    routePath: routes.lgbtqAgingGuide,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "qtipoc-organisations",
    category: "community",
    title: "QTIPOC organisations in Portugal and how to reach them",
    description:
      "Groups working where race and queerness meet, with both treated as central.",
    routePath: routes.qtipocOrganisations,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "running-guide",
    category: "community",
    title: "Queer running group in Lisbon: pace groups and what to bring",
    description:
      "Three pace groups from social to steady, and honestly less kit than you think.",
    routePath: routes.runningGuide,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "art-crit-guide",
    category: "culture",
    title: "How Rainbow Arts crit sessions work",
    description:
      "Honest, kind, specific, in that order: the whole method before you walk in.",
    routePath: routes.artCritGuide,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "shared-equipment",
    category: "culture",
    title: "Shared studio equipment: the Rainbow Arts kit library",
    description:
      "The riso, the kiln, the projector, the bookbinding kit, and how we care for them.",
    routePath: routes.sharedEquipment,
    lastReviewedOn: null,
    isManaged: true,
  },
  {
    slug: "group-show-archive",
    category: "culture",
    title: "Rainbow Arts: an archive of every group show",
    description:
      "Every show the collective has hung, with dates, venues, and what was made.",
    routePath: routes.groupShowArchive,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "ingredients-map",
    category: "culture",
    title: "The ingredients map",
    description:
      "Where to find the shops that stock what the recipes of home actually need.",
    routePath: routes.ingredientsMap,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "oral-history-project",
    category: "culture",
    title: "The oral history project",
    description:
      "Recording queer lives in Portugal before the stories go, and how to take part.",
    routePath: routes.oralHistoryProject,
    lastReviewedOn: null,
    isManaged: false,
  },
  {
    slug: "qtipoc-archive",
    category: "culture",
    title: "The QTIPOC archive",
    description:
      "Photo sets, letters and recordings from the QTIPOC circle, kept together.",
    routePath: routes.qtipocArchive,
    lastReviewedOn: null,
    isManaged: false,
  },
];
