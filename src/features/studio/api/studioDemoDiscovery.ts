import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_CREDIT_ROLES,
  STUDIO_DISCOVERY_LIMITS,
  type StudioAppearsOnCardDTO,
  type StudioArtistOfTheMonthCardDTO,
  type StudioArtistRefDTO,
  type StudioCuratedPickDTO,
  type StudioCurationDTO,
  type StudioPageDTO,
  type StudioRadioDTO,
  type StudioRadioFilter,
  type StudioReleaseCardDTO,
  type StudioSceneCardDTO,
  type StudioSceneDTO,
  type StudioSpotlightArtistCardDTO,
} from "./studio.types";
import { DEMO_ARTISTS, DEMO_RELEASES } from "./studioDemo.data";
import { DEMO_LISTED_RELEASES, demoPageOf } from "./studioDemoApi";
import { demoReleaseCard } from "./studioDemoCards";
import {
  demoEffectiveWarnings,
  demoWithheldTrackIds,
} from "./studioDemoSafety";
import {
  DEMO_CURATION_SEED,
  DEMO_SPOTLIGHT_SEED,
  type DemoCuratedPickSeed,
  type DemoSpotlightSeed,
} from "./studioDemoCuration.data";
import { demoAllArtists } from "./studioDemoFormats.data";
import { demoAcceptedPublicCredits } from "./studioDemoCreditLedger";
import {
  DEMO_STUDIO_SCENES,
  type DemoStudioScene,
} from "./studioDemoScenes.data";

// Discovery reads for the demo, wire-shaped so they go through the same
// adapters as live answers.

const sceneNotFound = () =>
  new ApiError(404, "Not found", {
    statusCode: 404,
    code: "studio_scene_not_found",
    message: "Not found",
  });
const artistNotFound = () => new ApiError(404, "Not found");

const releaseById = (releaseId: string) =>
  DEMO_RELEASES.find((release) => release.id === releaseId);

function picksOf(seeds: DemoCuratedPickSeed[]): StudioCuratedPickDTO[] {
  return seeds.flatMap((seed) => {
    const release = releaseById(seed.releaseId);
    return release ? [{ ...demoReleaseCard(release), note: seed.note }] : [];
  });
}

/** A seed whose artist the demo does not know is skipped. */
function spotlightCardOf(
  seed: DemoSpotlightSeed,
): StudioSpotlightArtistCardDTO | null {
  const artist = demoAllArtists().find(
    (candidate) => candidate.id === seed.artistId,
  );
  return artist ? { artist, note: seed.note } : null;
}

/** Skipped (null) when the artist has no listed release, as on the server. */
function artistOfTheMonthOf(
  seed: DemoSpotlightSeed | null,
): StudioArtistOfTheMonthCardDTO | null {
  const card = seed ? spotlightCardOf(seed) : null;
  if (!card) return null;
  const newestRelease = DEMO_LISTED_RELEASES.find(
    (release) => release.artist.id === card.artist.id,
  );
  return newestRelease
    ? { ...card, latestRelease: demoReleaseCard(newestRelease) }
    : null;
}

/** GET /studio/curation. */
export function demoStudioCuration(): StudioCurationDTO {
  return {
    featured: picksOf(DEMO_CURATION_SEED.featured)[0] ?? null,
    staffPicks: picksOf(DEMO_CURATION_SEED.staff_picks),
    newThisWeek: picksOf(DEMO_CURATION_SEED.new_this_week),
    artistOfTheMonth: artistOfTheMonthOf(DEMO_SPOTLIGHT_SEED.artistOfTheMonth),
    newStars: DEMO_SPOTLIGHT_SEED.newStars.flatMap((seed) => {
      const card = spotlightCardOf(seed);
      return card ? [card] : [];
    }),
  };
}

const activeScenes = () =>
  DEMO_STUDIO_SCENES.filter((scene) => scene.status === "active").sort(
    (left, right) => left.position - right.position,
  );

const cardOfScene = (scene: DemoStudioScene): StudioSceneCardDTO => ({
  id: scene.id,
  slug: scene.slug,
  name: scene.name,
  city: scene.city,
  coverUrl: scene.coverUrl,
});

function activeSceneBySlug(slug: string): DemoStudioScene {
  const scene = activeScenes().find((candidate) => candidate.slug === slug);
  if (!scene) throw sceneNotFound();
  return scene;
}

/** Newest first, as DEMO_RELEASES is ordered. */
const releasesInScene = (scene: DemoStudioScene) =>
  DEMO_RELEASES.filter((release) => scene.releaseIds.includes(release.id));

/** GET /studio/scenes. */
export function demoStudioScenes(): { items: StudioSceneCardDTO[] } {
  return { items: activeScenes().map(cardOfScene) };
}

/** GET /studio/scenes/:slug: 404 for an archived or unknown slug. */
export function demoStudioScene(slug: string): StudioSceneDTO {
  const scene = activeSceneBySlug(slug);
  const artists = new Map<string, StudioArtistRefDTO>();
  for (const release of releasesInScene(scene)) {
    if (!artists.has(release.artist.id))
      artists.set(release.artist.id, release.artist);
  }
  return {
    ...cardOfScene(scene),
    blurb: scene.blurb,
    artists: [...artists.values()].slice(
      0,
      STUDIO_DISCOVERY_LIMITS.sceneArtistsShown,
    ),
    upcomingEvents: [...scene.pinnedEvents]
      .sort((left, right) => left.startAt.localeCompare(right.startAt))
      .slice(0, STUDIO_DISCOVERY_LIMITS.sceneUpcomingEvents),
  };
}

/** GET /studio/scenes/:slug/releases. */
export function demoStudioSceneReleases(
  slug: string,
  cursor: string | null,
): StudioPageDTO<StudioReleaseCardDTO> {
  return demoPageOf(
    releasesInScene(activeSceneBySlug(slug)).map(demoReleaseCard),
    cursor,
  );
}

const isDemoArtist = (subprofileId: string) =>
  DEMO_ARTISTS.some((artist) => artist.id === subprofileId);

/** GET /studio/artists/:id/appears-on. */
export function demoStudioAppearsOn(
  subprofileId: string,
  cursor: string | null,
): StudioPageDTO<StudioAppearsOnCardDTO> {
  if (!isDemoArtist(subprofileId)) throw artistNotFound();
  const credits = demoAcceptedPublicCredits().filter(
    (credit) => credit.persona.id === subprofileId,
  );
  const cards = DEMO_RELEASES.flatMap((release) => {
    const roles = STUDIO_CREDIT_ROLES.filter((role) =>
      credits.some(
        (credit) => credit.releaseId === release.id && credit.role === role,
      ),
    );
    return roles.length > 0 ? [{ ...demoReleaseCard(release), roles }] : [];
  });
  return demoPageOf(cards, cursor);
}

const releasesOf = (artistId: string) =>
  DEMO_RELEASES.filter((release) => release.artist.id === artistId);

function creditScore(artistId: string, candidateId: string): number {
  const creditedTracks = new Set(
    demoAcceptedPublicCredits()
      .filter(
        (credit) =>
          (credit.persona.id === artistId &&
            credit.requestingPersona.id === candidateId) ||
          (credit.persona.id === candidateId &&
            credit.requestingPersona.id === artistId),
      )
      .map((credit) => credit.trackId),
  );
  return Math.min(creditedTracks.size * 4, 12);
}

/** An archived scene adds nothing, as on the server. */
function sceneScore(artistId: string, candidateId: string): number {
  const isInScene = (id: string, scene: DemoStudioScene) =>
    releasesOf(id).some((release) => scene.releaseIds.includes(release.id));
  return activeScenes().some(
    (scene) => isInScene(artistId, scene) && isInScene(candidateId, scene),
  )
    ? 2
    : 0;
}

function genreScore(artistId: string, candidateId: string): number {
  const genresOf = (id: string) =>
    new Set(releasesOf(id).flatMap((release) => release.genres));
  const ownGenres = genresOf(artistId);
  const sharedCount = [...genresOf(candidateId)].filter((genre) =>
    ownGenres.has(genre),
  ).length;
  return Math.min(sharedCount, 2);
}

/** GET /studio/artists/:id/related. The demo scores credits, scenes and
 *  genres; its playlists hold too few curators to pass the two-curator
 *  floor, so they add nothing. */
export function demoStudioRelatedArtists(subprofileId: string): {
  items: StudioArtistRefDTO[];
} {
  if (!isDemoArtist(subprofileId)) throw artistNotFound();
  const ranked = DEMO_ARTISTS.filter(
    (artist) => artist.id !== subprofileId && releasesOf(artist.id).length > 0,
  )
    .map((artist) => ({
      artist,
      score:
        creditScore(subprofileId, artist.id) +
        sceneScore(subprofileId, artist.id) +
        genreScore(subprofileId, artist.id),
      newestPublishedAt: releasesOf(artist.id)[0]?.publishedAt ?? "",
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.newestPublishedAt.localeCompare(left.newestPublishedAt) ||
        left.artist.id.localeCompare(right.artist.id),
    );
  return {
    items: ranked
      .slice(0, STUDIO_DISCOVERY_LIMITS.relatedArtistsMax)
      .map((entry) => entry.artist),
  };
}

/** GET /studio/radio. The demo answers in list order; the browser shuffles. */
export function demoStudioRadio(filter: StudioRadioFilter): StudioRadioDTO {
  // Artist kinds: a radio never plays an episode (spec 4.6).
  const releases = DEMO_LISTED_RELEASES.filter(
    (release) => release.type !== "podcast",
  ).filter((release) =>
    filter.kind === "genre"
      ? release.genres.includes(filter.value)
      : release.mood === filter.value,
  );
  const items = releases.flatMap((release) =>
    release.tracks.flatMap((track) =>
      track.hasAudio &&
      track.durationSeconds !== null &&
      // Studio safety: the radio leaves a withheld track out.
      !demoWithheldTrackIds().has(track.id)
        ? [
            {
              trackId: track.id,
              title: track.title,
              durationSeconds: track.durationSeconds,
              isExplicit: track.isExplicit,
              contentWarnings: demoEffectiveWarnings(track.id),
              releaseId: release.id,
              releaseTitle: release.title,
              coverUrl: release.coverUrl,
              artist: release.artist,
            },
          ]
        : [],
    ),
  );
  return { items: items.slice(0, STUDIO_DISCOVERY_LIMITS.radioMaxItems) };
}
