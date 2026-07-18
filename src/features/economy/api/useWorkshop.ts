import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useWorkshops } from "../../../app/providers/WorkshopsProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getWorkshop } from "./workshops.api";
import { workshopDtoToWorkshop } from "./workshops.adapters";
import type { Workshop } from "../workshops.data";

export interface WorkshopResult {
  workshop: Workshop | undefined;
  isLoading: boolean;
}

/**
 * One workshop, by slug (the FE's `id` — DTO departure 1).
 *
 * The provider's catalogue only holds the pages loaded so far, so a deep link to
 * `/skills/:id` in live mode would otherwise render "not found" before any page
 * had been fetched. Anything already in the catalogue (the demo fixture, or a
 * workshop this session listed) is served straight from there; otherwise live
 * mode fetches GET /workshops/:slug.
 *
 * Dual-mode: demo mode never reaches the network — an unknown id there really is
 * not found.
 */
export function useWorkshop(slug: string | undefined): WorkshopResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { getWorkshop: fromCatalogue } = useWorkshops();

  const local = slug ? fromCatalogue(slug) : undefined;
  const shouldFetch = !demoMode && !!slug && !local;

  const query = useQuery({
    queryKey: ["workshop", slug, demoMode, language],
    enabled: shouldFetch,
    queryFn: async () => {
      const dto = await getWorkshop(slug as string);
      return workshopDtoToWorkshop(dto, t, fmt);
    },
  });

  return {
    workshop: local ?? query.data,
    isLoading: shouldFetch && query.isLoading,
  };
}
