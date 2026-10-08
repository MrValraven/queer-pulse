import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvent } from "./events.api";
import { eventKeys } from "./eventKeys";
import { detailToGathering } from "./events.adapters";
import { resolveGathering, type GatheringDetail } from "../data";
import { gatheringSlugFromParam } from "../gatheringPaths";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GuestPreviewRole } from "../guestPreview/guestPreview";

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

/**
 * The detail as a guest would read it, for a host previewing their own
 * gathering (`GET /events/:slug?viewAs=`). Live only, and only while a
 * perspective is chosen; the server refuses anyone who is not an organiser.
 * The previous perspective stays on screen while the next one loads, so
 * switching views does not flash the skeleton. Always stale: an edit
 * invalidates only the host's own detail, so a preview opened after one
 * refetches and shows the gathering as it now stands.
 */
export function useEventPreview(
  param: string | undefined,
  viewAs: GuestPreviewRole | null,
) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const slug = gatheringSlugFromParam(param ?? "");
  return useQuery<EventResult>({
    queryKey: eventKeys.detailPreview(param, viewAs ?? "member", demoMode),
    enabled: !demoMode && slug !== "" && viewAs !== null,
    retry: false,
    staleTime: 0,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const dto = await getEvent(slug, viewAs ?? undefined);
      return { gathering: detailToGathering(dto, t) };
    },
  });
}
