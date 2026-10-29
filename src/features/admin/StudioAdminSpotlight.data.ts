import { foldForSearch } from "../../shared/lib/foldForSearch";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioArtistRefDTO,
} from "../studio/api/studio.types";
import { DEMO_LISTED_RELEASES } from "../studio/api/studioDemoApi";
import {
  DEMO_SPOTLIGHT_SEED,
  type DemoSpotlightSeed,
} from "../studio/api/studioDemoCuration.data";
import { demoAllArtists } from "../studio/api/studioDemoFormats.data";
import type {
  AdminStudioSpotlightArtistDTO,
  AdminStudioSpotlightArtistOptionDTO,
  AdminStudioSpotlightDTO,
} from "./api/studioSpotlightAdmin.api";

// The Artists tab's demo seed, built from the same spotlight seed and demo
// personas Studio home reads. Loaded through a dynamic import by the
// console's hooks in demo mode only. Every row is a persona; no member name
// or id appears here.

function demoArtistOf(artistId: string): StudioArtistRefDTO | null {
  return demoAllArtists().find((artist) => artist.id === artistId) ?? null;
}

/** The first day of this month at 10:00 local, so the demo month pick
 *  always reads as current. */
function startOfThisMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 10).toISOString();
}

function demoMonthRow(
  seed: DemoSpotlightSeed | null,
): AdminStudioSpotlightArtistDTO | null {
  if (!seed) return null;
  const artist = demoArtistOf(seed.artistId);
  return artist
    ? {
        id: "demo-spotlight-month",
        slot: "artist_of_the_month",
        position: 1,
        note: seed.note,
        createdAt: startOfThisMonthIso(),
        isListenable: true,
        artist,
      }
    : null;
}

function demoStarRows(
  seeds: readonly DemoSpotlightSeed[],
): AdminStudioSpotlightArtistDTO[] {
  const artists = seeds.flatMap((seed) => {
    const artist = demoArtistOf(seed.artistId);
    return artist ? [{ seed, artist }] : [];
  });
  return artists.map(({ seed, artist }, index) => {
    const dayOfMonth = String(index + 1).padStart(2, "0");
    return {
      id: `demo-spotlight-star-${index + 1}`,
      slot: "new_stars",
      position: index + 1,
      note: seed.note,
      createdAt: `2026-10-${dayOfMonth}T10:00:00.000Z`,
      isListenable: true,
      artist,
    };
  });
}

export function demoAdminStudioSpotlight(): AdminStudioSpotlightDTO {
  return {
    artistOfTheMonth: demoMonthRow(DEMO_SPOTLIGHT_SEED.artistOfTheMonth),
    newStars: demoStarRows(DEMO_SPOTLIGHT_SEED.newStars),
  };
}

/** Demo personas with a listed release whose name or handle holds the
 *  folded query; the newest listed release titles each row. */
export function demoSpotlightArtistSearch(
  query: string,
): AdminStudioSpotlightArtistOptionDTO[] {
  const folded = foldForSearch(query.trim());
  const monthArtistId = DEMO_SPOTLIGHT_SEED.artistOfTheMonth?.artistId ?? null;
  const starArtistIds = new Set(
    DEMO_SPOTLIGHT_SEED.newStars.map((seed) => seed.artistId),
  );
  return demoAllArtists()
    .flatMap((artist) => {
      const latestRelease = DEMO_LISTED_RELEASES.find(
        (release) => release.artist.id === artist.id,
      );
      if (!latestRelease) return [];
      const isMatch =
        foldForSearch(artist.name).includes(folded) ||
        foldForSearch(artist.handle).includes(folded);
      return isMatch
        ? [
            {
              artist,
              latestReleaseTitle: latestRelease.title,
              isInArtistOfTheMonth: artist.id === monthArtistId,
              isInNewStars: starArtistIds.has(artist.id),
            },
          ]
        : [];
    })
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchResults);
}
