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
 * workshop this session listed) renders immediately as a placeholder, while live
 * mode still fetches GET /workshops/:slug behind it.
 *
 * That fetch is unconditional in live mode on purpose. The list endpoint answers
 * for a whole page of workshops and does not carry `isHost`, so a catalogue row
 * always looks host-less; the detail endpoint is the only place the viewer's
 * relationship to this workshop is established. Short-circuiting on the
 * catalogue row would mean a host never sees their own edit/delete controls.
 *
 * Dual-mode: demo mode never reaches the network — an unknown id there really is
 * not found, and `isHost` comes off the session store instead.
 */
export function useWorkshop(slug: string | undefined): WorkshopResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { getWorkshop: fromCatalogue } = useWorkshops();

  const local = slug ? fromCatalogue(slug) : undefined;
  const shouldFetch = !demoMode && !!slug;

  const query = useQuery({
    queryKey: ["workshop", slug, demoMode, language],
    enabled: shouldFetch,
    queryFn: async () => {
      const dto = await getWorkshop(slug as string);
      return workshopDtoToWorkshop(dto, t, fmt);
    },
  });

  return {
    // The fetched row wins once it lands — it's the authoritative one.
    workshop: query.data ?? local,
    // Only a cold deep link blocks on the network; with a catalogue row in hand
    // there is something to render already.
    isLoading: shouldFetch && query.isLoading && !local,
  };
}
