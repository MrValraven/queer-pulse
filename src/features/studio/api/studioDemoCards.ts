import { mockFollowedPersonas } from "../../subprofiles/followedPersonas.data";
import { DEMO_SUBPROFILES } from "../../subprofiles/data/subprofiles.data";
import {
  STUDIO_FORMAT_BY_KIND,
  STUDIO_SUPPORT_PLATFORMS,
  type StudioReleaseCardDTO,
  type StudioReleaseDTO,
  type StudioSupportLinkDTO,
} from "./studio.types";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";

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
    genres: dto.genres,
    mood: dto.mood,
    scene: dto.scene,
    format: STUDIO_FORMAT_BY_KIND[dto.artist.kind],
  };
}

/** Follower totals for demo artists the persona registry does not hold. */
const STUDIO_ONLY_FOLLOWER_COUNTS: Record<string, number> = {
  "demo-persona-mariana-sol": 1204,
  "demo-persona-rita-ferreira": 0,
  "demo-persona-coro-de-outubro": 12,
  "demo-persona-lua-cardoso": 87,
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

// Studio v3: support links. They live here so the release fixture and the
// press kit read one list (studioDemoPress imports them; this file never
// imports studioDemoPress).

/** Mariana Sol has no persona page in the demo corpus; her links live here. */
const STUDIO_ONLY_LINKS: Record<
  string,
  { platform: string; urlOrHandle: string }[]
> = {
  [DEMO_ARTIST_MARIANA.id]: [
    { platform: "instagram", urlOrHandle: "@marianasol" },
    { platform: "website", urlOrHandle: "marianasol.pt" },
    { platform: "bandcamp", urlOrHandle: "https://marianasol.bandcamp.com" },
    { platform: "kofi", urlOrHandle: "@marianasol" },
  ],
};

const SUPPORT_PLATFORMS: ReadonlySet<string> = new Set(
  STUDIO_SUPPORT_PLATFORMS,
);

/** Every social link the persona holds, in its order: the registry's for a
 *  persona in both, else the Studio-only list. */
export function demoSocialLinksFor(
  artistId: string,
): { platform: string; urlOrHandle: string }[] {
  const persona = DEMO_SUBPROFILES.find((entry) => entry.id === artistId);
  return persona ? persona.socialLinks : (STUDIO_ONLY_LINKS[artistId] ?? []);
}

/** The persona's Bandcamp, Ko-fi and Patreon links, in its order. */
export function demoSupportLinksFor(artistId: string): StudioSupportLinkDTO[] {
  return demoSocialLinksFor(artistId).filter(
    (link): link is StudioSupportLinkDTO =>
      SUPPORT_PLATFORMS.has(link.platform),
  );
}
