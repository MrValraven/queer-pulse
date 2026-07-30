import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { castRoadmapVote, getMyRoadmapVotes, submitRoadmapIdea } from "./roadmap.api";

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
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["roadmap-my-votes", demoMode],
    queryFn: async () => (demoMode ? [] : await getMyRoadmapVotes()),
  });
  return new Set(query.data ?? []);
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
      queryClient.invalidateQueries({ queryKey: ["roadmap", false] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-my-votes", false] });
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
