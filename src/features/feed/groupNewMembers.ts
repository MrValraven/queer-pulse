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
 *  that week's `weekStartKey`, which the card turns into its heading.
 *  `isContinuation` marks a later card for a week that already has a group
 *  card on an earlier page (see `groupNewMemberPages`), which the heading
 *  words as "more people joined". */
export type FeedRenderEntry =
  | { kind: "item"; item: FeedItem }
  | {
      kind: "newMembersGroup";
      key: string;
      weekStart: string;
      members: FeedItem[];
      isContinuation: boolean;
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

/** React key for the first group card a week gets. Live, a week has at most
 *  one such card (see `groupNewMemberPages`); the demo folds its whole list at
 *  once, so every demo group uses this key. */
function newMembersGroupKey(weekStart: string): string {
  return `new-members-${weekStart}`;
}

/** React key for a continuation card: a group formed on a later page for a
 *  week that already has a group card. Named after the week and the
 *  continuation's first member in feed order, so it stays the same as more
 *  pages are appended and two continuations of one week never share it. */
function newMembersContinuationKey(
  weekStart: string,
  firstMemberId: string,
): string {
  return `new-members-${weekStart}-more-${firstMemberId}`;
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
 * every other entry keeps its place and order. `asGroup` also receives the
 * week's first member in list order, the member whose spot the group takes.
 */
function foldNewMembersByWeek<Entry, Rendered>(
  entries: Entry[],
  newMemberOf: (entry: Entry) => FeedItem | undefined,
  asPlain: (entry: Entry) => Rendered,
  asGroup: (
    weekStart: string,
    members: FeedItem[],
    firstMemberInListOrder: FeedItem,
  ) => Rendered,
): Rendered[] {
  const membersByWeek = new Map<string, FeedItem[]>();
  const memberWeekByIndex = entries.map((entry) => {
    const newMember = newMemberOf(entry);
    if (!newMember) return null;
    const weekStart = weekStartKey(new Date(newMember.createdAt));
    const weekMembers = membersByWeek.get(weekStart) ?? [];
    weekMembers.push(newMember);
    membersByWeek.set(weekStart, weekMembers);
    return { weekStart, newMember };
  });

  const rendered: Rendered[] = [];
  const placedWeeks = new Set<string>();
  entries.forEach((entry, index) => {
    const memberWeek = memberWeekByIndex[index] ?? null;
    const weekMembers =
      memberWeek === null ? undefined : membersByWeek.get(memberWeek.weekStart);
    if (
      memberWeek === null ||
      !weekMembers ||
      weekMembers.length < MIN_NEW_MEMBERS_TO_GROUP
    ) {
      rendered.push(asPlain(entry));
      return;
    }
    if (placedWeeks.has(memberWeek.weekStart)) return;
    placedWeeks.add(memberWeek.weekStart);
    // The first entry of a week to reach this point is the one the group
    // replaces, so its member is the week's first in list order.
    rendered.push(
      asGroup(
        memberWeek.weekStart,
        sortNewestFirst(weekMembers),
        memberWeek.newMember,
      ),
    );
  });
  return rendered;
}

/**
 * The live "All" tab's render entries, folded one loaded page at a time so
 * a card already on screen never changes when the next page lands.
 *
 * The backend ranks the All tab in windows larger than a page, so the people
 * who joined in one week can arrive across several pages. Folding the whole
 * flattened list would make a group the reader has already seen grow when a
 * later page brings more of its week, or swap a lone member's card for a
 * group card, and the masonry would then shift every card under it. Folding
 * page by page keeps the result append-only: each page's entries depend on
 * that page alone (plus which weeks earlier pages grouped), so a new page only
 * adds entries after the ones already rendered.
 *
 * Within a page the `foldNewMembersByWeek` rule applies: two or more members
 * of one week become one group at the first member's position, newest first,
 * and a lone member stays a plain item. A group for a week that already got
 * a GROUP card on an earlier page is a continuation (`isContinuation`), keyed
 * by `newMembersContinuationKey` and headed as "more people joined". A week
 * shown earlier only as a lone plain card has no group yet, so its first
 * group on a later page takes the usual heading and key.
 */
export function groupNewMemberPages(pages: FeedItem[][]): FeedRenderEntry[] {
  const groupedWeeks = new Set<string>();
  return pages.flatMap((pageItems) => {
    const pageEntries = foldNewMembersByWeek<FeedItem, FeedRenderEntry>(
      pageItems,
      (item) => (item.type === "new_member" ? item : undefined),
      (item) => ({ kind: "item", item }),
      (weekStart, members, firstMemberInListOrder) => {
        const isContinuation = groupedWeeks.has(weekStart);
        return {
          kind: "newMembersGroup",
          key: isContinuation
            ? newMembersContinuationKey(weekStart, firstMemberInListOrder.id)
            : newMembersGroupKey(weekStart),
          weekStart,
          members,
          isContinuation,
        };
      },
    );
    pageEntries.forEach((entry) => {
      if (entry.kind === "newMembersGroup") groupedWeeks.add(entry.weekStart);
    });
    return pageEntries;
  });
}

/** The live list as render entries: grouped page by page when the page asks
 *  for it (the "All" tab, see `groupNewMemberPages`), otherwise one plain
 *  entry per item in feed order (the People tab keeps one card per member). */
export function liveFeedRenderEntries(
  pages: FeedItem[][],
  isGroupingNewMembers: boolean,
): FeedRenderEntry[] {
  return isGroupingNewMembers
    ? groupNewMemberPages(pages)
    : pages.flat().map((item) => ({ kind: "item", item }));
}

/** React key for an entry: the item id, or the group's week key (with its
 *  first member's id for a continuation). */
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
 * The demo list as render entries, under the `foldNewMembersByWeek` rule live
 * applies to each page: when grouping, the entries carrying a new member fold
 * into one group per calendar week, each at the position of the first of its
 * members, newest first, and a week with a single new member stays plain.
 * The demo list is one fixed page, so its groups are never continuations.
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
