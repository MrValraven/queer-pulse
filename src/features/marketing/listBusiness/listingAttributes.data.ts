import type { TFunction } from "../../../shared/i18n/types";
import {
  COMMON_LISTING_LANGUAGE_CODES,
  INCLUSION_PRACTICE_SCOPES,
  isScopeOffered,
  LISTING_LANGUAGE_CODES,
  type InclusionPracticeScope,
  type ListingScope,
} from "./listingFacts.data";
import type { ListingKind } from "./listingMobile.data";

/**
 * The listing attribute vocabulary (contract 2026-10-08): yes facts scoped
 * to a listing's kind and categories, so a barbershop is never offered "DJ
 * nights". Mirrors the backend's groups slug for slug. Demo reads it
 * directly; live reads `GET /directory/attributes` and falls back to it
 * while the read loads or after it fails (`useListingAttributeVocabulary`).
 *
 * A slug may sit in several groups; every reader shows it once, in the
 * first group of `displayOrderedGroups` (table order, pricing last).
 */

export const LISTING_ATTRIBUTE_SLUGS = [
  "terrace",
  "wifi",
  "laptop-friendly",
  "kid-friendly",
  "dog-friendly",
  "solo-friendly",
  "space-for-hire",
  "takeaway",
  "delivery",
  "hosts-events",
  "workshops",
  "classes",
  "vegan-options",
  "vegetarian-options",
  "gluten-free-options",
  "halal",
  "alcohol-free-drinks",
  "brunch",
  "kitchen-open-late",
  "live-music",
  "dj-nights",
  "drag-shows",
  "karaoke",
  "dancefloor",
  "quiet-corner",
  "smoking-area",
  "coat-check",
  "adults-only",
  "exhibitions",
  "readings-and-talks",
  "screenings",
  "english-subtitles",
  "lgbtq-section",
  "book-club",
  "second-hand",
  "support-groups",
  "kitchen-access",
  "projector-and-sound",
  "quiet-room",
  "open-to-non-members",
  "priced-by-service",
  "curly-textured-hair",
  "colour-specialist",
  "shaves-and-beards",
  "facial-hair-removal",
  "makeup",
  "private-room",
  "drop-in-classes",
  "day-passes",
  "class-packs",
  "memberships",
  "beginner-sessions",
  "trans-nonbinary-sessions",
  "private-changing",
  "personal-training",
  "takes-insurance",
  "online-consultations",
  "home-visits",
  "same-week-appointments",
  "sexual-health-prep",
  "trans-care-experience",
  "made-to-order",
  "custom-commissions",
  "local-makers",
  "repairs",
  "gift-wrapping",
  "refurbished",
  "data-recovery",
  "beginner-help",
  "trade-ins",
  "queer-history",
  "walking-tours",
  "private-tours",
  "small-groups",
  "step-free-route",
  "free-quotes",
  "same-day",
  "weekend-visits",
  "insured",
  "small-jobs",
  "by-appointment",
  "beginner-friendly",
  "good-for-gifts",
  "gift-cards",
  "free-first-call",
  "sliding-scale",
  "pay-what-you-can",
  "student-discount",
] as const;
export type ListingAttributeSlug = (typeof LISTING_ATTRIBUTE_SLUGS)[number];

export const LISTING_ATTRIBUTE_GROUP_IDS = [
  "around",
  "food",
  "nightlife",
  "culture",
  "space",
  "grooming",
  "fitness",
  "health",
  "design",
  "tech",
  "tours",
  "home-services",
  "onlineOffering",
  "onlineFood",
  "onlineOrdering",
  "onlineSessions",
  "pricing",
] as const;
export type ListingAttributeGroupId =
  (typeof LISTING_ATTRIBUTE_GROUP_IDS)[number];

/** One group, local or from the server. `id` and the slugs are plain
 *  strings, so a server group or slug this build does not know still
 *  renders (by its humanised slug). */
export interface ListingAttributeGroup extends ListingScope {
  id: string;
  attributes: readonly string[];
}

const PLACE_KINDS: readonly ListingKind[] = ["place", "mobile"];
const ONLINE_KINDS: readonly ListingKind[] = ["online"];
const EVERY_KIND: readonly ListingKind[] = ["place", "mobile", "online"];

const group = (
  id: ListingAttributeGroupId,
  kinds: readonly ListingKind[],
  categories: readonly string[] | null,
  attributes: readonly ListingAttributeSlug[],
): ListingAttributeGroup => ({ id, kinds, categories, attributes });

/** The contract's table, in its order. */
export const LISTING_ATTRIBUTE_GROUPS: readonly ListingAttributeGroup[] = [
  group("around", PLACE_KINDS, null, [
    "terrace",
    "wifi",
    "laptop-friendly",
    "kid-friendly",
    "dog-friendly",
    "solo-friendly",
    "space-for-hire",
    "takeaway",
    "delivery",
    "hosts-events",
    "workshops",
    "classes",
  ]),
  group(
    "food",
    PLACE_KINDS,
    ["food"],
    [
      "vegan-options",
      "vegetarian-options",
      "gluten-free-options",
      "halal",
      "alcohol-free-drinks",
      "brunch",
      "kitchen-open-late",
    ],
  ),
  group(
    "nightlife",
    PLACE_KINDS,
    ["nightlife"],
    [
      "live-music",
      "dj-nights",
      "drag-shows",
      "karaoke",
      "dancefloor",
      "quiet-corner",
      "alcohol-free-drinks",
      "smoking-area",
      "coat-check",
      "adults-only",
    ],
  ),
  group(
    "culture",
    PLACE_KINDS,
    ["culture"],
    [
      "exhibitions",
      "readings-and-talks",
      "screenings",
      "english-subtitles",
      "lgbtq-section",
      "book-club",
      "second-hand",
    ],
  ),
  group(
    "space",
    PLACE_KINDS,
    ["space"],
    [
      "support-groups",
      "kitchen-access",
      "projector-and-sound",
      "quiet-room",
      "open-to-non-members",
    ],
  ),
  group(
    "grooming",
    PLACE_KINDS,
    ["grooming"],
    [
      "priced-by-service",
      "curly-textured-hair",
      "colour-specialist",
      "shaves-and-beards",
      "facial-hair-removal",
      "makeup",
      "private-room",
    ],
  ),
  group(
    "fitness",
    PLACE_KINDS,
    ["fitness"],
    [
      "drop-in-classes",
      "day-passes",
      "class-packs",
      "memberships",
      "beginner-sessions",
      "trans-nonbinary-sessions",
      "private-changing",
      "personal-training",
    ],
  ),
  group(
    "health",
    PLACE_KINDS,
    ["health"],
    [
      "takes-insurance",
      "online-consultations",
      "home-visits",
      "same-week-appointments",
      "sexual-health-prep",
      "trans-care-experience",
    ],
  ),
  group(
    "design",
    PLACE_KINDS,
    ["design"],
    [
      "made-to-order",
      "custom-commissions",
      "local-makers",
      "second-hand",
      "repairs",
      "gift-wrapping",
    ],
  ),
  group(
    "tech",
    PLACE_KINDS,
    ["tech"],
    ["repairs", "refurbished", "data-recovery", "beginner-help", "trade-ins"],
  ),
  group(
    "tours",
    PLACE_KINDS,
    ["tours"],
    [
      "queer-history",
      "walking-tours",
      "private-tours",
      "small-groups",
      "step-free-route",
    ],
  ),
  group(
    "home-services",
    PLACE_KINDS,
    ["home-services"],
    ["free-quotes", "same-day", "weekend-visits", "insured", "small-jobs"],
  ),
  group("onlineOffering", ONLINE_KINDS, null, [
    "workshops",
    "classes",
    "readings-and-talks",
    "hosts-events",
    "support-groups",
    "by-appointment",
    "memberships",
    "beginner-friendly",
    "good-for-gifts",
  ]),
  group(
    "onlineFood",
    ONLINE_KINDS,
    ["food"],
    [
      "vegan-options",
      "vegetarian-options",
      "gluten-free-options",
      "alcohol-free-drinks",
    ],
  ),
  group("onlineOrdering", ONLINE_KINDS, null, [
    "made-to-order",
    "custom-commissions",
    "gift-cards",
  ]),
  group("onlineSessions", ONLINE_KINDS, null, ["free-first-call"]),
  group("pricing", EVERY_KIND, null, [
    "sliding-scale",
    "pay-what-you-can",
    "student-discount",
  ]),
];

/** Need premises of their own, so never offered to an out-and-about listing. */
export const PREMISES_ONLY_ATTRIBUTE_SLUGS: readonly ListingAttributeSlug[] = [
  "terrace",
  "wifi",
  "laptop-friendly",
  "space-for-hire",
  "kitchen-open-late",
  "dancefloor",
  "quiet-corner",
  "smoking-area",
  "coat-check",
  "kitchen-access",
  "projector-and-sound",
  "quiet-room",
  "private-room",
  "private-changing",
];

/** Shown on the detail page like any other attribute; never filterable,
 *  never a highlight (the server answers 400 to either). */
export const SENSITIVE_ATTRIBUTE_SLUGS: readonly ListingAttributeSlug[] = [
  "sexual-health-prep",
  "trans-care-experience",
];

export const LISTING_HIGHLIGHT_CAP = 3;
/** The request's `ArrayMaxSize`. */
export const LISTING_ATTRIBUTE_CAP = 40;
export const PRICING_GROUP_ID = "pricing";
/** Where the detail page puts a slug no group holds (a newer server's). */
export const OTHER_ATTRIBUTE_GROUP_ID = "other";

/** The vocabulary as `GET /directory/attributes` serves it, normalised. */
export interface ListingAttributeVocabulary {
  groups: readonly ListingAttributeGroup[];
  premisesOnly: readonly string[];
  sensitive: readonly string[];
  inclusionPractices: readonly InclusionPracticeScope[];
  languages: readonly string[];
  commonLanguages: readonly string[];
}

export const LOCAL_ATTRIBUTE_VOCABULARY: ListingAttributeVocabulary = {
  groups: LISTING_ATTRIBUTE_GROUPS,
  premisesOnly: PREMISES_ONLY_ATTRIBUTE_SLUGS,
  sensitive: SENSITIVE_ATTRIBUTE_SLUGS,
  inclusionPractices: INCLUSION_PRACTICE_SCOPES,
  languages: LISTING_LANGUAGE_CODES,
  commonLanguages: COMMON_LISTING_LANGUAGE_CODES,
};

export const LISTING_ATTRIBUTE_LABEL_KEYS: Record<
  ListingAttributeSlug,
  string
> = {
  terrace: "marketing:listingAttribute.terrace",
  wifi: "marketing:listingAttribute.wifi",
  "laptop-friendly": "marketing:listingAttribute.laptopFriendly",
  "kid-friendly": "marketing:listingAttribute.kidFriendly",
  "dog-friendly": "marketing:listingAttribute.dogFriendly",
  "solo-friendly": "marketing:listingAttribute.soloFriendly",
  "space-for-hire": "marketing:listingAttribute.spaceForHire",
  takeaway: "marketing:listingAttribute.takeaway",
  delivery: "marketing:listingAttribute.delivery",
  "hosts-events": "marketing:listingAttribute.hostsEvents",
  workshops: "marketing:listingAttribute.workshops",
  classes: "marketing:listingAttribute.classes",
  "vegan-options": "marketing:listingAttribute.veganOptions",
  "vegetarian-options": "marketing:listingAttribute.vegetarianOptions",
  "gluten-free-options": "marketing:listingAttribute.glutenFreeOptions",
  halal: "marketing:listingAttribute.halal",
  "alcohol-free-drinks": "marketing:listingAttribute.alcoholFreeDrinks",
  brunch: "marketing:listingAttribute.brunch",
  "kitchen-open-late": "marketing:listingAttribute.kitchenOpenLate",
  "live-music": "marketing:listingAttribute.liveMusic",
  "dj-nights": "marketing:listingAttribute.djNights",
  "drag-shows": "marketing:listingAttribute.dragShows",
  karaoke: "marketing:listingAttribute.karaoke",
  dancefloor: "marketing:listingAttribute.dancefloor",
  "quiet-corner": "marketing:listingAttribute.quietCorner",
  "smoking-area": "marketing:listingAttribute.smokingArea",
  "coat-check": "marketing:listingAttribute.coatCheck",
  "adults-only": "marketing:listingAttribute.adultsOnly",
  exhibitions: "marketing:listingAttribute.exhibitions",
  "readings-and-talks": "marketing:listingAttribute.readingsAndTalks",
  screenings: "marketing:listingAttribute.screenings",
  "english-subtitles": "marketing:listingAttribute.englishSubtitles",
  "lgbtq-section": "marketing:listingAttribute.lgbtqSection",
  "book-club": "marketing:listingAttribute.bookClub",
  "second-hand": "marketing:listingAttribute.secondHand",
  "support-groups": "marketing:listingAttribute.supportGroups",
  "kitchen-access": "marketing:listingAttribute.kitchenAccess",
  "projector-and-sound": "marketing:listingAttribute.projectorAndSound",
  "quiet-room": "marketing:listingAttribute.quietRoom",
  "open-to-non-members": "marketing:listingAttribute.openToNonMembers",
  "priced-by-service": "marketing:listingAttribute.pricedByService",
  "curly-textured-hair": "marketing:listingAttribute.curlyTexturedHair",
  "colour-specialist": "marketing:listingAttribute.colourSpecialist",
  "shaves-and-beards": "marketing:listingAttribute.shavesAndBeards",
  "facial-hair-removal": "marketing:listingAttribute.facialHairRemoval",
  makeup: "marketing:listingAttribute.makeup",
  "private-room": "marketing:listingAttribute.privateRoom",
  "drop-in-classes": "marketing:listingAttribute.dropInClasses",
  "day-passes": "marketing:listingAttribute.dayPasses",
  "class-packs": "marketing:listingAttribute.classPacks",
  memberships: "marketing:listingAttribute.memberships",
  "beginner-sessions": "marketing:listingAttribute.beginnerSessions",
  "trans-nonbinary-sessions":
    "marketing:listingAttribute.transNonbinarySessions",
  "private-changing": "marketing:listingAttribute.privateChanging",
  "personal-training": "marketing:listingAttribute.personalTraining",
  "takes-insurance": "marketing:listingAttribute.takesInsurance",
  "online-consultations": "marketing:listingAttribute.onlineConsultations",
  "home-visits": "marketing:listingAttribute.homeVisits",
  "same-week-appointments": "marketing:listingAttribute.sameWeekAppointments",
  "sexual-health-prep": "marketing:listingAttribute.sexualHealthPrep",
  "trans-care-experience": "marketing:listingAttribute.transCareExperience",
  "made-to-order": "marketing:listingAttribute.madeToOrder",
  "custom-commissions": "marketing:listingAttribute.customCommissions",
  "local-makers": "marketing:listingAttribute.localMakers",
  repairs: "marketing:listingAttribute.repairs",
  "gift-wrapping": "marketing:listingAttribute.giftWrapping",
  refurbished: "marketing:listingAttribute.refurbished",
  "data-recovery": "marketing:listingAttribute.dataRecovery",
  "beginner-help": "marketing:listingAttribute.beginnerHelp",
  "trade-ins": "marketing:listingAttribute.tradeIns",
  "queer-history": "marketing:listingAttribute.queerHistory",
  "walking-tours": "marketing:listingAttribute.walkingTours",
  "private-tours": "marketing:listingAttribute.privateTours",
  "small-groups": "marketing:listingAttribute.smallGroups",
  "step-free-route": "marketing:listingAttribute.stepFreeRoute",
  "free-quotes": "marketing:listingAttribute.freeQuotes",
  "same-day": "marketing:listingAttribute.sameDay",
  "weekend-visits": "marketing:listingAttribute.weekendVisits",
  insured: "marketing:listingAttribute.insured",
  "small-jobs": "marketing:listingAttribute.smallJobs",
  "by-appointment": "marketing:listingAttribute.byAppointment",
  "beginner-friendly": "marketing:listingAttribute.beginnerFriendly",
  "good-for-gifts": "marketing:listingAttribute.goodForGifts",
  "gift-cards": "marketing:listingAttribute.giftCards",
  "free-first-call": "marketing:listingAttribute.freeFirstCall",
  "sliding-scale": "marketing:listingAttribute.slidingScale",
  "pay-what-you-can": "marketing:listingAttribute.payWhatYouCan",
  "student-discount": "marketing:listingAttribute.studentDiscount",
};

export const LISTING_ATTRIBUTE_GROUP_LABEL_KEYS: Record<
  ListingAttributeGroupId | typeof OTHER_ATTRIBUTE_GROUP_ID,
  string
> = {
  around: "marketing:listingAttribute.group.around",
  food: "marketing:listingAttribute.group.food",
  nightlife: "marketing:listingAttribute.group.nightlife",
  culture: "marketing:listingAttribute.group.culture",
  space: "marketing:listingAttribute.group.space",
  grooming: "marketing:listingAttribute.group.grooming",
  fitness: "marketing:listingAttribute.group.fitness",
  health: "marketing:listingAttribute.group.health",
  design: "marketing:listingAttribute.group.design",
  tech: "marketing:listingAttribute.group.tech",
  tours: "marketing:listingAttribute.group.tours",
  "home-services": "marketing:listingAttribute.group.homeServices",
  onlineOffering: "marketing:listingAttribute.group.onlineOffering",
  onlineFood: "marketing:listingAttribute.group.onlineFood",
  onlineOrdering: "marketing:listingAttribute.group.onlineOrdering",
  onlineSessions: "marketing:listingAttribute.group.onlineSessions",
  pricing: "marketing:listingAttribute.group.pricing",
  other: "marketing:listingAttribute.group.other",
};

function ownKey<Key extends string>(
  record: Readonly<Record<Key, string>>,
  key: string,
): string | undefined {
  return Object.hasOwn(record, key) ? record[key as Key] : undefined;
}

/** A slug's label in the reader's language. A slug this build does not
 *  know (a newer server's) reads as its words: "rooftop-cinema" becomes
 *  "Rooftop cinema". */
export function attributeLabel(t: TFunction, slug: string): string {
  const key = ownKey(LISTING_ATTRIBUTE_LABEL_KEYS, slug);
  if (key) return t(key);
  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function attributeGroupLabel(t: TFunction, groupId: string): string {
  const key = ownKey(LISTING_ATTRIBUTE_GROUP_LABEL_KEYS, groupId);
  return key ? t(key) : groupId;
}

export function isKnownAttribute(
  slug: string,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): boolean {
  return vocabulary.groups.some((entry) => entry.attributes.includes(slug));
}

export function isSensitiveAttribute(
  slug: string,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): boolean {
  return vocabulary.sensitive.includes(slug);
}

export function isHighlightableAttribute(
  slug: string,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): boolean {
  return !isSensitiveAttribute(slug, vocabulary);
}

/** What `?attr=` may carry: a known slug that is not sensitive. */
export function isFilterableAttribute(
  slug: string,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): boolean {
  return (
    isKnownAttribute(slug, vocabulary) &&
    !isSensitiveAttribute(slug, vocabulary)
  );
}

/** Table order with pricing moved last, the order every reader shows. */
export function displayOrderedGroups(
  groups: readonly ListingAttributeGroup[],
): ListingAttributeGroup[] {
  return [
    ...groups.filter((entry) => entry.id !== PRICING_GROUP_ID),
    ...groups.filter((entry) => entry.id === PRICING_GROUP_ID),
  ];
}

/** The groups the owner picks from: offered to this kind and these
 *  categories, premises-only slugs left out for an out-and-about listing,
 *  each slug once (in the first group), empty groups dropped. */
export function offeredAttributeGroups(
  vocabulary: ListingAttributeVocabulary,
  kind: ListingKind,
  cats: readonly string[],
): ListingAttributeGroup[] {
  const premisesOnly = new Set(vocabulary.premisesOnly);
  const seen = new Set<string>();
  return displayOrderedGroups(vocabulary.groups)
    .filter((entry) => isScopeOffered(entry, kind, cats))
    .map((entry) => ({
      ...entry,
      attributes: entry.attributes.filter((slug) => {
        if (kind === "mobile" && premisesOnly.has(slug)) return false;
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
      }),
    }))
    .filter((entry) => entry.attributes.length > 0);
}

/** Ticked slugs the offered groups do not hold: carried over a category or
 *  kind change, or retired. The server keeps them valid; the owner removes
 *  them from the "No longer fits your categories" row. */
export function carriedAttributesOutsideOffer(
  selected: readonly string[],
  offeredGroups: readonly ListingAttributeGroup[],
): string[] {
  const offered = new Set(offeredGroups.flatMap((entry) => entry.attributes));
  return selected.filter((slug) => !offered.has(slug));
}

export interface AttributeSelection {
  attributes: readonly string[];
  highlights: readonly string[];
}

/** Tick or untick one attribute. Unticking drops its highlight too; a tick
 *  past `LISTING_ATTRIBUTE_CAP` changes nothing. */
export function withAttributeToggled(
  selection: AttributeSelection,
  slug: string,
): { attributes: string[]; highlights: string[] } {
  if (selection.attributes.includes(slug)) {
    return {
      attributes: selection.attributes.filter((entry) => entry !== slug),
      highlights: selection.highlights.filter((entry) => entry !== slug),
    };
  }
  const isAtCap = selection.attributes.length >= LISTING_ATTRIBUTE_CAP;
  return {
    attributes: isAtCap
      ? [...selection.attributes]
      : [...selection.attributes, slug],
    highlights: [...selection.highlights],
  };
}

/** Pick or unpick one highlight: only a ticked, highlightable attribute,
 *  and never a fourth. A stored highlight that cannot be one (a sensitive
 *  slug) is dropped before the cap check, so it never fills a place the
 *  picker's "N of 3" leaves open. */
export function withHighlightToggled(
  selection: AttributeSelection,
  slug: string,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): string[] {
  if (selection.highlights.includes(slug)) {
    return selection.highlights.filter((entry) => entry !== slug);
  }
  const highlightableStored = selection.highlights.filter((entry) =>
    isHighlightableAttribute(entry, vocabulary),
  );
  const canPick =
    selection.attributes.includes(slug) &&
    isHighlightableAttribute(slug, vocabulary) &&
    highlightableStored.length < LISTING_HIGHLIGHT_CAP;
  return canPick ? [...highlightableStored, slug] : [...selection.highlights];
}

/** The ticked attributes that may be a highlight, in tick order. */
export function highlightCandidates(
  attributes: readonly string[],
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): string[] {
  return attributes.filter((slug) =>
    isHighlightableAttribute(slug, vocabulary),
  );
}

/** Lowercased with accents folded, so "gluten" finds "Sem glúten". */
function foldForSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** The groups narrowed to slugs whose translated label or slug holds the
 *  query, case and accents ignored. A blank query returns every group;
 *  emptied groups drop out. */
export function filterAttributeGroups<
  Group extends { attributes: readonly string[] },
>(groups: readonly Group[], query: string, t: TFunction): Group[] {
  const needle = foldForSearch(query.trim());
  if (!needle) return [...groups];
  const isMatch = (slug: string) =>
    foldForSearch(slug).includes(needle) ||
    foldForSearch(attributeLabel(t, slug)).includes(needle);
  return groups
    .map((entry) => ({
      ...entry,
      attributes: entry.attributes.filter(isMatch),
    }))
    .filter((entry) => entry.attributes.length > 0);
}

export interface DisplayAttributeGroup {
  groupId: string;
  attributes: string[];
}

/** "What's here": every attribute under one heading, in the group's own
 *  order. A slug's heading is the first group in display order that holds
 *  it and is offered to this kind and `cats` (the group the owner ticked it
 *  in), then the first that holds it for this kind, then any group; slugs
 *  no group holds come last under "other". Without `cats` the kind alone
 *  decides. */
export function groupAttributesForDisplay(
  attributes: readonly string[],
  kind: ListingKind,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
  cats?: readonly string[],
): DisplayAttributeGroup[] {
  const ordered = displayOrderedGroups(vocabulary.groups);
  const buckets = new Map<string, string[]>();
  for (const slug of attributes) {
    const holding = ordered.filter((entry) => entry.attributes.includes(slug));
    const home =
      (cats
        ? holding.find((entry) => isScopeOffered(entry, kind, cats))
        : undefined) ??
      holding.find((entry) => entry.kinds.includes(kind)) ??
      holding[0];
    const groupId = home ? home.id : OTHER_ATTRIBUTE_GROUP_ID;
    const bucket = buckets.get(groupId) ?? [];
    if (!bucket.includes(slug)) bucket.push(slug);
    buckets.set(groupId, bucket);
  }
  const known = ordered.flatMap((entry): DisplayAttributeGroup[] => {
    const bucket = buckets.get(entry.id);
    if (!bucket) return [];
    return [
      {
        groupId: entry.id,
        attributes: entry.attributes.filter((slug) => bucket.includes(slug)),
      },
    ];
  });
  const other = buckets.get(OTHER_ATTRIBUTE_GROUP_ID);
  return other
    ? [...known, { groupId: OTHER_ATTRIBUTE_GROUP_ID, attributes: other }]
    : known;
}

/** "More filters" for the tab's kinds: the chosen categories' groups
 *  first, then the groups every category carries underneath ("Around the
 *  place" and "Pricing" on the List and Map tabs, the online universal
 *  groups and "Pricing" on the Online tab); with no category chosen, those
 *  universal groups alone. Sensitive slugs left out, each slug once, in the
 *  first group that holds it. */
export function filterableAttributeGroupsFor(
  vocabulary: ListingAttributeVocabulary,
  {
    categories,
    isOnlineScope,
  }: { categories: readonly string[]; isOnlineScope: boolean },
): ListingAttributeGroup[] {
  const kinds = isOnlineScope ? ONLINE_KINDS : PLACE_KINDS;
  const sensitive = new Set(vocabulary.sensitive);
  const seen = new Set<string>();
  const forTab = displayOrderedGroups(vocabulary.groups).filter((entry) =>
    entry.kinds.some((kind) => kinds.includes(kind)),
  );
  const chosen = forTab.filter(
    (entry) =>
      entry.categories !== null &&
      entry.categories.some((category) => categories.includes(category)),
  );
  const universal = forTab.filter((entry) => entry.categories === null);
  return [...chosen, ...universal]
    .map((entry) => ({
      ...entry,
      attributes: entry.attributes.filter((slug) => {
        if (sensitive.has(slug) || seen.has(slug)) return false;
        seen.add(slug);
        return true;
      }),
    }))
    .filter((entry) => entry.attributes.length > 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function kindList(value: unknown): ListingKind[] {
  const wanted = new Set(stringList(value));
  return EVERY_KIND.filter((kind) => wanted.has(kind));
}

function scopeCategories(value: unknown): string[] | null {
  return Array.isArray(value) ? stringList(value) : null;
}

/** `GET /directory/attributes` read defensively: null when the body is no
 *  vocabulary (the caller then keeps the local copy). The sensitive list is
 *  the union of the server's and the local one, so a slug can never become
 *  filterable because a server copy left it out. */
export function normalizeAttributeVocabulary(
  raw: unknown,
): ListingAttributeVocabulary | null {
  if (!isRecord(raw) || !Array.isArray(raw.groups)) return null;
  const groups = raw.groups.flatMap((entry): ListingAttributeGroup[] => {
    if (!isRecord(entry) || typeof entry.id !== "string") return [];
    const attributes = stringList(entry.attributes);
    const kinds = kindList(entry.kinds);
    if (attributes.length === 0 || kinds.length === 0) return [];
    return [
      {
        id: entry.id,
        kinds,
        categories: scopeCategories(entry.categories),
        attributes,
      },
    ];
  });
  if (groups.length === 0) return null;
  const practices = Array.isArray(raw.inclusionPractices)
    ? raw.inclusionPractices.flatMap((entry): InclusionPracticeScope[] =>
        isRecord(entry) && typeof entry.slug === "string"
          ? [
              {
                slug: entry.slug,
                kinds: kindList(entry.kinds),
                categories: scopeCategories(entry.categories),
              },
            ]
          : [],
      )
    : [];
  const languages = stringList(raw.languages);
  const commonLanguages = stringList(raw.commonLanguages);
  return {
    groups,
    premisesOnly: Array.isArray(raw.premisesOnly)
      ? stringList(raw.premisesOnly)
      : PREMISES_ONLY_ATTRIBUTE_SLUGS,
    sensitive: [
      ...new Set([...SENSITIVE_ATTRIBUTE_SLUGS, ...stringList(raw.sensitive)]),
    ],
    inclusionPractices:
      practices.length > 0 ? practices : INCLUSION_PRACTICE_SCOPES,
    languages: languages.length > 0 ? languages : LISTING_LANGUAGE_CODES,
    commonLanguages:
      commonLanguages.length > 0
        ? commonLanguages
        : COMMON_LISTING_LANGUAGE_CODES,
  };
}
