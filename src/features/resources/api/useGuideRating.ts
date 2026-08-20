import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  fetchGuideRating,
  rateGuide,
  type GuideRatingValue,
} from "./resources.api";

/**
 * Backs `GuideRatingWidget` for one guide section's `contentKey` (CNT-18).
 * Demo mode never calls the network (mirrors `useForumMutations`'s `if
 * (demoMode) return` no-op) — clicks still toggle a local `useState`
 * optimistically, so the widget responds visually in the demo prototype, it
 * just never persists across a reload. Live mode fetches the caller's
 * existing vote once (so a member who already rated sees their selection on
 * return visits) and POSTs on click, reconciling `myVote` from the server's
 * authoritative post-toggle response (same value clears, different value
 * changes — `ResourceGuideRatingsService.rate()`).
 */
export function useGuideRating(contentKey: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = ["guide-rating", contentKey, demoMode];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchGuideRating(contentKey),
    enabled: !demoMode,
    staleTime: Infinity,
  });

  const [demoVote, setDemoVote] = useState<GuideRatingValue | null>(null);

  const mutation = useMutation({
    mutationFn: (value: GuideRatingValue) => rateGuide(contentKey, value),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
    },
  });

  const myVote = demoMode ? demoVote : (query.data?.myVote ?? null);

  const vote = (value: GuideRatingValue) => {
    if (demoMode) {
      setDemoVote((current) => (current === value ? null : value));
      return;
    }
    mutation.mutate(value);
  };

  return { myVote, isPending: mutation.isPending, vote };
}
