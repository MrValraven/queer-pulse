import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getNowInsights, type NowInsights } from "./nowInsights.api";

/**
 * The owner's Now card figures. Demo reads the mock registry; live calls the
 * endpoint.
 *
 * Disabled for a visitor, and a failure resolves to `null` rather than an
 * error state: the card's numbers are a bonus on top of a section that must
 * render from the profile alone. A member whose insights request fails sees
 * their status and chips, without a broken panel where the figures go.
 */
export function useNowInsights(isSelf: boolean, slug?: string) {
  const { demoMode } = useDemoMode();
  return useQuery<NowInsights | null>({
    queryKey: ["nowInsights", demoMode, slug ?? "me"],
    enabled: isSelf,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { DEMO_NOW_INSIGHTS } = await import("../now/nowInsights.demo");
        return (slug ? DEMO_NOW_INSIGHTS[slug] : undefined) ?? null;
      }
      try {
        return await getNowInsights(signal);
      } catch {
        return null;
      }
    },
  });
}
