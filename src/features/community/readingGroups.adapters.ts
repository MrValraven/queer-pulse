import type { CommunityCardDTO } from "../communities/api/communities.api";
import { SPINE_COLORS, type Format, type Group } from "./readingGroups.data";

/**
 * The curated community tag that MAKES a community a reading group.
 *
 * A reading group is a community, not a table of its own. That is what lets a
 * group inherit a roster, join requests, posts, moderation and a detail page
 * the moment it exists, instead of growing a second, thinner copy of all five
 * next to the real ones. `book-club` is already in the platform's curated
 * `COMMUNITY_TAGS` vocabulary, so the directory is a filter over an endpoint
 * that already exists (`GET /communities?tags=book-club`) rather than a new
 * one, and a group created through the ordinary community flow shows up here
 * too without anybody wiring it.
 */
export const READING_GROUP_TAG = "book-club";

/** The two curated tags a group carries to say where it meets. */
const IN_PERSON_TAG = "in-person-meetups";
const ONLINE_TAG = "virtual-online";

/**
 * Where a live group meets, read off its curated tags. A group carrying both
 * is genuinely happy either way, which is one of the three answers the propose
 * form offers, so it stays `either` rather than being forced onto one side.
 * A group carrying neither is treated as in-person, the directory's default
 * and the same assumption the demo set makes.
 */
function formatFromTags(tags: string[] | undefined): Format {
  const meetsInPerson = tags?.includes(IN_PERSON_TAG) ?? false;
  const meetsOnline = tags?.includes(ONLINE_TAG) ?? false;
  if (meetsInPerson && meetsOnline) return "either";
  if (meetsOnline) return "online";
  return "irl";
}

/** A stable spine colour for a slug: the same group gets the same spine on
 *  every visit, on every device, without storing a colour anywhere. */
function spineColorForSlug(slug: string): string {
  let total = 0;
  for (let index = 0; index < slug.length; index += 1) {
    total += slug.charCodeAt(index);
  }
  return SPINE_COLORS[total % SPINE_COLORS.length] ?? SPINE_COLORS[0];
}

/**
 * A live reading group, in the shape the directory card renders.
 *
 * What is deliberately NOT invented here: a genre (nobody was asked for one),
 * a meeting place, a cadence, a language, or a number of spare seats. Each
 * stays null and the card omits it, because a directory that fills its gaps
 * with plausible defaults is the ephemeral prototype this replaced.
 */
export function communityCardToReadingGroup(card: CommunityCardDTO): Group {
  const book = card.name;
  return {
    id: card.slug,
    communitySlug: card.slug,
    genre: null,
    format: formatFromTags(card.tags),
    book,
    author: null,
    spine: book.trim().charAt(0).toUpperCase() || "?",
    spineColor: spineColorForSlug(card.slug),
    // The group's own name would only repeat the book it is named after, so
    // the card shows the book once and leaves this empty.
    name: null,
    description: card.tagline,
    where: null,
    frequency: null,
    spots: null,
    language: null,
    memberCount: card.memberCount,
    isJoined: card.myRole !== null,
  };
}
