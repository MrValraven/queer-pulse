import type { StudioArtistRefDTO } from "../studio/api/studio.types";
import { DEMO_FOUNDING_ARTIST_IDS } from "../studio/api/studioDemoFounding.data";
import { DEMO_STUDIO_LANDING } from "../studio/landing/studioLandingDemo.data";
import type {
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingDTO,
  AdminStudioLandingPhotoDTO,
  AdminStudioLandingPreviewDTO,
} from "./api/studioLandingAdmin.api";
import {
  DEMO_STAFF,
  DEMO_PERSONAS,
  trackEntries,
  flagged,
  previewOf,
} from "./studioAdminLandingDemoBase";

// The Studio page console's demo seed. The artist cards, their quotes and
// avatars, and both photos are the ones the public Studio page demo shows
// (`DEMO_STUDIO_LANDING`), so staff see what the page shows. The founding
// list is the demo founding artists.

const SEEDED_AT = "2026-10-20T10:00:00.000Z";
const FOUNDING_IDS: readonly string[] = DEMO_FOUNDING_ARTIST_IDS;

/** The demo persona the page's card names, wearing the avatar the page
 *  shows for it. */
function pageArtistOf(name: string): StudioArtistRefDTO | undefined {
  const persona = DEMO_PERSONAS.find((candidate) => candidate.name === name);
  const pageCard = DEMO_STUDIO_LANDING.artists.find(
    (card) => card.artist.name === name,
  );
  return persona
    ? { ...persona, avatarUrl: pageCard?.artist.avatarUrl ?? persona.avatarUrl }
    : undefined;
}

const PAGE_ARTISTS: StudioArtistRefDTO[] = DEMO_PERSONAS.flatMap((persona) => {
  const artist = pageArtistOf(persona.name);
  return artist ? [artist] : [];
});

function photoOf(
  slot: "hero" | "manifesto",
): AdminStudioLandingPhotoDTO | null {
  const page = DEMO_STUDIO_LANDING.photos[slot];
  return page
    ? {
        slot,
        imageKey: `studio-landing/${slot}/demo-sample.jpg`,
        url: page.url,
        altText: page.altText,
        credit: page.credit,
        consentedAt: SEEDED_AT,
        updatedBy: DEMO_STAFF,
      }
    : null;
}

function seedCards(): AdminStudioLandingArtistCardDTO[] {
  return DEMO_STUDIO_LANDING.artists.flatMap((pageCard, index) => {
    const artist = PAGE_ARTISTS.find(
      (candidate) => candidate.name === pageCard.artist.name,
    );
    return artist
      ? [
          {
            id: `demo-landing-card-${artist.id}`,
            artist,
            quote: pageCard.quote,
            position: index + 1,
            consentedAt: SEEDED_AT,
            createdBy: DEMO_STAFF,
            isShown: true,
            isFoundingArtist: FOUNDING_IDS.includes(artist.id),
          },
        ]
      : [];
  });
}

export function seedLanding(): AdminStudioLandingDTO {
  const entries = trackEntries();
  const rowOf = (
    trackId: string,
    status: AdminStudioLandingPreviewDTO["status"],
  ) => {
    const entry = entries.find((candidate) => candidate.track.id === trackId);
    return entry ? [previewOf(entry, status, SEEDED_AT)] : [];
  };
  const open = [
    ...rowOf("demo-track-cidade-dos-santos-01", "pending"),
    ...rowOf("demo-track-home-4-01", "pending"),
    ...rowOf("demo-track-cidade-dos-santos-02", "approved"),
    ...rowOf("demo-track-home-2-01", "approved"),
    // Approved, then a content warning was added: off the page.
    ...rowOf("demo-track-cidade-dos-santos-03", "approved"),
  ];
  return {
    previews: [
      ...flagged(open),
      ...rowOf("demo-track-mariana-single-1-01", "declined"),
    ],
    artistCards: seedCards(),
    photos: { hero: photoOf("hero"), manifesto: photoOf("manifesto") },
    foundingArtists: FOUNDING_IDS.flatMap((personaId, index) => {
      const artist = PAGE_ARTISTS.find((persona) => persona.id === personaId);
      return artist
        ? [
            {
              id: `demo-landing-founding-${personaId}`,
              artist,
              position: index + 1,
              addedBy: DEMO_STAFF,
              createdAt: SEEDED_AT,
              isListed: true,
            },
          ]
        : [];
    }),
    settings: { isFoundingShelfVisible: true },
  };
}
