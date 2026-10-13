import { mockFollowedPersonas } from "../../subprofiles/followedPersonas.data";
import { DEMO_SUBPROFILES } from "../../subprofiles/data/subprofiles.data";
import type { StudioReleaseCardDTO, StudioReleaseDTO } from "./studio.types";

/** A release as the card the list endpoints send. */
export function demoReleaseCard(dto: StudioReleaseDTO): StudioReleaseCardDTO {
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    coverUrl: dto.coverUrl,
    releasedOn: dto.releasedOn,
    trackCount: dto.trackCount,
    totalDurationSeconds: dto.totalDurationSeconds,
    artist: dto.artist,
    publishedAt: dto.publishedAt,
    genre: dto.genre,
  };
}

/** Follower totals for demo artists the persona registry does not hold. */
const STUDIO_ONLY_FOLLOWER_COUNTS: Record<string, number> = {
  "demo-persona-mariana-sol": 1204,
  "demo-persona-rita-ferreira": 0,
  "demo-persona-coro-de-outubro": 12,
};

/** The persona page reads the registry, so the Studio reads it too: a
 *  persona in both shows the same follower total in each place. */
export function demoArtistFollowerCount(artistId: string): number {
  const persona = DEMO_SUBPROFILES.find((entry) => entry.id === artistId);
  return persona
    ? persona.followerCount
    : (STUDIO_ONLY_FOLLOWER_COUNTS[artistId] ?? 0);
}

/** Whether the demo viewer follows this artist: the followed-personas list
 *  the library Artists tab reads, so the hero and the tab agree. */
export function demoIsFollowingArtist(artistId: string): boolean {
  return mockFollowedPersonas(1, 1000).items.some(
    (persona) => persona.id === artistId,
  );
}
