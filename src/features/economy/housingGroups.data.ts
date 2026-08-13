/**
 * Vetted housing groups (P3.1/P3.3) — the access-gated, norm-enforcing groups
 * queer renters already trust over open listing sites. Demo fixtures; live mode
 * reads the API and falls back to these when demo is on. Copy is warm and
 * community-first (see the `queer-community-copywriting` skill).
 */

/** A screening question shown in the join-with-screening flow. */
export interface GroupScreeningQuestion {
  id: string;
  prompt: string;
  required: boolean;
}

/** A norm-compliant listing shared inside a group (price + access required). */
export interface GroupListing {
  id: string;
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
}

export interface VettedGroup {
  /** Slug — the id the UI routes and submits on. */
  id: string;
  name: string;
  nameEm?: string;
  city: string;
  blurb: string;
  isAccessGated: boolean;
  memberCount: number;
  norms: string[];
  screeningQuestions: GroupScreeningQuestion[];
  /** Present on the detail view; the list view leaves it undefined. */
  listings?: GroupListing[];
}

const SHARED_NORMS = [
  "No hate speech — transphobia, racism, whorephobia, serophobia get you removed.",
  "Every listing states the rent, up front. No \"message me for price\".",
  "Every listing describes accessibility honestly — stairs, lift, step-free, bathroom.",
  "No brokers, no agencies, no finder's fees. Neighbours helping neighbours.",
  "What's shared here stays here. Don't screenshot people out of the group.",
];

// The dedicated "relationship to the community" prompt is asked as its own
// field in the join flow — these are the group's ADDITIONAL screening questions.
const SHARED_SCREENING: GroupScreeningQuestion[] = [
  {
    id: "vouch",
    prompt: "Is there anyone already in the group who knows you? No worries if not.",
    required: false,
  },
  {
    id: "values",
    prompt: "Our house rules are on this page — anything there you'd push back on?",
    required: true,
  },
];

export const VETTED_GROUPS: VettedGroup[] = [
  {
    id: "lisbon-trans-housing",
    name: "Trans housing",
    nameEm: "Lisboa",
    city: "Lisbon",
    blurb:
      "A quiet, screened room-and-flatshare group for trans and non-binary folks in and around Lisbon. Real people, real rents, no landlords fishing for tenants.",
    isAccessGated: true,
    memberCount: 214,
    norms: SHARED_NORMS,
    screeningQuestions: SHARED_SCREENING,
    listings: [
      {
        id: "l-1",
        title: "Sunny room in a two-person trans household",
        description:
          "One room opening in a calm, plant-filled flat we've shared for two years. Looking for someone easy-going who's around for shared dinners but respects quiet.",
        neighbourhood: "Arroios, Lisbon",
        priceEuros: 430,
        accessibilityInfo: "Third floor, no lift. Step-free once inside. Bathroom door is 70cm.",
      },
      {
        id: "l-2",
        title: "Whole studio, sublet for three months",
        description:
          "Subletting my ground-floor studio while I'm away for a season. Furnished, bills split, cat stays and comes with instructions.",
        neighbourhood: "Graça, Lisbon",
        priceEuros: 620,
        accessibilityInfo: "Step-free entry from the street. Wet-room shower, no bath lip.",
      },
    ],
  },
  {
    id: "porto-queer-flatshares",
    name: "Queer flatshares",
    nameEm: "Porto",
    city: "Porto",
    blurb:
      "Room shares and whole flats for LGBTQ+ folks in Porto, kept small and vouched-for on purpose. Ask to join and a steward will say hello.",
    isAccessGated: true,
    memberCount: 96,
    norms: SHARED_NORMS,
    screeningQuestions: SHARED_SCREENING,
    listings: [
      {
        id: "l-3",
        title: "Room in a five-person queer house",
        description:
          "A big, loud, loving house near Cedofeita has one room free. We cook together on Sundays and mind our own business the rest of the week.",
        neighbourhood: "Cedofeita, Porto",
        priceEuros: 310,
        accessibilityInfo: "Second floor, no lift. Narrow stairs. Not step-free.",
      },
    ],
  },
  {
    id: "lisbon-disabled-queer-housing",
    name: "Disabled &",
    nameEm: "queer housing",
    city: "Lisbon",
    blurb:
      "Accessible, affordable housing for disabled queer and trans folks — every listing here has to spell out access honestly, because we need it to.",
    isAccessGated: true,
    memberCount: 58,
    norms: SHARED_NORMS,
    screeningQuestions: SHARED_SCREENING,
    listings: [],
  },
];
