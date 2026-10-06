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

/** One masonry child in the "All" tab: a plain feed item, or the new members
 *  of one calendar week folded into a "people joined" card. `weekStart` is
 *  that week's `weekStartKey`, which the card turns into its heading. */
export type FeedRenderEntry =
  | { kind: "item"; item: FeedItem }
  | {
      kind: "newMembersGroup";
      key: string;
      weekStart: string;
      members: FeedItem[];
    };

/** Two digits for a month or day in a "YYYY-MM-DD" key. */
function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * The local Monday that starts `date`'s week, as "YYYY-MM-DD". Weeks start on
 * Monday in the viewer's own time zone, so Sunday belongs to the week that
 * began the Monday before it.
 *
 * The Monday comes from local calendar math (`new Date(year, month, day -
 * offset)`), which counts whole calendar days, so a daylight saving change
 * inside the week leaves it on the right Monday.
 *
 * An invalid date (one whose time is NaN, such as an unparseable `createdAt`)
 * counts as now, so its member lands in the current week. That keeps a
 * malformed timestamp out of a "week of 29 December 1969" group of its own;
 * `sortNewestFirst` still places that member last within the week, as
 * `joinedAtMs` reads its time as 0.
 */
export function weekStartKey(date: Date): string {
  const day = Number.isNaN(date.getTime()) ? new Date() : date;
  // getDay() is 0 on Sunday, so this maps Monday to 0 and Sunday to 6.
  const daysSinceMonday = (day.getDay() + 6) % 7;
  const monday = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate() - daysSinceMonday,
  );
  return `${monday.getFullYear()}-${padTwoDigits(monday.getMonth() + 1)}-${padTwoDigits(monday.getDate())}`;
}

/** React key for one week's group. Constant per week on purpose: when
 *  infinite scroll appends more people who joined in a week already shown,
 *  that group keeps its key, so React keeps its DOM node (and its expanded
 *  state) and the masonry only relayouts the one card that grew. */
function newMembersGroupKey(weekStart: string): string {
  return `new-members-${weekStart}`;
}

/** Weeks with fewer new members than this stay plain cards: a group of one
 *  would only add a heading around a single person. */
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
 * The one folding rule live and demo share. Every entry carrying a new member
 * (`newMemberOf` returns it) is bucketed by the week it joined in. A week with
 * at least `MIN_NEW_MEMBERS_TO_GROUP` people becomes ONE group, placed where
 * the first of its members sat in the list, with its members sorted newest
 * first. A week with a single person keeps that person as a plain entry, and
 * every other entry keeps its place and order.
 */
function foldNewMembersByWeek<Entry, Rendered>(
  entries: Entry[],
  newMemberOf: (entry: Entry) => FeedItem | undefined,
  asPlain: (entry: Entry) => Rendered,
  asGroup: (weekStart: string, members: FeedItem[]) => Rendered,
): Rendered[] {
  const membersByWeek = new Map<string, FeedItem[]>();
  const weekStartByIndex = entries.map((entry) => {
    const newMember = newMemberOf(entry);
    if (!newMember) return null;
    const weekStart = weekStartKey(new Date(newMember.createdAt));
    const weekMembers = membersByWeek.get(weekStart) ?? [];
    weekMembers.push(newMember);
    membersByWeek.set(weekStart, weekMembers);
    return weekStart;
  });

  const rendered: Rendered[] = [];
  const placedWeeks = new Set<string>();
  entries.forEach((entry, index) => {
    const weekStart = weekStartByIndex[index] ?? null;
    const weekMembers =
      weekStart === null ? undefined : membersByWeek.get(weekStart);
    if (
      weekStart === null ||
      !weekMembers ||
      weekMembers.length < MIN_NEW_MEMBERS_TO_GROUP
    ) {
      rendered.push(asPlain(entry));
      return;
    }
    if (placedWeeks.has(weekStart)) return;
    placedWeeks.add(weekStart);
    rendered.push(asGroup(weekStart, sortNewestFirst(weekMembers)));
  });
  return rendered;
}

/**
 * Fold the `new_member` items into one group entry per calendar week (see
 * `foldNewMembersByWeek`): each group sits where the first of that week's
 * members sat in the feed, its members newest first, and a week with a
 * single new member keeps that person as a plain item.
 */
export function groupNewMemberItems(items: FeedItem[]): FeedRenderEntry[] {
  return foldNewMembersByWeek<FeedItem, FeedRenderEntry>(
    items,
    (item) => (item.type === "new_member" ? item : undefined),
    (item) => ({ kind: "item", item }),
    (weekStart, members) => ({
      kind: "newMembersGroup",
      key: newMembersGroupKey(weekStart),
      weekStart,
      members,
    }),
  );
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

/** React key for an entry: the item id, or the group's per-week key. */
export function feedRenderEntryKey(entry: FeedRenderEntry): string {
  return entry.kind === "item" ? entry.item.id : entry.key;
}

/** A demo feed entry. New-member entries carry the `new_member` item their
 *  card renders, which is what lets the demo fold them like live. */
export interface DemoFeedEntry {
  key: string;
  newMemberItem?: FeedItem;
}

/** One masonry child in the demo feed: a static entry, or one week's new
 *  members folded into the same group card live uses. */
export type DemoRenderEntry<Entry extends DemoFeedEntry> =
  | { kind: "static"; key: string; entry: Entry }
  | {
      kind: "newMembersGroup";
      key: string;
      weekStart: string;
      members: FeedItem[];
    };

/**
 * The demo list as render entries, under the same rule as
 * `groupNewMemberItems`: when grouping, the entries carrying a new member fold
 * into one group per calendar week, each at the position of the first of its
 * members, newest first, and a week with a single new member stays plain.
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
  if (!isGroupingNewMembers) return entries.map(asStatic);

  return foldNewMembersByWeek<Entry, DemoRenderEntry<Entry>>(
    entries,
    (entry) => entry.newMemberItem,
    asStatic,
    (weekStart, members) => ({
      kind: "newMembersGroup",
      key: newMembersGroupKey(weekStart),
      weekStart,
      members,
    }),
  );
}
