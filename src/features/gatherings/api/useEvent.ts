import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvent } from "./events.api";
import { detailToGathering } from "./events.adapters";
import { resolveGathering, type GatheringDetail } from "../data";

export interface EventResult {
  gathering: GatheringDetail;
}

/**
 * Single event detail. Demo mode resolves the `:slug` route param against the
 * mock `gatheringDetails` registry (the existing `resolveGathering` fallback);
 * live mode calls GET /events/:slug and adapts it to the same `GatheringDetail`
 * view-model the GatheringPage renders.
 *
 * `param` is the raw route param (`<slug>-<shortId>`); we strip the trailing
 * short-id before hitting the API so the backend gets the real slug.
 */
export function useEvent(param: string | undefined) {
  const { demoMode } = useDemoMode();
  const slug = (param ?? "").replace(/-[a-z0-9]+$/i, "") || (param ?? "");
  return useQuery<EventResult>({
    queryKey: ["event", demoMode, param],
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
      return { gathering: detailToGathering(dto) };
    },
  });
}
