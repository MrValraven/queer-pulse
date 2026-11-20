import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  getCulturalGuide,
  getCulturalGuides,
  shouldRetryCulturalRead,
} from "./culturalProduction.api";
import {
  type CulturalGuideDTO,
  type CulturalGuideListDTO,
} from "./culturalProduction.types";
import { culturalKeys } from "./culturalProductionKeys";

const LIVE_STALE_MS = 30_000;

/** Every guide in both languages. Demo reads the demo store, which only
 *  demo writes change, so it never goes stale there. */
export function useCulturalGuides(): UseQueryResult<
  CulturalGuideListDTO,
  Error
> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalGuideListDTO, Error>({
    queryKey: culturalKeys.guides(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoListCulturalGuides } =
          await import("../culturalProductionDemoStore");
        return demoListCulturalGuides();
      }
      return getCulturalGuides(signal);
    },
  });
}

/** One guide with its sections, steps and revision. A null id sends no
 *  request. A refusal that names a reason (the guide is gone) answers at
 *  once; any other failure retries twice. */
export function useCulturalGuide(
  guideId: string | null,
): UseQueryResult<CulturalGuideDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalGuideDTO, Error>({
    queryKey: culturalKeys.guide(guideId ?? "", demoMode),
    enabled: guideId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      const requestedId = guideId ?? "";
      if (demoMode) {
        const { demoGetCulturalGuide } =
          await import("../culturalProductionDemoStore");
        return demoGetCulturalGuide(requestedId);
      }
      return getCulturalGuide(requestedId, signal);
    },
  });
}
