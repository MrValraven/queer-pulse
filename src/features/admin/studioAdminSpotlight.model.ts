import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import type {
  AdminStudioSpotlightArtistDTO,
  AdminStudioSpotlightDTO,
  StudioSpotlightSlot,
} from "./api/studioSpotlightAdmin.api";
import { renumbered } from "./studioAdmin.model";

// Labels and pure rules the Artists tab shares. No demo data lives here, so
// the console's chunk carries none.

export const EMPTY_ADMIN_SPOTLIGHT: AdminStudioSpotlightDTO = {
  artistOfTheMonth: null,
  newStars: [],
};

const monthIndexOf = (date: Date) => date.getFullYear() * 12 + date.getMonth();

/** True when the pick's local calendar month comes before this one, so the
 *  console asks for this month's artist. */
export function isPickedBeforeThisMonth(
  createdAtIso: string,
  nowMs: number,
): boolean {
  return monthIndexOf(new Date(createdAtIso)) < monthIndexOf(new Date(nowMs));
}

export function isNewStarsFull(
  stars: readonly AdminStudioSpotlightArtistDTO[],
): boolean {
  return stars.length >= STUDIO_DISCOVERY_LIMITS.spotlightNewStarsMax;
}

/** The persona ids already in New stars. */
export function newStarArtistIds(
  spotlight: AdminStudioSpotlightDTO,
): ReadonlySet<string> {
  return new Set(spotlight.newStars.map((star) => star.artist.id));
}

export function withNewStars(
  spotlight: AdminStudioSpotlightDTO,
  stars: AdminStudioSpotlightArtistDTO[],
): AdminStudioSpotlightDTO {
  return { ...spotlight, newStars: renumbered(stars) };
}

/** A saved row in its slot: the month row replaces the current one; a New
 *  stars row replaces its own id, else joins the end. */
export function withSavedSpotlightArtist(
  spotlight: AdminStudioSpotlightDTO,
  saved: AdminStudioSpotlightArtistDTO,
): AdminStudioSpotlightDTO {
  if (saved.slot === "artist_of_the_month")
    return { ...spotlight, artistOfTheMonth: saved };
  const isAlreadyListed = spotlight.newStars.some(
    (star) => star.id === saved.id,
  );
  return withNewStars(
    spotlight,
    isAlreadyListed
      ? spotlight.newStars.map((star) => (star.id === saved.id ? saved : star))
      : [...spotlight.newStars, saved],
  );
}

/** The spotlight without one row, from either slot; New stars renumbers. */
export function withoutSpotlightArtist(
  spotlight: AdminStudioSpotlightDTO,
  removedId: string,
): AdminStudioSpotlightDTO {
  return withNewStars(
    {
      ...spotlight,
      artistOfTheMonth:
        spotlight.artistOfTheMonth?.id === removedId
          ? null
          : spotlight.artistOfTheMonth,
    },
    spotlight.newStars.filter((star) => star.id !== removedId),
  );
}

/** The picker's title, naming what saving it does in each slot. */
export const STUDIO_SPOTLIGHT_SLOT_TITLE_KEY: Record<
  StudioSpotlightSlot,
  string
> = {
  artist_of_the_month: "admin:studioAdmin.spotlight.pickerTitleMonth",
  new_stars: "admin:studioAdmin.spotlight.pickerTitleNewStars",
};

export const STUDIO_SPOTLIGHT_SUBMIT_KEY: Record<StudioSpotlightSlot, string> =
  {
    artist_of_the_month: "admin:studioAdmin.spotlight.pickArtist",
    new_stars: "admin:studioAdmin.spotlight.addArtist",
  };
