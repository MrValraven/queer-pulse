import type {
  AddAdminStudioFoundingArtistBody,
  AdminStudioFoundingArtistDTO,
  AdminStudioLandingSettingsDTO,
} from "./api/studioLandingAdmin.api";
import {
  isSameIdSet,
  orderedByIds,
  renumbered,
  withLandingFoundingArtists,
} from "./studioAdmin.model";
import {
  LIMITS,
  demoRefusal,
  DEMO_STAFF,
  INELIGIBLE_PERSONA_IDS,
} from "./studioAdminLandingDemoBase";
import {
  current,
  commit,
  nextId,
  personaOf,
} from "./studioAdminLandingDemoStore";

// Demo writes for founding artists and the shelf switch.

export function demoAddFounding(body: AddAdminStudioFoundingArtistBody) {
  const landing = current();
  const artist = personaOf(body.subprofileId);
  if (!artist || INELIGIBLE_PERSONA_IDS.has(artist.id))
    throw demoRefusal("studio_founding_persona_not_eligible", 422);
  if (landing.foundingArtists.some((listed) => listed.artist.id === artist.id))
    throw demoRefusal("studio_founding_artist_exists", 409);
  if (landing.foundingArtists.length >= LIMITS.founding)
    throw demoRefusal("studio_founding_artists_full", 409);
  const listed: AdminStudioFoundingArtistDTO = {
    id: nextId("demo-landing-founding"),
    artist,
    position: landing.foundingArtists.length + 1,
    addedBy: DEMO_STAFF,
    createdAt: new Date().toISOString(),
    isListed: true,
  };
  commit(
    withLandingFoundingArtists(landing, [...landing.foundingArtists, listed]),
  );
  return listed;
}

export function demoRemoveFounding(foundingArtistId: string): void {
  const landing = current();
  if (!landing.foundingArtists.some((listed) => listed.id === foundingArtistId))
    throw demoRefusal("studio_founding_artist_not_found", 404);
  commit(
    withLandingFoundingArtists(
      landing,
      renumbered(
        landing.foundingArtists.filter(
          (listed) => listed.id !== foundingArtistId,
        ),
      ),
    ),
  );
}

export function demoReorderFounding(foundingArtistIds: string[]) {
  const landing = current();
  if (!isSameIdSet(foundingArtistIds, landing.foundingArtists))
    throw demoRefusal("studio_landing_order_mismatch", 409);
  const ordered = renumbered(
    orderedByIds(landing.foundingArtists, foundingArtistIds),
  );
  commit(withLandingFoundingArtists(landing, ordered));
  return ordered;
}

export function demoSetSettings(
  settings: AdminStudioLandingSettingsDTO,
): AdminStudioLandingSettingsDTO {
  commit({ ...current(), settings });
  return settings;
}
