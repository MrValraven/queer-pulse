import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioTrackView } from "./studio.adapters";
import { DEMO_DEFAULT_TRACK_ID } from "./studioDemoMe.data";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { studioTrackQueryOptions } from "./studioTrackQuery";
import { useStudioAccess } from "./useStudioAccess";

export function useStudioTrack(trackId: string | null): {
  track: StudioTrackView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const resolvedId = trackId ?? (demoMode ? DEMO_DEFAULT_TRACK_ID : null);
  const query = useQuery({
    ...studioTrackQueryOptions(demoMode, resolvedId ?? ""),
    enabled: resolvedId !== null && (demoMode || hasAccess),
  });
  if (resolvedId === null)
    return { track: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    track: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
