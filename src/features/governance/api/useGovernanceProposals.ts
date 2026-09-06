import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  approveGovernanceMotion,
  getAdminGovernanceMotions,
  rejectGovernanceMotion,
  type ApproveGovernanceMotionBody,
  type RejectGovernanceMotionBody,
} from "./adminGovernanceMotions.api";
import {
  castGovernanceVote,
  composeGovernanceMotion,
  cosignGovernanceProposal,
  getGovernanceProposals,
  withdrawGovernanceCosignature,
  type ComposeGovernanceMotionBody,
  type GovernanceProposalDTO,
  type GovernanceVoteChoice,
} from "./governanceProposals.api";

export interface GovernanceProposalsResult {
  proposals: GovernanceProposalDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly),
   *  and while the session itself is still being determined. */
  loading: boolean;
  /** True when the live fetch failed — the section renders a retry state
   *  instead of a silently-empty list. Always false in demo, and false when
   *  the read was never attempted (see `isSignedOut`). */
  error: boolean;
  /** Refetch after an error (wired to the retry affordance). */
  retry: () => void;
  /**
   * True when the reader has no session, so the proposal list was never
   * requested. `/about/governance` is a public page (PRD-260) and its overview
   * and finance sections now answer anyone, but `GET /governance/proposals` is
   * member deliberation and stays member-only — a `council_removal` motion
   * names the member whose seat is in question. The section must render a
   * signed-out note off this flag, never an error panel and never the "no
   * proposal has been opened yet" copy, which would be a lie.
   */
  isSignedOut: boolean;
}

const proposalsQueryKey = (demoMode: boolean) =>
  ["governance-proposals", demoMode] as const;

const motionQueueQueryKey = (demoMode: boolean) =>
  ["admin-governance-motions", demoMode] as const;

/** Demo pauses long enough to read as a round-trip, matching the admin
 *  proposal-create mutation's simulated latency. */
const DEMO_LATENCY_MS = 400;

const simulateDemoRoundTrip = () =>
  new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));

/**
 * Data source for the Governance page's Proposals section. Demo mode returns
 * the page's own fixture (no persisted voting, mirrors `useGovernanceOverview`);
 * live mode calls `GET /governance/proposals` once.
 *
 * The request is skipped entirely for a signed-out reader (`enabled`), the
 * same shape `ArrivingCommunitiesSection` uses for its members-only read. The
 * rest of `/about/governance` is public, so this section used to be the one
 * place a visitor met a retry panel on an otherwise complete page.
 */
export function useGovernanceProposals(): GovernanceProposalsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const canReadProposals = demoMode || loggedIn;

  const query = useQuery<GovernanceProposalDTO[]>({
    queryKey: proposalsQueryKey(demoMode),
    enabled: canReadProposals,
    queryFn: async () =>
      demoMode
        ? (await import("../governanceProposals.data"))
            .DEMO_GOVERNANCE_PROPOSALS
        : getGovernanceProposals(),
  });

  const retry = () => {
    void query.refetch();
  };

  // A disabled query stays `pending` forever in react-query v5, so `isPending`
  // is only meaningful once the read is actually enabled — reading it raw
  // would pin a signed-out visitor to a skeleton that never resolves.
  const isSessionResolving = !demoMode && checking;

  return {
    proposals: query.data ?? [],
    loading: isSessionResolving || (canReadProposals && query.isPending),
    error: canReadProposals && query.isError,
    retry,
    isSignedOut: !canReadProposals && !isSessionResolving,
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

/**
 * Files a member motion, which opens in `gathering` and starts collecting
 * co-signatures. Demo mode resolves without a network call (the fixture list
 * is illustrative and never grows); live mode posts and invalidates the
 * shared list so the new motion appears on the gathering shelf.
 */
export function useGovernanceMotionCompose() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ComposeGovernanceMotionBody) => {
      if (demoMode) {
        await simulateDemoRoundTrip();
        return;
      }
      await composeGovernanceMotion(body);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: proposalsQueryKey(false),
      });
    },
  });
}

/**
 * Adds or withdraws the signed-in member's co-signature on a gathering
 * motion. Demo mode resolves locally (the calling row tracks its own "just
 * signed" state, exactly as the vote row does); live mode calls the real
 * endpoint and invalidates so the count and `hasCosigned` come back from the
 * server rather than being guessed here.
 */
export function useGovernanceCosign() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      proposalId,
      isWithdrawing,
    }: {
      proposalId: string;
      isWithdrawing: boolean;
    }) => {
      if (demoMode) {
        await simulateDemoRoundTrip();
        return;
      }
      if (isWithdrawing) {
        await withdrawGovernanceCosignature(proposalId);
        return;
      }
      await cosignGovernanceProposal(proposalId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: proposalsQueryKey(false),
      });
    },
  });
  return {
    demoMode,
    cosign: mutation.mutate,
    pending: mutation.isPending,
  };
}

export interface AdminGovernanceMotionsResult {
  motions: GovernanceProposalDTO[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/**
 * The admin screening queue: motions that cleared their co-signature
 * threshold and are waiting on a reviewer. Demo mode filters the page's own
 * fixture (dynamically imported so it never ships in the live bundle); live
 * mode calls `GET /admin/governance/motions?status=screening`.
 */
export function useAdminGovernanceMotions(): AdminGovernanceMotionsResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<GovernanceProposalDTO[]>({
    queryKey: motionQueueQueryKey(demoMode),
    queryFn: async () => {
      if (!demoMode) return getAdminGovernanceMotions();
      const { DEMO_GOVERNANCE_PROPOSALS } =
        await import("../governanceProposals.data");
      return DEMO_GOVERNANCE_PROPOSALS.filter(
        (proposal) => proposal.status === "screening",
      );
    },
  });

  const retry = () => {
    void query.refetch();
  };

  return {
    motions: query.data ?? [],
    loading: query.isPending,
    error: query.isError,
    retry,
  };
}

/** Invalidate both the queue and the public list after a screening decision. */
function useRefreshAfterScreening() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: motionQueueQueryKey(false),
    });
    void queryClient.invalidateQueries({ queryKey: proposalsQueryKey(false) });
  };
}

/** Opens a screened motion for voting over the reviewer's chosen window. */
export function useAdminGovernanceMotionApprove() {
  const { demoMode } = useDemoMode();
  const refresh = useRefreshAfterScreening();
  return useMutation({
    mutationFn: async ({
      motionId,
      body,
    }: {
      motionId: string;
      body: ApproveGovernanceMotionBody;
    }) => {
      if (demoMode) {
        await simulateDemoRoundTrip();
        return;
      }
      await approveGovernanceMotion(motionId, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      refresh();
    },
  });
}

/** Turns a screened motion down, recording the reason the public page shows. */
export function useAdminGovernanceMotionReject() {
  const { demoMode } = useDemoMode();
  const refresh = useRefreshAfterScreening();
  return useMutation({
    mutationFn: async ({
      motionId,
      body,
    }: {
      motionId: string;
      body: RejectGovernanceMotionBody;
    }) => {
      if (demoMode) {
        await simulateDemoRoundTrip();
        return;
      }
      await rejectGovernanceMotion(motionId, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      refresh();
    },
  });
}
