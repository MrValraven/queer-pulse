import {
  isSameIdSet,
  orderedByIds,
  renumbered,
  withLandingFoundingArtists,
} from "../studioAdmin.model";
import {
  addAdminStudioFoundingArtist,
  removeAdminStudioFoundingArtist,
  reorderAdminStudioFoundingArtists,
  setAdminStudioLandingSettings,
  type AdminStudioFoundingArtistDTO,
  type AdminStudioLandingSettingsDTO,
} from "./studioLandingAdmin.api";
import { useLandingMutation } from "./useStudioAdminLandingWrite";

// Founding artist and shelf switch writes of the Studio page console.

// Founding artists and the shelf switch.

/** POST .../founding-artists. */
export function useAddFoundingArtist() {
  return useLandingMutation<
    AdminStudioFoundingArtistDTO,
    { subprofileId: string }
  >({
    live: ({ subprofileId }) => addAdminStudioFoundingArtist({ subprofileId }),
    demo: (data, { subprofileId }) => data.demoAddFounding({ subprofileId }),
    patch: (landing, listed) =>
      withLandingFoundingArtists(landing, [...landing.foundingArtists, listed]),
    shouldRefreshFounding: true,
  });
}

export function useRemoveFoundingArtist() {
  return useLandingMutation<void, { foundingArtistId: string }>({
    live: ({ foundingArtistId }) =>
      removeAdminStudioFoundingArtist(foundingArtistId),
    demo: (data, { foundingArtistId }) =>
      data.demoRemoveFounding(foundingArtistId),
    patch: (landing, _result, { foundingArtistId }) =>
      withLandingFoundingArtists(
        landing,
        renumbered(
          landing.foundingArtists.filter(
            (listed) => listed.id !== foundingArtistId,
          ),
        ),
      ),
    shouldRefreshFounding: true,
  });
}

export function useReorderFoundingArtists() {
  return useLandingMutation<
    AdminStudioFoundingArtistDTO[],
    { foundingArtistIds: string[] }
  >({
    live: ({ foundingArtistIds }) =>
      reorderAdminStudioFoundingArtists({ foundingArtistIds }),
    demo: (data, { foundingArtistIds }) =>
      data.demoReorderFounding(foundingArtistIds),
    patch: (landing, listed) =>
      withLandingFoundingArtists(landing, renumbered(listed)),
    optimistic: (landing, { foundingArtistIds }) =>
      withLandingFoundingArtists(
        landing,
        renumbered(orderedByIds(landing.foundingArtists, foundingArtistIds)),
      ),
    isOrderValid: (landing, { foundingArtistIds }) =>
      isSameIdSet(foundingArtistIds, landing.foundingArtists),
    shouldRefreshFounding: true,
  });
}

/** PUT .../settings: the launch shelf switch. The founding badge never
 *  depends on it. */
export function useSetFoundingShelf() {
  return useLandingMutation<
    AdminStudioLandingSettingsDTO,
    AdminStudioLandingSettingsDTO
  >({
    live: (settings) => setAdminStudioLandingSettings(settings),
    demo: (data, settings) => data.demoSetSettings(settings),
    patch: (landing, settings) => ({ ...landing, settings }),
    shouldRefreshFounding: true,
  });
}
