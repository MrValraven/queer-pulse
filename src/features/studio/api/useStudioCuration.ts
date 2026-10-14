import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toCurationView,
  type StudioCurationView,
} from "./studioDiscovery.adapters";
import { getStudioCuration } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const CURATION_STALE_MS = 60_000;

/** The featured pick and the two shelves. Home hides an empty or failed
 *  shelf and falls back to the newest release, so a failure stays quiet. */
export function useStudioCuration(): {
  curation: StudioCurationView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.curation(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : CURATION_STALE_MS,
    retry: false,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toCurationView(
          demoMode
            ? (await import("./studioDemoDiscovery")).demoStudioCuration()
            : await getStudioCuration(),
        ),
      ),
  });
  return {
    curation: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
