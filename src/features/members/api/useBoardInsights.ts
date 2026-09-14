import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { fetchBoardInsights, type BoardInsightsDTO } from "./boardInsights.api";

/**
 * The owner's own board figures: the hellos/replies funnel and the reciprocal
 * matches per post.
 *
 * Only ever enabled for the profile owner, because the endpoint has no slug and
 * answers for the caller alone. A failed or absent response resolves to `null`
 * rather than an error state, so the section renders without its owner
 * figures and stays quiet about it instead of raising a toast over a strip of
 * secondary figures.
 */
export function useBoardInsights(isSelf: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<BoardInsightsDTO | null>({
    queryKey: ["boardInsights", demoMode],
    enabled: isSelf,
    queryFn: async () => {
      if (demoMode) {
        const { DEMO_BOARD_INSIGHTS } =
          await import("../board/boardInsights.demo");
        return DEMO_BOARD_INSIGHTS;
      }
      try {
        return await fetchBoardInsights();
      } catch {
        return null;
      }
    },
  });
}
