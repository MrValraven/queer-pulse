import type {
  OwnerListingHistoryDTO,
  OwnerListingHistoryEventDTO,
} from "./listingHistory.api";

/**
 * Paging helpers and the demo fixture behind `useOwnerListingHistory`. Kept in
 * the api folder beside the hook so the cache layer never imports the editor.
 */

/**
 * Every loaded page's events as one newest-first list, each event once. A
 * save between two page fetches shifts the pages by a row, so the same event
 * can arrive at the bottom of one page and the top of the next.
 */
export function flattenHistoryPages(
  pages: readonly OwnerListingHistoryDTO[],
): OwnerListingHistoryEventDTO[] {
  const seenIds = new Set<string>();
  const events: OwnerListingHistoryEventDTO[] = [];
  for (const page of pages) {
    for (const event of page.events) {
      if (seenIds.has(event.id)) continue;
      seenIds.add(event.id);
      events.push(event);
    }
  }
  return events;
}

/** The next `?page=` to ask for, or undefined once every event is loaded. */
export function nextHistoryPage(
  lastPage: OwnerListingHistoryDTO,
): number | undefined {
  return lastPage.page * lastPage.pageSize < lastPage.totalEvents
    ? lastPage.page + 1
    : undefined;
}

const DEMO_TEAM_OWNER = {
  slug: "rita-almeida",
  firstName: "Rita",
  lastName: "Almeida",
};

const DEMO_TEAM_CO_MANAGER = {
  slug: "joana-reis",
  firstName: "Joana",
  lastName: "Reis",
};

function demoEvent(
  event: Pick<OwnerListingHistoryEventDTO, "id" | "action" | "createdAt"> &
    Partial<OwnerListingHistoryEventDTO>,
): OwnerListingHistoryEventDTO {
  return {
    actor: { kind: "moderation" },
    fromStatus: null,
    toStatus: null,
    reason: null,
    changedFields: null,
    hasModeratorNote: false,
    ...event,
  };
}

/**
 * The demo listing's history, newest first. One of each kind of row an owner
 * meets, including an edit from before an ownership transfer, which the owner
 * sees attributed to "a previous team member".
 */
export const DEMO_OWNER_LISTING_HISTORY_EVENTS: OwnerListingHistoryEventDTO[] =
  [
    demoEvent({
      id: "demo-history-8",
      action: "owner_edited",
      actor: { kind: "team", member: DEMO_TEAM_OWNER },
      changedFields: ["hours", "address", "geocoded", "latitude", "longitude"],
      createdAt: "2026-09-20T10:14:00.000Z",
    }),
    demoEvent({
      id: "demo-history-7",
      action: "co_manager_added",
      actor: { kind: "team", member: DEMO_TEAM_CO_MANAGER },
      reason: "Joana Reis accepted an invitation to co-manage this listing.",
      createdAt: "2026-09-12T16:40:00.000Z",
    }),
    demoEvent({
      id: "demo-history-6",
      action: "directory_resumed",
      actor: { kind: "team", member: DEMO_TEAM_OWNER },
      createdAt: "2026-09-01T09:05:00.000Z",
    }),
    demoEvent({
      id: "demo-history-5",
      action: "directory_paused",
      actor: { kind: "team", member: DEMO_TEAM_OWNER },
      createdAt: "2026-08-21T18:30:00.000Z",
    }),
    demoEvent({
      id: "demo-history-4",
      action: "suggestion_applied",
      reason:
        "A member suggested a correction to the opening-hours note and a moderator applied it.",
      changedFields: ["hoursNote"],
      createdAt: "2026-08-04T11:20:00.000Z",
    }),
    demoEvent({
      id: "demo-history-3",
      action: "ownership_transferred",
      createdAt: "2026-07-09T14:00:00.000Z",
    }),
    demoEvent({
      id: "demo-history-2",
      action: "owner_edited",
      actor: { kind: "previous_team" },
      changedFields: ["tagline"],
      createdAt: "2026-06-18T08:45:00.000Z",
    }),
    demoEvent({
      id: "demo-history-1",
      action: "status_changed",
      fromStatus: "question",
      toStatus: "live",
      createdAt: "2026-06-02T13:10:00.000Z",
    }),
    // A moderator's note reaches the owner only on a move to a non-live
    // status (or a removal), so only the send-back carries one.
    demoEvent({
      id: "demo-history-0",
      action: "status_changed",
      fromStatus: "review",
      toStatus: "question",
      hasModeratorNote: true,
      createdAt: "2026-05-28T15:25:00.000Z",
    }),
  ];

const DEMO_PAGE_SIZE = 20;

/** One page of the demo history, shaped like the live response. */
export function getDemoOwnerListingHistory(
  page: number,
): OwnerListingHistoryDTO {
  const start = (page - 1) * DEMO_PAGE_SIZE;
  return {
    events: DEMO_OWNER_LISTING_HISTORY_EVENTS.slice(
      start,
      start + DEMO_PAGE_SIZE,
    ),
    questions: [],
    totalEvents: DEMO_OWNER_LISTING_HISTORY_EVENTS.length,
    page,
    pageSize: DEMO_PAGE_SIZE,
  };
}
