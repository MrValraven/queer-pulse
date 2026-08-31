import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  castRoadmapVote,
  getMyRoadmapVotes,
  submitRoadmapIdea,
} from "./roadmap.api";

// ── Roadmap vote + idea-submission mutations (public) ───────────────────────
// Dual-mode: demo mode never touches the network (the page tracks its own
// local optimistic "voted" state, exactly as before this feature existed);
// live mode calls the real backend and lets react-query own the cache.

/**
 * Ids of items/ideas the signed-in member has already voted for. Demo mode
 * has no persisted voting (each page load starts fresh, matching today's
 * local-only behavior), so it resolves an empty set without a network call.
 */
export function useMyRoadmapVotes(): Set<string> {
  return useMyRoadmapVotesQuery().votedIds;
}

export interface MyRoadmapVotesResult {
  votedIds: Set<string>;
  isLoading: boolean;
  /** True when the read failed (DES-22). A failed read leaves every card
   *  looking unvoted, so a caller that cares must be able to tell that apart
   *  from "you have voted for nothing yet". */
  isError: boolean;
  /** Re-run the failed read. */
  refetch: () => void;
}

/**
 * The same read as `useMyRoadmapVotes`, with the query state attached
 * (DES-22). `useMyRoadmapVotes` stays the Set-returning convenience for the
 * vote buttons, which fail quietly: a missing vote list only costs a member a
 * refused duplicate vote, never a wrong page of content.
 */
export function useMyRoadmapVotesQuery(): MyRoadmapVotesResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["roadmap-my-votes", demoMode],
    queryFn: async () => (demoMode ? [] : await getMyRoadmapVotes()),
  });
  return {
    votedIds: new Set(query.data ?? []),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

export function useRoadmapVote() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      targetType,
      targetId,
    }: {
      targetType: "item" | "idea";
      targetId: string;
    }) => castRoadmapVote(targetType, targetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roadmap", false] });
      void queryClient.invalidateQueries({
        queryKey: ["roadmap-my-votes", false],
      });
    },
  });
  return { demoMode, vote: mutation.mutate, pending: mutation.isPending };
}

export function useSubmitRoadmapIdea() {
  const { demoMode } = useDemoMode();
  const mutation = useMutation({
    // SubmitIdea shows its own success/error toast, so silence the global
    // duplicate error toast.
    meta: { silentError: true },
    mutationFn: (text: string) =>
      demoMode
        ? Promise.resolve({ status: "pending" as const })
        : submitRoadmapIdea(text),
  });
  return { submit: mutation.mutate, pending: mutation.isPending };
}
