import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toSceneView, type StudioSceneView } from "./studioDiscovery.adapters";
import { getStudioScene } from "./studioDiscovery.api";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** One scene with its artists and upcoming events. An archived or unknown
 *  slug answers 404, which the page turns into its not-found state. */
export function useStudioScene(slug: string | null): {
  scene: StudioSceneView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.scene(demoMode, slug ?? ""),
    enabled: slug !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toSceneView(
          demoMode
            ? (await import("./studioDemoDiscovery")).demoStudioScene(
                slug ?? "",
              )
            : await getStudioScene(slug ?? ""),
        ),
      ),
  });
  if (slug === null) return { scene: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    scene: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
