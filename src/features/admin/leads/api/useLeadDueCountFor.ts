import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getLeads } from "./leads.api";
import { leadKeys } from "./leadKeys";
import type { LeadType } from "./leads.types";
import { useLeadDueCount } from "./useLeadDueCount";

const LIVE_STALE_MS = 30_000;

/** How many open leads wait on a follow-up. `isCapped` means there are
 *  more than one page holds, so `count` is a floor. */
export interface LeadDueCountFor {
  count: number;
  isCapped: boolean;
}

/**
 * The due count for the search and type on screen, so it reads like the
 * stage counts beside it. With no search and no type it is the badge's own
 * count. Otherwise the list's counts ignore the due filter, so this reads
 * the first due-only page: its length is the count, and a further page
 * means "at least one page". Null until it answers.
 */
export function useLeadDueCountFor(
  q: string,
  type: LeadType | null,
): LeadDueCountFor | null {
  const { demoMode } = useDemoMode();
  const isUnfiltered = q === "" && type === null;
  const overall = useLeadDueCount({ isEnabled: isUnfiltered });
  const filtered = useQuery<LeadDueCountFor, Error>({
    queryKey: leadKeys.dueCountFor(q, type, demoMode),
    enabled: !isUnfiltered,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    meta: { silentError: true, isPrivateQueryKey: true },
    queryFn: async ({ signal }) => {
      const filters = { q, type, stage: null, isDueOnly: true };
      const page = demoMode
        ? (await import("../leadsDemoStore")).demoListLeads(filters)
        : await getLeads(filters, null, signal);
      return {
        count: page.items.length,
        // Demo answers every match in one page, so its count is exact.
        isCapped: page.nextCursor !== null,
      };
    },
  });
  if (isUnfiltered) {
    return overall.data === undefined
      ? null
      : { count: overall.data, isCapped: false };
  }
  return filtered.data ?? null;
}
