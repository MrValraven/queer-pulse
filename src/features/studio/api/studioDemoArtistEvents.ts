import type { StudioSceneEventDTO } from "./studio.types";
import { demoStudioScene, demoStudioScenes } from "./studioDemoDiscovery";

/** The artist page shows at most this many upcoming events. */
export const ARTIST_EVENTS_SHOWN = 4;

/**
 * The demo's upcoming events for one persona, read through the scene events
 * path: every active scene that lists the persona among its artists gives
 * its upcoming events (the demo has no persona affiliations, so a scene's
 * pins stand in for them). Deduplicated by slug, soonest first, at most 4.
 */
export function demoStudioArtistEvents(
  subprofileId: string,
): StudioSceneEventDTO[] {
  const bySlug = new Map<string, StudioSceneEventDTO>();
  for (const card of demoStudioScenes().items) {
    const scene = demoStudioScene(card.slug);
    if (!scene.artists.some((artist) => artist.id === subprofileId)) continue;
    for (const event of scene.upcomingEvents)
      if (!bySlug.has(event.slug)) bySlug.set(event.slug, event);
  }
  return [...bySlug.values()]
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, ARTIST_EVENTS_SHOWN);
}
