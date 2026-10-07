/**
 * The curated tag vocabulary behind the wizard's tag picker, its i18n keys,
 * and the pure helpers the picker runs on every keystroke. Kept free of React
 * so the helpers are unit-tested directly.
 *
 * The English strings below are the stored values: the backend's
 * `GET /directory/tags` serves the same groups and rejects any other tag on
 * save (a listing keeps the older tags it already carries).
 *
 * The online delivery, payment and session tags became structured fields on
 * 2026-10-07 (`listingOnline.data.ts`). The backend's `listing-tags.ts`
 * changes in step. Their label keys stay below, so a stored tag or a server
 * copy from before the change still renders.
 *
 * Each group holds two lists: `tags` for place listings and `onlineTags` for
 * online-only ones. The picker shows one audience at a time through
 * `tagGroupsForAudience`.
 */

import type { TFunction } from "../../../shared/i18n/types";

export type ListingTagGroupId =
  "visiting" | "happening" | "foodDrink" | "pricing" | "ordering" | "sessions";

/** A group narrowed to one audience: the tags that audience is offered. */
export interface ListingTagAudienceGroup {
  id: string;
  tags: readonly string[];
}

/** Any tag group: the local vocabulary or the server's copy of it. `tags` is
 *  offered to place listings and `onlineTags` to online-only listings; either
 *  may be empty. */
export interface ListingTagGroupShape extends ListingTagAudienceGroup {
  onlineTags: readonly string[];
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
    onlineTags: ["By appointment", "Memberships"],
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
    onlineTags: [
      "Workshops",
      "Classes",
      "Readings and talks",
      "Community events",
      "Support groups",
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
    onlineTags: [
      "Vegan options",
      "Vegetarian options",
      "Gluten-free options",
      "Alcohol-free options",
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
    onlineTags: [
      "Gender-neutral pricing",
      "Sliding scale",
      "Pay what you can",
      "Student discount",
    ],
  },
  {
    id: "ordering",
    tags: [],
    onlineTags: ["Made to order", "Custom commissions", "Gift cards"],
  },
  {
    id: "sessions",
    tags: [],
    onlineTags: ["Free first call"],
  },
];

/** The most tags one listing can carry (`addTag` in useListingForm enforces it). */
export const LISTING_TAG_CAP = 6;

export const LISTING_TAG_GROUP_LABEL_KEYS: Record<string, string> = {
  visiting: "marketing:listBusiness.tagGroup.visiting",
  happening: "marketing:listBusiness.tagGroup.happening",
  foodDrink: "marketing:listBusiness.tagGroup.foodDrink",
  pricing: "marketing:listBusiness.tagGroup.pricing",
  ordering: "marketing:listBusiness.tagGroup.ordering",
  payment: "marketing:listBusiness.tagGroup.payment",
  sessions: "marketing:listBusiness.tagGroup.sessions",
  /** The 'visiting' heading on an online listing (see listingTagGroupLabel). */
  visitingOnline: "marketing:listBusiness.tagGroup.visitingOnline",
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
  "Ships to Portugal": "marketing:listBusiness.tag.shipsToPortugal",
  "Ships across the EU": "marketing:listBusiness.tag.shipsAcrossEu",
  "Ships worldwide": "marketing:listBusiness.tag.shipsWorldwide",
  "Pick-up in Lisbon": "marketing:listBusiness.tag.pickUpInLisbon",
  "Made to order": "marketing:listBusiness.tag.madeToOrder",
  "Custom commissions": "marketing:listBusiness.tag.customCommissions",
  "Digital downloads": "marketing:listBusiness.tag.digitalDownloads",
  "Gift cards": "marketing:listBusiness.tag.giftCards",
  "MB WAY": "marketing:listBusiness.tag.mbWay",
  Multibanco: "marketing:listBusiness.tag.multibanco",
  PayPal: "marketing:listBusiness.tag.payPal",
  "Video sessions": "marketing:listBusiness.tag.videoSessions",
  "Phone sessions": "marketing:listBusiness.tag.phoneSessions",
  "Free first call": "marketing:listBusiness.tag.freeFirstCall",
};

/** Display label for a stored tag. Falls back to the stored string. */
export function listingTagLabel(translate: TFunction, tag: string): string {
  const key = LISTING_TAG_LABEL_KEYS[tag];
  return key ? translate(key) : tag;
}

/** Display heading for a group id. An online listing reads the group's
 *  `<id>Online` heading when one exists. Falls back to the id itself. */
export function listingTagGroupLabel(
  translate: TFunction,
  groupId: string,
  isOnline = false,
): string {
  const onlineKey = isOnline
    ? LISTING_TAG_GROUP_LABEL_KEYS[`${groupId}Online`]
    : undefined;
  const key = onlineKey ?? LISTING_TAG_GROUP_LABEL_KEYS[groupId];
  return key ? translate(key) : groupId;
}

/** A tag group as the server sends it. A backend older than the online
 *  vocabulary omits `onlineTags`. */
export interface ServerListingTagGroup {
  id: string;
  tags: readonly string[];
  onlineTags?: readonly string[];
}

/** The server's groups with a missing `onlineTags` read as an empty list. */
export function normalizeServerTagGroups(
  serverGroups: readonly ServerListingTagGroup[],
): ListingTagGroupShape[] {
  return serverGroups.map((group) => ({
    id: group.id,
    tags: group.tags,
    onlineTags: group.onlineTags ?? [],
  }));
}

/**
 * The groups narrowed to one audience: a place listing sees each group's
 * `tags` and an online-only listing its `onlineTags`. Groups left empty are
 * dropped, display order kept.
 */
export function tagGroupsForAudience(
  groups: readonly ListingTagGroupShape[],
  isOnline: boolean,
): ListingTagAudienceGroup[] {
  return groups
    .map((group) => ({
      id: group.id,
      tags: isOnline ? group.onlineTags : group.tags,
    }))
    .filter((group) => group.tags.length > 0);
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
export function filterTagGroups<Group extends ListingTagAudienceGroup>(
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

/** The selected tags outside the groups shown: older free-text tags a
 *  listing still carries, and, given audience-narrowed groups, tags this
 *  audience is not offered (Terrace on a listing since made online-only).
 *  Picking cannot add them back. */
export function splitLegacyTags(
  selected: readonly string[],
  groups: readonly ListingTagAudienceGroup[],
): string[] {
  const vocabulary = new Set(groups.flatMap((group) => group.tags));
  return selected.filter((tag) => !vocabulary.has(tag));
}
