import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  castGovernanceVote,
  getGovernanceProposals,
  type GovernanceProposalDTO,
  type GovernanceVoteChoice,
} from "./governanceProposals.api";

export interface GovernanceProposalsResult {
  proposals: GovernanceProposalDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the section renders a retry state
   *  instead of a silently-empty list. Always false in demo. */
  error: boolean;
  /** Refetch after an error (wired to the retry affordance). */
  retry: () => void;
}

const proposalsQueryKey = (demoMode: boolean) =>
  ["governance-proposals", demoMode] as const;

/**
 * Data source for the Governance page's Proposals section. Demo mode returns
 * the page's own fixture (no persisted voting, mirrors `useGovernanceOverview`);
 * live mode calls `GET /governance/proposals` once.
 */
export function useGovernanceProposals(): GovernanceProposalsResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<GovernanceProposalDTO[]>({
    queryKey: proposalsQueryKey(demoMode),
    queryFn: async () =>
      demoMode
        ? (await import("../governanceProposals.data"))
            .DEMO_GOVERNANCE_PROPOSALS
        : getGovernanceProposals(),
  });

  const retry = () => {
    void query.refetch();
  };

  return {
    proposals: query.data ?? [],
    loading: query.isPending,
    error: query.isError,
    retry,
  };
}

/**
 * Casts a for/against vote on a proposal. Mirrors `useRoadmapVote`: demo mode
 * never touches the network (the calling card tracks its own local "just
 * voted" state); live mode calls the real backend and invalidates the list
 * so the tally + `myVote` refresh from the server's response.
 */
export function useGovernanceProposalVote() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      proposalId,
      choice,
    }: {
      proposalId: string;
      choice: GovernanceVoteChoice;
    }) => castGovernanceVote(proposalId, choice),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: proposalsQueryKey(false),
      });
    },
  });
  return { demoMode, vote: mutation.mutate, pending: mutation.isPending };
}
