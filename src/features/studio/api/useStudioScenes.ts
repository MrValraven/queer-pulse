import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toSceneCardView,
  type StudioSceneCardView,
} from "./studioDiscovery.adapters";
import { getStudioScenes } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const SCENES_STALE_MS = 5 * 60_000;

/** Active scenes in staff order: the home row and the release editor's
 *  scene select. */
export function useStudioScenes(): {
  scenes: StudioSceneCardView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.scenes(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : SCENES_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const dto = demoMode
          ? (await import("./studioDemoDiscovery")).demoStudioScenes()
          : await getStudioScenes();
        return dto.items.map(toSceneCardView);
      }),
  });
  return {
    scenes: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
