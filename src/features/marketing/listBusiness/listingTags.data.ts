/**
 * The curated tag vocabulary behind the wizard's tag picker, its i18n keys,
 * and the pure helpers the picker runs on every keystroke. Kept free of React
 * so the helpers are unit-tested directly.
 *
 * The English strings below are the stored values: the backend's
 * `GET /directory/tags` serves the same groups and rejects any other tag on
 * save (a listing keeps the older tags it already carries).
 */

import type { TFunction } from "../../../shared/i18n/types";

export type ListingTagGroupId =
  "visiting" | "happening" | "foodDrink" | "pricing" | "languages";

/** Any tag group: the local vocabulary or the server's copy of it. */
export interface ListingTagGroupShape {
  id: string;
  tags: readonly string[];
}

export interface ListingTagGroup extends ListingTagGroupShape {
  id: ListingTagGroupId;
}

/** The vocabulary, in display order. Demo mode reads it directly and live
 *  mode falls back to it while the server copy loads or after a failed read. */
export const LISTING_TAG_GROUPS: readonly ListingTagGroup[] = [
  {
    id: "visiting",
    tags: [
      "By appointment",
      "Booking recommended",
      "Members only",
      "Free entry",
      "Day passes",
      "Memberships",
      "Class packs",
    ],
  },
  {
    id: "happening",
    tags: [
      "Workshops",
      "Classes",
      "Live music",
      "DJ nights",
      "Drag shows",
      "Exhibitions",
      "Readings and talks",
      "Community events",
      "Support groups",
      "Space for hire",
    ],
  },
  {
    id: "foodDrink",
    tags: [
      "Vegan options",
      "Vegetarian options",
      "Gluten-free options",
      "Alcohol-free options",
      "Terrace",
      "Late opening",
    ],
  },
  {
    id: "pricing",
    tags: [
      "Gender-neutral pricing",
      "Sliding scale",
      "Pay what you can",
      "Student discount",
    ],
  },
  {
    id: "languages",
    tags: [
      "Portuguese spoken",
      "English spoken",
      "Spanish spoken",
      "French spoken",
      "Portuguese Sign Language",
    ],
  },
];

/** The most tags one listing can carry (`addTag` in useListingForm enforces it). */
export const LISTING_TAG_CAP = 6;

export const LISTING_TAG_GROUP_LABEL_KEYS: Record<string, string> = {
  visiting: "marketing:listBusiness.tagGroup.visiting",
  happening: "marketing:listBusiness.tagGroup.happening",
  foodDrink: "marketing:listBusiness.tagGroup.foodDrink",
  pricing: "marketing:listBusiness.tagGroup.pricing",
  languages: "marketing:listBusiness.tagGroup.languages",
};

export const LISTING_TAG_LABEL_KEYS: Record<string, string> = {
  "By appointment": "marketing:listBusiness.tag.byAppointment",
  "Booking recommended": "marketing:listBusiness.tag.bookingRecommended",
  "Members only": "marketing:listBusiness.tag.membersOnly",
  "Free entry": "marketing:listBusiness.tag.freeEntry",
  "Day passes": "marketing:listBusiness.tag.dayPasses",
  Memberships: "marketing:listBusiness.tag.memberships",
  "Class packs": "marketing:listBusiness.tag.classPacks",
  Workshops: "marketing:listBusiness.tag.workshops",
  Classes: "marketing:listBusiness.tag.classes",
  "Live music": "marketing:listBusiness.tag.liveMusic",
  "DJ nights": "marketing:listBusiness.tag.djNights",
  "Drag shows": "marketing:listBusiness.tag.dragShows",
  Exhibitions: "marketing:listBusiness.tag.exhibitions",
  "Readings and talks": "marketing:listBusiness.tag.readingsAndTalks",
  "Community events": "marketing:listBusiness.tag.communityEvents",
  "Support groups": "marketing:listBusiness.tag.supportGroups",
  "Space for hire": "marketing:listBusiness.tag.spaceForHire",
  "Vegan options": "marketing:listBusiness.tag.veganOptions",
  "Vegetarian options": "marketing:listBusiness.tag.vegetarianOptions",
  "Gluten-free options": "marketing:listBusiness.tag.glutenFreeOptions",
  "Alcohol-free options": "marketing:listBusiness.tag.alcoholFreeOptions",
  Terrace: "marketing:listBusiness.tag.terrace",
  "Late opening": "marketing:listBusiness.tag.lateOpening",
  "Gender-neutral pricing": "marketing:listBusiness.tag.genderNeutralPricing",
  "Sliding scale": "marketing:listBusiness.tag.slidingScale",
  "Pay what you can": "marketing:listBusiness.tag.payWhatYouCan",
  "Student discount": "marketing:listBusiness.tag.studentDiscount",
  "Portuguese spoken": "marketing:listBusiness.tag.portugueseSpoken",
  "English spoken": "marketing:listBusiness.tag.englishSpoken",
  "Spanish spoken": "marketing:listBusiness.tag.spanishSpoken",
  "French spoken": "marketing:listBusiness.tag.frenchSpoken",
  "Portuguese Sign Language":
    "marketing:listBusiness.tag.portugueseSignLanguage",
};

/** Display label for a stored tag. Falls back to the stored string. */
export function listingTagLabel(translate: TFunction, tag: string): string {
  const key = LISTING_TAG_LABEL_KEYS[tag];
  return key ? translate(key) : tag;
}

/** Display heading for a group id. Falls back to the id itself. */
export function listingTagGroupLabel(
  translate: TFunction,
  groupId: string,
): string {
  const key = LISTING_TAG_GROUP_LABEL_KEYS[groupId];
  return key ? translate(key) : groupId;
}

/** Lowercased with accents folded, so "gluten" finds "Sem glúten". */
function foldForSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * The groups narrowed to the tags whose translated label or stored string
 * contains the query (case- and accent-insensitive). Groups left empty are
 * dropped; a blank query returns every group.
 */
export function filterTagGroups<Group extends ListingTagGroupShape>(
  groups: readonly Group[],
  query: string,
  translate: TFunction,
): Group[] {
  const needle = foldForSearch(query.trim());
  if (!needle) return [...groups];
  const matches = (tag: string) =>
    foldForSearch(tag).includes(needle) ||
    foldForSearch(listingTagLabel(translate, tag)).includes(needle);
  return groups
    .map((group) => ({ ...group, tags: group.tags.filter(matches) }))
    .filter((group) => group.tags.length > 0);
}

/** The selected tags outside the vocabulary: older free-text tags a listing
 *  still carries. Picking cannot add them back. */
export function splitLegacyTags(
  selected: readonly string[],
  groups: readonly ListingTagGroupShape[],
): string[] {
  const vocabulary = new Set(groups.flatMap((group) => group.tags));
  return selected.filter((tag) => !vocabulary.has(tag));
}
