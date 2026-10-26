import type {
  InfiniteData,
  QueryClient,
  QueryFilters,
  QueryKey,
} from "@tanstack/react-query";
import type { HiddenEventCommunityDTO } from "./api/hiddenEventCommunities.api";
import type { EventsPageVM } from "./api/useEvents";
import { calendarEvents, type CalendarEvent } from "./data";
import {
  DEMO_EVENT_COMMUNITIES,
  DEMO_EVENT_GUEST_COMMUNITY_IDS,
  demoCommunityId,
} from "./hiddenEventCommunities.data";

/** A community to hide or show again. `name` is toast copy; `id` is optional
 *  because the refine search knows only the slug. */
export interface HiddenCommunityTarget {
  slug: string;
  name: string;
  id?: string;
  avatarImageUrl?: string | null;
  /** The event card the member hid it from. When another community the
   *  member still sees co-hosts that event, the toast says why it stays. */
  fromEvent?: { slug: string; title: string; isCoHosted: boolean };
}

export interface HideCommunityOptions {
  /** Runs once the hide is saved, while the caller is still mounted. */
  onHidden?: () => void;
}

/** An unhide, keyed by the id the DELETE route takes. */
export type UnhideVariables = Pick<HiddenCommunityTarget, "slug" | "name"> & {
  communityId: string;
};

/** The empty hidden set, shared so a default argument keeps one identity. */
export const NO_HIDDEN_COMMUNITIES: ReadonlySet<string> = new Set<string>();

/**
 * The hiding rule, the same one the server applies in SQL (and the feed
 * applies to community posts): an event is hidden when its lead community is
 * hidden AND every accepted guest community is hidden too. One host the member
 * still wants to see keeps the event on the board. An event with no lead and
 * no guests is never hidden; one with no lead whose guests are all hidden is.
 */
export function isHiddenByCommunities(
  leadId: string | undefined,
  guestIds: readonly string[],
  hiddenIds: ReadonlySet<string>,
): boolean {
  if (hiddenIds.size === 0) return false;
  if (leadId === undefined && guestIds.length === 0) return false;
  if (leadId !== undefined && !hiddenIds.has(leadId)) return false;
  return guestIds.every((guestId) => hiddenIds.has(guestId));
}

/** The rule against a demo row: its lead from the card, its accepted guests
 *  from the demo guest registry keyed by gathering slug. */
export function isDemoEventHidden(
  event: CalendarEvent,
  hiddenIds: ReadonlySet<string>,
): boolean {
  return isHiddenByCommunities(
    event.hostingCommunity?.id,
    DEMO_EVENT_GUEST_COMMUNITY_IDS[event.slug ?? ""] ?? [],
    hiddenIds,
  );
}

/** The rule against the demo registry row with this gathering slug. A slug
 *  the registry does not carry is never hidden. */
export function isDemoSlugHidden(
  slug: string,
  hiddenIds: ReadonlySet<string>,
): boolean {
  if (hiddenIds.size === 0) return false;
  const event = calendarEvents.find((candidate) => candidate.slug === slug);
  return event ? isDemoEventHidden(event, hiddenIds) : false;
}

/**
 * Whether a hide of `communityId` takes this cached row off the board before
 * the server answers. Demo runs the full rule against the hidden ids as they
 * stand after the hide (its guest registry is known). Live drops the rows the
 * community leads alone; a co-hosted row waits for the refetch, since only the
 * server knows whether a guest the member still sees keeps it.
 */
export function isDroppedOptimistically(
  event: CalendarEvent,
  communityId: string,
  demoHiddenIdsAfterHide?: ReadonlySet<string>,
): boolean {
  if (demoHiddenIdsAfterHide) {
    return isDemoEventHidden(event, demoHiddenIdsAfterHide);
  }
  return event.hostingCommunity?.id === communityId && !event.isCoHosted;
}

/**
 * Every cached upcoming list a hide may patch: the `["events", "upcoming"]`
 * prefix, minus the lists that asked for hidden communities to stay in. My
 * events lists (going, hosting, saved, past) share the `["events"]` root and
 * must never lose a row to a hide, so nothing wider is ever touched.
 */
export const HIDEABLE_UPCOMING_LISTS: QueryFilters = {
  queryKey: ["events", "upcoming"],
  predicate: (query) => !query.queryKey.includes("includeHidden"),
};

export type UpcomingListSnapshot = Array<
  [QueryKey, InfiniteData<EventsPageVM> | undefined]
>;

/**
 * Drops every cached upcoming row `isDroppedOptimistically` picks and lowers
 * each page's `total` by the rows dropped, so the infinite query never asks
 * for a page that now overshoots. Demo passes the hidden list before this
 * hide. Returns the lists as they were, for `onError`.
 */
export function dropCommunityFromUpcomingPages(
  queryClient: QueryClient,
  communityId: string,
  demoHiddenRowsBefore?: readonly HiddenEventCommunityDTO[],
): UpcomingListSnapshot {
  const demoHiddenIdsAfterHide = demoHiddenRowsBefore
    ? new Set([
        ...demoHiddenRowsBefore.map((row) => row.communityId),
        communityId,
      ])
    : undefined;
  const snapshot = queryClient.getQueriesData<InfiniteData<EventsPageVM>>(
    HIDEABLE_UPCOMING_LISTS,
  );
  queryClient.setQueriesData<InfiniteData<EventsPageVM>>(
    HIDEABLE_UPCOMING_LISTS,
    (data) => {
      if (!data) return data;
      const isKept = (event: CalendarEvent) =>
        !isDroppedOptimistically(event, communityId, demoHiddenIdsAfterHide);
      const droppedCount = data.pages.reduce(
        (count, page) =>
          count + page.items.filter((event) => !isKept(event)).length,
        0,
      );
      if (droppedCount === 0) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter(isKept),
          total: Math.max(0, page.total - droppedCount),
        })),
      };
    },
  );
  return snapshot;
}

/** Puts back the lists `dropCommunityFromUpcomingPages` patched. */
export function restoreUpcomingPages(
  queryClient: QueryClient,
  snapshot: UpcomingListSnapshot,
): void {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}

/** Demo has no server, so the saved row comes from the demo corpus. */
export function demoHiddenRowFor(
  target: HiddenCommunityTarget,
): HiddenEventCommunityDTO {
  const community = DEMO_EVENT_COMMUNITIES.find(
    (candidate) => candidate.slug === target.slug,
  );
  return {
    communityId: community?.id ?? target.id ?? demoCommunityId(target.slug),
    slug: target.slug,
    name: community?.name ?? target.name,
    avatarImageUrl: community?.avatarImageUrl ?? target.avatarImageUrl ?? null,
    hiddenAt: new Date().toISOString(),
  };
}
