import type {
  StudioPlaylistTrackDTO,
  StudioPressKitDTO,
  StudioReleaseDTO,
  UpdateStudioPressKitBody,
} from "./studio.types";
import { STUDIO_PRESS } from "./studio.types";
import {
  demoAllArtists,
  demoArtistDetailsOf,
  demoPublishedReleasesOf,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { studioRefusal } from "./studioDemoMutations";
import {
  demoReleaseCard,
  demoSocialLinksFor,
  demoSupportLinksFor,
} from "./studioDemoCards";

// The press kit test reads the support links from here; they live in
// studioDemoCards, beside the release fixture that also reads them.
export { demoSupportLinksFor } from "./studioDemoCards";

interface StoredStudioPressKit extends UpdateStudioPressKitBody {
  updatedAt: string;
}

/** Mariana's saved press kit. Member content stays as she wrote it. */
const storedKits = new Map<string, StoredStudioPressKit>([
  [
    DEMO_ARTIST_MARIANA.id,
    {
      pitch: "Fado letters set to a patient piano, from Beja to Sintra",
      pressBio: null,
      featuredTrackIds: [
        "demo-track-cidade-dos-santos-06",
        "demo-track-cidade-dos-santos-01",
        "demo-track-cidade-dos-santos-03",
      ],
      quotes: [
        {
          quote: "Sol sings like someone bargaining with God, and winning",
          source: "Shape, Lisbon",
        },
        {
          quote: "A record that trusts silence as much as the voice",
          source: "The Wire",
        },
      ],
      contact: "mailto:press@marianasol.pt",
      updatedAt: "2026-10-01T09:00:00.000Z",
    },
  ],
]);

/** Published releases only, newest first, across the music and artist
 *  kinds catalogues; a draft episode is left out. */
const publishedOf = (artistId: string): StudioReleaseDTO[] =>
  demoPublishedReleasesOf(artistId);

const trackOf = (release: StudioReleaseDTO, trackId: string) =>
  release.tracks.find((track) => track.id === trackId);

/** The chosen tracks in stored order, keeping the playable ones only. */
function playableTracks(
  releases: StudioReleaseDTO[],
  trackIds: string[],
): StudioPlaylistTrackDTO[] {
  return trackIds.flatMap((trackId) => {
    const release = releases.find((candidate) => trackOf(candidate, trackId));
    const track = release ? trackOf(release, trackId) : undefined;
    return release && track?.hasAudio
      ? [{ ...track, release: demoReleaseCard(release) }]
      : [];
  });
}

/** With none chosen: up to five tracks from the newest releases. */
function fallbackTracks(
  releases: StudioReleaseDTO[],
): StudioPlaylistTrackDTO[] {
  return releases
    .flatMap((release) =>
      release.tracks
        .filter((track) => track.hasAudio)
        .map((track) => ({ ...track, release: demoReleaseCard(release) })),
    )
    .slice(0, STUDIO_PRESS.featuredMax);
}

const emptyToNull = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

/** GET /studio/artists/:id/press-kit in the demo: the viewer's personas
 *  (Mariana, Late Bloomers) are theirs to edit; any other demo artist reads
 *  from the persona alone (no row). */
export function demoStudioPressKit(subprofileId: string): StudioPressKitDTO {
  const artist = demoAllArtists().find(
    (candidate) => candidate.id === subprofileId,
  );
  if (!artist) throw studioRefusal(404, "not_found");
  const isOwner = isDemoOwnedPersona(subprofileId);
  const releases = publishedOf(subprofileId);
  const details = demoArtistDetailsOf(subprofileId);
  const row = storedKits.get(subprofileId) ?? null;
  const isFeaturedFallback = !row || row.featuredTrackIds.length === 0;
  return {
    // As the server: the city slot stays empty.
    artist: { ...artist, bio: details.bio, city: null },
    personaHandle: artist.handle,
    pitch: row?.pitch ?? null,
    bio: row?.pressBio ?? details.bio,
    featuredTracks: isFeaturedFallback
      ? fallbackTracks(releases)
      : playableTracks(releases, row?.featuredTrackIds ?? []),
    isFeaturedFallback,
    releases: releases
      .slice(0, STUDIO_PRESS.releasesShown)
      .map(demoReleaseCard),
    quotes: row?.quotes ?? [],
    contact: row?.contact ?? null,
    socialLinks: demoSocialLinksFor(subprofileId),
    supportLinks: demoSupportLinksFor(subprofileId),
    isOwner,
    owner: isOwner
      ? {
          pitch: row?.pitch ?? null,
          pressBio: row?.pressBio ?? null,
          featuredTrackIds: row?.featuredTrackIds ?? [],
          quotes: row?.quotes ?? [],
          contact: row?.contact ?? null,
          updatedAt: row?.updatedAt ?? null,
        }
      : null,
  };
}

/** The body rules the server's validation pipe applies before the service
 *  runs: counts, lengths and a contact that is https or mailto. */
function isPressBodyValid(body: UpdateStudioPressKitBody): boolean {
  const isWithin = (value: string | null, max: number) =>
    value === null || value.trim().length <= max;
  const isContactSafe =
    body.contact === null ||
    body.contact.trim() === "" ||
    /^(https:|mailto:)/i.test(body.contact.trim());
  return (
    body.featuredTrackIds.length <= STUDIO_PRESS.featuredMax &&
    body.quotes.length <= STUDIO_PRESS.quotesMax &&
    body.quotes.every(
      (entry) =>
        entry.quote.trim().length >= 1 &&
        entry.quote.trim().length <= STUDIO_PRESS.quoteMax &&
        entry.source.trim().length >= 1 &&
        entry.source.trim().length <= STUDIO_PRESS.sourceMax,
    ) &&
    isWithin(body.pitch, STUDIO_PRESS.pitchMax) &&
    isWithin(body.pressBio, STUDIO_PRESS.bioMax) &&
    isWithin(body.contact, STUDIO_PRESS.contactMax) &&
    isContactSafe
  );
}

/** PUT in the demo, with the server's checks in its order: an unknown
 *  persona is 404, another member's persona 403, a repeated pick 400, a
 *  track from outside this persona's published releases 422. Empty strings
 *  are stored as null. */
export function demoSaveStudioPressKit(
  subprofileId: string,
  body: UpdateStudioPressKitBody,
): StudioPressKitDTO {
  if (!isPressBodyValid(body)) throw studioRefusal(400, "bad_request");
  if (!demoAllArtists().some((candidate) => candidate.id === subprofileId))
    throw studioRefusal(404, "not_found");
  if (!isDemoOwnedPersona(subprofileId))
    throw studioRefusal(403, "studio_not_persona_owner");
  if (new Set(body.featuredTrackIds).size !== body.featuredTrackIds.length)
    throw studioRefusal(400, "bad_request");
  const releases = publishedOf(subprofileId);
  const isEveryTrackTheirs = body.featuredTrackIds.every((trackId) =>
    releases.some((release) => trackOf(release, trackId)),
  );
  if (!isEveryTrackTheirs)
    throw studioRefusal(422, "studio_press_track_not_allowed");
  storedKits.set(subprofileId, {
    pitch: emptyToNull(body.pitch),
    pressBio: emptyToNull(body.pressBio),
    featuredTrackIds: body.featuredTrackIds,
    quotes: body.quotes,
    contact: emptyToNull(body.contact),
    updatedAt: new Date().toISOString(),
  });
  return demoStudioPressKit(subprofileId);
}
