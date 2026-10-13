import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioTrack } from "./studio.api";
import { toTrackView, type StudioTrackView } from "./studio.adapters";
import { DEMO_DEFAULT_TRACK_ID } from "./studioDemoMe.data";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

export function useStudioTrack(trackId: string | null): {
  track: StudioTrackView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const resolvedId = trackId ?? (demoMode ? DEMO_DEFAULT_TRACK_ID : null);
  const query = useQuery({
    queryKey: studioKeys.track(demoMode, resolvedId ?? ""),
    enabled: resolvedId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toTrackView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioTrack(
                resolvedId ?? "",
              )
            : await getStudioTrack(resolvedId ?? ""),
        ),
      ),
  });
  if (resolvedId === null)
    return { track: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    track: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
