import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";
import type { StudioSceneEventDTO } from "./studio.types";
import {
  toSceneEventView,
  type StudioSceneEventView,
} from "./studioDiscovery.adapters";
import { readStudio } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const NO_EVENTS: StudioSceneEventView[] = [];
/** Matches the server's `Cache-Control: private, max-age=300`. */
const ARTIST_EVENTS_STALE_MS = 5 * 60_000;

/** GET /studio/artists/:id/events: 404 for an artist the viewer cannot hear. */
const getStudioArtistEvents = (subprofileId: string) =>
  apiGet<{ items: StudioSceneEventDTO[] }>(
    `/studio/artists/${encodeURIComponent(subprofileId)}/events`,
  );

/**
 * PRD-15: where an artist plays next, up to 4 upcoming events, soonest
 * first. Live reads `GET /studio/artists/:id/events`: the events the persona
 * lists as public affiliations, under the scene page's event rule. The demo
 * derives them from the scenes the persona belongs to. A failed read folds
 * the shelf away quietly, so no toast.
 */
export function useStudioArtistEvents(
  subprofileId: string,
): StudioSceneEventView[] {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: ["studio", "artistEvents", demoMode, subprofileId] as const,
    enabled: subprofileId !== "" && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : ARTIST_EVENTS_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        demoMode
          ? (await import("./studioDemoArtistEvents"))
              .demoStudioArtistEvents(subprofileId)
              .map(toSceneEventView)
          : (await getStudioArtistEvents(subprofileId)).items.map(
              toSceneEventView,
            ),
      ),
  });
  return query.data ?? NO_EVENTS;
}
