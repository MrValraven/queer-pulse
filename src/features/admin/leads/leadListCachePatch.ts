import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { leadKeys } from "./api/leadKeys";
import type {
  LeadListFilters,
  LeadListPageDTO,
  LeadStage,
} from "./api/leads.types";
import type { LeadDueCountFor } from "./api/useLeadDueCountFor";
import { isLeadFollowUpDue } from "./leadDates";

export type LeadListPages = InfiniteData<LeadListPageDTO, string | null>;

/**
 * The cached pages of one list, with a lead moved to `stage` as the server
 * will have it: its stage and due flag change, the stage counts move by
 * one, and a row that no longer matches the list's stage or due filter
 * leaves it. A list that does not hold the lead comes back as it was.
 */
export function withLeadMovedInPages(
  pages: LeadListPages,
  filters: LeadListFilters,
  leadId: string,
  stage: LeadStage,
  today: string,
): LeadListPages {
  const row = pages.pages
    .flatMap((page) => page.items)
    .find((item) => item.id === leadId);
  if (row === undefined || row.stage === stage) return pages;
  const movedRow = {
    ...row,
    stage,
    isFollowUpDue: isLeadFollowUpDue(stage, row.followUpOn, today),
  };
  const isStillListed =
    (filters.stage === null || filters.stage === stage) &&
    (!filters.isDueOnly || movedRow.isFollowUpDue);
  return {
    ...pages,
    pages: pages.pages.map((page) => ({
      ...page,
      items: page.items.flatMap((item) =>
        item.id !== leadId ? [item] : isStillListed ? [movedRow] : [],
      ),
      stageCounts: {
        ...page.stageCounts,
        [row.stage]: Math.max(0, page.stageCounts[row.stage] - 1),
        [stage]: page.stageCounts[stage] + 1,
      },
    })),
  };
}

/** How a move changes the due count: -1 when a due lead closes, +1 when a
 *  closed lead with a past date opens again, else 0. */
export function dueCountShiftOf(
  from: { stage: LeadStage; followUpOn: string | null },
  stage: LeadStage,
  today: string,
): number {
  const wasDue = isLeadFollowUpDue(from.stage, from.followUpOn, today);
  const isDue = isLeadFollowUpDue(stage, from.followUpOn, today);
  return Number(isDue) - Number(wasDue);
}

/**
 * Shows a stage move in every cached list and due count before it is
 * saved. Nothing is written; reading the lists again brings back what the
 * server holds, which is how Undo cancels the move.
 */
export function showLeadMoveInCache(
  queryClient: QueryClient,
  move: {
    leadId: string;
    from: { stage: LeadStage; followUpOn: string | null };
    stage: LeadStage;
    today: string;
  },
): void {
  for (const [key, pages] of queryClient.getQueriesData<LeadListPages>({
    queryKey: leadKeys.listRoot,
  })) {
    const filters = key[3] as LeadListFilters | undefined;
    if (pages === undefined || filters === undefined) continue;
    queryClient.setQueryData(
      key,
      withLeadMovedInPages(pages, filters, move.leadId, move.stage, move.today),
    );
  }
  const shift = dueCountShiftOf(move.from, move.stage, move.today);
  if (shift === 0) return;
  queryClient.setQueriesData<number | LeadDueCountFor>(
    { queryKey: leadKeys.dueCountRoot },
    (count) => {
      if (count === undefined) return count;
      if (typeof count === "number") return Math.max(0, count + shift);
      return count.isCapped
        ? count
        : { ...count, count: Math.max(0, count.count + shift) };
    },
  );
}

/** Drops every shown-but-unsaved change: the lists and due counts read
 *  again from the server. */
export function rereadLeadLists(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: leadKeys.listRoot });
  void queryClient.invalidateQueries({ queryKey: leadKeys.dueCountRoot });
}
