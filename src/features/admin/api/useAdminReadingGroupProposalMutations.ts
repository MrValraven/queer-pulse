import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  approveReadingGroupProposal,
  archiveReadingGroupProposal,
  declineReadingGroupProposal,
  type AdminReadingGroupProposalListDTO,
  type ReadingGroupProposalDecision,
  type ReadingGroupProposalStatus,
} from "./adminReadingGroupProposals.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

/** Shared prefix for every `useAdminReadingGroupProposals` infinite query (the
 *  full key also carries `demoMode` + the active filter). Patched/invalidated
 *  by decision so the row's status updates across every filter tab at once. */
const PROPOSALS_QUERY_KEY = ["admin-reading-group-proposals"] as const;

const STATUS_BY_DECISION: Record<
  ReadingGroupProposalDecision,
  ReadingGroupProposalStatus
> = {
  approve: "approved",
  decline: "declined",
  archive: "archived",
};

const LIVE_CALL: Record<
  ReadingGroupProposalDecision,
  (id: string, note?: string) => Promise<unknown>
> = {
  approve: approveReadingGroupProposal,
  decline: declineReadingGroupProposal,
  archive: archiveReadingGroupProposal,
};

export interface DecideReadingGroupProposalVars {
  id: string;
  decision: ReadingGroupProposalDecision;
  note?: string;
}

type ProposalsData = InfiniteData<AdminReadingGroupProposalListDTO>;
type CachedEntry = [QueryKey, ProposalsData | undefined];
interface DecideContext {
  previous: CachedEntry[];
}

/**
 * Approve / decline / archive a reading-group proposal from the admin oversight
 * page. Dual-mode: in demo mode the optimistic cache patch IS the source of
 * truth (no network, no invalidation — the fixture never goes stale); in live
 * mode it calls `POST /admin/reading-group-proposals/:id/{approve|decline|archive}`
 * and reconciles by invalidating on settle. Both modes patch the row's `status`
 * across every cached filter tab optimistically and roll back on error.
 */
export function useAdminReadingGroupProposalMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: ReadingGroupProposalStatus) => {
    queryClient.setQueriesData<ProposalsData>(
      { queryKey: PROPOSALS_QUERY_KEY },
      (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        status,
                        decidedAt: item.decidedAt ?? new Date().toISOString(),
                      }
                    : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<
    ReadingGroupProposalStatus,
    Error,
    DecideReadingGroupProposalVars,
    DecideContext
  >({
    mutationFn: async ({ id, decision, note }) => {
      const status = STATUS_BY_DECISION[decision];
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.readingGroupProposal.decide (demo — no network)", {
          id,
          decision,
        });
        return status;
      }
      await LIVE_CALL[decision](id, note);
      return status;
    },
    onMutate: async ({ id, decision }) => {
      await queryClient.cancelQueries({ queryKey: PROPOSALS_QUERY_KEY });
      const previous = queryClient.getQueriesData<ProposalsData>({
        queryKey: PROPOSALS_QUERY_KEY,
      });
      patchStatus(id, STATUS_BY_DECISION[decision]);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      }
    },
    meta: { silentError: true },
  });

  return { decide: mutation.mutate, pending: mutation.isPending };
}
