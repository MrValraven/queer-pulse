import type { AvatarTint } from "../../shared/components/ui";
import { tintForSlug } from "../../shared/api/refs";
import { initials } from "./api/feed.adapters";
import type { FeedItem, FeedReason } from "./api/feed.api";

/** One person in the "people joined recently" card. A plain view model, built
 *  from a `new_member` feed item through `feedItemToNewMemberRow` (live items
 *  and the demo's `DEMO_NEW_MEMBER_ITEMS` alike). */
export interface NewMemberRowModel {
  slug: string;
  name: string;
  pronouns: string | null;
  avatarSrc?: string;
  initials: string;
  tint: AvatarTint;
  reason?: FeedReason;
  reasonSubject?: string | null;
  mutualConnectionCount?: number;
  /** The member's interests the viewer also lists, in the member's order. */
  sharedInterests?: string[];
  /** ISO join time, shown through `compactJoinedTimeLabel`. */
  createdAt: string;
}

/** A live `new_member` item as a group row, deriving slug, name, pronouns,
 *  avatar, initials and tint exactly the way `MemberCard` does. */
export function feedItemToNewMemberRow(item: FeedItem): NewMemberRowModel {
  const slug = item.actor?.handle ?? "";
  return {
    slug,
    name: item.title,
    pronouns: item.actor?.pronouns ?? null,
    avatarSrc: item.actor?.avatarUrl ?? undefined,
    initials: initials(item.title),
    tint: slug ? tintForSlug(slug) : "plum",
    reason: item.reason,
    reasonSubject: item.reasonSubject,
    mutualConnectionCount: item.mutualConnectionCount,
    sharedInterests: item.sharedInterests,
    createdAt: item.createdAt,
  };
}

/** One masonry child in the "All" tab: a plain feed item, or every new member
 *  folded into a single "people joined recently" card. */
export type FeedRenderEntry =
  | { kind: "item"; item: FeedItem }
  | { kind: "newMembersGroup"; key: string; members: FeedItem[] };

/** Constant on purpose: when infinite scroll appends more new members, the
 *  group keeps its key, so React keeps its DOM node (and its expanded state)
 *  and the masonry only relayouts the one card that grew. */
export const NEW_MEMBERS_GROUP_KEY = "new-members-group";

/** Fewer new members than this stay plain cards: a group of one would only
 *  add a heading around a single person. */
const MIN_NEW_MEMBERS_TO_GROUP = 2;

function joinedAtMs(item: FeedItem): number {
  const timestamp = new Date(item.createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortNewestFirst(items: FeedItem[]): FeedItem[] {
  return [...items].sort(
    (first, second) => joinedAtMs(second) - joinedAtMs(first),
  );
}

/**
 * Fold every `new_member` item into ONE group entry, placed where the first of
 * them sat in the feed, with its members sorted newest first. With fewer than
 * two new members there is nothing to fold, so the list comes back as plain
 * items (a group of one would only add a heading around a single person).
 */
export function groupNewMemberItems(items: FeedItem[]): FeedRenderEntry[] {
  const newMembers = items.filter((item) => item.type === "new_member");
  if (newMembers.length < MIN_NEW_MEMBERS_TO_GROUP) {
    return items.map((item) => ({ kind: "item", item }));
  }

  const sortedMembers = sortNewestFirst(newMembers);
  const entries: FeedRenderEntry[] = [];
  let hasPlacedGroup = false;
  for (const item of items) {
    if (item.type !== "new_member") {
      entries.push({ kind: "item", item });
    } else if (!hasPlacedGroup) {
      entries.push({
        kind: "newMembersGroup",
        key: NEW_MEMBERS_GROUP_KEY,
        members: sortedMembers,
      });
      hasPlacedGroup = true;
    }
  }
  return entries;
}

/** The live list as render entries: grouped when the page asks for it (the
 *  "All" tab), otherwise one plain entry per item (the People tab keeps one
 *  card per member). */
export function liveFeedRenderEntries(
  items: FeedItem[],
  isGroupingNewMembers: boolean,
): FeedRenderEntry[] {
  return isGroupingNewMembers
    ? groupNewMemberItems(items)
    : items.map((item) => ({ kind: "item", item }));
}

/** React key for an entry: the item id, or the group's constant key. */
export function feedRenderEntryKey(entry: FeedRenderEntry): string {
  return entry.kind === "item" ? entry.item.id : entry.key;
}

/** A demo feed entry. New-member entries carry the `new_member` item their
 *  card renders, which is what lets the demo fold them like live. */
export interface DemoFeedEntry {
  key: string;
  newMemberItem?: FeedItem;
}

/** One masonry child in the demo feed: a static entry, or the new members
 *  folded into the same group card live uses. */
export type DemoRenderEntry<Entry extends DemoFeedEntry> =
  | { kind: "static"; key: string; entry: Entry }
  | { kind: "newMembersGroup"; key: string; members: FeedItem[] };

/**
 * The demo list as render entries, under the same rule as
 * `groupNewMemberItems`: when grouping, every entry carrying a new member
 * folds into ONE group at the position of the first of them, newest first,
 * and fewer than two new members stay plain.
 */
export function demoFeedRenderEntries<Entry extends DemoFeedEntry>(
  entries: Entry[],
  isGroupingNewMembers: boolean,
): DemoRenderEntry<Entry>[] {
  const asStatic = (entry: Entry): DemoRenderEntry<Entry> => ({
    kind: "static",
    key: entry.key,
    entry,
  });
  const newMembers = entries.flatMap((entry) =>
    entry.newMemberItem ? [entry.newMemberItem] : [],
  );
  if (!isGroupingNewMembers || newMembers.length < MIN_NEW_MEMBERS_TO_GROUP) {
    return entries.map(asStatic);
  }

  const sortedMembers = sortNewestFirst(newMembers);
  const renderEntries: DemoRenderEntry<Entry>[] = [];
  let hasPlacedGroup = false;
  for (const entry of entries) {
    if (!entry.newMemberItem) {
      renderEntries.push(asStatic(entry));
    } else if (!hasPlacedGroup) {
      renderEntries.push({
        kind: "newMembersGroup",
        key: NEW_MEMBERS_GROUP_KEY,
        members: sortedMembers,
      });
      hasPlacedGroup = true;
    }
  }
  return renderEntries;
}
