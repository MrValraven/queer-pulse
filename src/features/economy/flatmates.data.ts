import { getMember, fullName, type Member } from "../members/data/members";
import type {
  FlatmateHouseholdNorms,
  FlatmateIdentityHousehold,
  IdentityVisibility,
  MatchReason,
} from "./api/flatmateProfile.api";
import type { VerificationLevel } from "./api/verification.api";

export type ListingType = "seeking" | "offering";

/**
 * A flatmate-board listing. Identity (name, pronouns, avatar, neighbourhood,
 * member-since) is pulled from the canonical member registry by `slug` — so
 * everyone posting here is a real member who exists elsewhere on the platform.
 * Only the listing-specific fields live below.
 */
interface Listing {
  /** Member slug in the registry. */
  slug: string;
  pronouns: string;
  type: ListingType;
  /** Filterable neighbourhood; defaults to the member's home hood. */
  neighbourhood?: string;
  /** Display string for the listing (can be broader than the filter value). */
  neighbourhoodLabel: string;
  budget: string;
  budgetRange: number;
  movein: string;
  moveinKey: string;
  note: string;
  tags: string[];
  /** Optional demo-only special-category fields (backend gates these live). */
  genderIdentity?: string;
  safeSpaceNeeds?: string[];
  householdNorms?: FlatmateHouseholdNorms;
  identityHousehold?: FlatmateIdentityHousehold;
  /** Demo-only compatibility score + explainable reasons (live: from the API). */
  matchScore?: number;
  matchReasons?: MatchReason[];
}

export interface Profile {
  id: number;
  slug: string;
  profileSlug: string; // the flatmate-profile slug (for hello/save/report); demo reuses the member slug
  matchScore?: number | null; // live compatibility score (0-100) when the viewer has a profile
  name: string;
  pronouns: string;
  type: ListingType;
  neighbourhood: string;
  neighbourhoodLabel: string;
  budget: string;
  budgetRange: number;
  movein: string;
  moveinKey: string;
  note: string;
  tags: string[];
  genderIdentity?: string;
  safeSpaceNeeds?: string[];
  householdNorms?: FlatmateHouseholdNorms;
  identityHousehold?: FlatmateIdentityHousehold;
  identityVisibility?: IdentityVisibility;
  matchReasons?: MatchReason[];
  initials: string;
  tint: Member["tint"];
  photo?: string;
  /** The member's real identity-verification level — drives the honest badge.
   * Never a decorative flag; `email`/`none` show no badge. */
  verificationLevel: VerificationLevel;
  since: string;
}

const LISTINGS: Listing[] = [
  {
    slug: "carla",
    pronouns: "she/her",
    type: "seeking",
    neighbourhoodLabel: "Arroios or Anjos",
    budget: "€700–900",
    budgetRange: 800,
    movein: "Flexible",
    moveinKey: "flex",
    note: "Between roles right now and looking for somewhere settled in Arroios after a summer of subletting. I'm a product manager: tidy, around during the day, and I walk everywhere so I'm rarely underfoot in the evenings. Looking for a household where I don't have to translate myself.",
    tags: ["WFH", "Quiet household", "Sociable", "Early riser"],
  },
  {
    slug: "rui",
    pronouns: "he/him",
    type: "offering",
    neighbourhoodLabel: "Marvila",
    budget: "€750 / month",
    budgetRange: 750,
    movein: "Available now",
    moveinKey: "now",
    note: "There's a room going in our warehouse flat in Marvila: high ceilings, far too many plants, and three of us in tech and music who mostly keep good hours. Looking for a fourth who's easy-going and cares about a calm home. The cat is already in residence.",
    tags: ["Plant parent", "WFH", "Quiet household", "Pets welcome"],
  },
  {
    slug: "ines",
    pronouns: "she/her",
    type: "offering",
    neighbourhoodLabel: "Príncipe Real",
    budget: "€950 / month",
    budgetRange: 950,
    movein: "Mid-July",
    moveinKey: "jul",
    note: "I have a bright first-floor flat in Príncipe Real with a spare room and a garden view. I run my design studio from the back, often at odd hours, so I'm after someone calm and self-contained. You'd have your own bathroom and a very quiet street.",
    tags: ["WFH", "Quiet household", "Introvert-friendly", "Plant parent"],
  },
  {
    slug: "kai",
    pronouns: "they/them",
    type: "seeking",
    neighbourhoodLabel: "Cais do Sodré or anywhere central",
    budget: "€600–800",
    budgetRange: 700,
    movein: "Flexible",
    moveinKey: "flex",
    note: "Just landed in Lisbon and shooting a documentary on the city's queer nightlife, so my hours are honestly all over the place. I'm tidy, easy company, and good at being quiet when you need the flat calm. Looking for somewhere I don't have to explain the 4am returns.",
    tags: ["Night owl", "Late nights fine", "Sociable"],
    genderIdentity: "Non-binary",
    safeSpaceNeeds: ["Trans-inclusive household", "Affirming flatmates"],
    householdNorms: { sleepSchedule: "Night owl", noise: "Relaxed about noise" },
    identityHousehold: {
      outAtHome: "Out at home",
      bathroomComfort: "Happy to share a bathroom",
    },
    matchScore: 88,
    matchReasons: [
      { factor: "safeSpace", label: "Shared safe-space values", weight: 15, contribution: 15 },
      { factor: "budget", label: "Budget and rent line up", weight: 25, contribution: 25 },
      { factor: "lifestyle", label: "Several lifestyle tags in common", weight: 15, contribution: 10 },
    ],
  },
  {
    slug: "beatriz",
    pronouns: "she/her",
    type: "offering",
    neighbourhoodLabel: "Graça",
    budget: "€700 / month",
    budgetRange: 700,
    movein: "1 August",
    moveinKey: "aug",
    note: "The smaller room in my place in Graça is opening up: good afternoon light, a tidy-ish kitchen, and me, usually covered in clay and home most days. I like a quiet household with real conversation in it. My cat already runs the place.",
    tags: ["WFH", "Quiet household", "Plant parent", "Cats welcome"],
  },
  {
    slug: "anika",
    pronouns: "she/they",
    type: "seeking",
    neighbourhoodLabel: "Mouraria or Arroios",
    budget: "€600–750",
    budgetRange: 675,
    movein: "Flexible",
    moveinKey: "flex",
    note: "Translator and poet, working from home most days with headphones on and the kettle always going. I'm after a calm flat with people who are happy to share the occasional dinner and otherwise let the quiet be. Sober-friendly, plant-friendly, low drama.",
    tags: ["WFH", "Quiet household", "Sober household", "Plant parent"],
    genderIdentity: "Trans woman",
    safeSpaceNeeds: ["Trans-inclusive household", "No outing", "Chosen-family friendly"],
    householdNorms: {
      cleanliness: "Tidy",
      guests: "Occasional guests",
      noise: "Quiet, please",
    },
    identityHousehold: {
      mailNamePrivacy: "Post in my chosen name, please",
      medicationPrivacy: "Discreet about medication",
    },
    matchScore: 91,
    matchReasons: [
      { factor: "safeSpace", label: "Shared safe-space values", weight: 15, contribution: 15 },
      { factor: "household", label: "Household basics agree", weight: 15, contribution: 15 },
      { factor: "neighbourhood", label: "Same neighbourhood", weight: 20, contribution: 20 },
      { factor: "budget", label: "Budget is roughly in range", weight: 25, contribution: 18 },
    ],
  },
  {
    slug: "jordan",
    pronouns: "they/them",
    type: "seeking",
    neighbourhoodLabel: "Graça or Mouraria",
    budget: "€800–1,000",
    budgetRange: 900,
    movein: "Available now",
    moveinKey: "now",
    note: "Community organiser: after a decade of this work I've learned to protect a calm home. I'm looking for a steady, considerate household in Graça: I cook, I clean up after myself, and I'm very good at keeping the peace. No drama, just a place to land.",
    tags: ["Quiet household", "Sociable", "WFH", "Early riser"],
  },
  {
    slug: "andre",
    pronouns: "he/him",
    type: "offering",
    neighbourhoodLabel: "Cais do Sodré",
    budget: "€850 / month",
    budgetRange: 850,
    movein: "Mid-July",
    moveinKey: "jul",
    note: "Big room going in my flat in Cais do Sodré, five minutes from the river and from my studio. I shoot portraits on film so the hours bend a bit, but I respect a shared home completely. Sociable when you want it, invisible when you don't.",
    tags: ["Sociable", "Late nights fine", "Pets welcome", "Night owl"],
  },
];

export const PROFILES: Profile[] = LISTINGS.map((l, i) => {
  const m = getMember(l.slug);
  if (!m) throw new Error(`Flatmates: unknown member slug "${l.slug}"`);
  return {
    id: i + 1,
    slug: l.slug,
    profileSlug: l.slug,
    name: fullName(m),
    pronouns: l.pronouns,
    type: l.type,
    neighbourhood: l.neighbourhood ?? m.hood,
    neighbourhoodLabel: l.neighbourhoodLabel,
    budget: l.budget,
    budgetRange: l.budgetRange,
    movein: l.movein,
    moveinKey: l.moveinKey,
    note: l.note,
    tags: l.tags,
    genderIdentity: l.genderIdentity,
    safeSpaceNeeds: l.safeSpaceNeeds,
    householdNorms: l.householdNorms,
    identityHousehold: l.identityHousehold,
    identityVisibility: "matches",
    matchScore: l.matchScore ?? null,
    matchReasons: l.matchReasons,
    initials: m.initials,
    tint: m.tint,
    photo: m.photo,
    // Demo has no real verification event, so mirror the member registry's
    // verified flag onto the honest ladder (verified → ID-verified) purely to
    // demonstrate the badge; unverified demo members show none.
    verificationLevel: m.verified ? "id_verified" : "email",
    since: m.since,
  };
});

export const NEIGHBOURHOODS = [
  "Príncipe Real",
  "Mouraria",
  "Arroios",
  "Graça",
  "Bairro Alto",
  "Cais do Sodré",
  "Marvila",
  "Estrela",
];
export const LIFESTYLE_TAGS = [
  "WFH",
  "Quiet household",
  "Sociable",
  "Sober household",
  "Early riser",
  "Night owl",
  "Pets welcome",
  "Plant parent",
  "Vegan kitchen",
  "420-friendly",
];
export const MODAL_TAGS = [
  "Early riser",
  "Night owl",
  "WFH",
  "Quiet household",
  "Sociable",
  "Sober household",
  "Pets welcome",
  "Cats welcome",
  "Plant parent",
  "Vegan kitchen",
  "Musicians welcome",
  "Late nights fine",
  "Introvert-friendly",
  "420-friendly",
];

/** Affirming / values statements a member can add to their profile. These are
 * always framed as what a home *is*, never as excluding anyone — no
 * exclusionary options belong here (fair-housing). Stored verbatim. */
export const SAFE_SPACE_NEEDS = [
  "Trans-inclusive household",
  "Affirming flatmates",
  "No outing",
  "Chosen-family friendly",
  "Sober-friendly space",
  "Neurodivergent-friendly",
  "Disability-aware",
  "Pronouns respected",
];

/** Ordinary shared-living preferences + the co-living compatibility
 * questionnaire (`noise`, `sharing`). Each maps to one `householdNorms` key; the
 * option strings are stored verbatim (like lifestyle tags) and feed the
 * household-compatibility match factor. Ordinary data — no consent needed. */
export const HOUSEHOLD_NORM_FIELDS: {
  key: keyof FlatmateHouseholdNorms;
  labelKey: string;
  options: string[];
}[] = [
  {
    key: "smoking",
    labelKey: "economy:postProfileForm.household.smoking",
    options: ["Non-smoking home", "Smoking OK", "Outdoor only"],
  },
  {
    key: "pets",
    labelKey: "economy:postProfileForm.household.pets",
    options: ["Pets welcome", "No pets", "Already have pets"],
  },
  {
    key: "guests",
    labelKey: "economy:postProfileForm.household.guests",
    options: ["Guests welcome", "Occasional guests", "Quiet on guests"],
  },
  {
    key: "cleanliness",
    labelKey: "economy:postProfileForm.household.cleanliness",
    options: ["Tidy", "Relaxed", "Shared cleaning rota"],
  },
  {
    key: "sleepSchedule",
    labelKey: "economy:postProfileForm.household.sleepSchedule",
    options: ["Early riser", "Night owl", "Varies"],
  },
  {
    key: "noise",
    labelKey: "economy:postProfileForm.household.noise",
    options: ["Quiet, please", "Relaxed about noise", "Music welcome"],
  },
  {
    key: "sharing",
    labelKey: "economy:postProfileForm.household.sharing",
    options: ["Love shared spaces", "A balance of both", "Mostly keep to myself"],
  },
];

/** Consent-gated (GDPR Art.9) trans-affirming household prompts. Each maps to
 * one `identityHousehold` key. Framed as affirming/compatibility, never
 * intrusive; all optional. Only stored + shown under the same consent gate as
 * pronouns / gender / safe-space needs. */
export const IDENTITY_HOUSEHOLD_FIELDS: {
  key: keyof FlatmateIdentityHousehold;
  labelKey: string;
  options: string[];
}[] = [
  {
    key: "outAtHome",
    labelKey: "economy:postProfileForm.identityHousehold.outAtHome",
    options: ["Out at home", "Private at home", "Prefer not to say"],
  },
  {
    key: "bathroomComfort",
    labelKey: "economy:postProfileForm.identityHousehold.bathroom",
    options: [
      "Happy to share a bathroom",
      "Prefer my own bathroom",
      "No preference",
    ],
  },
  {
    key: "mailNamePrivacy",
    labelKey: "economy:postProfileForm.identityHousehold.mailName",
    options: [
      "Post in my chosen name, please",
      "Either name is fine",
      "Prefer not to say",
    ],
  },
  {
    key: "medicationPrivacy",
    labelKey: "economy:postProfileForm.identityHousehold.medication",
    options: [
      "Discreet about medication",
      "Open about it",
      "Prefer not to say",
    ],
  },
];

/** Who can see the special-category identity fields. */
export const IDENTITY_VISIBILITY_OPTIONS: {
  value: IdentityVisibility;
  labelKey: string;
}[] = [
  { value: "public", labelKey: "economy:postProfileForm.visibility.public" },
  { value: "members", labelKey: "economy:postProfileForm.visibility.members" },
  { value: "matches", labelKey: "economy:postProfileForm.visibility.matches" },
  { value: "hidden", labelKey: "economy:postProfileForm.visibility.hidden" },
];

/** Demo-only stand-in for the signed-in member's own consent-stored pronouns,
 * so the opt-in pronoun pre-share is demonstrable without a live profile. Live
 * mode reads the real value from `useMyFlatmateProfile`; never used there. */
export const DEMO_MY_PRONOUNS = "they/them";

/** Demo-only: a discovery "like" resolves to a mutual match when the profile's
 * compatibility score clears this bar — deterministic so the fixture always has
 * a couple of matches to show. Live mode ignores this (the backend decides from
 * real reciprocal likes). */
export const DEMO_MATCH_THRESHOLD = 85;

export function demoWouldMatch(p: Profile): boolean {
  return (p.matchScore ?? 0) >= DEMO_MATCH_THRESHOLD;
}

export function matchesBudget(p: Profile, budget: string) {
  if (budget === "all") return true;
  const b = p.budgetRange;
  if (budget === "600") return b <= 700;
  if (budget === "700") return b > 700 && b <= 900;
  if (budget === "900") return b > 900 && b <= 1100;
  if (budget === "1100") return b > 1100;
  return true;
}
