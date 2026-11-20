import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  getCulturalIdea,
  getCulturalIdeas,
  shouldRetryCulturalRead,
} from "./culturalProduction.api";
import {
  type CulturalIdeaDTO,
  type CulturalIdeaListDTO,
} from "./culturalProduction.types";
import { culturalKeys } from "./culturalProductionKeys";

const LIVE_STALE_MS = 30_000;

/** Every idea, newest first. Demo reads the demo store, which only demo
 *  writes change, so it never goes stale there. */
export function useCulturalIdeas(): UseQueryResult<CulturalIdeaListDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalIdeaListDTO, Error>({
    queryKey: culturalKeys.ideas(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoListCulturalIdeas } =
          await import("../culturalProductionDemoStore");
        return demoListCulturalIdeas();
      }
      return getCulturalIdeas(signal);
    },
  });
}

/** One idea with every backer, comment and linked task. A null id sends no
 *  request. A refusal that names a reason (the idea is gone) answers at
 *  once; any other failure retries twice. */
export function useCulturalIdea(
  ideaId: string | null,
): UseQueryResult<CulturalIdeaDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalIdeaDTO, Error>({
    queryKey: culturalKeys.idea(ideaId ?? "", demoMode),
    enabled: ideaId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      const requestedId = ideaId ?? "";
      if (demoMode) {
        const { demoGetCulturalIdea } =
          await import("../culturalProductionDemoStore");
        return demoGetCulturalIdea(requestedId);
      }
      return getCulturalIdea(requestedId, signal);
    },
  });
}
