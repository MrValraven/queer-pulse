import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PUBLIC_ROADMAP_KEY, roadmapKeys } from "./roadmapKeys";

/**
 * Shared invalidation for every admin roadmap mutation hook
 * (`useAdminRoadmapItemMutations`/`useAdminRoadmapIdeaMutations`/
 * `useAdminRoadmapTeamMutations`, composed by `useAdminRoadmapMutations`).
 * Split out purely so the three action-group hooks don't each re-derive the
 * same `demoMode`/`queryClient` pair — every mutation across all three
 * finishes by invalidating `roadmapKeys.admin(demoMode)` so
 * `useAdminRoadmap` refetches, and live mutations additionally invalidate
 * the public page's `[PUBLIC_ROADMAP_KEY]` query, since these are the same
 * admin-controlled items/ideas/hero-stats it renders.
 */
export function useInvalidateAdminRoadmap(): () => void {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: roadmapKeys.admin(demoMode),
    });
    if (!demoMode) {
      void queryClient.invalidateQueries({ queryKey: [PUBLIC_ROADMAP_KEY] });
    }
  };
}
