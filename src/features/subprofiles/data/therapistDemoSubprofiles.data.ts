import type { SubprofileItemDTO } from "../api/subprofiles.api";
import type { DemoSubprofile } from "./subprofiles.data";

// ── Therapist demo personas ──────────────────────────────────────────────────
// Three more listed therapists, so a therapist page's "Also worth a look"
// rows have neighbours in demo mode, each status at a different age
// (PRD-435): one confirmed last week, one a few weeks ago, and one open
// status nobody has touched in months, which the rows show as not confirmed
// recently and rank with no "taking new clients" boost. Unlinked, so their
// owners stay unnamed. Shapes match `SOFIA_NEVES`, with only the blocks the
// therapist layout needs to look listed.

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/** An ISO timestamp `days` before the demo loads, so the statuses keep their
 *  age whatever day the demo runs on. */
export function demoDaysAgoIso(days: number): string {
  return new Date(Date.now() - days * DAY_IN_MILLISECONDS).toISOString();
}

function specialism(
  id: string,
  title: string,
  description: string,
): SubprofileItemDTO {
  return {
    id: `itm-specialisms-${id}`,
    section: "specialisms",
    createdAt: "2025-06-02T10:00:00.000Z",
    title,
    subtitle: null,
    description,
    url: null,
    imageUrl: null,
    date: null,
    meta: null,
    tags: [],
    isFeatured: false,
    collaborators: [],
  };
}

/** Status confirmed last week: open, and boosted. */
const RIO_MATOS: DemoSubprofile = {
  ownerSlug: "carla",
  ownerName: "Carla Nogueira",
  id: "sp-carla-rio-matos",
  kind: "therapist",
  slug: "rio-matos",
  handle: "rio-matos",
  displayName: "Rio Matos",
  avatarUrl: null,
  tagline: "Counselling for trans and non-binary adults · PT / EN",
  bio: "I'm a trans counsellor working with people at every stage of transition, and with the ones who never plan to. Online across Portugal, in person in Porto.",
  coverUrl: null,
  accent: "jade",
  availability: "open_to_collabs",
  availabilityUpdatedAt: demoDaysAgoIso(6),
  ctaLabel: "Book a first session",
  ctaUrl: "https://example.com/rio-matos/book",
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 6,
  viewerEndorsed: false,
  followerCount: 4,
  viewerFollowing: false,
  skinData: {
    therapist: {
      status: "open",
      waitNote: "",
      title: "Counsellor",
      registration: "",
      quote: "You set the pace. Transition is *your* story to tell.",
      languages: ["pt", "en"],
      where: "Bonfim, Porto · and online",
      online: "yes",
      timezone: "",
      email: "",
      website: "",
      goodToKnow: "",
    },
    modalities: ["personCentred", "affirmative"],
  },
  affiliations: [],
  endorsers: [],
  items: [
    specialism(
      "rio-identity",
      "Identity & coming out",
      "Transition at any stage\nQuestioning, without needing a label",
    ),
    specialism(
      "rio-relationships",
      "Relationships",
      "Family after coming out\nChosen family",
    ),
  ],
};

/** Status confirmed a few weeks ago: a waitlist, still trusted. */
const INES_LOBO: DemoSubprofile = {
  ownerSlug: "vera",
  ownerName: "Vera Duarte",
  id: "sp-vera-ines-lobo",
  kind: "therapist",
  slug: "ines-lobo",
  handle: "ines-lobo",
  displayName: "Inês Lobo",
  avatarUrl: null,
  tagline: "Psychologist for queer couples and polycules · Lisbon",
  bio: "I work with couples, triads and families of every shape on the stuff that piles up: jealousy, repair, and whose turn it is to do the dishes.",
  coverUrl: null,
  accent: "coral",
  availability: "booking",
  availabilityUpdatedAt: demoDaysAgoIso(23),
  ctaLabel: "Join the waitlist",
  ctaUrl: "https://example.com/ines-lobo/waitlist",
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 11,
  viewerEndorsed: false,
  followerCount: 17,
  viewerFollowing: false,
  skinData: {
    therapist: {
      status: "wait",
      waitNote: "About 5 weeks",
      title: "Clinical psychologist",
      registration: "OPP 18312",
      quote: "Every relationship has its own rules. We start with *yours*.",
      languages: ["pt", "en", "es"],
      where: "Arroios, Lisbon",
      online: "no",
      timezone: "",
      email: "",
      website: "",
      goodToKnow: "",
    },
    modalities: ["systemic", "affirmative"],
  },
  affiliations: [],
  endorsers: [],
  items: [
    specialism(
      "lobo-relationships",
      "Relationships",
      "Non-monogamy and open relationships\nCouples and relationship therapy",
    ),
    specialism(
      "lobo-everything-else",
      "Everything else",
      "Anxiety and panic\nBurnout and work stress",
    ),
  ],
};

/** An open status left alone for months: shown as not confirmed recently. */
const MIGUEL_REIS: DemoSubprofile = {
  ownerSlug: "rita",
  ownerName: "Rita Camões",
  id: "sp-rita-miguel-reis",
  kind: "therapist",
  slug: "miguel-reis",
  handle: "miguel-reis",
  displayName: "Miguel Reis",
  avatarUrl: null,
  tagline: "Psychotherapy for gay and bi men · online",
  bio: "Shame, sex, family and the long tail of growing up hiding. Online sessions in Portuguese and English.",
  coverUrl: null,
  accent: "plum",
  availability: "open_to_collabs",
  availabilityUpdatedAt: demoDaysAgoIso(140),
  ctaLabel: "Get in touch",
  ctaUrl: "https://example.com/miguel-reis/contact",
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 3,
  viewerEndorsed: false,
  followerCount: 2,
  viewerFollowing: false,
  skinData: {
    therapist: {
      status: "open",
      waitNote: "",
      title: "Psychotherapist",
      registration: "",
      quote: "Nothing you bring here is *too much*.",
      languages: ["pt", "en"],
      where: "Online only",
      online: "yes",
      timezone: "Lisbon time",
      email: "",
      website: "",
      goodToKnow: "",
    },
    modalities: ["traumaInformed"],
  },
  affiliations: [],
  endorsers: [],
  items: [
    specialism(
      "miguel-identity",
      "Identity & coming out",
      "Coming out at any age\nShame and self-acceptance",
    ),
  ],
};

/** Every extra therapist demo persona, appended to `DEMO_SUBPROFILES`. */
export const THERAPIST_DEMO_SUBPROFILES: DemoSubprofile[] = [
  RIO_MATOS,
  INES_LOBO,
  MIGUEL_REIS,
];
