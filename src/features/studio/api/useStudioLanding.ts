import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isPrerendering } from "../../../shared/prerender";
import { toStudioLandingView } from "./studioLanding.adapters";
import { fetchStudioLanding } from "./studioLanding.api";
import { studioKeys } from "./studioQueryKeys";

/**
 * The public Studio landing read. A failed read leaves `landing` null: every
 * live section stays hidden and the static page stands on its own. The read
 * is off while prerendering, so the baked HTML holds no live answer.
 */
export function useStudioLanding() {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: studioKeys.landing(demoMode),
    enabled: !isPrerendering(),
    staleTime: 60_000,
    meta: { silentError: true },
    queryFn: async ({ signal }) =>
      toStudioLandingView(
        demoMode
          ? (await import("../landing/studioLandingDemo.data"))
              .DEMO_STUDIO_LANDING
          : await fetchStudioLanding(signal),
      ),
  });
  return {
    landing: query.data ?? null,
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isError: query.isError,
  };
}
