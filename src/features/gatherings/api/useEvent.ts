import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvent } from "./events.api";
import { eventKeys } from "./eventKeys";
import { detailToGathering } from "./events.adapters";
import { resolveGathering, type GatheringDetail } from "../data";
import { gatheringSlugFromParam } from "../gatheringPaths";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export interface EventResult {
  gathering: GatheringDetail;
}

/**
 * Single event detail. Demo mode resolves the `:slug` route param against the
 * mock `gatheringDetails` registry (the existing `resolveGathering` fallback);
 * live mode calls GET /events/:slug and adapts it to the same `GatheringDetail`
 * view-model the GatheringPage renders.
 *
 * `param` is the raw route param, either our own `<slug>-<shortId>` or the
 * bare slug that backend-built links carry. `gatheringSlugFromParam` strips a
 * trailing segment only when it is that slug's real short id, so the backend
 * always gets the real slug.
 */
export function useEvent(param: string | undefined) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const slug = gatheringSlugFromParam(param ?? "");
  return useQuery<EventResult>({
    queryKey: eventKeys.detail(param, demoMode),
    // Never fetch without a slug: `GET /events/` is matched by the *list*
    // handler (Express routing ignores the trailing slash), which answers 200
    // with an events page. The adapter would read that as a detail DTO and
    // produce `new Date(undefined)`, crashing the page on the first date
    // format. Staying disabled leaves `data` undefined so the caller's
    // `resolveGathering` fallback takes over.
    enabled: demoMode || slug !== "",
    queryFn: async () => {
      if (demoMode) return { gathering: resolveGathering(param) };
      const dto = await getEvent(slug);
      return { gathering: detailToGathering(dto, t) };
    },
  });
}
