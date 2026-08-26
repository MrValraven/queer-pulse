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
  "No hate speech: transphobia, racism, whorephobia, serophobia get you removed.",
  'Every listing states the rent, up front. No "message me for price".',
  "Every listing describes accessibility honestly: stairs, lift, step-free, bathroom.",
  "No brokers, no agencies, no finder's fees. Neighbours helping neighbours.",
  "What's shared here stays here. Don't screenshot people out of the group.",
];

// The dedicated "relationship to the community" prompt is asked as its own
// field in the join flow — these are the group's ADDITIONAL screening questions.
const SHARED_SCREENING: GroupScreeningQuestion[] = [
  {
    id: "vouch",
    prompt:
      "Is there anyone already in the group who knows you? No worries if not.",
    required: false,
  },
  {
    id: "values",
    prompt:
      "Our house rules are on this page. Anything there you'd push back on?",
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
        accessibilityInfo:
          "Third floor, no lift. Step-free once inside. Bathroom door is 70cm.",
      },
      {
        id: "l-2",
        title: "Whole studio, sublet for three months",
        description:
          "Subletting my ground-floor studio while I'm away for a season. Furnished, bills split, cat stays and comes with instructions.",
        neighbourhood: "Graça, Lisbon",
        priceEuros: 620,
        accessibilityInfo:
          "Step-free entry from the street. Wet-room shower, no bath lip.",
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
        accessibilityInfo:
          "Second floor, no lift. Narrow stairs. Not step-free.",
      },
    ],
  },
  {
    id: "lisbon-disabled-queer-housing",
    name: "Disabled &",
    nameEm: "queer housing",
    city: "Lisbon",
    blurb:
      "Accessible, affordable housing for disabled queer and trans folks. Every listing here has to spell out access honestly, because we need it to.",
    isAccessGated: true,
    memberCount: 58,
    norms: SHARED_NORMS,
    screeningQuestions: SHARED_SCREENING,
    listings: [],
  },
];

/**
 * The four states a room a member submitted can be in. `review` is where every
 * submission lands, `live` is on the group page, `question` means a moderator
 * needs something answered first, and `declined` means it will not go up.
 */
export type MyGroupListingStatus = "review" | "question" | "live" | "declined";

/**
 * A room the signed-in member submitted to a group, with the moderation state
 * the public group page deliberately hides. `decisionReason` is the
 * moderator's own sentence, shown to the poster verbatim.
 */
export interface MyGroupListing extends GroupListing {
  status: MyGroupListingStatus;
  /** Taken down after publication for a norm the moderator recorded. */
  hidden: boolean;
  hiddenReason: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  createdAt: string;
}

/**
 * Demo fixtures for "your rooms in this group", keyed by group slug. Live mode
 * reads `GET /housing-groups/:slug/listings/mine` instead and never touches
 * these. Deliberately covers all four states in one group, since the whole
 * point of the surface is that a member can see which one they are in.
 */
export const DEMO_MY_GROUP_LISTINGS: Record<string, MyGroupListing[]> = {
  "lisbon-trans-housing": [
    {
      id: "mine-1",
      title: "Sunny room in a two-person trans household",
      description:
        "One room opening in a calm, plant-filled flat we've shared for two years. Looking for someone easy-going who's around for shared dinners but respects quiet.",
      neighbourhood: "Arroios, Lisbon",
      priceEuros: 430,
      accessibilityInfo:
        "Third floor, no lift. Step-free once inside. Bathroom door is 70cm.",
      status: "live",
      hidden: false,
      hiddenReason: null,
      decidedAt: "2026-08-19T10:20:00.000Z",
      decisionReason: null,
      createdAt: "2026-08-18T18:04:00.000Z",
    },
    {
      id: "mine-2",
      title: "Small room, short let over the summer",
      description:
        "Free from June to September while my flatmate is away. Furnished, bills split four ways.",
      neighbourhood: "Anjos, Lisbon",
      priceEuros: 340,
      accessibilityInfo: "Second floor, no lift. Narrow stairwell.",
      status: "question",
      hidden: false,
      hiddenReason: null,
      decidedAt: "2026-08-24T09:12:00.000Z",
      decisionReason:
        "Could you say whether the 340 covers bills or sits on top of them? The group rule is that the number people read is the number they pay.",
      createdAt: "2026-08-23T21:40:00.000Z",
    },
    {
      id: "mine-3",
      title: "Room available, message me for details",
      description: "Nice place, quiet street. Get in touch and we'll talk.",
      neighbourhood: "Lisbon",
      priceEuros: 1,
      accessibilityInfo: "Ask me.",
      status: "declined",
      hidden: false,
      hiddenReason: null,
      decidedAt: "2026-08-21T15:02:00.000Z",
      decisionReason:
        "Two house rules are missing here: the real rent has to be in the post, and access has to be described rather than left as a question. Post it again with both and it will go straight up.",
      createdAt: "2026-08-21T11:15:00.000Z",
    },
  ],
};
