import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { QuizshowWinBadgesPreviewResponse } from "../../../shared/contracts/quizWinBadges";
import { quizshowKeys } from "../api/quizshowKeys";
import { getQuizshowWinBadgesPreview } from "./quizWinBadges.api";
import { demoGetWinBadgesPreview } from "./quizWinBadgesDemoStore";

/**
 * The "Win to earn" read for an event's next game. It is a supplementary read,
 * so it never retries: a failure leaves `data` undefined and the surfaces that
 * call it render nothing. Idle while there is no slug or `isEnabled` is false.
 */
export function useQuizshowWinBadgesPreview(
  eventSlug: string | null,
  options?: { isEnabled?: boolean },
): UseQueryResult<QuizshowWinBadgesPreviewResponse> {
  const { demoMode } = useDemoMode();
  const isEnabled = eventSlug !== null && options?.isEnabled !== false;
  return useQuery<QuizshowWinBadgesPreviewResponse>({
    queryKey: quizshowKeys.winBadgesPreview(eventSlug ?? "", demoMode),
    enabled: isEnabled,
    retry: false,
    // Always stale: a game that just ended moves the preview on to the next
    // game, so every mount and every invalidation reads it again.
    staleTime: 0,
    // A supplementary read: a failure renders nothing and raises no toast.
    meta: { silentError: true },
    queryFn: async () => {
      if (eventSlug === null) {
        throw new Error("The win badges preview needs an event slug.");
      }
      return demoMode
        ? demoGetWinBadgesPreview(eventSlug)
        : getQuizshowWinBadgesPreview(eventSlug);
    },
  });
}
