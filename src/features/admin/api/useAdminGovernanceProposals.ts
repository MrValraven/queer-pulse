import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getGovernanceProposals,
  type GovernanceProposalDTO,
} from "../../governance/api/governanceProposals.api";
import {
  createGovernanceProposal,
  type CreateGovernanceProposalBody,
} from "./adminGovernanceProposals.api";

// Same cache key the public `useGovernanceProposals` uses, so opening a
// proposal here invalidates what a member sees on `/about/governance`.
const proposalsQueryKey = (demoMode: boolean) =>
  ["governance-proposals", demoMode] as const;

export interface AdminGovernanceProposalsResult {
  proposals: GovernanceProposalDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

/** The admin Proposals tab's list — same data the public page's Proposals
 *  section shows, reused as-is (open + resolved, live tallies). */
export function useAdminGovernanceProposalsList(): AdminGovernanceProposalsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<GovernanceProposalDTO[]>({
    queryKey: proposalsQueryKey(demoMode),
    queryFn: async () =>
      demoMode
        ? (await import("../../governance/governanceProposals.data"))
            .DEMO_GOVERNANCE_PROPOSALS
        : getGovernanceProposals(),
  });
  return { proposals: query.data ?? [], loading: query.isPending };
}

/**
 * Opens a new proposal. Demo mode simulates the round-trip and resolves
 * without persisting (there is no admin roadmap-style local demo store for
 * proposals — the fixture is a fixed, illustrative list, matching how demo
 * mode never persists a Roadmap vote either); live mode calls the real
 * endpoint and invalidates the shared list so both the admin tab and the
 * public page's Proposals section pick up the new proposal.
 */
export function useCreateGovernanceProposal() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateGovernanceProposalBody) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return;
      }
      await createGovernanceProposal(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: proposalsQueryKey(false),
        });
      }
    },
  });
}
